-- =====================================================
-- UNIFIED MIGRATION: New Features from Mayur Branch
-- =====================================================
-- This script safely adds the new features without
-- conflicting with the existing 001-003 migrations.
-- Run this AFTER 001, 002, 003 are already executed.
-- =====================================================

-- =====================================================
-- STEP 1: Add new ENUM values to existing types
-- =====================================================

-- Add COMPLIANCE_OFFICER to user_role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'user_role' AND e.enumlabel = 'COMPLIANCE_OFFICER'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'COMPLIANCE_OFFICER';
    END IF;
END $$;

-- Create new workflow-specific status types (different from existing case_status)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_status') THEN
        CREATE TYPE workflow_status AS ENUM (
            'PENDING',
            'ALLOCATED',
            'ASSIGNED',
            'IN_PROGRESS',
            'RESOLVED',
            'ESCALATED',
            'CLOSED'
        );
    END IF;
END $$;

-- Create workflow priority type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_priority') THEN
        CREATE TYPE case_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
    END IF;
END $$;

-- Create action type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_type') THEN
        CREATE TYPE action_type AS ENUM (
            'CALL', 'EMAIL', 'SMS', 'PAYMENT', 'NEGOTIATION', 'ESCALATION', 'NOTE'
        );
    END IF;
END $$;

-- Create outcome type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'outcome_type') THEN
        CREATE TYPE outcome_type AS ENUM (
            'PTP', 'RPC', 'BROKEN_PROMISE', 'DISPUTE', 'PAYMENT_RECEIVED',
            'NO_CONTACT', 'LEFT_MESSAGE', 'CALLBACK_REQUESTED', 'SKIP_TRACE',
            'DECEASED', 'BANKRUPTCY'
        );
    END IF;
END $$;

-- Create allocation rule type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'allocation_rule_type') THEN
        CREATE TYPE allocation_rule_type AS ENUM (
            'VALUE_BASED', 'GEO_BASED', 'RECOVERY_BASED', 'PRIORITY_BASED', 'CUSTOM'
        );
    END IF;
END $$;

-- Create import status type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'import_status') THEN
        CREATE TYPE import_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'PARTIAL');
    END IF;
END $$;

-- Create violation types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'violation_severity') THEN
        CREATE TYPE violation_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'violation_status') THEN
        CREATE TYPE violation_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_type') THEN
        CREATE TYPE report_type AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'AUDIT', 'REGULATORY');
    END IF;
END $$;

-- =====================================================
-- STEP 2: Add missing columns to existing debtors table
-- =====================================================

-- Add full_name column (alias for name) if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'debtors' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.debtors ADD COLUMN full_name TEXT;
        -- Copy existing name values to full_name
        UPDATE public.debtors SET full_name = name WHERE full_name IS NULL;
    END IF;
END $$;

-- Add date_of_birth column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'debtors' AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE public.debtors ADD COLUMN date_of_birth DATE;
    END IF;
END $$;

-- Add ssn_last_4 column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'debtors' AND column_name = 'ssn_last_4'
    ) THEN
        ALTER TABLE public.debtors ADD COLUMN ssn_last_4 TEXT;
    END IF;
END $$;

-- Add zip_code column (alias for postal_code) if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'debtors' AND column_name = 'zip_code'
    ) THEN
        ALTER TABLE public.debtors ADD COLUMN zip_code TEXT;
        -- Copy existing postal_code values
        UPDATE public.debtors SET zip_code = postal_code WHERE zip_code IS NULL;
    END IF;
END $$;

-- =====================================================
-- STEP 3: Create new tables
-- =====================================================

-- WORKFLOW CASES TABLE
CREATE TABLE IF NOT EXISTS public.workflow_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number TEXT UNIQUE NOT NULL,
    debtor_id UUID REFERENCES public.debtors(id) ON DELETE SET NULL,
    
    -- Financial details
    amount DECIMAL(12,2) NOT NULL,
    original_amount DECIMAL(12,2) NOT NULL,
    recovered_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Status and priority
    status workflow_status DEFAULT 'PENDING' NOT NULL,
    priority case_priority DEFAULT 'MEDIUM' NOT NULL,
    
    -- Assignment details
    assigned_dca_agency TEXT,
    assigned_manager_id UUID REFERENCES public.profiles(id),
    assigned_agent_id UUID REFERENCES public.profiles(id),
    
    -- AI predictions
    recovery_probability DECIMAL(5,2),
    recommended_strategy TEXT,
    
    -- SLA and dates
    sla_due_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    last_contact_date TIMESTAMPTZ,
    next_follow_up TIMESTAMPTZ,
    
    -- Metadata
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_recovery_probability CHECK (recovery_probability >= 0 AND recovery_probability <= 100),
    CONSTRAINT valid_amounts CHECK (amount >= 0 AND original_amount >= 0 AND recovered_amount >= 0)
);

