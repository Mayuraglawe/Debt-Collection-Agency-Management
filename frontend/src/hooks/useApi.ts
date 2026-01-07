'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, DashboardKPIs, Case, AgentInfo } from '@/lib/supabase';

// Hook for fetching dashboard KPIs
export function useDashboardKPIs() {
    const [data, setData] = useState<DashboardKPIs | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await api.get<DashboardKPIs>('/analytics/dashboard');
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch KPIs');
            // Use mock data as fallback
            setData({
                active_cases: 1236,
                total_cases: 2450,
                total_debt: 82500000,
                total_recovered: 56515000,
                recovery_rate: 68.5,
                open_cases: 342,
                in_progress_cases: 567,
                escalated_cases: 89,
                settled_cases: 1452,
                avg_days_past_due: 23,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

// Hook for fetching cases
export function useCases(filters?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
}) {
    const [data, setData] = useState<{ data: Case[]; pagination: any } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams();
            if (filters?.status) params.set('status', filters.status);
            if (filters?.priority) params.set('priority', filters.priority);
            if (filters?.search) params.set('search', filters.search);
            if (filters?.page) params.set('page', String(filters.page));
            if (filters?.limit) params.set('limit', String(filters.limit));

            const result = await api.get<{ data: Case[]; pagination: any }>(
                `/cases?${params.toString()}`
            );
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch cases');
            // Mock data fallback
            setData({
                data: [
                    {
                        id: '1',
                        case_number: 'DCA-2026-000001',
                        debtor_id: '1',
                        amount: 45000,
                        original_amount: 50000,
                        due_date: '2026-01-15',
                        days_past_due: 12,
                        status: 'IN_PROGRESS',
                        priority: 'HIGH',
                        recovery_probability: 0.72,
                        recommended_strategy: 'NEGOTIATION',
                        assigned_agent_id: null,
                        debtor_name: 'Rajesh Kumar',
                        debtor_email: 'rajesh@email.com',
                        debtor_phone: '+91 98765 43210',
                        created_at: '2026-01-01T00:00:00Z',
                    },
                    {
                        id: '2',
                        case_number: 'DCA-2026-000002',
                        debtor_id: '2',
                        amount: 125000,
                        original_amount: 125000,
                        due_date: '2025-12-20',
                        days_past_due: 18,
                        status: 'ESCALATED',
                        priority: 'CRITICAL',
                        recovery_probability: 0.35,
                        recommended_strategy: 'ESCALATION',
                        assigned_agent_id: null,
                        debtor_name: 'Priya Sharma',
                        debtor_email: 'priya@email.com',
                        debtor_phone: '+91 87654 32109',
                        created_at: '2025-12-15T00:00:00Z',
                    },
                    {
                        id: '3',
                        case_number: 'DCA-2026-000003',
                        debtor_id: '3',
                        amount: 28000,
                        original_amount: 30000,
                        due_date: '2026-01-25',
                        days_past_due: 5,
                        status: 'OPEN',
                        priority: 'MEDIUM',
                        recovery_probability: 0.85,
                        recommended_strategy: 'STANDARD_FOLLOW_UP',
                        assigned_agent_id: null,
                        debtor_name: 'Amit Verma',
                        debtor_email: 'amit@email.com',
                        debtor_phone: '+91 76543 21098',
                        created_at: '2026-01-05T00:00:00Z',
                    },
                ],
                pagination: { page: 1, limit: 20, total: 3, totalPages: 1 },
            });
        } finally {
            setLoading(false);
        }
    }, [filters?.status, filters?.priority, filters?.search, filters?.page, filters?.limit]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

// Hook for fetching agents
export function useAgents() {
    const [data, setData] = useState<AgentInfo[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await api.get<AgentInfo[]>('/agents');
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch agents');
            // Mock data fallback
            setData([
                {
                    id: 'predictive',
                    type: 'PREDICTIVE',
                    name: 'Predictive Agent',
                    description: 'ML-based recovery prediction',
                    status: 'ACTIVE',
                    total_actions: 1247,
                    successful_actions: 1198,
                    failed_actions: 49,
                    success_rate: '96.1',
                    avg_duration_ms: 145,
                    last_action_at: new Date().toISOString(),
                },
                {
                    id: 'negotiation',
                    type: 'NEGOTIATION',
                    name: 'Negotiation Agent',
                    description: 'Payment plan generation',
                    status: 'ACTIVE',
                    total_actions: 856,
                    successful_actions: 823,
                    failed_actions: 33,
                    success_rate: '96.1',
                    avg_duration_ms: 89,
                    last_action_at: new Date().toISOString(),
                },
                {
                    id: 'compliance',
                    type: 'COMPLIANCE',
                    name: 'Compliance Agent',
                    description: 'Regulatory compliance checking',
                    status: 'ACTIVE',
                    total_actions: 2341,
                    successful_actions: 2341,
                    failed_actions: 0,
                    success_rate: '100.0',
                    avg_duration_ms: 23,
                    last_action_at: new Date().toISOString(),
                },
                {
                    id: 'rpa',
                    type: 'RPA',
                    name: 'RPA Agent',
                    description: 'Automated follow-ups',
                    status: 'ACTIVE',
                    total_actions: 4521,
                    successful_actions: 4389,
                    failed_actions: 132,
                    success_rate: '97.1',
                    avg_duration_ms: 234,
                    last_action_at: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

// Hook for triggering predictions
export function usePrediction() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const predict = useCallback(async (caseId: string) => {
        try {
            setLoading(true);
            setError(null);
            const result = await api.post('/predictions/recovery', { case_id: caseId });
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get prediction');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { predict, loading, error };
}

// Hook for case distribution
export function useCaseDistribution() {
    const [data, setData] = useState<{ status: string; count: number }[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await api.get<{ status: string; count: number }[]>('/analytics/distribution');
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch distribution');
            // Mock data fallback
            setData([
                { status: 'OPEN', count: 342 },
                { status: 'IN_PROGRESS', count: 567 },
                { status: 'ESCALATED', count: 89 },
                { status: 'SETTLED', count: 1452 },
                { status: 'CLOSED', count: 0 },
                { status: 'WRITTEN_OFF', count: 0 },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}
