-- =====================================================
-- Atlas DCA - Supporting Tables for Admin Features
-- Migration: 006_admin_support_tables
-- Description: Creates tables for SOP rules, system config, and debtors
-- =====================================================

-- =====================================================
-- DEBTORS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.debtors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    date_of_birth DATE,
    ssn_last_4 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_debtors_email ON public.debtors(email);
CREATE INDEX idx_debtors_phone ON public.debtors(phone);

-- Enable RLS
ALTER TABLE public.debtors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debtors
CREATE POLICY "Users can view debtors"
    ON public.debtors FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Admins and Managers can manage debtors"
    ON public.debtors FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('ADMIN', 'MANAGER')
        )
    );

-- =====================================================
-- SOP RULES TABLE
-- =====================================================

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

CREATE INDEX idx_sop_rules_category ON public.sop_rules(category);
CREATE INDEX idx_sop_rules_active ON public.sop_rules(is_active);
CREATE INDEX idx_sop_rules_priority ON public.sop_rules(priority);

-- Enable RLS
ALTER TABLE public.sop_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SOP rules
CREATE POLICY "All users can view active SOP rules"
    ON public.sop_rules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage SOP rules"
    ON public.sop_rules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Seed default SOP rules
INSERT INTO public.sop_rules (name, category, description, priority, is_active) VALUES
('First Contact Protocol', 'Communication', 'Initial contact must be made within 24 hours of case assignment', 1, true),
('Payment Plan Approval', 'Financial', 'Payment plans exceeding 6 months require manager approval', 2, true),
('Escalation Threshold', 'Escalation', 'Cases with no contact after 7 attempts must be escalated', 1, true),
('Compliance Check', 'Compliance', 'All calls must be recorded and logged for compliance', 1, true),
('Follow-up Frequency', 'Communication', 'Minimum 3 business days between follow-up calls', 2, true),
('Dispute Resolution', 'Compliance', 'All disputes must be investigated within 48 hours', 1, true);

-- =====================================================
-- SYSTEM CONFIG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_config_key ON public.system_config(config_key);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system config
CREATE POLICY "Admins can view system config"
    ON public.system_config FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can manage system config"
    ON public.system_config FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Insert default system configuration
INSERT INTO public.system_config (config_key, config_value) VALUES
('database', '{"dbBackupEnabled": true, "dbBackupFrequency": "daily"}'),
('email', '{"emailProvider": "smtp", "smtpHost": "smtp.gmail.com", "smtpPort": "587"}'),
('notifications', '{"notificationsEnabled": true, "smsEnabled": true, "emailNotifications": true}'),
('security', '{"sessionTimeout": "30", "mfaRequired": false, "passwordExpiry": "90"}'),
('general', '{"appName": "Atlas DCA", "timezone": "Asia/Kolkata", "dateFormat": "DD/MM/YYYY"}')
ON CONFLICT (config_key) DO NOTHING;

-- =====================================================
-- COMMUNICATION TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- EMAIL, SMS, LEGAL
    subject TEXT,
    body TEXT NOT NULL,
    variables JSONB, -- List of available variables like {debtor_name}, {amount}
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON public.communication_templates(category);
CREATE INDEX idx_templates_active ON public.communication_templates(is_active);

-- Enable RLS
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "All users can view templates"
    ON public.communication_templates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage templates"
    ON public.communication_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Seed default templates
INSERT INTO public.communication_templates (name, category, subject, body, variables) VALUES
(
    'First Contact Email',
    'EMAIL',
    'Important Notice Regarding Your Account',
    'Dear {debtor_name},\n\nThis is an important notice regarding your account with account number {account_number}. The current outstanding balance is {amount}.\n\nWe would like to work with you to resolve this matter. Please contact us at your earliest convenience.\n\nSincerely,\nAtlas DCA',
    '["debtor_name", "account_number", "amount"]'::jsonb
),
(
    'Payment Reminder SMS',
    'SMS',
    NULL,
    'Reminder: Your payment of {amount} is due on {due_date}. Please call {company_phone} to arrange payment. -Atlas DCA',
    '["amount", "due_date", "company_phone"]'::jsonb
),
(
    'Legal Notice',
    'LEGAL',
    'Final Notice - Legal Action Pending',
    'FINAL NOTICE\n\nTo: {debtor_name}\nRe: Account #{account_number}\nAmount Due: {amount}\n\nThis is a final attempt to resolve this matter before legal proceedings are initiated. You have 15 days from the date of this notice to contact us.\n\nAtlas DCA\n{company_address}',
    '["debtor_name", "account_number", "amount", "company_address"]'::jsonb
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_debtors_updated_at
    BEFORE UPDATE ON public.debtors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sop_rules_updated_at
    BEFORE UPDATE ON public.sop_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON public.communication_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUMMARY
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Admin Support Tables Created Successfully';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - debtors';
    RAISE NOTICE '  - sop_rules (with 6 default rules)';
    RAISE NOTICE '  - system_config (with default settings)';
    RAISE NOTICE '  - communication_templates (with 3 templates)';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS policies enabled for all tables';
    RAISE NOTICE '========================================';
END $$;