-- Workflow cases indexes
CREATE INDEX IF NOT EXISTS idx_workflow_cases_status ON public.workflow_cases(status);
CREATE INDEX IF NOT EXISTS idx_workflow_cases_priority ON public.workflow_cases(priority);
CREATE INDEX IF NOT EXISTS idx_workflow_cases_assigned_agent ON public.workflow_cases(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_workflow_cases_assigned_manager ON public.workflow_cases(assigned_manager_id);
CREATE INDEX IF NOT EXISTS idx_workflow_cases_sla_due ON public.workflow_cases(sla_due_date);

-- CASE ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.case_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.workflow_cases(id) ON DELETE CASCADE NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id) NOT NULL,
    assigned_by UUID REFERENCES public.profiles(id) NOT NULL,
    assignment_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    target_recovery DECIMAL(12,2),
    target_date TIMESTAMPTZ,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_assignments_case ON public.case_assignments(case_id);
CREATE INDEX IF NOT EXISTS idx_case_assignments_assigned_to ON public.case_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_case_assignments_active ON public.case_assignments(is_active);

-- AGENT ACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.agent_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.workflow_cases(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES public.profiles(id) NOT NULL,
    action_type action_type NOT NULL,
    outcome outcome_type,
    contact_method TEXT,
    duration_seconds INTEGER,
    promise_amount DECIMAL(12,2),
    promise_date DATE,
    payment_amount DECIMAL(12,2),
    notes TEXT,
    next_follow_up TIMESTAMPTZ,
    compliant BOOLEAN DEFAULT true,
    compliance_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_actions_case ON public.agent_actions(case_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_agent ON public.agent_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_created ON public.agent_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_actions_outcome ON public.agent_actions(outcome);

-- SOP RULES TABLE
CREATE TABLE IF NOT EXISTS public.sop_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    priority INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sop_rules_category ON public.sop_rules(category);
CREATE INDEX IF NOT EXISTS idx_sop_rules_active ON public.sop_rules(is_active);

-- SYSTEM CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_config_key ON public.system_config(config_key);

-- COMMUNICATION TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON public.communication_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_active ON public.communication_templates(is_active);

-- ALLOCATION RULES TABLE
CREATE TABLE IF NOT EXISTS public.allocation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name TEXT NOT NULL UNIQUE,
    rule_type allocation_rule_type NOT NULL,
    description TEXT,
    priority INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    target_agency TEXT NOT NULL,
    target_manager_id UUID REFERENCES public.profiles(id),
    times_applied INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_priority CHECK (priority > 0),
    CONSTRAINT valid_success_rate CHECK (success_rate >= 0 AND success_rate <= 100)
);

CREATE INDEX IF NOT EXISTS idx_allocation_rules_active ON public.allocation_rules(is_active, priority);
CREATE INDEX IF NOT EXISTS idx_allocation_rules_type ON public.allocation_rules(rule_type);

-- CSV IMPORT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.csv_import_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
    status import_status DEFAULT 'PENDING',
    total_rows INTEGER DEFAULT 0,
    successful_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]'::jsonb,
    column_mapping JSONB,
    storage_path TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_csv_imports_status ON public.csv_import_logs(status);
CREATE INDEX IF NOT EXISTS idx_csv_imports_user ON public.csv_import_logs(uploaded_by);

-- COMPLIANCE VIOLATIONS TABLE
CREATE TABLE IF NOT EXISTS public.compliance_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    violation_type TEXT NOT NULL,
    severity violation_severity NOT NULL,
    status violation_status DEFAULT 'OPEN',
    case_id UUID REFERENCES public.workflow_cases(id),
    agent_id UUID REFERENCES public.profiles(id),
    action_id UUID REFERENCES public.agent_actions(id),
    description TEXT NOT NULL,
    auto_detected BOOLEAN DEFAULT true,
    detection_rule TEXT,
    evidence JSONB,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    resolution_notes TEXT,
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_violations_status ON public.compliance_violations(status);
CREATE INDEX IF NOT EXISTS idx_violations_severity ON public.compliance_violations(severity);
CREATE INDEX IF NOT EXISTS idx_violations_agent ON public.compliance_violations(agent_id);
CREATE INDEX IF NOT EXISTS idx_violations_case ON public.compliance_violations(case_id);

