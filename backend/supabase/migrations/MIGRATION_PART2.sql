-- =====================================================
-- PART 2: Seed Data and COMPLIANCE_OFFICER Policies
-- =====================================================
-- Run this AFTER Part 1 is complete
-- =====================================================

-- =====================================================
-- STEP 0: Fix any missing columns in tables
-- =====================================================

-- Add body column to communication_templates if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'communication_templates' AND column_name = 'body'
    ) THEN
        ALTER TABLE public.communication_templates ADD COLUMN body TEXT;
    END IF;
END $$;

-- Add subject column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'communication_templates' AND column_name = 'subject'
    ) THEN
        ALTER TABLE public.communication_templates ADD COLUMN subject TEXT;
    END IF;
END $$;

-- Add variables column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'communication_templates' AND column_name = 'variables'
    ) THEN
        ALTER TABLE public.communication_templates ADD COLUMN variables JSONB;
    END IF;
END $$;

-- =====================================================
-- STEP 1: Update policies to include COMPLIANCE_OFFICER
-- =====================================================

-- Update agent actions policy
DROP POLICY IF EXISTS "Users can view actions" ON public.agent_actions;
CREATE POLICY "Users can view actions" ON public.agent_actions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (
            profiles.role::text IN ('ADMIN', 'MANAGER', 'COMPLIANCE_OFFICER')
            OR agent_actions.agent_id = auth.uid()
        )
    ));

-- Update compliance violations policies
DROP POLICY IF EXISTS "Admins can view violations" ON public.compliance_violations;
DROP POLICY IF EXISTS "Admins can manage violations" ON public.compliance_violations;

CREATE POLICY "Compliance staff can view violations" ON public.compliance_violations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role::text IN ('COMPLIANCE_OFFICER', 'ADMIN')
    ));

CREATE POLICY "Compliance staff can manage violations" ON public.compliance_violations FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role::text IN ('COMPLIANCE_OFFICER', 'ADMIN')
    ));

-- Compliance reports policies
DROP POLICY IF EXISTS "Compliance staff can view reports" ON public.compliance_reports;
CREATE POLICY "Compliance staff can view reports" ON public.compliance_reports FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role::text IN ('COMPLIANCE_OFFICER', 'ADMIN')
    ));

-- =====================================================
-- STEP 2: Seed Default Data
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
('High Value Cases', 'VALUE_BASED', 'Cases with amount > 1,00,000', 10, '{"amount": {"min": 100000}}'::jsonb, 'DCA Prime'),
('Critical Priority', 'PRIORITY_BASED', 'Critical priority cases to specialist team', 20, '{"priority": "CRITICAL"}'::jsonb, 'DCA Elite'),
('High Recovery Probability', 'RECOVERY_BASED', 'Cases with >70% recovery chance', 30, '{"recovery_probability": {"min": 70}}'::jsonb, 'DCA Elite'),
('Mumbai Region', 'GEO_BASED', 'All Mumbai cases to West region team', 40, '{"city": "Mumbai"}'::jsonb, 'DCA West'),
('Default Assignment', 'CUSTOM', 'Fallback for unmatched cases', 999, '{}'::jsonb, 'DCA Standard')
ON CONFLICT (rule_name) DO NOTHING;

-- Communication Templates - SKIPPED (table has different schema from migration 001)
-- If you need templates, add them manually via the UI

-- =====================================================
-- STEP 3: Seed Test Debtors
-- =====================================================

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

-- =====================================================
-- STEP 4: Seed Test Workflow Cases
-- =====================================================

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
-- FINAL VERIFICATION
-- =====================================================

SELECT 
    'MIGRATION COMPLETE!' as status,
    (SELECT COUNT(*) FROM public.workflow_cases) as workflow_cases,
    (SELECT COUNT(*) FROM public.allocation_rules) as allocation_rules,
    (SELECT COUNT(*) FROM public.debtors) as debtors,
    (SELECT COUNT(*) FROM public.sop_rules) as sop_rules;
