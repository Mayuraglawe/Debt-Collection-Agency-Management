-- =====================================================
-- PART 1: Add ENUM Values and Create Tables
-- =====================================================
-- Run this FIRST, then run PART 2 separately
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

-- Create new workflow-specific status types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_status') THEN
        CREATE TYPE workflow_status AS ENUM (
            'PENDING', 'ALLOCATED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'CLOSED'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_priority') THEN
        CREATE TYPE case_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_type') THEN
        CREATE TYPE action_type AS ENUM ('CALL', 'EMAIL', 'SMS', 'PAYMENT', 'NEGOTIATION', 'ESCALATION', 'NOTE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'outcome_type') THEN
        CREATE TYPE outcome_type AS ENUM (
            'PTP', 'RPC', 'BROKEN_PROMISE', 'DISPUTE', 'PAYMENT_RECEIVED',
            'NO_CONTACT', 'LEFT_MESSAGE', 'CALLBACK_REQUESTED', 'SKIP_TRACE', 'DECEASED', 'BANKRUPTCY'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'allocation_rule_type') THEN
        CREATE TYPE allocation_rule_type AS ENUM ('VALUE_BASED', 'GEO_BASED', 'RECOVERY_BASED', 'PRIORITY_BASED', 'CUSTOM');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'import_status') THEN
        CREATE TYPE import_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'PARTIAL');
    END IF;
END $$;

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

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'debtors' AND column_name = 'full_name') THEN
        ALTER TABLE public.debtors ADD COLUMN full_name TEXT;
        UPDATE public.debtors SET full_name = name WHERE full_name IS NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'debtors' AND column_name = 'date_of_birth') THEN
        ALTER TABLE public.debtors ADD COLUMN date_of_birth DATE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'debtors' AND column_name = 'ssn_last_4') THEN
        ALTER TABLE public.debtors ADD COLUMN ssn_last_4 TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'debtors' AND column_name = 'zip_code') THEN
        ALTER TABLE public.debtors ADD COLUMN zip_code TEXT;
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
    amount DECIMAL(12,2) NOT NULL,
    original_amount DECIMAL(12,2) NOT NULL,
    recovered_amount DECIMAL(12,2) DEFAULT 0,
    status workflow_status DEFAULT 'PENDING' NOT NULL,
    priority case_priority DEFAULT 'MEDIUM' NOT NULL,
    assigned_dca_agency TEXT,
    assigned_manager_id UUID REFERENCES public.profiles(id),
    assigned_agent_id UUID REFERENCES public.profiles(id),
    recovery_probability DECIMAL(5,2),
    recommended_strategy TEXT,
    sla_due_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    last_contact_date TIMESTAMPTZ,
    next_follow_up TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_recovery_probability CHECK (recovery_probability >= 0 AND recovery_probability <= 100),
    CONSTRAINT valid_amounts CHECK (amount >= 0 AND original_amount >= 0 AND recovered_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_workflow_cases_status ON public.workflow_cases(status);
CREATE INDEX IF NOT EXISTS idx_workflow_cases_priority ON public.workflow_cases(priority);
CREATE INDEX IF NOT EXISTS idx_workflow_cases_assigned_agent ON public.workflow_cases(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_workflow_cases_assigned_manager ON public.workflow_cases(assigned_manager_id);

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

-- SYSTEM CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- STEP 5: Create basic RLS Policies (without COMPLIANCE_OFFICER)
-- =====================================================

-- Workflow cases - basic policies
DROP POLICY IF EXISTS "Admins can view all workflow cases" ON public.workflow_cases;
CREATE POLICY "Admins can view all workflow cases" ON public.workflow_cases FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'));

DROP POLICY IF EXISTS "Managers can view cases" ON public.workflow_cases;
CREATE POLICY "Managers can view cases" ON public.workflow_cases FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'MANAGER'));

DROP POLICY IF EXISTS "Agents can view assigned cases" ON public.workflow_cases;
CREATE POLICY "Agents can view assigned cases" ON public.workflow_cases FOR SELECT
    USING (assigned_agent_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage workflow cases" ON public.workflow_cases;
CREATE POLICY "Admins can manage workflow cases" ON public.workflow_cases FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'));

DROP POLICY IF EXISTS "Managers can update cases" ON public.workflow_cases;
CREATE POLICY "Managers can update cases" ON public.workflow_cases FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'MANAGER'));

-- Agent actions - basic policies (without COMPLIANCE_OFFICER for now)
DROP POLICY IF EXISTS "Users can view actions" ON public.agent_actions;
CREATE POLICY "Users can view actions" ON public.agent_actions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (
            profiles.role IN ('ADMIN', 'MANAGER')
            OR agent_actions.agent_id = auth.uid()
        )
    ));

DROP POLICY IF EXISTS "Agents can insert actions" ON public.agent_actions;
CREATE POLICY "Agents can insert actions" ON public.agent_actions FOR INSERT
    WITH CHECK (agent_id = auth.uid());

-- Allocation rules
DROP POLICY IF EXISTS "Admins can manage allocation rules" ON public.allocation_rules;
CREATE POLICY "Admins can manage allocation rules" ON public.allocation_rules FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Users can view active rules" ON public.allocation_rules;
CREATE POLICY "Users can view active rules" ON public.allocation_rules FOR SELECT
    USING (is_active = true);

-- Compliance violations - admin only for now
DROP POLICY IF EXISTS "Admins can view violations" ON public.compliance_violations;
CREATE POLICY "Admins can view violations" ON public.compliance_violations FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can manage violations" ON public.compliance_violations;
CREATE POLICY "Admins can manage violations" ON public.compliance_violations FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- =====================================================
-- STEP 6: Create Triggers
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_workflow_cases_updated_at ON public.workflow_cases;
CREATE TRIGGER trigger_update_workflow_cases_updated_at
    BEFORE UPDATE ON public.workflow_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sop_rules_updated_at ON public.sop_rules;
CREATE TRIGGER update_sop_rules_updated_at
    BEFORE UPDATE ON public.sop_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Compliance violation auto-detection
CREATE OR REPLACE FUNCTION check_compliance_violations()
RETURNS TRIGGER AS $$
DECLARE
    call_count INTEGER;
BEGIN
    IF NEW.action_type = 'CALL' THEN
        SELECT COUNT(*) INTO call_count
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
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_compliance_check ON public.agent_actions;
CREATE TRIGGER trigger_compliance_check
AFTER INSERT ON public.agent_actions
FOR EACH ROW EXECUTE FUNCTION check_compliance_violations();

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'PART 1 COMPLETED!' as status,
       'Now run PART 2' as next_step;
