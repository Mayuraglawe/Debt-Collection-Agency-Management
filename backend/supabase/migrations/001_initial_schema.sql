-- Atlas DCA Database Schema for Supabase
-- Migration: 001_initial_schema
-- Description: Creates all core tables for the debt collection management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE debtor_status AS ENUM ('ACTIVE', 'INACTIVE', 'SETTLED', 'DEFAULTED');
CREATE TYPE case_status AS ENUM ('OPEN', 'IN_PROGRESS', 'ESCALATED', 'SETTLED', 'CLOSED', 'WRITTEN_OFF');
CREATE TYPE priority_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE transaction_type AS ENUM ('PAYMENT', 'ADJUSTMENT', 'WRITE_OFF', 'RECOVERY');
CREATE TYPE payment_method AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'UPI', 'CHEQUE');
CREATE TYPE channel_type AS ENUM ('EMAIL', 'SMS', 'CALL', 'LETTER');
CREATE TYPE comm_status AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');
CREATE TYPE agent_type AS ENUM ('PREDICTIVE', 'NEGOTIATION', 'COMPLIANCE', 'RPA');
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'AGENT', 'VIEWER');

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'AGENT',
    department TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- DEBTORS TABLE
-- =====================================================

CREATE TABLE public.debtors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    alternate_phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'India',
    total_debt DECIMAL(15,2) DEFAULT 0,
    total_recovered DECIMAL(15,2) DEFAULT 0,
    risk_score DECIMAL(5,2),
    credit_score INTEGER,
    income_level DECIMAL(15,2),
    employment_status TEXT,
    status debtor_status DEFAULT 'ACTIVE',
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.debtors ENABLE ROW LEVEL SECURITY;

-- Policies for debtors
CREATE POLICY "Authenticated users can view debtors" ON public.debtors
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert debtors" ON public.debtors
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update debtors" ON public.debtors
    FOR UPDATE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_debtors_status ON public.debtors(status);
CREATE INDEX idx_debtors_email ON public.debtors(email);
CREATE INDEX idx_debtors_phone ON public.debtors(phone);
CREATE INDEX idx_debtors_risk_score ON public.debtors(risk_score);

-- =====================================================
-- CASES TABLE
-- =====================================================

