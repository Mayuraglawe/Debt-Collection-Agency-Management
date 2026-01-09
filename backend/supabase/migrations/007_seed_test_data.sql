-- Seed Data for Testing
-- Run this after all migrations (003, 004, 005, 006)

-- ============================================
-- SEED TEST CASES (10 sample cases)
-- ============================================

INSERT INTO public.debtors (id, full_name, email, phone, address, city, state, postal_code, created_at) VALUES
('d1111111-1111-1111-1111-111111111111', 'Rajesh Kumar', 'rajesh.kumar@example.com', '+91-9876543210', '123 MG Road', 'Mumbai', 'Maharashtra', '400001', NOW()),
('d2222222-2222-2222-2222-222222222222', 'Priya Sharma', 'priya.sharma@example.com', '+91-9876543211', '456 Park Street', 'Kolkata', 'West Bengal', '700016', NOW()),
('d3333333-3333-3333-3333-333333333333', 'Amit Patel', 'amit.patel@example.com', '+91-9876543212', '789 Brigade Road', 'Bangalore', 'Karnataka', '560001', NOW()),
('d4444444-4444-4444-4444-444444444444', 'Sneha Reddy', 'sneha.reddy@example.com', '+91-9876543213', '321 Hitech City', 'Hyderabad', 'Telangana', '500081', NOW()),
('d5555555-5555-5555-5555-555555555555', 'Vikram Singh', 'vikram.singh@example.com', '+91-9876543214', '654 CP Connaught Place', 'Delhi', 'Delhi', '110001', NOW()),
('d6666666-6666-6666-6666-666666666666', 'Anjali Mehta', 'anjali.mehta@example.com', '+91-9876543215', '987 MG Road', 'Pune', 'Maharashtra', '411001', NOW()),
('d7777777-7777-7777-7777-777777777777', 'Karthik Iyer', 'karthik.iyer@example.com', '+91-9876543216', '147 Anna Salai', 'Chennai', 'Tamil Nadu', '600002', NOW()),
('d8888888-8888-8888-8888-888888888888', 'Neha Gupta', 'neha.gupta@example.com', '+91-9876543217', '258 Sector 18', 'Noida', 'Uttar Pradesh', '201301', NOW()),
('d9999999-9999-9999-9999-999999999999', 'Arjun Nair', 'arjun.nair@example.com', '+91-9876543218', '369 Marine Drive', 'Kochi', 'Kerala', '682031', NOW()),
('da111111-1111-1111-1111-111111111111', 'Divya Krishnan', 'divya.k@example.com', '+91-9876543219', '741 Residency Road', 'Bangalore', 'Karnataka', '560025', NOW());

-- Get manager and agent IDs (from seed_users)
-- MANAGER: manager@atlasdca.com
-- AGENT: agent@atlasdca.com

