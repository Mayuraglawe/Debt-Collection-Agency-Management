"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/layout/admin-layout';
import { BarChart3, TrendingUp, DollarSign, Users, Target, Award, Calendar, Clock } from 'lucide-react';

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCases: 0,
        totalRecovered: 0,
        recoveryRate: 0,
        activeAgents: 0,
        avgResolutionDays: 0,
        monthlyTarget: 5000000,
        monthlyRecovered: 0,
    });

    const [performanceData, setPerformanceData] = useState<any[]>([]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // Fetch case statistics
            const { data: cases, error: casesError } = await supabase
                .from('workflow_cases')
                .select('*');

            if (casesError) throw casesError;

            const totalCases = cases?.length || 0;
            const totalRecovered = cases?.reduce((sum, c) => sum + (c.recovered_amount || 0), 0) || 0;
            const totalAmount = cases?.reduce((sum, c) => sum + c.amount, 0) || 0;
            const recoveryRate = totalAmount > 0 ? (totalRecovered / totalAmount) * 100 : 0;

            // Fetch active agents count
            const { data: agents, error: agentsError } = await supabase
                .from('profiles')
                .select('id', { count: 'exact' })
                .eq('role', 'AGENT')
                .eq('is_active', true);

            if (agentsError) throw agentsError;

            // Calculate monthly recovered (cases created this month)
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthlyRecovered = cases
                ?.filter(c => new Date(c.created_at) >= monthStart)
                .reduce((sum, c) => sum + (c.recovered_amount || 0), 0) || 0;

            setStats({
                totalCases,
                totalRecovered,
                recoveryRate,
                activeAgents: agents?.length || 0,
                avgResolutionDays: 12,
                monthlyTarget: 5000000,
                monthlyRecovered,
            });

            // Simulate performance data
            const mockPerformance = [
                { name: 'Rajesh Kumar', recovered: 850000, cases: 15, rate: 92 },
                { name: 'Priya Sharma', recovered: 720000, cases: 12, rate: 88 },
                { name: 'Amit Patel', recovered: 650000, cases: 11, rate: 85 },
                { name: 'Sneha Reddy', recovered: 580000, cases: 9, rate: 81 },
                { name: 'Vikram Singh', recovered: 490000, cases: 8, rate: 78 },
            ];
            setPerformanceData(mockPerformance);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const targetProgress = (stats.monthlyRecovered / stats.monthlyTarget) * 100;

    return (
        <AdminLayout 
            title="Executive Analytics"
            description="Real-time performance insights and KPIs"
        >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard icon={BarChart3} label="Total Cases" value={stats.totalCases.toString()} change="+12%" color="#3b82f6" />
                <KPICard icon={DollarSign} label="Total Recovered" value={`₹${(stats.totalRecovered / 1000000).toFixed(2)}M`} change="+8%" color="#22c55e" />
                <KPICard icon={TrendingUp} label="Recovery Rate" value={`${stats.recoveryRate.toFixed(1)}%`} change="+3%" color="#f59e0b" />
                <KPICard icon={Users} label="Active Agents" value={stats.activeAgents.toString()} change="stable" color="#8b5cf6" />
            </div>

            {/* Target Progress */}
            <div className="mb-8">
                <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-600/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Monthly Target Progress</h2>
                                <p className="text-sm text-slate-400">₹{(stats.monthlyRecovered / 1000000).toFixed(2)}M / ₹{(stats.monthlyTarget / 1000000).toFixed(0)}M</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">{targetProgress.toFixed(1)}%</p>
                            <p className="text-xs text-slate-400">of target achieved</p>
                        </div>
                    </div>
                    <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 progress-bar"
                            data-width={Math.min(Math.round(targetProgress), 100).toString()}
                        />
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <MetricCard
                    icon={Clock}
                    title="Avg. Resolution Time"
                    value={`${stats.avgResolutionDays} days`}
                    subtitle="Industry avg: 15 days"
                    color="#06b6d4"
                />
                <MetricCard
                    icon={Calendar}
                    title="Cases This Month"
                    value={stats.totalCases.toString()}
                    subtitle="Across all agents"
                    color="#a855f7"
                />
            </div>

            {/* Top Performers */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Top Performing Agents
                </h2>
                <div className="rounded-xl overflow-hidden bg-slate-800/40 border border-slate-600/50">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-600/50">
                                <th className="text-left p-4 text-sm font-semibold text-slate-400">Rank</th>
                                <th className="text-left p-4 text-sm font-semibold text-slate-400">Agent</th>
                                <th className="text-left p-4 text-sm font-semibold text-slate-400">Recovered</th>
                                <th className="text-left p-4 text-sm font-semibold text-slate-400">Cases</th>
                                <th className="text-left p-4 text-sm font-semibold text-slate-400">Success Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {performanceData.map((agent, idx) => (
                                <tr key={idx} className="border-b border-slate-700/50">
                                    <td className="p-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                            idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                                idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
                                                    idx === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-800' :
                                                        'bg-slate-600/50'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                    </td>
                                    <td className="p-4 text-white font-medium">{agent.name}</td>
                                    <td className="p-4 text-green-400 font-semibold">₹{(agent.recovered / 1000).toFixed(0)}K</td>
                                    <td className="p-4 text-slate-300">{agent.cases}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 progress-bar transition-all duration-300"
                                                    data-width={agent.rate.toString()}
                                                />
                                            </div>
                                            <span className="text-sm text-slate-300 w-12">{agent.rate}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

function KPICard({ icon: Icon, label, value, change, color }: any) {
    const isPositive = change.startsWith('+');
    const isStable = change === 'stable';

    return (
        <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-600/50 hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-500/10">
                    <Icon className="w-6 h-6 text-indigo-500" />
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    isStable ? 'bg-slate-500/20 text-slate-300 border border-slate-500/40' :
                    isPositive ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                    {change}
                </span>
            </div>
            <p className="text-sm text-slate-400 mb-2">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );
}

function MetricCard({ icon: Icon, title, value, subtitle, color }: any) {
    return (
        <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-600/50 hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10">
                    <Icon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="text-xs text-slate-400">{subtitle}</p>
                </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );
}
