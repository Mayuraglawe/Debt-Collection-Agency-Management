"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, WorkflowCase, UserProfile } from '@/lib/supabase';
import { AuthGuard } from '@/components/auth-guard';
import { UserPlus, Users, ArrowRight, CheckCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AssignCasesPage() {
    const { user } = useAuth();
    const [cases, setCases] = useState<WorkflowCase[]>([]);
    const [agents, setAgents] = useState<UserProfile[]>([]);
    const [selectedCases, setSelectedCases] = useState<string[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAllocatedCases();
        fetchAgents();
    }, [user]);

    const fetchAllocatedCases = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('workflow_cases')
                .select('*')
                .eq('assigned_manager_id', user?.id)
                .in('status', ['ALLOCATED', 'ASSIGNED'])
                .order('priority', { ascending: false });

            if (error) throw error;
            setCases(data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAgents = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'AGENT')
                .eq('is_active', true);

            if (error) throw error;
            setAgents(data || []);
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    };

    const handleAssign = async () => {
        if (!selectedAgent || selectedCases.length === 0) {
            alert('Please select agent and cases');
            return;
        }

        setAssigning(true);
        try {
            // Update cases
            for (const caseId of selectedCases) {
                const { error: caseError } = await supabase
                    .from('workflow_cases')
                    .update({
                        assigned_agent_id: selectedAgent,
                        status: 'ASSIGNED',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', caseId);

                if (caseError) throw caseError;

                // Create assignment record
                const { error: assignmentError } = await supabase
                    .from('case_assignments')
                    .insert({
                        case_id: caseId,
                        assigned_to: selectedAgent,
                        assigned_by: user?.id,
                        assignment_date: new Date().toISOString(),
                        is_active: true
                    });

                if (assignmentError) throw assignmentError;
            }

            alert(`Successfully assigned ${selectedCases.length} cases!`);
            setSelectedCases([]);
            setSelectedAgent('');
            fetchAllocatedCases();
        } catch (error) {
            console.error('Error assigning cases:', error);
            alert('Error during case assignment');
        } finally {
            setAssigning(false);
        }
    };

    const toggleCaseSelection = (caseId: string) => {
        setSelectedCases(prev =>
            prev.includes(caseId) ? prev.filter(id => id !== caseId) : [...prev, caseId]
        );
    };

    const filteredCases = cases.filter(c =>
        searchTerm === '' ||
        c.case_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const allocatedCases = filteredCases.filter(c => c.status === 'ALLOCATED');
    const assignedCases = filteredCases.filter(c => c.status === 'ASSIGNED');

    return (
        <AuthGuard allowedRoles={['ADMIN', 'MANAGER']}>
            <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Assign Cases to Agents</h1>
                                <p className="text-slate-400">Distribute cases to your team members</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleAssign}
                            disabled={assigning || selectedCases.length === 0 || !selectedAgent}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                            style={{
                                background: assigning || selectedCases.length === 0 || !selectedAgent
                                    ? 'rgba(236, 72, 153, 0.3)'
                                    : 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                                boxShadow: '0 10px 30px -10px rgba(236, 72, 153, 0.5)'
                            }}
                        >
                            {assigning ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Assign {selectedCases.length} Case{selectedCases.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StatsCard label="Total Cases" value={cases.length.toString()} color="#ec4899" />
                    <StatsCard label="Awaiting Assignment" value={allocatedCases.length.toString()} color="#f59e0b" />
                    <StatsCard label="Already Assigned" value={assignedCases.length.toString()} color="#22c55e" />
                </div>

                {/* Agent Selection */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white mb-3">Select Agent</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {agents.map(agent => (
                            <button
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent.id)}
                                className="p-4 rounded-xl text-left transition-all"
                                style={{
                                    background: selectedAgent === agent.id
                                        ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 63, 94, 0.2))'
                                        : 'rgba(30, 41, 59, 0.5)',
                                    backdropFilter: 'blur(12px)',
                                    border: selectedAgent === agent.id
                                        ? '2px solid rgba(236, 72, 153, 0.5)'
                                        : '1px solid rgba(148, 163, 184, 0.2)'
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {agent.full_name?.split(' ').map(n => n[0]).join('') || 'A'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{agent.full_name || agent.email}</p>
                                        <p className="text-xs text-slate-400">{agent.email}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="mb-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search cases..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                            style={{
                                background: 'rgba(30, 41, 59, 0.5)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(148, 163, 184, 0.2)'
                            }}
                        />
                    </div>
                </div>

                {/* Cases Table */}
                <div
                    className="rounded-xl overflow-hidden"
                    style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(148, 163, 184, 0.2)'
                    }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                                    <th className="p-4 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedCases.length === allocatedCases.length && allocatedCases.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCases(allocatedCases.map(c => c.id));
                                                } else {
                                                    setSelectedCases([]);
                                                }
                                            }}
                                            className="w-4 h-4 rounded"
                                        />
                                    </th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Case Number</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Amount</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Priority</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Status</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Current Agent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCases.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedCases.includes(c.id)}
                                                onChange={() => toggleCaseSelection(c.id)}
                                                disabled={c.status === 'ASSIGNED'}
                                                className="w-4 h-4 rounded"
                                            />
                                        </td>
                                        <td className="p-4 text-white font-medium">{c.case_number}</td>
                                        <td className="p-4 text-white">₹{c.amount.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded ${c.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                                                    c.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-300' :
                                                        'bg-blue-500/20 text-blue-300'
                                                }`}>
                                                {c.priority}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded ${c.status === 'ALLOCATED' ? 'bg-yellow-500/20 text-yellow-300' :
                                                    'bg-green-500/20 text-green-300'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-300">
                                            {c.assigned_agent_id ? agents.find(a => a.id === c.assigned_agent_id)?.full_name || 'Assigned' : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

function StatsCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div
            className="p-4 rounded-xl"
            style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.2)'
            }}
        >
            <p className="text-sm text-slate-400 mb-1">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
        </div>
    );
}
