import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mwdofqdltingaspryanv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13ZG9mcWRsdGluZ2FzcHJ5YW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjA4NTcsImV4cCI6MjA4MzI5Njg1N30.ImIZzZWd8dbk4Bxhk8StoumycjaoPzjr_s1x27kqTtQ';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Using fallback Supabase configuration');
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

// Authentication types
export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    department: string | null;
    phone: string | null;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    full_name: string | null;
    avatar_url: string | null;
}

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

// =====================================================
// WORKFLOW TYPES
// =====================================================

export type CaseStatus = 'PENDING' | 'ALLOCATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED' | 'CLOSED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ActionType = 'CALL' | 'EMAIL' | 'SMS' | 'PAYMENT' | 'NEGOTIATION' | 'ESCALATION' | 'NOTE';
export type OutcomeType =
    | 'PTP'              // Promise to Pay
    | 'RPC'              // Right Party Contact
    | 'BROKEN_PROMISE'
    | 'DISPUTE'
    | 'PAYMENT_RECEIVED'
    | 'NO_CONTACT'
    | 'LEFT_MESSAGE'
    | 'CALLBACK_REQUESTED'
    | 'SKIP_TRACE'
    | 'DECEASED'
    | 'BANKRUPTCY';

export interface WorkflowCase {
    id: string;
    case_number: string;
    debtor_id: string | null;

    // Financial details
    amount: number;
    original_amount: number;
    recovered_amount: number;

    // Status and priority
    status: CaseStatus;
    priority: CasePriority;

    // Assignment details
    assigned_dca_agency: string | null;
    assigned_manager_id: string | null;
    assigned_agent_id: string | null;

    // AI predictions
    recovery_probability: number | null;
    recommended_strategy: string | null;

    // SLA and dates
    sla_due_date: string | null;
    due_date: string | null;
    last_contact_date: string | null;
    next_follow_up: string | null;

    // Metadata
    created_by: string | null;
    created_at: string;
    updated_at: string;

    // Joined data (optional)
    debtor_name?: string;
    debtor_email?: string;
    debtor_phone?: string;
    agent_name?: string;
    manager_name?: string;
}

export interface CaseAssignment {
    id: string;
    case_id: string;
    assigned_to: string;
    assigned_by: string;
    assignment_date: string;
    target_recovery: number | null;
    target_date: string | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
}

export interface AgentAction {
    id: string;
    case_id: string;
    agent_id: string;

    // Action details
    action_type: ActionType;
    outcome: OutcomeType | null;

    // Communication details
    contact_method: string | null;
    duration_seconds: number | null;

    // Outcomes
    promise_amount: number | null;
    promise_date: string | null;
    payment_amount: number | null;

    // Notes and follow-up
    notes: string | null;
    next_follow_up: string | null;

    // Compliance
    compliant: boolean;
    compliance_notes: string | null;

    created_at: string;

    // Joined data (optional)
    agent_name?: string;
    case_number?: string;
}

// Workflow statistics and analytics
export interface WorkflowStats {
    total_cases: number;
    pending_cases: number;
    assigned_cases: number;
    in_progress_cases: number;
    resolved_cases: number;
    total_amount: number;
    recovered_amount: number;
    recovery_rate: number;
    avg_resolution_days: number;
}

export interface AgentPerformance {
    agent_id: string;
    agent_name: string;
    assigned_cases: number;
    resolved_cases: number;
    total_recovered: number;
    avg_recovery_rate: number;
    total_actions: number;
    compliance_score: number;
}

