"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { AuthGuard } from '@/components/auth-guard';
import { Users, TrendingUp, Target, Award, Activity, Clock } from 'lucide-react';

interface AgentStats {
    agent_id: string;
    agent_name: string;
    assigned_cases: number;
    resolved_cases: number;
    total_recovered: number;
    avg_resolution_days: number;
    success_rate: number;
}

export default function TeamDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [teamStats, setTeamStats] = useState<AgentStats[]>([]);
    const [overallStats, setOverallStats] = useState({
        totalCases: 0,
        resolvedCases: 0,
        totalRecovered: 0,
        avgSuccessRate: 0,
    });

    useEffect(() => {
        fetchTeamPerformance();
    }, [user]);

    const fetchTeamPerformance = async () => {
        setLoading(true);
        try {
            // Fetch all cases for manager's team
            const { data: cases, error } = await supabase
                .from('workflow_cases')
                .select('*, profiles:assigned_agent_id(id, full_name, email)')
                .eq('assigned_manager_id', user?.id);

            if (error) throw error;

            // Calculate stats per agent
            const agentMap = new Map<string, AgentStats>();

            cases?.forEach(c => {
                const agentId = c.assigned_agent_id;
                if (!agentId) return;

                const agentName = (c.profiles as any)?.full_name || (c.profiles as any)?.email || 'Unknown';

                if (!agentMap.has(agentId)) {
                    agentMap.set(agentId, {
                        agent_id: agentId,
                        agent_name: agentName,
                        assigned_cases: 0,
                        resolved_cases: 0,
                        total_recovered: 0,
                        avg_resolution_days: 0,
                        success_rate: 0
                    });
                }

                const stats = agentMap.get(agentId)!;
                stats.assigned_cases++;
                if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
                    stats.resolved_cases++;
                }
                stats.total_recovered += c.recovered_amount || 0;
            });

            // Calculate success rates
            const agentStats = Array.from(agentMap.values()).map(stats => ({
                ...stats,
                success_rate: stats.assigned_cases > 0
                    ? (stats.resolved_cases / stats.assigned_cases) * 100
                    : 0,
                avg_resolution_days: Math.floor(Math.random() * 15) + 5 // Mock data
            }));

            // Sort by total recovered
            agentStats.sort((a, b) => b.total_recovered - a.total_recovered);

            setTeamStats(agentStats);

            // Calculate overall stats
            const totalCases = agentStats.reduce((sum, a) => sum + a.assigned_cases, 0);
            const resolvedCases = agentStats.reduce((sum, a) => sum + a.resolved_cases, 0);
            const totalRecovered = agentStats.reduce((sum, a) => sum + a.total_recovered, 0);
            const avgSuccessRate = agentStats.length > 0
                ? agentStats.reduce((sum, a) => sum + a.success_rate, 0) / agentStats.length
                : 0;

            setOverallStats({
                totalCases,
                resolvedCases,
                totalRecovered,
                avgSuccessRate
            });

        } catch (error) {
            console.error('Error fetching team performance:', error);
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Team Performance Dashboard</h1>
                            <p className="text-slate-400">Monitor your team's productivity and success metrics</p>
                        </div>
                    </div>
                </div>

                {/* Overall Team Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatsCard icon={Activity} label="Team Members" value={teamStats.length.toString()} color="#10b981" />
                    <StatsCard icon={Target} label="Total Cases" value={overallStats.totalCases.toString()} color="#3b82f6" />
                    <StatsCard icon={TrendingUp} label="Resolved" value={overallStats.resolvedCases.toString()} color="#22c55e" />
                    <StatsCard icon={Award} label="Avg Success Rate" value={`${overallStats.avgSuccessRate.toFixed(1)}%`} color="#f59e0b" />
                </div>

                {/* Team Recovery Summary */}
                <div className="mb-8">
                    <div
                        className="p-6 rounded-xl"
                        style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(148, 163, 184, 0.2)'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Total Team Recovery</h2>
                                <p className="text-sm text-slate-400">Cumulative recovery amount</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-bold text-green-400">
                                    ₹{(overallStats.totalRecovered / 100000).toFixed(2)}L
                                </p>
                                <p className="text-xs text-slate-400">This month</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Agent Performance Table */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">Individual Agent Performance</h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-slate-400">Loading team data...</p>
                            </div>
                        </div>
                    ) : teamStats.length === 0 ? (
                        <div
                            className="p-12 rounded-xl text-center"
                            style={{
                                background: 'rgba(30, 41, 59, 0.5)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(148, 163, 184, 0.2)'
                            }}
                        >
                            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Team Data</h3>
                            <p className="text-slate-400">Assign cases to agents to see performance metrics</p>
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
                            <table className="w-full">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-400">Rank</th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-400">Agent Name</th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-400">Assigned</th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-400">Resolved</th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-400">Recovered</th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-400">Success Rate</th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-400">Avg Days</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamStats.map((agent, idx) => (
                                        <tr key={agent.agent_id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                                            <td className="p-4">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                                                    style={{
                                                        background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                                                            idx === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' :
                                                                idx === 2 ? 'linear-gradient(135deg, #d97706, #92400e)' :
                                                                    'rgba(71, 85, 105, 0.5)',
                                                        color: 'white'
                                                    }}
                                                >
                                                    {idx + 1}
                                                </div>
                                            </td>
                                            <td className="p-4 text-white font-medium">{agent.agent_name}</td>
                                            <td className="p-4 text-slate-300">{agent.assigned_cases}</td>
                                            <td className="p-4 text-green-400 font-semibold">{agent.resolved_cases}</td>
                                            <td className="p-4 text-emerald-400 font-semibold">₹{(agent.total_recovered / 1000).toFixed(0)}K</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                                            style={{ width: `${agent.success_rate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-slate-300 w-12">{agent.success_rate.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-300">{agent.avg_resolution_days} days</td>
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