-- COMPLIANCE REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type report_type NOT NULL,
    report_name TEXT NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    violations_summary JSONB,
    recommendations JSONB,
    pdf_url TEXT,
    csv_url TEXT,
    generated_by UUID REFERENCES public.profiles(id),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (date_to >= date_from)
);

CREATE INDEX IF NOT EXISTS idx_reports_type_date ON public.compliance_reports(report_type, date_from);

-- =====================================================
-- STEP 4: Enable RLS on new tables
-- =====================================================

ALTER TABLE public.workflow_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sop_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csv_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Create RLS Policies (with IF NOT EXISTS logic)
-- =====================================================

-- Workflow cases policies
DO $$
BEGIN
    -- Drop existing policies if they exist and recreate
    DROP POLICY IF EXISTS "Admins can view all workflow cases" ON public.workflow_cases;
    DROP POLICY IF EXISTS "Managers can view assigned cases" ON public.workflow_cases;
    DROP POLICY IF EXISTS "Agents can view their assigned cases" ON public.workflow_cases;
    DROP POLICY IF EXISTS "Admins can manage all workflow cases" ON public.workflow_cases;
    DROP POLICY IF EXISTS "Managers can update assigned cases" ON public.workflow_cases;
    DROP POLICY IF EXISTS "Agents can update their assigned cases" ON public.workflow_cases;
    
    -- Recreate policies
    CREATE POLICY "Admins can view all workflow cases" ON public.workflow_cases FOR SELECT
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'));
    
    CREATE POLICY "Managers can view assigned cases" ON public.workflow_cases FOR SELECT
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'MANAGER'));
    
    CREATE POLICY "Agents can view their assigned cases" ON public.workflow_cases FOR SELECT
        USING (assigned_agent_id = auth.uid());
    
    CREATE POLICY "Admins can manage all workflow cases" ON public.workflow_cases FOR ALL
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'));
    
    CREATE POLICY "Managers can update assigned cases" ON public.workflow_cases FOR UPDATE
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'MANAGER'));
    
    CREATE POLICY "Agents can update their assigned cases" ON public.workflow_cases FOR UPDATE
        USING (assigned_agent_id = auth.uid());
END $$;

-- Agent actions policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view relevant actions" ON public.agent_actions;
    DROP POLICY IF EXISTS "Agents can insert their own actions" ON public.agent_actions;
    
    CREATE POLICY "Users can view relevant actions" ON public.agent_actions FOR SELECT
        USING (EXISTS (
            SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (
                profiles.role IN ('ADMIN', 'MANAGER', 'COMPLIANCE_OFFICER')
                OR agent_actions.agent_id = auth.uid()
            )
        ));
    
    CREATE POLICY "Agents can insert their own actions" ON public.agent_actions FOR INSERT
        WITH CHECK (agent_id = auth.uid());
END $$;

-- Allocation rules policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "ADMIN can manage allocation rules" ON public.allocation_rules;
    DROP POLICY IF EXISTS "All authenticated users can view active rules" ON public.allocation_rules;
    
    CREATE POLICY "ADMIN can manage allocation rules" ON public.allocation_rules FOR ALL
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));
    
    CREATE POLICY "All authenticated users can view active rules" ON public.allocation_rules FOR SELECT
        USING (is_active = true AND auth.role() = 'authenticated');
END $$;

-- Compliance policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "COMPLIANCE_OFFICER can view all violations" ON public.compliance_violations;
    DROP POLICY IF EXISTS "COMPLIANCE_OFFICER can update violations" ON public.compliance_violations;
    
    CREATE POLICY "COMPLIANCE_OFFICER can view all violations" ON public.compliance_violations FOR SELECT
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('COMPLIANCE_OFFICER', 'ADMIN')));
    
    CREATE POLICY "COMPLIANCE_OFFICER can update violations" ON public.compliance_violations FOR UPDATE
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('COMPLIANCE_OFFICER', 'ADMIN')));
END $$;

