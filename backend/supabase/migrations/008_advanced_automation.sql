-- Migration 008: Advanced Allocation & Compliance Features
-- This migration adds:
-- 1. Allocation rules table (configurable allocation logic)
-- 2. Compliance tables (violations, reports)
-- 3. CSV import logs
-- 4. Enhanced types and functions

-- ============================================
-- 1. ALLOCATION RULES SYSTEM
-- ============================================

-- Add allocation rule types
CREATE TYPE allocation_rule_type AS ENUM (
    'VALUE_BASED',        -- Based on amount range
    'GEO_BASED',          -- Based on location
    'RECOVERY_BASED',     -- Based on recovery probability
    'PRIORITY_BASED',     -- Based on case priority
    'CUSTOM'              -- Custom conditions
);

-- Allocation rules table
CREATE TABLE IF NOT EXISTS public.allocation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name TEXT NOT NULL UNIQUE,
    rule_type allocation_rule_type NOT NULL,
    description TEXT,
    priority INTEGER NOT NULL DEFAULT 100, -- Lower number = higher priority
    is_active BOOLEAN DEFAULT true,
    
    -- Conditions stored as JSONB for flexibility
    -- Example: {"amount": {"min": 100000, "max": null}, "city": "Mumbai"}
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Target assignment
    target_agency TEXT NOT NULL,
    target_manager_id UUID REFERENCES public.profiles(id),
    
    -- Success metrics (populated over time)
    times_applied INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Metadata
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_priority CHECK (priority > 0),
    CONSTRAINT valid_success_rate CHECK (success_rate >= 0 AND success_rate <= 100)
);

-- Index for performance
CREATE INDEX idx_allocation_rules_active ON public.allocation_rules(is_active, priority);
CREATE INDEX idx_allocation_rules_type ON public.allocation_rules(rule_type);

-- ============================================
-- 2. CSV IMPORT TRACKING
-- ============================================

CREATE TYPE import_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'PARTIAL'
);

CREATE TABLE IF NOT EXISTS public.csv_import_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
    
    -- Processing status
    status import_status DEFAULT 'PENDING',
    
    -- Results
    total_rows INTEGER DEFAULT 0,
    successful_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    
    -- Error details (JSONB array of errors)
    errors JSONB DEFAULT '[]'::jsonb,
    
    -- Column mapping used
    column_mapping JSONB,
    
    -- Storage reference
    storage_path TEXT,
    
    -- Timestamps
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_row_counts CHECK (
        successful_rows >= 0 AND 
        failed_rows >= 0 AND 
        total_rows = successful_rows + failed_rows
    )
);

CREATE INDEX idx_csv_imports_status ON public.csv_import_logs(status);
CREATE INDEX idx_csv_imports_user ON public.csv_import_logs(uploaded_by);

-- ============================================
-- 3. COMPLIANCE SYSTEM
-- ============================================

-- Add compliance officer role
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typelem = 0) THEN
        -- Role type doesn't exist, create it
        CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'AGENT', 'COMPLIANCE_OFFICER');
    ELSE
        -- Check if COMPLIANCE_OFFICER exists, if not add it
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'user_role' AND e.enumlabel = 'COMPLIANCE_OFFICER'
        ) THEN
            ALTER TYPE user_role ADD VALUE 'COMPLIANCE_OFFICER';
        END IF;
    END IF;
END $$;

-- Compliance violation types
CREATE TYPE violation_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE violation_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

CREATE TABLE IF NOT EXISTS public.compliance_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    violation_type TEXT NOT NULL, -- 'EXCESSIVE_CALLS', 'LATE_CALL', 'MISSING_DISCLOSURE', etc.
    severity violation_severity NOT NULL,
    status violation_status DEFAULT 'OPEN',
    
    -- Related entities
    case_id UUID REFERENCES public.workflow_cases(id),
    agent_id UUID REFERENCES public.profiles(id),
    action_id UUID REFERENCES public.agent_actions(id),
    
    -- Violation details
    description TEXT NOT NULL,
    auto_detected BOOLEAN DEFAULT true,
    detection_rule TEXT, -- Which rule caught this
    
    -- Evidence
    evidence JSONB, -- Screenshots, logs, etc.
    
    -- Resolution
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Timestamps
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_violations_status ON public.compliance_violations(status);
CREATE INDEX idx_violations_severity ON public.compliance_violations(severity);
CREATE INDEX idx_violations_agent ON public.compliance_violations(agent_id);
CREATE INDEX idx_violations_case ON public.compliance_violations(case_id);

-- Compliance reports
CREATE TYPE report_type AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'AUDIT', 'REGULATORY');

CREATE TABLE IF NOT EXISTS public.compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type report_type NOT NULL,
    report_name TEXT NOT NULL,
    
    -- Date range
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    
    -- Report data (JSONB for flexibility)
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    violations_summary JSONB,
    recommendations JSONB,
    
    -- Export formats
    pdf_url TEXT,
    csv_url TEXT,
    
    -- Metadata
    generated_by UUID REFERENCES public.profiles(id),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_date_range CHECK (date_to >= date_from)
);

CREATE INDEX idx_reports_type_date ON public.compliance_reports(report_type, date_from);

-- ============================================
-- 4. ENHANCED TRIGGER FUNCTIONS
-- ============================================