CREATE TABLE public.cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_number TEXT UNIQUE NOT NULL,
    debtor_id UUID NOT NULL REFERENCES public.debtors(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    original_amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    days_past_due INTEGER DEFAULT 0,
    status case_status DEFAULT 'OPEN',
    priority priority_level DEFAULT 'MEDIUM',
    recovery_probability DECIMAL(5,4),
    recommended_strategy TEXT,
    assigned_agent_id UUID REFERENCES public.profiles(id),
    escalated_to UUID REFERENCES public.profiles(id),
    escalation_reason TEXT,
    escalated_at TIMESTAMPTZ,
    settlement_amount DECIMAL(15,2),
    settled_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Policies for cases
CREATE POLICY "Authenticated users can view cases" ON public.cases
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert cases" ON public.cases
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update cases" ON public.cases
    FOR UPDATE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_cases_debtor ON public.cases(debtor_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_priority ON public.cases(priority);
CREATE INDEX idx_cases_assigned_agent ON public.cases(assigned_agent_id);
CREATE INDEX idx_cases_due_date ON public.cases(due_date);
CREATE INDEX idx_cases_recovery_prob ON public.cases(recovery_probability);
CREATE INDEX idx_cases_case_number ON public.cases(case_number);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    debtor_id UUID NOT NULL REFERENCES public.debtors(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    type transaction_type NOT NULL,
    method payment_method,
    reference_number TEXT,
    note TEXT,
    processed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
CREATE POLICY "Authenticated users can view transactions" ON public.transactions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert transactions" ON public.transactions
    FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX idx_transactions_case ON public.transactions(case_id);
CREATE INDEX idx_transactions_debtor ON public.transactions(debtor_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_created ON public.transactions(created_at);

-- =====================================================
-- COMMUNICATIONS TABLE
-- =====================================================

CREATE TABLE public.communications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    debtor_id UUID NOT NULL REFERENCES public.debtors(id) ON DELETE CASCADE,
    channel channel_type NOT NULL,
    template_id TEXT,
    subject TEXT,
    content TEXT NOT NULL,
    status comm_status DEFAULT 'PENDING',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    failed_reason TEXT,
    external_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- Policies for communications
CREATE POLICY "Authenticated users can view communications" ON public.communications
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert communications" ON public.communications
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update communications" ON public.communications
    FOR UPDATE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_communications_case ON public.communications(case_id);
CREATE INDEX idx_communications_debtor ON public.communications(debtor_id);
CREATE INDEX idx_communications_status ON public.communications(status);
CREATE INDEX idx_communications_channel ON public.communications(channel);
CREATE INDEX idx_communications_scheduled ON public.communications(scheduled_at);

-- =====================================================
-- PREDICTIONS TABLE
-- =====================================================

CREATE TABLE public.predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    debtor_id UUID NOT NULL REFERENCES public.debtors(id) ON DELETE CASCADE,
    recovery_probability DECIMAL(5,4) NOT NULL,
    risk_category TEXT,
    recommended_strategy TEXT,
    model_version TEXT NOT NULL,
    model_name TEXT,
    features JSONB,
    confidence_score DECIMAL(5,4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Policies for predictions
CREATE POLICY "Authenticated users can view predictions" ON public.predictions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert predictions" ON public.predictions
    FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX idx_predictions_case ON public.predictions(case_id);
CREATE INDEX idx_predictions_debtor ON public.predictions(debtor_id);
CREATE INDEX idx_predictions_prob ON public.predictions(recovery_probability);
CREATE INDEX idx_predictions_created ON public.predictions(created_at);

-- =====================================================
-- AGENT LOGS TABLE
-- =====================================================

CREATE TABLE public.agent_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_type agent_type NOT NULL,
    action TEXT NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    debtor_id UUID REFERENCES public.debtors(id) ON DELETE SET NULL,
    input_data JSONB,
    output_data JSONB,
    result_status TEXT,
    error_message TEXT,
    duration_ms INTEGER,
    model_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- Policies for agent_logs
CREATE POLICY "Authenticated users can view agent logs" ON public.agent_logs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert agent logs" ON public.agent_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX idx_agent_logs_type ON public.agent_logs(agent_type);
CREATE INDEX idx_agent_logs_case ON public.agent_logs(case_id);
CREATE INDEX idx_agent_logs_created ON public.agent_logs(created_at);
CREATE INDEX idx_agent_logs_action ON public.agent_logs(action);

-- =====================================================
-- COMPLIANCE RULES TABLE
-- =====================================================

CREATE TABLE public.compliance_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT NOT NULL,
    conditions JSONB NOT NULL,
    actions JSONB,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    effective_from DATE,
    effective_to DATE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;

-- Policies for compliance_rules
CREATE POLICY "Authenticated users can view compliance rules" ON public.compliance_rules
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage compliance rules" ON public.compliance_rules
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'MANAGER')
        )
    );

-- Indexes
CREATE INDEX idx_compliance_rules_type ON public.compliance_rules(rule_type);
CREATE INDEX idx_compliance_rules_active ON public.compliance_rules(is_active);

-- =====================================================
-- COMMUNICATION TEMPLATES TABLE
-- =====================================================

CREATE TABLE public.communication_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    channel channel_type NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    category TEXT,
    language TEXT DEFAULT 'en',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;

-- Policies for communication_templates
CREATE POLICY "Authenticated users can view templates" ON public.communication_templates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage templates" ON public.communication_templates
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'MANAGER')
        )
    );

-- Indexes
CREATE INDEX idx_templates_channel ON public.communication_templates(channel);
CREATE INDEX idx_templates_active ON public.communication_templates(is_active);

-- =====================================================
-- ANALYTICS SNAPSHOTS TABLE
-- =====================================================

CREATE TABLE public.analytics_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    total_cases INTEGER DEFAULT 0,
    open_cases INTEGER DEFAULT 0,
    in_progress_cases INTEGER DEFAULT 0,
    escalated_cases INTEGER DEFAULT 0,
    settled_cases INTEGER DEFAULT 0,
    closed_cases INTEGER DEFAULT 0,
    total_debt DECIMAL(15,2) DEFAULT 0,
    total_recovered DECIMAL(15,2) DEFAULT 0,
    recovery_rate DECIMAL(5,4) DEFAULT 0,
    avg_days_to_resolve DECIMAL(10,2),
    communications_sent INTEGER DEFAULT 0,
    predictions_made INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies for analytics_snapshots
