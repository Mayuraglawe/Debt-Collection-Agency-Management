-- Atlas DCA Seed Data
-- Run this in Supabase SQL Editor to add sample data

-- Insert sample debtors
INSERT INTO public.debtors (name, email, phone, address, city, state, postal_code, total_debt, risk_score, credit_score, status) VALUES
('Rajesh Kumar', 'rajesh.kumar@email.com', '+91 98765 43210', '123 MG Road', 'Mumbai', 'Maharashtra', '400001', 145000, 65.5, 620, 'ACTIVE'),
('Priya Sharma', 'priya.sharma@email.com', '+91 87654 32109', '456 Park Street', 'Delhi', 'Delhi', '110001', 287500, 45.2, 540, 'ACTIVE'),
('Amit Verma', 'amit.verma@email.com', '+91 76543 21098', '789 Lake View', 'Bangalore', 'Karnataka', '560001', 92000, 78.3, 680, 'ACTIVE'),
('Sneha Patel', 'sneha.patel@email.com', '+91 65432 10987', '321 Garden City', 'Ahmedabad', 'Gujarat', '380001', 175000, 52.8, 580, 'ACTIVE'),
('Vikram Singh', 'vikram.singh@email.com', '+91 54321 09876', '654 Hill Road', 'Pune', 'Maharashtra', '411001', 320000, 38.9, 510, 'ACTIVE'),
('Ananya Reddy', 'ananya.reddy@email.com', '+91 43210 98765', '987 Tech Park', 'Hyderabad', 'Telangana', '500001', 68000, 82.1, 720, 'ACTIVE'),
('Rahul Gupta', 'rahul.gupta@email.com', '+91 32109 87654', '147 Business District', 'Chennai', 'Tamil Nadu', '600001', 245000, 55.6, 595, 'ACTIVE'),
('Kavita Nair', 'kavita.nair@email.com', '+91 21098 76543', '258 Coastal Road', 'Kochi', 'Kerala', '682001', 128000, 71.2, 650, 'ACTIVE'),
('Suresh Menon', 'suresh.menon@email.com', '+91 10987 65432', '369 Industrial Area', 'Coimbatore', 'Tamil Nadu', '641001', 198000, 48.7, 560, 'ACTIVE'),
('Deepika Joshi', 'deepika.joshi@email.com', '+91 09876 54321', '741 IT Corridor', 'Noida', 'Uttar Pradesh', '201301', 156000, 63.4, 615, 'ACTIVE');

-- Insert cases for each debtor (using the debtor IDs)
DO $$
DECLARE
    debtor_rec RECORD;
    case_amount DECIMAL;
    due_date DATE;
    status_val case_status;
    priority_val priority_level;
BEGIN
    FOR debtor_rec IN SELECT id, name, total_debt FROM public.debtors LOOP
        -- Create 1-3 cases per debtor
        FOR i IN 1..FLOOR(RANDOM() * 3 + 1)::INT LOOP
            case_amount := FLOOR(RANDOM() * debtor_rec.total_debt * 0.5 + 10000);
            due_date := CURRENT_DATE - FLOOR(RANDOM() * 60 - 10)::INT;
            
            -- Random status
            status_val := (ARRAY['OPEN', 'IN_PROGRESS', 'ESCALATED', 'SETTLED'])[FLOOR(RANDOM() * 4 + 1)];
            priority_val := (ARRAY['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])[FLOOR(RANDOM() * 4 + 1)];
            
            INSERT INTO public.cases (debtor_id, amount, original_amount, due_date, status, priority, recovery_probability)
            VALUES (
                debtor_rec.id,
                case_amount,
                case_amount * (1 + RANDOM() * 0.2),
                due_date,
                status_val,
                priority_val,
                RANDOM() * 0.6 + 0.2
            );
        END LOOP;
    END LOOP;
END $$;

-- Insert sample communications
INSERT INTO public.communications (case_id, debtor_id, channel, subject, content, status, sent_at)
SELECT 
    c.id,
    c.debtor_id,
    (ARRAY['EMAIL', 'SMS', 'CALL'])[FLOOR(RANDOM() * 3 + 1)]::channel_type,
    'Payment Reminder for Account ' || c.case_number,
    'Dear Customer, this is a reminder regarding your outstanding payment.',
    (ARRAY['PENDING', 'SENT', 'DELIVERED'])[FLOOR(RANDOM() * 3 + 1)]::comm_status,
    NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30)
FROM public.cases c
LIMIT 20;

-- Insert sample agent logs
INSERT INTO public.agent_logs (agent_type, action, case_id, result_status, duration_ms)
SELECT 
    (ARRAY['PREDICTIVE', 'NEGOTIATION', 'COMPLIANCE', 'RPA'])[FLOOR(RANDOM() * 4 + 1)]::agent_type,
    (ARRAY['PREDICTION_GENERATED', 'PLAN_CREATED', 'COMPLIANCE_CHECK', 'EMAIL_SENT', 'SMS_SENT'])[FLOOR(RANDOM() * 5 + 1)],
    c.id,
    'SUCCESS',
    FLOOR(RANDOM() * 500 + 50)
FROM public.cases c
CROSS JOIN generate_series(1, 3)
LIMIT 50;

-- Insert sample predictions
INSERT INTO public.predictions (case_id, debtor_id, recovery_probability, risk_category, recommended_strategy, model_version)
SELECT 
    c.id,
    c.debtor_id,
    RANDOM() * 0.6 + 0.2,
    (ARRAY['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'])[FLOOR(RANDOM() * 3 + 1)],
    (ARRAY['STANDARD_FOLLOW_UP', 'NEGOTIATION_OFFER', 'ESCALATION'])[FLOOR(RANDOM() * 3 + 1)],
    '1.0.0'
FROM public.cases c;

-- Update totals in debtors table
UPDATE public.debtors d
SET total_debt = (
    SELECT COALESCE(SUM(original_amount), 0) 
    FROM public.cases c 
    WHERE c.debtor_id = d.id
),
total_recovered = (
    SELECT COALESCE(SUM(original_amount - amount), 0) 
    FROM public.cases c 
    WHERE c.debtor_id = d.id
);

-- Verify data was inserted
SELECT 'Debtors: ' || COUNT(*) FROM public.debtors
UNION ALL
SELECT 'Cases: ' || COUNT(*) FROM public.cases
UNION ALL
SELECT 'Communications: ' || COUNT(*) FROM public.communications
UNION ALL
SELECT 'Agent Logs: ' || COUNT(*) FROM public.agent_logs
UNION ALL
SELECT 'Predictions: ' || COUNT(*) FROM public.predictions;