-- Update allocation rule metrics when used
CREATE OR REPLACE FUNCTION update_allocation_rule_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.assigned_dca_agency IS NOT NULL AND OLD.assigned_dca_agency IS NULL THEN
        -- Find which rule was likely used (simplified logic)
        UPDATE public.allocation_rules
        SET times_applied = times_applied + 1,
            updated_at = NOW()
        WHERE target_agency = NEW.assigned_dca_agency
        AND is_active = true
        LIMIT 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_allocation_metrics
AFTER UPDATE ON public.workflow_cases
FOR EACH ROW
EXECUTE FUNCTION update_allocation_rule_metrics();

-- Auto-detect compliance violations
CREATE OR REPLACE FUNCTION check_compliance_violations()
RETURNS TRIGGER AS $$
DECLARE
    call_count INTEGER;
    last_call_time TIMESTAMPTZ;
BEGIN
    -- Only check for CALL actions
    IF NEW.action_type = 'CALL' THEN
        -- Check 1: Max 3 calls per day per case
        SELECT COUNT(*), MAX(created_at) INTO call_count, last_call_time
        FROM public.agent_actions
        WHERE case_id = NEW.case_id
        AND action_type = 'CALL'
        AND created_at::date = CURRENT_DATE
        AND id != NEW.id;
        
        IF call_count >= 3 THEN
            INSERT INTO public.compliance_violations (
                violation_type, severity, case_id, agent_id, action_id,
                description, detection_rule
            ) VALUES (
                'EXCESSIVE_CALLS', 'MEDIUM', NEW.case_id, NEW.agent_id, NEW.id,
                'More than 3 calls made to debtor on same day',
                'MAX_CALLS_PER_DAY'
            );
        END IF;
        
        -- Check 2: Minimum gap between calls (2 hours)
        IF last_call_time IS NOT NULL AND 
           (NEW.created_at - last_call_time) < INTERVAL '2 hours' THEN
            INSERT INTO public.compliance_violations (
                violation_type, severity, case_id, agent_id, action_id,
                description, detection_rule
            ) VALUES (
                'CALL_FREQUENCY', 'LOW', NEW.case_id, NEW.agent_id, NEW.id,
                'Less than 2 hours gap between calls',
                'MIN_CALL_GAP'
            );
        END IF;
        
        -- Check 3: Call duration limit (10 minutes = 600 seconds)
        IF NEW.duration_seconds IS NOT NULL AND NEW.duration_seconds > 600 THEN
            INSERT INTO public.compliance_violations (
                violation_type, severity, case_id, agent_id, action_id,
                description, detection_rule
            ) VALUES (
                'LONG_CALL', 'LOW', NEW.case_id, NEW.agent_id, NEW.id,
                format('Call duration %s seconds exceeds limit of 600 seconds', NEW.duration_seconds),
                'MAX_CALL_DURATION'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_compliance_check
AFTER INSERT ON public.agent_actions
FOR EACH ROW
EXECUTE FUNCTION check_compliance_violations();

-- ============================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Allocation rules - ADMIN only
ALTER TABLE public.allocation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ADMIN can manage allocation rules" ON public.allocation_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

CREATE POLICY "All authenticated users can view active rules" ON public.allocation_rules
    FOR SELECT USING (
        is_active = true AND auth.role() = 'authenticated'
    );

-- CSV import logs - uploaders and admins
ALTER TABLE public.csv_import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own imports" ON public.csv_import_logs
    FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "ADMIN can view all imports" ON public.csv_import_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Compliance violations - compliance officers and admins
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "COMPLIANCE_OFFICER can view all violations" ON public.compliance_violations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('COMPLIANCE_OFFICER', 'ADMIN')
        )
    );

CREATE POLICY "COMPLIANCE_OFFICER can update violations" ON public.compliance_violations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('COMPLIANCE_OFFICER', 'ADMIN')
        )
    );

-- Compliance reports
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "COMPLIANCE_OFFICER and ADMIN can manage reports" ON public.compliance_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('COMPLIANCE_OFFICER', 'ADMIN')
        )
    );

-- ============================================
-- 6. DEFAULT ALLOCATION RULES (SEED DATA)
-- ============================================

INSERT INTO public.allocation_rules (rule_name, rule_type, description, priority, conditions, target_agency, created_by) VALUES
('High Value Cases', 'VALUE_BASED', 'Cases with amount > ₹1,00,000', 10, 
 '{"amount": {"min": 100000}}'::jsonb, 'DCA Prime', 
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com' LIMIT 1)),

('Critical Priority', 'PRIORITY_BASED', 'Critical priority cases to specialist team', 20,
 '{"priority": "CRITICAL"}'::jsonb, 'DCA Elite',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com' LIMIT 1)),

('High Recovery Probability', 'RECOVERY_BASED', 'Cases with >70% recovery chance', 30,
 '{"recovery_probability": {"min": 70}}'::jsonb, 'DCA Elite',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com' LIMIT 1)),

('Mumbai Region', 'GEO_BASED', 'All Mumbai cases to West region team', 40,
 '{"city": "Mumbai"}'::jsonb, 'DCA West',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com' LIMIT 1)),

('Default Assignment', 'CUSTOM', 'Fallback for unmatched cases', 999,
 '{}'::jsonb, 'DCA Standard',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com' LIMIT 1));

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Migration 008 completed successfully!' as status,
       (SELECT COUNT(*) FROM public.allocation_rules) as allocation_rules_count,
       (SELECT COUNT(*) FROM public.compliance_violations) as violations_count;
