"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { AuthGuard } from '@/components/auth-guard';
import { Shield, CheckCircle, XCircle, AlertTriangle, Calendar, Filter } from 'lucide-react';

interface AuditLog {
    id: string;
    case_id: string;
    case_number: string;
    agent_id: string;
    agent_name: string;
    action_type: string;
    outcome: string | null;
    compliant: boolean;
    compliance_notes: string | null;
    created_at: string;
    duration_seconds: number | null;
}

export default function AuditPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'COMPLIANT' | 'NON_COMPLIANT'>('ALL');
    const [stats, setStats] = useState({
        total: 0,
        compliant: 0,
        nonCompliant: 0,
        complianceRate: 100
    });

    useEffect(() => {
        fetchAuditLogs();
    }, [user, filter]);

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            // Fetch agent actions for manager's cases
            let query = supabase
                .from('agent_actions')
                .select(`
                    *,
                    workflow_cases!inner(case_number, assigned_manager_id),
                    profiles:agent_id(full_name, email)
                `)
                .eq('workflow_cases.assigned_manager_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(100);

            if (filter === 'COMPLIANT') {
                query = query.eq('compliant', true);
            } else if (filter === 'NON_COMPLIANT') {
                query = query.eq('compliant', false);
            }

            const { data, error } = await query;

            if (error) throw error;

            const logs: AuditLog[] = (data || []).map((action: any) => ({
                id: action.id,
                case_id: action.case_id,
                case_number: action.workflow_cases?.case_number || 'N/A',
                agent_id: action.agent_id,
                agent_name: action.profiles?.full_name || action.profiles?.email || 'Unknown',
                action_type: action.action_type,
                outcome: action.outcome,
                compliant: action.compliant,
                compliance_notes: action.compliance_notes,
                created_at: action.created_at,
                duration_seconds: action.duration_seconds
            }));

            setAuditLogs(logs);

            // Calculate stats
            const total = logs.length;
            const compliant = logs.filter(l => l.compliant).length;
            const nonCompliant = total - compliant;
            const complianceRate = total > 0 ? (compliant / total) * 100 : 100;

            setStats({ total, compliant, nonCompliant, complianceRate });

        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthGuard allowedRoles={['ADMIN', 'MANAGER']}>
            <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Audit & Compliance Tracker</h1>
                            <p className="text-slate-400">Monitor agent actions and ensure regulatory compliance</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatsCard icon={Calendar} label="Total Actions" value={stats.total.toString()} color="#3b82f6" />
                    <StatsCard icon={CheckCircle} label="Compliant" value={stats.compliant.toString()} color="#22c55e" />
                    <StatsCard icon={XCircle} label="Non-Compliant" value={stats.nonCompliant.toString()} color="#ef4444" />
                    <StatsCard icon={Shield} label="Compliance Rate" value={`${stats.complianceRate.toFixed(1)}%`} color={stats.complianceRate >= 95 ? '#22c55e' : stats.complianceRate >= 85 ? '#f59e0b' : '#ef4444'} />
                </div>

                {/* Compliance Score */}
                <div className="mb-8">
                    <div
                        className="p-6 rounded-xl"
                        style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            backdropFilter: 'blur(12px)',
                            border: stats.complianceRate >= 95 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Team Compliance Score</h2>
                                <p className="text-sm text-slate-400">Target: 95% or above</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-4xl font-bold ${stats.complianceRate >= 95 ? 'text-green-400' : 'text-red-400'}`}>
                                    {stats.complianceRate.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${stats.complianceRate >= 95 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                        stats.complianceRate >= 85 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                            'bg-gradient-to-r from-red-500 to-rose-500'
                                    }`}
                                style={{ width: `${stats.complianceRate}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-4 flex gap-2">
                    <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="All Actions" />
                    <FilterButton active={filter === 'COMPLIANT'} onClick={() => setFilter('COMPLIANT')} label="Compliant" />
                    <FilterButton active={filter === 'NON_COMPLIANT'} onClick={() => setFilter('NON_COMPLIANT')} label="Non-Compliant" />
                </div>

                {/* Audit Logs Table */}
                <div>
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-slate-400">Loading audit logs...</p>
                            </div>
                        </div>
                    ) : auditLogs.length === 0 ? (
                        <div
                            className="p-12 rounded-xl text-center"
                            style={{
                                background: 'rgba(30, 41, 59, 0.5)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(148, 163, 184, 0.2)'
                            }}
                        >
                            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Audit Logs</h3>
                            <p className="text-slate-400">Agent actions will appear here once your team starts working on cases</p>
                        </div>
                    ) : (
                        <div
                            className="rounded-xl overflow-hidden"
                            style={{
                                background: 'rgba(30, 41, 59, 0.5)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(148, 163, 184, 0.2)'
                            }}
                        >
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                                        <th className="text-left p-4 text-slate-400">Timestamp</th>
                                        <th className="text-left p-4 text-slate-400">Agent</th>
                                        <th className="text-left p-4 text-slate-400">Case</th>
                                        <th className="text-left p-4 text-slate-400">Action</th>
                                        <th className="text-left p-4 text-slate-400">Outcome</th>
                                        <th className="text-left p-4 text-slate-400">Duration</th>
                                        <th className="text-left p-4 text-slate-400">Compliance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.map(log => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                                            <td className="p-4 text-slate-300 text-xs">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-white">{log.agent_name}</td>
                                            <td className="p-4 text-slate-300">{log.case_number}</td>
                                            <td className="p-4">
                                                <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                                                    {log.action_type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-300">{log.outcome || '-'}</td>
                                            <td className="p-4 text-slate-300">
                                                {log.duration_seconds ? `${Math.floor(log.duration_seconds / 60)}m ${log.duration_seconds % 60}s` : '-'}
                                            </td>
                                            <td className="p-4">
                                                {log.compliant ? (
                                                    <div className="flex items-center gap-1 text-green-400">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span className="text-xs">Compliant</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-red-400">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <span className="text-xs">Issue</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}

function StatsCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
    return (
        <div
            className="p-4 rounded-xl"
            style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.2)'
            }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-400 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}20` }}
                >
                    <Icon className="w-6 h-6" style={{ color }} />
                </div>
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
                background: active
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.2))'
                    : 'rgba(30, 41, 59, 0.5)',
                border: active ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
                color: active ? '#fbbf24' : '#94a3b8'
            }}
        >
            {label}
        </button>
    );
}
