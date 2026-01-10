"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { AuthGuard } from '@/components/auth-guard';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, Users, FileText } from 'lucide-react';

export default function ComplianceDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [violations, setViolations] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalActions: 0,
        compliantActions: 0,
        openViolations: 0,
        criticalViolations: 0,
        complianceRate: 0,
        avgResolutionTime: 0
    });
    const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

    useEffect(() => {
        fetchComplianceData();
    }, [filter]);

    const fetchComplianceData = async () => {
        setLoading(true);
        try {
            // Fetch violations
            let query = supabase
                .from('compliance_violations')
                .select('*, agent:agent_id(full_name, email), case:case_id(case_number)')
                .order('occurred_at', { ascending: false });

            if (filter === 'OPEN') {
                query = query.in('status', ['OPEN', 'UNDER_REVIEW']);
            } else if (filter === 'RESOLVED') {
                query = query.in('status', ['RESOLVED', 'DISMISSED']);
            }

            const { data: violationsData, error } = await query.limit(100);
            if (error) throw error;

            setViolations(violationsData || []);

            // Calculate statistics
            const { data: allActions } = await supabase
                .from('agent_actions')
                .select('id, compliant');

            const totalActions = allActions?.length || 0;
            const compliantActions = allActions?.filter(a => a.compliant).length || 0;

            const { data: allViolations } = await supabase
                .from('compliance_violations')
                .select('id, status, severity, occurred_at, reviewed_at');

            const openViolations = allViolations?.filter(v => v.status === 'OPEN' || v.status === 'UNDER_REVIEW').length || 0;
            const criticalViolations = allViolations?.filter(v => v.severity === 'CRITICAL' && (v.status === 'OPEN' || v.status === 'UNDER_REVIEW')).length || 0;

            // Calculate average resolution time
            const resolvedViolations = allViolations?.filter(v => v.status === 'RESOLVED' && v.reviewed_at) || [];
            const avgResolutionMs = resolvedViolations.reduce((sum, v) => {
                const occurred = new Date(v.occurred_at).getTime();
                const resolved = new Date(v.reviewed_at).getTime();
                return sum + (resolved - occurred);
            }, 0) / (resolvedViolations.length || 1);
            const avgResolutionHours = Math.round(avgResolutionMs / (1000 * 60 * 60));

            setStats({
                totalActions,
                compliantActions,
                openViolations,
                criticalViolations,
                complianceRate: totalActions > 0 ? (compliantActions / totalActions) * 100 : 100,
                avgResolutionTime: avgResolutionHours
            });

        } catch (error) {
            console.error('Error fetching compliance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateViolation = async (violationId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('compliance_violations')
                .update({
                    status: newStatus,
                    reviewed_by: user?.id,
                    reviewed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', violationId);

            if (error) throw error;
            fetchComplianceData();
        } catch (error) {
            console.error('Error updating violation:', error);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return { bg: '#dc2626', text: '#fca5a5' };
            case 'HIGH': return { bg: '#ea580c', text: '#fdba74' };
            case 'MEDIUM': return { bg: '#eab308', text: '#fde047' };
            case 'LOW': return { bg: '#3b82f6', text: '#93c5fd' };
            default: return { bg: '#64748b', text: '#cbd5e1' };
        }
    };

    return (
        <AuthGuard allowedRoles={['ADMIN', 'COMPLIANCE_OFFICER']}>
            <div className="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Compliance Dashboard</h1>
                            <p className="text-slate-400">Monitor regulatory compliance and agent performance</p>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <KPICard
                        icon={CheckCircle}
                        label="Compliance Rate"
                        value={`${stats.complianceRate.toFixed(1)}%`}
                        color={stats.complianceRate >= 95 ? '#22c55e' : stats.complianceRate >= 85 ? '#eab308' : '#ef4444'}
                        trend={stats.complianceRate >= 95 ? '+2.3%' : '-1.2%'}
                    />
                    <KPICard
                        icon={AlertTriangle}
                        label="Open Violations"
                        value={stats.openViolations.toString()}
                        color="#f59e0b"
                    />
                    <KPICard
                        icon={XCircle}
                        label="Critical Violations"
                        value={stats.criticalViolations.toString()}
                        color="#ef4444"
                    />
                    <KPICard
                        icon={TrendingUp}
                        label="Avg Resolution Time"
                        value={`${stats.avgResolutionTime}h`}
                        color="#3b82f6"
                    />
                </div>

                {/* Compliance Score Visualization */}
                <div className="mb-8 p-6 rounded-xl bg-slate-800/50 border border-slate-400/20">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">Overall Compliance Score</h2>
                            <p className="text-sm text-slate-400">Target: ≥ 95%</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-4xl font-bold ${stats.complianceRate >= 95 ? 'compliance-good' : 'compliance-warning'}`}>
                                {stats.complianceRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-slate-400">{stats.compliantActions} / {stats.totalActions} actions</p>
                        </div>
                    </div>
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 progress-bar ${stats.complianceRate >= 95 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-yellow-500 to-amber-600'}`}
                            data-width={Math.round(stats.complianceRate).toString()}
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-3">
                    <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="All Violations" />
                    <FilterButton active={filter === 'OPEN'} onClick={() => setFilter('OPEN')} label="Open / Under Review" />
                    <FilterButton active={filter === 'RESOLVED'} onClick={() => setFilter('RESOLVED')} label="Resolved / Dismissed" />
                </div>

                {/* Violations Table */}
                <div className="rounded-xl overflow-hidden bg-slate-800/50 border border-slate-400/20">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-400">Loading compliance data...</p>
                        </div>
                    ) : violations.length === 0 ? (
                        <div className="p-20 text-center">
                            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Violations Found</h3>
                            <p className="text-slate-400">All agent actions are compliant</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-400/20">
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Occurred</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Type</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Agent</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Case</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Severity</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Status</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {violations.map(violation => {
                                    const severityStyle = getSeverityColor(violation.severity);
                                    return (
                                        <tr key={violation.id} className="border-b border-slate-400/10">
                                            <td className="p-4 text-sm text-slate-300">
                                                {new Date(violation.occurred_at).toLocaleDateString()}
                                                <br />
                                                <span className="text-xs text-slate-500">
                                                    {new Date(violation.occurred_at).toLocaleTimeString()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-white font-medium">{violation.violation_type.replace(/_/g, ' ')}</div>
                                                <div className="text-xs text-slate-400">{violation.description}</div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300">
                                                {violation.agent?.full_name || violation.agent?.email || 'Unknown'}
                                            </td>
                                            <td className="p-4 text-sm text-slate-300">
                                                {violation.case?.case_number || 'N/A'}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`text-xs px-2 py-1 rounded font-medium ${
                                                        violation.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                                        violation.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                                        violation.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                    }`}
                                                >
                                                    {violation.severity}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded ${violation.status === 'RESOLVED' ? 'bg-green-500/20 text-green-300' :
                                                        violation.status === 'UNDER_REVIEW' ? 'bg-yellow-500/20 text-yellow-300' :
                                                            violation.status === 'DISMISSED' ? 'bg-slate-500/20 text-slate-300' :
                                                                'bg-red-500/20 text-red-300'
                                                    }`}>
                                                    {violation.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {(violation.status === 'OPEN' || violation.status === 'UNDER_REVIEW') && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleUpdateViolation(violation.id, 'UNDER_REVIEW')}
                                                            className="text-xs px-3 py-1 rounded bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                                                        >
                                                            Review
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateViolation(violation.id, 'RESOLVED')}
                                                            className="text-xs px-3 py-1 rounded bg-green-500/20 text-green-300 hover:bg-green-500/30"
                                                        >
                                                            Resolve
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateViolation(violation.id, 'DISMISSED')}
                                                            className="text-xs px-3 py-1 rounded bg-slate-500/20 text-slate-300 hover:bg-slate-500/30"
                                                        >
                                                            Dismiss
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}

function KPICard({ icon: Icon, label, value, color, trend }: any) {
    return (
        <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-400/20">
            <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/20">
                    <Icon className="w-5 h-5 text-red-500" />
                </div>
                {trend && <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{trend}</span>}
            </div>
            <p className="text-sm text-slate-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-red-500">{value}</p>
        </div>
    );
}

function FilterButton({ active, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-300' :
                'bg-slate-800/50 border border-slate-400/20 text-slate-400'
            }`}
        >
            {label}
        </button>
    );
}
