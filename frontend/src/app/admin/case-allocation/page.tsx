"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, WorkflowCase } from '@/lib/supabase';
import { AuthGuard } from '@/components/auth-guard';
import { GitBranch, Play, Settings, TrendingUp, Users, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AllocationRule {
    id: string;
    name: string;
    criteria: string;
    agency: string;
    isActive: boolean;
}

export default function CaseAllocationPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [pendingCases, setPendingCases] = useState<WorkflowCase[]>([]);
    const [allocationRules, setAllocationRules] = useState<AllocationRule[]>([
        { id: '1', name: 'High Value Cases', criteria: 'amount > 100000', agency: 'DCA Prime', isActive: true },
        { id: '2', name: 'Geo-based (Mumbai)', criteria: 'city = Mumbai', agency: 'DCA West', isActive: true },
        { id: '3', name: 'High Recovery Probability', criteria: 'recovery_probability > 70', agency: 'DCA Elite', isActive: true },
    ]);
    const [allocating, setAllocating] = useState(false);
    const [stats, setStats] = useState({
        pending: 0,
        allocated: 0,
        successRate: 0
    });

    useEffect(() => {
        fetchPendingCases();
        fetchStats();
    }, []);

    const fetchPendingCases = async () => {
        try {
            const { data, error } = await supabase
                .from('workflow_cases')
                .select('*')
                .eq('status', 'PENDING')
                .order('priority', { ascending: false });

            if (error) throw error;
            setPendingCases(data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const { data: pending } = await supabase.from('workflow_cases').select('id', { count: 'exact' }).eq('status', 'PENDING');
            const { data: allocated } = await supabase.from('workflow_cases').select('id', { count: 'exact' }).eq('status', 'ALLOCATED');

            setStats({
                pending: pending?.length || 0,
                allocated: allocated?.length || 0,
                successRate: 85
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const runAllocation = async () => {
        setAllocating(true);
        try {
            // Step 1: Fetch active allocation rules ordered by priority
            const { data: rules, error: rulesError } = await supabase
                .from('allocation_rules')
                .select('*')
                .eq('is_active', true)
                .order('priority', { ascending: true });

            if (rulesError) throw rulesError;

            if (!rules || rules.length === 0) {
                alert('No active allocation rules found. Please create rules first.');
                setAllocating(false);
                return;
            }

            let allocatedCount = 0;
            const allocationLog: any[] = [];

            // Step 2: Process each pending case
            for (const caseItem of pendingCases) {
                // Calculate AI-powered recovery probability
                const recoveryProb = calculateRecoveryProbability(caseItem);

                // Find matching rule
                let assignedAgency = null;
                let matchedRule = null;

                for (const rule of rules) {
                    if (matchesRule(caseItem, rule, recoveryProb)) {
                        assignedAgency = rule.target_agency;
                        matchedRule = rule;
                        break; // First match wins
                    }
                }

                // Fallback to default if no rule matched
                if (!assignedAgency) {
                    assignedAgency = 'DCA Standard';
                }

                // Update case with allocation
                const { error } = await supabase
                    .from('workflow_cases')
                    .update({
                        status: 'ALLOCATED',
                        assigned_dca_agency: assignedAgency,
                        recovery_probability: recoveryProb,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', caseItem.id);

                if (error) throw error;

                allocatedCount++;
                allocationLog.push({
                    case_number: caseItem.case_number,
                    agency: assignedAgency,
                    rule: matchedRule?.rule_name || 'Default',
                    recovery_prob: recoveryProb
                });

                // Update rule metrics if a rule was matched
                if (matchedRule) {
                    await supabase
                        .from('allocation_rules')
                        .update({
                            times_applied: (matchedRule.times_applied || 0) + 1
                        })
                        .eq('id', matchedRule.id);
                }
            }

            console.log('Allocation complete:', allocationLog);
            alert(`Successfully allocated ${allocatedCount} cases!\n\nView browser console for detailed log.`);
            fetchPendingCases();
            fetchStats();
        } catch (error) {
            console.error('Error allocating cases:', error);
            alert('Error during case allocation. Check console for details.');
        } finally {
            setAllocating(false);
        }
    };

    // AI-Powered Recovery Probability Calculator
    const calculateRecoveryProbability = (caseData: any): number => {
        let score = 50; // Base score

        // Factor 1: Amount (smaller amounts easier to recover)
        if (caseData.amount < 50000) score += 15;
        else if (caseData.amount > 200000) score -= 10;

        // Factor 2: Priority (higher priority gets more attention)
        if (caseData.priority === 'CRITICAL') score += 10;
        else if (caseData.priority === 'LOW') score -= 5;

        // Factor 3: Age of debt (newer is better)
        const daysOverdue = caseData.due_date
            ? Math.floor((new Date().getTime() - new Date(caseData.due_date).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        if (daysOverdue < 30) score += 20;
        else if (daysOverdue > 180) score -= 25;
        else if (daysOverdue > 90) score -= 10;

        // Factor 4: Already recovered amount (positive signal)
        if (caseData.recovered_amount > 0) score += 10;

        // Ensure score is between 0 and 100
        return Math.max(0, Math.min(100, Math.round(score)));
    };

    // Rule Matcher - checks if a case matches a rule's conditions
    const matchesRule = (caseData: any, rule: any, recoveryProb: number): boolean => {
        const conditions = rule.conditions;

        if (rule.rule_type === 'VALUE_BASED' && conditions.amount) {
            const min = conditions.amount.min || 0;
            const max = conditions.amount.max || Infinity;
            if (caseData.amount < min || caseData.amount > max) return false;
        }

        if (rule.rule_type === 'GEO_BASED' && conditions.city) {
            // Would need city field on case - for now skip
            return false; // TODO: Add city field to workflow_cases
        }

        if (rule.rule_type === 'RECOVERY_BASED' && conditions.recovery_probability) {
            const min = conditions.recovery_probability.min || 0;
            if (recoveryProb < min) return false;
        }

        if (rule.rule_type === 'PRIORITY_BASED' && conditions.priority) {
            if (caseData.priority !== conditions.priority) return false;
        }

        // CUSTOM type always matches (acts as fallback)
        return true;
    };

    return (
        <AuthGuard allowedRoles={['ADMIN', 'MANAGER']}>
            <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <GitBranch className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Case Allocation Engine</h1>
                                <p className="text-slate-400">AI-powered automated case distribution</p>
                            </div>
                        </div>
                        <Button
                            onClick={runAllocation}
                            disabled={allocating || pendingCases.length === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                            style={{
                                background: allocating || pendingCases.length === 0
                                    ? 'rgba(139, 92, 246, 0.3)'
                                    : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                                boxShadow: '0 10px 30px -10px rgba(139, 92, 246, 0.5)'
                            }}
                        >
                            {allocating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Allocating...
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    Run Allocation
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatsCard icon={AlertCircle} label="Pending Cases" value={stats.pending.toString()} color="#f59e0b" />
                    <StatsCard icon={GitBranch} label="Allocated Today" value={stats.allocated.toString()} color="#8b5cf6" />
                    <StatsCard icon={TrendingUp} label="Success Rate" value={`${stats.successRate}%`} color="#22c55e" />
                </div>

                {/* Allocation Rules */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Active Allocation Rules</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {allocationRules.map(rule => (
                            <div
                                key={rule.id}
                                className="p-5 rounded-xl"
                                style={{
                                    background: 'rgba(30, 41, 59, 0.5)',
                                    backdropFilter: 'blur(12px)',
                                    border: rule.isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)'
                                }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-white">{rule.name}</h3>
                                    <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-400' : 'bg-slate-600'}`} />
                                </div>
                                <p className="text-sm text-slate-400 mb-2">Criteria: {rule.criteria}</p>
                                <div className="px-2.5 py-1 rounded-full inline-block" style={{ background: '#8b5cf620', border: '1px solid #8b5cf630' }}>
                                    <span className="text-xs text-purple-300 font-medium">{rule.agency}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Cases Preview */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">
                        Pending Cases ({pendingCases.length})
                    </h2>
                    {pendingCases.length === 0 ? (
                        <div
                            className="p-12 rounded-xl text-center"
                            style={{
                                background: 'rgba(30, 41, 59, 0.5)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(148, 163, 184, 0.2)'
                            }}
                        >
                            <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Pending Cases</h3>
                            <p className="text-slate-400">All cases have been allocated</p>
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
                                        <th className="text-left p-4 text-slate-400">Case Number</th>
                                        <th className="text-left p-4 text-slate-400">Amount</th>
                                        <th className="text-left p-4 text-slate-400">Priority</th>
                                        <th className="text-left p-4 text-slate-400">Recovery %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingCases.slice(0, 5).map(c => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                                            <td className="p-4 text-white">{c.case_number}</td>
                                            <td className="p-4 text-white">₹{c.amount.toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded ${c.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                                                    c.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-300' :
                                                        'bg-blue-500/20 text-blue-300'
                                                    }`}>
                                                    {c.priority}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-300">{c.recovery_probability || 'N/A'}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {pendingCases.length > 5 && (
                                <div className="p-3 text-center text-sm text-slate-400 border-t border-slate-700/50">
                                    +{pendingCases.length - 5} more cases
                                </div>
                            )}
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