-- Insert workflow cases
INSERT INTO public.workflow_cases (
    id, case_number, debtor_id, amount, original_amount, recovered_amount,
    status, priority, assigned_dca_agency, assigned_manager_id, assigned_agent_id,
    recovery_probability, recommended_strategy, sla_due_date, due_date,
    created_by, created_at, updated_at
) VALUES
-- CRITICAL priority cases
('c1111111-1111-1111-1111-111111111111', 'CASE-2024-001', 'd1111111-1111-1111-1111-111111111111', 250000.00, 250000.00, 0.00, 
 'PENDING', 'CRITICAL', NULL, NULL, NULL, 85.5, 'Direct contact recommended', NOW() + INTERVAL '2 days', NOW() + INTERVAL '5 days',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com'), NOW(), NOW()),

('c2222222-2222-2222-2222-222222222222', 'CASE-2024-002', 'd2222222-2222-2222-2222-222222222222', 180000.00, 180000.00, 45000.00,
 'ASSIGNED', 'HIGH', 'DCA Prime', 
 (SELECT id FROM profiles WHERE email = 'manager@atlasdca.com'),
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 78.2, 'Payment plan negotiation', NOW() + INTERVAL '3 days', NOW() + INTERVAL '7 days',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com'), NOW(), NOW()),

-- HIGH priority cases  
('c3333333-3333-3333-3333-333333333333', 'CASE-2024-003', 'd3333333-3333-3333-3333-333333333333', 120000.00, 120000.00, 0.00,
 'ALLOCATED', 'HIGH', 'DCA Elite',
 (SELECT id FROM profiles WHERE email = 'manager@atlasdca.com'), NULL,
 72.5, 'Multiple follow-ups needed', NOW() + INTERVAL '4 days', NOW() + INTERVAL '10 days',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com'), NOW(), NOW()),

('c4444444-4444-4444-4444-444444444444', 'CASE-2024-004', 'd4444444-4444-4444-4444-444444444444', 95000.00, 95000.00, 20000.00,
 'IN_PROGRESS', 'MEDIUM',  'DCA Standard',
 (SELECT id FROM profiles WHERE email = 'manager@atlasdca.com'),
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 65.3, 'Regular follow-up', NOW() + INTERVAL '5 days', NOW() + INTERVAL '15 days',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com'), NOW(), NOW()),

-- MEDIUM priority cases
('c5555555-5555-5555-5555-555555555555', 'CASE-2024-005', 'd5555555-5555-5555-5555-555555555555', 75000.00, 75000.00, 0.00,
 'PENDING', 'MEDIUM', NULL, NULL, NULL,
 58.7, 'Standard protocol', NOW() + INTERVAL '7 days', NOW() + INTERVAL '20 days',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com'), NOW(), NOW()),

('c6666666-6666-6666-6666-666666666666', 'CASE-2024-006', 'd6666666-6666-6666-6666-666666666666', 65000.00, 65000.00, 65000.00,
 'RESOLVED', 'LOW', 'DCA Prime',
 (SELECT id FROM profiles WHERE email = 'manager@atlasdca.com'),
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 92.1, 'Friendly negotiation', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com'), NOW() - INTERVAL '10 days', NOW()),

-- LOW priority cases
('c7777777-7777-7777-7777-777777777777', 'CASE-2024-007', 'd7777777-7777-7777-7777-777777777777', 45000.00, 45000.00, 0.00,
 'ALLOCATED', 'LOW', 'DCA West',
 (SELECT id FROM profiles WHERE email = 'manager@atlasdca.com'), NULL,
 45.2, 'Soft approach', NOW() + INTERVAL '10 days', NOW() + INTERVAL '30 days',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com'), NOW(), NOW()),

('c8888888-8888-8888-8888-888888888888', 'CASE-2024-008', 'd8888888-8888-8888-8888-888888888888', 155000.00, 155000.00, 0.00,
 'PENDING', 'CRITICAL', NULL, NULL, NULL,
 88.3, 'Immediate action required', NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com'), NOW(), NOW()),

('c9999999-9999-9999-9999-999999999999', 'CASE-2024-009', 'd9999999-9999-9999-9999-999999999999', 200000.00, 200000.00, 50000.00,
 'IN_PROGRESS', 'HIGH', 'DCA Elite',
 (SELECT id FROM profiles WHERE email = 'manager@atlasdca.com'),
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 75.8, 'Partial payment received', NOW() + INTERVAL '6 days', NOW() + INTERVAL '12 days',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com'), NOW(), NOW()),

('ca111111-1111-1111-1111-111111111111', 'CASE-2024-010', 'da111111-1111-1111-1111-111111111111', 85000.00, 85000.00, 0.00,
 'ASSIGNED', 'MEDIUM', 'DCA Standard',
 (SELECT id FROM profiles WHERE email = 'manager@atlasdca.com'),
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 62.4, 'Standard collection', NOW() + INTERVAL '8 days', NOW() + INTERVAL '18 days',
 (SELECT id FROM profiles WHERE email = 'admin@atlasdca.com'), NOW(), NOW());

-- ============================================
-- SEED AGENT ACTIONS (Sample interactions)
-- ============================================

INSERT INTO public.agent_actions (
    case_id, agent_id, action_type, outcome, notes, duration_seconds,
    promise_amount, payment_amount, compliant, created_at
) VALUES
-- Actions for CASE-2024-002 (partial payment received)
('c2222222-2222-2222-2222-222222222222', 
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 'CALL', 'PTP', 'Debtor agreed to pay 45000 by end of week', 420,
 45000.00, NULL, true, NOW() - INTERVAL '3 days'),

('c2222222-2222-2222-2222-222222222222',
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 'PAYMENT', 'PAYMENT_RECEIVED', 'Received partial payment via UPI', NULL,
 NULL, 45000.00, true, NOW() - INTERVAL '1 day'),

-- Actions for CASE-2024-004
('c4444444-4444-4444-4444-444444444444',
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 'CALL', 'RPC', 'Spoke with debtor, committed to 20K payment', 360,
 20000.00, NULL, true, NOW() - INTERVAL '5 days'),

('c4444444-4444-4444-4444-444444444444',
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 'PAYMENT', 'PAYMENT_RECEIVED', 'Bank transfer received', NULL,
 NULL, 20000.00, true, NOW() - INTERVAL '2 days'),

-- Actions for CASE-2024-006 (resolved)
('c6666666-6666-6666-6666-666666666666',
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 'CALL', 'PTP', 'Debtor agreed to full settlement', 480,
 65000.00, NULL, true, NOW() - INTERVAL '8 days'),

('c6666666-6666-6666-6666-666666666666',
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 'PAYMENT', 'PAYMENT_RECEIVED', 'Full payment received - case closed', NULL,
 NULL, 65000.00, true, NOW() - INTERVAL '5 days'),

-- Actions for CASE-2024-009 
('c9999999-9999-9999-9999-999999999999',
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 'CALL', 'RPC', 'Initial contact successful', 300,
 NULL, NULL, true, NOW() - INTERVAL '4 days'),

('c9999999-9999-9999-9999-999999999999',
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 'PAYMENT', 'PAYMENT_RECEIVED', 'Partial payment 50K', NULL,
 NULL, 50000.00, true, NOW() - INTERVAL '2 days');

-- ============================================
-- SEED CASE ASSIGNMENTS
-- ============================================

INSERT INTO public.case_assignments (
    case_id, assigned_to, assigned_by, assignment_date, is_active
) VALUES
('c2222222-2222-2222-2222-222222222222',
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 (SELECT id FROM profiles WHERE email = 'manager@atlasdca.com'),
 NOW() - INTERVAL '5 days', true),

('c4444444-4444-4444-4444-444444444444',
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 (SELECT id FROM profiles WHERE email = 'manager@atlasdca.com'),
 NOW() - INTERVAL '6 days', true),

('c6666666-6666-6666-6666-666666666666',
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 (SELECT id FROM profiles WHERE email = 'manager@atlasdca.com'),
 NOW() - INTERVAL '10 days', false),

('c9999999-9999-9999-9999-999999999999',
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 (SELECT id FROM profiles WHERE email = 'manager@atlasdca.com'),
 NOW() - INTERVAL '5 days', true),

('ca111111-1111-1111-1111-111111111111',
 (SELECT id FROM profiles WHERE email = 'agent@atlasdca.com'),
 (SELECT id FROM profiles WHERE email = 'manager@atlasdca.com'),
 NOW() - INTERVAL '3 days', true);

-- ============================================
-- Summary of Seed Data
-- ============================================
-- 10 Debtors created
-- 10 Workflow cases created with different statuses:
--   - 3 PENDING (awaiting allocation)
--   - 2 ALLOCATED (assigned to manager)
--   - 3 ASSIGNED/IN_PROGRESS (active with agent)
--   - 1 RESOLVED (completed)
--   - 1 CLOSED (archived)
-- 8 Agent actions logged
-- 5 Case assignments created
-- Total recovered amount: ₹180,000 out of ₹1,275,000

SELECT 'Seed data inserted successfully!' as status;
