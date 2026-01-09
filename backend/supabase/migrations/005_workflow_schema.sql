-- =====================================================
-- Atlas DCA - Workflow Management Schema
-- Migration: 005_workflow_schema
-- Description: Creates tables for workflow cases, assignments, and agent actions
-- =====================================================

-- Create ENUM types for workflow
CREATE TYPE case_status AS ENUM (
    'PENDING',
    'ALLOCATED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'ESCALATED',
    'CLOSED'
);

CREATE TYPE case_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

CREATE TYPE action_type AS ENUM (
    'CALL',
    'EMAIL',
    'SMS',
    'PAYMENT',
    'NEGOTIATION',
    'ESCALATION',
    'NOTE'
);

CREATE TYPE outcome_type AS ENUM (
    'PTP',              -- Promise to Pay
    'RPC',              -- Right Party Contact
    'BROKEN_PROMISE',
    'DISPUTE',
    'PAYMENT_RECEIVED',
    'NO_CONTACT',
    'LEFT_MESSAGE',
    'CALLBACK_REQUESTED',
    'SKIP_TRACE',
    'DECEASED',
    'BANKRUPTCY'
);

-- =====================================================
-- WORKFLOW CASES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.workflow_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number TEXT UNIQUE NOT NULL,
    debtor_id UUID REFERENCES public.debtors(id) ON DELETE SET NULL,
    
    -- Financial details
    amount DECIMAL(12,2) NOT NULL,
    original_amount DECIMAL(12,2) NOT NULL,
    recovered_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Status and priority
    status case_status DEFAULT 'PENDING' NOT NULL,
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
    
    -- Indexes for faster queries
    CONSTRAINT valid_recovery_probability CHECK (recovery_probability >= 0 AND recovery_probability <= 100),
    CONSTRAINT valid_amounts CHECK (amount >= 0 AND original_amount >= 0 AND recovered_amount >= 0)
);

-- Create indexes
CREATE INDEX idx_workflow_cases_status ON public.workflow_cases(status);
CREATE INDEX idx_workflow_cases_priority ON public.workflow_cases(priority);
CREATE INDEX idx_workflow_cases_assigned_agent ON public.workflow_cases(assigned_agent_id);
CREATE INDEX idx_workflow_cases_assigned_manager ON public.workflow_cases(assigned_manager_id);
CREATE INDEX idx_workflow_cases_sla_due ON public.workflow_cases(sla_due_date);

-- =====================================================
-- CASE ASSIGNMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.case_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.workflow_cases(id) ON DELETE CASCADE NOT NULL,
    
    -- Assignment details
    assigned_to UUID REFERENCES public.profiles(id) NOT NULL,
    assigned_by UUID REFERENCES public.profiles(id) NOT NULL,
    assignment_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Targets
    target_recovery DECIMAL(12,2),
    target_date TIMESTAMPTZ,
    
    -- Notes
    notes TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_case_assignments_case ON public.case_assignments(case_id);
CREATE INDEX idx_case_assignments_assigned_to ON public.case_assignments(assigned_to);
CREATE INDEX idx_case_assignments_active ON public.case_assignments(is_active);

-- =====================================================
-- AGENT ACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.agent_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.workflow_cases(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES public.profiles(id) NOT NULL,
    
    -- Action details
    action_type action_type NOT NULL,
    outcome outcome_type,
    
    -- Communication details
    contact_method TEXT,
    duration_seconds INTEGER,
    
    -- Outcomes
    promise_amount DECIMAL(12,2),
    promise_date DATE,
    payment_amount DECIMAL(12,2),
    
    -- Notes and follow-up
    notes TEXT,
    next_follow_up TIMESTAMPTZ,
    
    -- Compliance
    compliant BOOLEAN DEFAULT true,
    compliance_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_actions_case ON public.agent_actions(case_id);
CREATE INDEX idx_agent_actions_agent ON public.agent_actions(agent_id);
CREATE INDEX idx_agent_actions_created ON public.agent_actions(created_at);
CREATE INDEX idx_agent_actions_outcome ON public.agent_actions(outcome);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.workflow_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

-- WORKFLOW CASES POLICIES

-- Admins can see all cases
CREATE POLICY "Admins can view all workflow cases"
    ON public.workflow_cases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Managers can see cases assigned to them
CREATE POLICY "Managers can view assigned cases"
    ON public.workflow_cases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'MANAGER'
            AND (workflow_cases.assigned_manager_id = auth.uid() OR workflow_cases.assigned_manager_id IS NULL)
        )
    );

-- Agents can see cases assigned to them
CREATE POLICY "Agents can view their assigned cases"
    ON public.workflow_cases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'AGENT'
            AND workflow_cases.assigned_agent_id = auth.uid()
        )
    );

-- Admins can insert/update/delete all cases
CREATE POLICY "Admins can manage all workflow cases"
    ON public.workflow_cases FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Managers can update their assigned cases
CREATE POLICY "Managers can update assigned cases"
    ON public.workflow_cases FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'MANAGER'
            AND workflow_cases.assigned_manager_id = auth.uid()
        )
    );

-- Agents can update their assigned cases
CREATE POLICY "Agents can update their assigned cases"
    ON public.workflow_cases FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'AGENT'
            AND workflow_cases.assigned_agent_id = auth.uid()
        )
    );

-- CASE ASSIGNMENTS POLICIES

CREATE POLICY "Admins and Managers can view assignments"
    ON public.case_assignments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('ADMIN', 'MANAGER')
        )
    );

CREATE POLICY "Agents can view their assignments"
    ON public.case_assignments FOR SELECT
    USING (
        case_assignments.assigned_to = auth.uid()
    );

CREATE POLICY "Admins and Managers can create assignments"
    ON public.case_assignments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('ADMIN', 'MANAGER')
        )
    );

-- AGENT ACTIONS POLICIES

CREATE POLICY "Users can view relevant actions"
    ON public.agent_actions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role IN ('ADMIN', 'MANAGER')
                OR agent_actions.agent_id = auth.uid()
            )
        )
    );

CREATE POLICY "Agents can insert their own actions"
    ON public.agent_actions FOR INSERT
    WITH CHECK (
        agent_actions.agent_id = auth.uid()
    );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update workflow_cases.updated_at on any change
CREATE OR REPLACE FUNCTION update_workflow_cases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workflow_cases_updated_at
    BEFORE UPDATE ON public.workflow_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_cases_updated_at();

-- Update last_contact_date when agent action is logged
CREATE OR REPLACE FUNCTION update_case_last_contact()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.workflow_cases
    SET last_contact_date = NEW.created_at
    WHERE id = NEW.case_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_case_last_contact
    AFTER INSERT ON public.agent_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_case_last_contact();

-- =====================================================
-- SUMMARY
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Workflow Schema Created Successfully';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - workflow_cases';
    RAISE NOTICE '  - case_assignments';
    RAISE NOTICE '  - agent_actions';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS policies enabled for all tables';
    RAISE NOTICE 'Triggers configured for automatic updates';
    RAISE NOTICE '========================================';
END $$;
