import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Client for public operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: false,
    },
});

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : supabase;

// Database types (generated from Supabase schema)
export type Database = {
    public: {
        Tables: {
            debtors: {
                Row: {
                    id: string;
                    name: string;
                    email: string | null;
                    phone: string | null;
                    address: string | null;
                    city: string | null;
                    state: string | null;
                    postal_code: string | null;
                    total_debt: number;
                    total_recovered: number;
                    risk_score: number | null;
                    credit_score: number | null;
                    status: 'ACTIVE' | 'INACTIVE' | 'SETTLED' | 'DEFAULTED';
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['debtors']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['debtors']['Insert']>;
            };
            cases: {
                Row: {
                    id: string;
                    case_number: string;
                    debtor_id: string;
                    amount: number;
                    original_amount: number;
                    due_date: string;
                    days_past_due: number;
                    status: 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'SETTLED' | 'CLOSED' | 'WRITTEN_OFF';
                    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
                    recovery_probability: number | null;
                    recommended_strategy: string | null;
                    assigned_agent_id: string | null;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['cases']['Row'], 'id' | 'case_number' | 'created_at' | 'updated_at' | 'days_past_due'>;
                Update: Partial<Database['public']['Tables']['cases']['Insert']>;
            };
            transactions: {
                Row: {
                    id: string;
                    case_id: string;
                    debtor_id: string;
                    amount: number;
                    type: 'PAYMENT' | 'ADJUSTMENT' | 'WRITE_OFF' | 'RECOVERY';
                    method: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | null;
                    reference_number: string | null;
                    note: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
            };
            communications: {
                Row: {
                    id: string;
                    case_id: string;
                    debtor_id: string;
                    channel: 'EMAIL' | 'SMS' | 'CALL' | 'LETTER';
                    subject: string | null;
                    content: string;
                    status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
                    scheduled_at: string | null;
                    sent_at: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['communications']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['communications']['Insert']>;
            };
            predictions: {
                Row: {
                    id: string;
                    case_id: string;
                    debtor_id: string;
                    recovery_probability: number;
                    risk_category: string | null;
                    recommended_strategy: string | null;
                    model_version: string;
                    features: Record<string, unknown> | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['predictions']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['predictions']['Insert']>;
            };
            agent_logs: {
                Row: {
                    id: string;
                    agent_type: 'PREDICTIVE' | 'NEGOTIATION' | 'COMPLIANCE' | 'RPA';
                    action: string;
                    case_id: string | null;
                    debtor_id: string | null;
                    input_data: Record<string, unknown> | null;
                    output_data: Record<string, unknown> | null;
                    result_status: string | null;
                    duration_ms: number | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['agent_logs']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['agent_logs']['Insert']>;
            };
        };
        Views: {
            dashboard_kpis: {
                Row: {
                    active_cases: number;
                    total_cases: number;
                    total_debt: number;
                    total_recovered: number;
                    recovery_rate: number;
                    open_cases: number;
                    in_progress_cases: number;
                    escalated_cases: number;
                    settled_cases: number;
                    avg_days_past_due: number;
                };
            };
            agent_performance: {
                Row: {
                    agent_type: string;
                    total_actions: number;
                    successful_actions: number;
                    failed_actions: number;
                    avg_duration_ms: number;
                    last_action_at: string;
                };
            };
        };
    };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