CREATE POLICY "Authenticated users can view analytics" ON public.analytics_snapshots
    FOR SELECT TO authenticated USING (true);

-- Indexes
CREATE UNIQUE INDEX idx_analytics_date ON public.analytics_snapshots(snapshot_date);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debtors_updated_at
    BEFORE UPDATE ON public.debtors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communications_updated_at
    BEFORE UPDATE ON public.communications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_rules_updated_at
    BEFORE UPDATE ON public.compliance_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON public.communication_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate case number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.case_number IS NULL THEN
        NEW.case_number := 'DCA-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
            LPAD(NEXTVAL('case_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence for case numbers
CREATE SEQUENCE IF NOT EXISTS case_number_seq START 1;

-- Trigger for case number generation
CREATE TRIGGER set_case_number
    BEFORE INSERT ON public.cases
    FOR EACH ROW EXECUTE FUNCTION generate_case_number();

-- Function to update debtor totals on transaction
CREATE OR REPLACE FUNCTION update_debtor_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'PAYMENT' OR NEW.type = 'RECOVERY' THEN
        UPDATE public.debtors 
        SET total_recovered = total_recovered + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.debtor_id;
        
        -- Update case amount
        UPDATE public.cases
        SET amount = amount - NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.case_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for debtor totals
CREATE TRIGGER update_debtor_on_transaction
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_debtor_totals();

-- Function to calculate days past due
CREATE OR REPLACE FUNCTION calculate_days_past_due()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.due_date < CURRENT_DATE AND NEW.status NOT IN ('SETTLED', 'CLOSED', 'WRITTEN_OFF') THEN
        NEW.days_past_due := CURRENT_DATE - NEW.due_date;
    ELSE
        NEW.days_past_due := 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for days past due calculation
CREATE TRIGGER calculate_case_days_past_due
    BEFORE INSERT OR UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION calculate_days_past_due();

-- =====================================================
-- VIEWS
-- =====================================================

-- Dashboard KPIs View
CREATE OR REPLACE VIEW public.dashboard_kpis AS
SELECT
    COUNT(*) FILTER (WHERE status != 'CLOSED' AND status != 'WRITTEN_OFF') as active_cases,
    COUNT(*) as total_cases,
    COALESCE(SUM(original_amount), 0) as total_debt,
    COALESCE(SUM(original_amount - amount), 0) as total_recovered,
    CASE 
        WHEN SUM(original_amount) > 0 
        THEN ROUND((SUM(original_amount - amount) / SUM(original_amount)) * 100, 2)
        ELSE 0 
    END as recovery_rate,
    COUNT(*) FILTER (WHERE status = 'OPEN') as open_cases,
    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress_cases,
    COUNT(*) FILTER (WHERE status = 'ESCALATED') as escalated_cases,
    COUNT(*) FILTER (WHERE status = 'SETTLED') as settled_cases,
    ROUND(AVG(days_past_due), 0) as avg_days_past_due
FROM public.cases;

-- Agent Performance View
CREATE OR REPLACE VIEW public.agent_performance AS
SELECT
    al.agent_type,
    COUNT(*) as total_actions,
    COUNT(*) FILTER (WHERE result_status = 'SUCCESS') as successful_actions,
    COUNT(*) FILTER (WHERE result_status = 'FAILED') as failed_actions,
    ROUND(AVG(duration_ms)::numeric, 2) as avg_duration_ms,
    MAX(created_at) as last_action_at
FROM public.agent_logs al
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY al.agent_type;

-- Case Summary View
CREATE OR REPLACE VIEW public.case_summary AS
SELECT
    c.id,
    c.case_number,
    c.amount,
    c.original_amount,
    c.status,
    c.priority,
    c.recovery_probability,
    c.days_past_due,
    c.due_date,
    c.created_at,
    d.name as debtor_name,
    d.email as debtor_email,
    d.phone as debtor_phone,
    p.full_name as assigned_agent_name,
    (SELECT COUNT(*) FROM public.communications WHERE case_id = c.id) as communication_count,
    (SELECT COUNT(*) FROM public.transactions WHERE case_id = c.id) as transaction_count,
    (SELECT recovery_probability FROM public.predictions WHERE case_id = c.id ORDER BY created_at DESC LIMIT 1) as latest_prediction
FROM public.cases c
LEFT JOIN public.debtors d ON c.debtor_id = d.id
LEFT JOIN public.profiles p ON c.assigned_agent_id = p.id;

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Insert default compliance rules
INSERT INTO public.compliance_rules (name, description, rule_type, conditions, actions, is_active) VALUES
('Communication Hours', 'Restrict communication to business hours', 'TIMING', 
    '{"start_time": "09:00", "end_time": "21:00", "timezone": "Asia/Kolkata"}',
    '{"block_outside_hours": true}', true),
('Max Calls Per Day', 'Limit calls to 3 per day per debtor', 'FREQUENCY',
    '{"channel": "CALL", "max_per_day": 3}',
    '{"skip_if_exceeded": true}', true),
('Cool Off Period', 'Minimum gap between communications', 'FREQUENCY',
    '{"min_gap_hours": 48}',
    '{"skip_if_within_period": true}', true),
('Required Disclosure', 'Add required legal disclosure to all communications', 'CONTENT',
    '{"apply_to": ["EMAIL", "SMS", "LETTER"]}',
    '{"append_text": "This is an attempt to collect a debt. Any information obtained will be used for that purpose."}', true);

-- Insert default communication templates
INSERT INTO public.communication_templates (name, channel, subject, content, variables, category) VALUES
('First Reminder - Email', 'EMAIL', 'Payment Reminder for Account {{case_number}}', 
    'Dear {{debtor_name}},\n\nThis is a friendly reminder that your payment of ₹{{amount}} is due on {{due_date}}.\n\nPlease make the payment at your earliest convenience to avoid any late fees.\n\nBest regards,\nAtlas DCA',
    '["debtor_name", "amount", "due_date", "case_number"]', 'reminder'),
('Payment Due - SMS', 'SMS', NULL,
    'Dear {{debtor_name}}, your payment of ₹{{amount}} is overdue. Please pay by {{due_date}} to avoid further action. Call us at {{support_phone}} for assistance.',
    '["debtor_name", "amount", "due_date", "support_phone"]', 'reminder'),
('Settlement Offer', 'EMAIL', 'Special Settlement Offer for Account {{case_number}}',
    'Dear {{debtor_name}},\n\nWe are pleased to offer you a settlement opportunity. Pay ₹{{settlement_amount}} ({{discount_percent}}% off) by {{offer_expiry}} to close your account.\n\nThis is a limited-time offer.\n\nBest regards,\nAtlas DCA',
    '["debtor_name", "settlement_amount", "discount_percent", "offer_expiry", "case_number"]', 'settlement'),
('Escalation Notice', 'EMAIL', 'Urgent: Account {{case_number}} Requires Immediate Attention',
    'Dear {{debtor_name}},\n\nDespite our previous communications, your account remains unpaid. The outstanding amount is ₹{{amount}}.\n\nPlease contact us immediately at {{support_phone}} to discuss payment options.\n\nThis matter may be escalated if we do not hear from you within 7 days.\n\nBest regards,\nAtlas DCA',
    '["debtor_name", "amount", "case_number", "support_phone"]', 'escalation');

COMMENT ON TABLE public.debtors IS 'Stores debtor/customer information';
COMMENT ON TABLE public.cases IS 'Stores debt collection cases';
COMMENT ON TABLE public.transactions IS 'Stores payment and adjustment transactions';
COMMENT ON TABLE public.communications IS 'Stores all communication attempts';
COMMENT ON TABLE public.predictions IS 'Stores ML model predictions for cases';
COMMENT ON TABLE public.agent_logs IS 'Stores AI agent activity logs';
COMMENT ON TABLE public.compliance_rules IS 'Stores compliance rules configuration';
COMMENT ON TABLE public.communication_templates IS 'Stores reusable communication templates';
COMMENT ON TABLE public.analytics_snapshots IS 'Stores daily analytics snapshots';