-- =====================================================
-- STEP 6: Create Triggers
-- =====================================================

-- Auto-update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS trigger_update_workflow_cases_updated_at ON public.workflow_cases;
CREATE TRIGGER trigger_update_workflow_cases_updated_at
    BEFORE UPDATE ON public.workflow_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sop_rules_updated_at ON public.sop_rules;
CREATE TRIGGER update_sop_rules_updated_at
    BEFORE UPDATE ON public.sop_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON public.communication_templates;
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON public.communication_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Compliance violation auto-detection trigger
CREATE OR REPLACE FUNCTION check_compliance_violations()
RETURNS TRIGGER AS $$
DECLARE
    call_count INTEGER;
    last_call_time TIMESTAMPTZ;
BEGIN
    IF NEW.action_type = 'CALL' THEN
        -- Check max 3 calls per day
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
        
        -- Check minimum 2 hour gap
        IF last_call_time IS NOT NULL AND (NEW.created_at - last_call_time) < INTERVAL '2 hours' THEN
            INSERT INTO public.compliance_violations (
                violation_type, severity, case_id, agent_id, action_id,
                description, detection_rule
            ) VALUES (
                'CALL_FREQUENCY', 'LOW', NEW.case_id, NEW.agent_id, NEW.id,
                'Less than 2 hours gap between calls',
                'MIN_CALL_GAP'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_compliance_check ON public.agent_actions;
CREATE TRIGGER trigger_compliance_check
AFTER INSERT ON public.agent_actions
FOR EACH ROW EXECUTE FUNCTION check_compliance_violations();

-- =====================================================
-- STEP 7: Seed Default Data
-- =====================================================

-- SOP Rules
INSERT INTO public.sop_rules (name, category, description, priority, is_active) VALUES
('First Contact Protocol', 'Communication', 'Initial contact must be made within 24 hours of case assignment', 1, true),
('Payment Plan Approval', 'Financial', 'Payment plans exceeding 6 months require manager approval', 2, true),
('Escalation Threshold', 'Escalation', 'Cases with no contact after 7 attempts must be escalated', 1, true),
('Compliance Check', 'Compliance', 'All calls must be recorded and logged for compliance', 1, true),
('Follow-up Frequency', 'Communication', 'Minimum 3 business days between follow-up calls', 2, true),
('Dispute Resolution', 'Compliance', 'All disputes must be investigated within 48 hours', 1, true)
ON CONFLICT DO NOTHING;

-- System Config
INSERT INTO public.system_config (config_key, config_value) VALUES
('database', '{"dbBackupEnabled": true, "dbBackupFrequency": "daily"}'),
('email', '{"emailProvider": "smtp", "smtpHost": "smtp.gmail.com", "smtpPort": "587"}'),
('notifications', '{"notificationsEnabled": true, "smsEnabled": true, "emailNotifications": true}'),
('security', '{"sessionTimeout": "30", "mfaRequired": false, "passwordExpiry": "90"}'),
('general', '{"appName": "Atlas DCA", "timezone": "Asia/Kolkata", "dateFormat": "DD/MM/YYYY"}')
ON CONFLICT (config_key) DO NOTHING;

-- Allocation Rules
INSERT INTO public.allocation_rules (rule_name, rule_type, description, priority, conditions, target_agency) VALUES
('High Value Cases', 'VALUE_BASED', 'Cases with amount > ₹1,00,000', 10, 
 '{"amount": {"min": 100000}}'::jsonb, 'DCA Prime'),
('Critical Priority', 'PRIORITY_BASED', 'Critical priority cases to specialist team', 20,
 '{"priority": "CRITICAL"}'::jsonb, 'DCA Elite'),
('High Recovery Probability', 'RECOVERY_BASED', 'Cases with >70% recovery chance', 30,
 '{"recovery_probability": {"min": 70}}'::jsonb, 'DCA Elite'),
('Mumbai Region', 'GEO_BASED', 'All Mumbai cases to West region team', 40,
 '{"city": "Mumbai"}'::jsonb, 'DCA West'),
('Default Assignment', 'CUSTOM', 'Fallback for unmatched cases', 999,
 '{}'::jsonb, 'DCA Standard')
ON CONFLICT (rule_name) DO NOTHING;

-- Communication Templates
INSERT INTO public.communication_templates (name, category, subject, body, variables) VALUES
('First Contact Email', 'EMAIL', 'Important Notice Regarding Your Account',
 'Dear {debtor_name},\n\nThis is an important notice regarding your account with account number {account_number}. The current outstanding balance is {amount}.\n\nWe would like to work with you to resolve this matter. Please contact us at your earliest convenience.\n\nSincerely,\nAtlas DCA',
 '["debtor_name", "account_number", "amount"]'::jsonb),
('Payment Reminder SMS', 'SMS', NULL,
 'Reminder: Your payment of {amount} is due on {due_date}. Please call {company_phone} to arrange payment. -Atlas DCA',
 '["amount", "due_date", "company_phone"]'::jsonb),
('Legal Notice', 'LEGAL', 'Final Notice - Legal Action Pending',
 'FINAL NOTICE\n\nTo: {debtor_name}\nRe: Account #{account_number}\nAmount Due: {amount}\n\nThis is a final attempt to resolve this matter before legal proceedings are initiated. You have 15 days from the date of this notice to contact us.\n\nAtlas DCA\n{company_address}',
 '["debtor_name", "account_number", "amount", "company_address"]'::jsonb)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 8: Seed Test Data (Debtors & Cases)
-- =====================================================

-- Insert test debtors (using name column which exists in original schema)
INSERT INTO public.debtors (id, name, full_name, email, phone, address, city, state, postal_code, created_at) VALUES
('d1111111-1111-1111-1111-111111111111', 'Rajesh Kumar', 'Rajesh Kumar', 'rajesh.kumar@example.com', '+91-9876543210', '123 MG Road', 'Mumbai', 'Maharashtra', '400001', NOW()),
('d2222222-2222-2222-2222-222222222222', 'Priya Sharma', 'Priya Sharma', 'priya.sharma@example.com', '+91-9876543211', '456 Park Street', 'Kolkata', 'West Bengal', '700016', NOW()),
('d3333333-3333-3333-3333-333333333333', 'Amit Patel', 'Amit Patel', 'amit.patel@example.com', '+91-9876543212', '789 Brigade Road', 'Bangalore', 'Karnataka', '560001', NOW()),
('d4444444-4444-4444-4444-444444444444', 'Sneha Reddy', 'Sneha Reddy', 'sneha.reddy@example.com', '+91-9876543213', '321 Hitech City', 'Hyderabad', 'Telangana', '500081', NOW()),
('d5555555-5555-5555-5555-555555555555', 'Vikram Singh', 'Vikram Singh', 'vikram.singh@example.com', '+91-9876543214', '654 CP Connaught Place', 'Delhi', 'Delhi', '110001', NOW()),
('d6666666-6666-6666-6666-666666666666', 'Anjali Mehta', 'Anjali Mehta', 'anjali.mehta@example.com', '+91-9876543215', '987 MG Road', 'Pune', 'Maharashtra', '411001', NOW()),
('d7777777-7777-7777-7777-777777777777', 'Karthik Iyer', 'Karthik Iyer', 'karthik.iyer@example.com', '+91-9876543216', '147 Anna Salai', 'Chennai', 'Tamil Nadu', '600002', NOW()),
('d8888888-8888-8888-8888-888888888888', 'Neha Gupta', 'Neha Gupta', 'neha.gupta@example.com', '+91-9876543217', '258 Sector 18', 'Noida', 'Uttar Pradesh', '201301', NOW()),
('d9999999-9999-9999-9999-999999999999', 'Arjun Nair', 'Arjun Nair', 'arjun.nair@example.com', '+91-9876543218', '369 Marine Drive', 'Kochi', 'Kerala', '682031', NOW()),
('da111111-1111-1111-1111-111111111111', 'Divya Krishnan', 'Divya Krishnan', 'divya.k@example.com', '+91-9876543219', '741 Residency Road', 'Bangalore', 'Karnataka', '560025', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test workflow cases
INSERT INTO public.workflow_cases (
    id, case_number, debtor_id, amount, original_amount, recovered_amount,
    status, priority, assigned_dca_agency, recovery_probability, recommended_strategy, 
    sla_due_date, due_date, created_at, updated_at
) VALUES
('c1111111-1111-1111-1111-111111111111', 'CASE-2024-001', 'd1111111-1111-1111-1111-111111111111', 250000.00, 250000.00, 0.00, 
 'PENDING', 'CRITICAL', NULL, 85.5, 'Direct contact recommended', NOW() + INTERVAL '2 days', NOW() + INTERVAL '5 days', NOW(), NOW()),
('c2222222-2222-2222-2222-222222222222', 'CASE-2024-002', 'd2222222-2222-2222-2222-222222222222', 180000.00, 180000.00, 45000.00,
 'ASSIGNED', 'HIGH', 'DCA Prime', 78.2, 'Payment plan negotiation', NOW() + INTERVAL '3 days', NOW() + INTERVAL '7 days', NOW(), NOW()),
('c3333333-3333-3333-3333-333333333333', 'CASE-2024-003', 'd3333333-3333-3333-3333-333333333333', 120000.00, 120000.00, 0.00,
 'ALLOCATED', 'HIGH', 'DCA Elite', 72.5, 'Multiple follow-ups needed', NOW() + INTERVAL '4 days', NOW() + INTERVAL '10 days', NOW(), NOW()),
('c4444444-4444-4444-4444-444444444444', 'CASE-2024-004', 'd4444444-4444-4444-4444-444444444444', 95000.00, 95000.00, 20000.00,
 'IN_PROGRESS', 'MEDIUM', 'DCA Standard', 65.3, 'Regular follow-up', NOW() + INTERVAL '5 days', NOW() + INTERVAL '15 days', NOW(), NOW()),
('c5555555-5555-5555-5555-555555555555', 'CASE-2024-005', 'd5555555-5555-5555-5555-555555555555', 75000.00, 75000.00, 0.00,
 'PENDING', 'MEDIUM', NULL, 58.7, 'Standard protocol', NOW() + INTERVAL '7 days', NOW() + INTERVAL '20 days', NOW(), NOW()),
('c6666666-6666-6666-6666-666666666666', 'CASE-2024-006', 'd6666666-6666-6666-6666-666666666666', 65000.00, 65000.00, 65000.00,
 'RESOLVED', 'LOW', 'DCA Prime', 92.1, 'Friendly negotiation', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '10 days', NOW()),
('c7777777-7777-7777-7777-777777777777', 'CASE-2024-007', 'd7777777-7777-7777-7777-777777777777', 45000.00, 45000.00, 0.00,
 'ALLOCATED', 'LOW', 'DCA West', 45.2, 'Soft approach', NOW() + INTERVAL '10 days', NOW() + INTERVAL '30 days', NOW(), NOW()),
('c8888888-8888-8888-8888-888888888888', 'CASE-2024-008', 'd8888888-8888-8888-8888-888888888888', 155000.00, 155000.00, 0.00,
 'PENDING', 'CRITICAL', NULL, 88.3, 'Immediate action required', NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days', NOW(), NOW()),
('c9999999-9999-9999-9999-999999999999', 'CASE-2024-009', 'd9999999-9999-9999-9999-999999999999', 200000.00, 200000.00, 50000.00,
 'IN_PROGRESS', 'HIGH', 'DCA Elite', 75.8, 'Partial payment received', NOW() + INTERVAL '6 days', NOW() + INTERVAL '12 days', NOW(), NOW()),
('ca111111-1111-1111-1111-111111111111', 'CASE-2024-010', 'da111111-1111-1111-1111-111111111111', 85000.00, 85000.00, 0.00,
 'ASSIGNED', 'MEDIUM', 'DCA Standard', 62.4, 'Standard collection', NOW() + INTERVAL '8 days', NOW() + INTERVAL '18 days', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'workflow_cases', 'case_assignments', 'agent_actions',
        'sop_rules', 'system_config', 'communication_templates',
        'allocation_rules', 'csv_import_logs', 
        'compliance_violations', 'compliance_reports'
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'UNIFIED MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'New tables created: %', table_count;
    RAISE NOTICE 'Workflow cases: %', (SELECT COUNT(*) FROM workflow_cases);
    RAISE NOTICE 'Allocation rules: %', (SELECT COUNT(*) FROM allocation_rules);
    RAISE NOTICE 'SOP rules: %', (SELECT COUNT(*) FROM sop_rules);
    RAISE NOTICE '================================================';
END $$;

SELECT 'Migration completed!' as status,
       (SELECT COUNT(*) FROM public.workflow_cases) as workflow_cases,
       (SELECT COUNT(*) FROM public.allocation_rules) as allocation_rules,
       (SELECT COUNT(*) FROM public.debtors) as debtors;
