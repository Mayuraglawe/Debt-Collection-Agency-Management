import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// API client for backend calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error?.message || error.message || 'Request failed');
    }

    return response.json();
}

// Convenience methods
export const api = {
    get: <T>(endpoint: string) => apiClient<T>(endpoint),
    post: <T>(endpoint: string, data: unknown) =>
        apiClient<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: <T>(endpoint: string, data: unknown) =>
        apiClient<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: <T>(endpoint: string) =>
        apiClient<T>(endpoint, { method: 'DELETE' }),
};

// Database types
export interface Debtor {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    total_debt: number;
    total_recovered: number;
    risk_score: number | null;
    status: 'ACTIVE' | 'INACTIVE' | 'SETTLED' | 'DEFAULTED';
    created_at: string;
}

export interface Case {
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
    debtor_name?: string;
    debtor_email?: string;
    debtor_phone?: string;
    created_at: string;
}

export interface DashboardKPIs {
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
}

export interface AgentInfo {
    id: string;
    type: string;
    name: string;
    description: string;
    status: 'ACTIVE' | 'IDLE' | 'ERROR';
    total_actions: number;
    successful_actions: number;
    failed_actions: number;
    success_rate: string;
    avg_duration_ms: number;
    last_action_at: string | null;
}

export interface Prediction {
    id: string;
    case_id: string;
    recovery_probability: number;
    risk_category: string;
    recommended_strategy: string;
    model_version: string;
    created_at: string;
}
