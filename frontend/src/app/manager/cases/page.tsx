"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, WorkflowCase } from '@/lib/supabase';
import { CaseCard } from '@/components/workflow/CaseCard';
import { Briefcase, ListFilter, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';

export default function ManagerCasesPage() {
    const { user } = useAuth();
    const [cases, setCases] = useState<WorkflowCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'ALLOCATED' | 'ASSIGNED' | 'IN_PROGRESS'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.id) {
            fetchManagerCases();
        }
    }, [user, filter]);

    const fetchManagerCases = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('workflow_cases')
                .select(`
                    *,
                    debtors:debtor_id (
                        full_name
                    )
                `)
                .eq('assigned_manager_id', user?.id)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false });

            if (filter !== 'ALL') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Map debtor name from JOIN
            const mappedCases = (data || []).map((c: any) => ({
                ...c,
                debtor_name: c.debtors?.full_name || 'Unknown Debtor'
            }));

            setCases(mappedCases);
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCases = cases.filter(c =>
        searchTerm === '' ||
        c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.debtor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: cases.length,
        allocated: cases.filter(c => c.status === 'ALLOCATED').length,
        assigned: cases.filter(c => c.status === 'ASSIGNED').length,
        inProgress: cases.filter(c => c.status === 'IN_PROGRESS').length,
    };

    return (
        <AuthGuard allowedRoles={['ADMIN', 'MANAGER']}>
            <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">My Cases</h1>
                            <p className="text-slate-400">Cases allocated to your agency</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatsCard icon={Briefcase} label="Total Cases" value={stats.total.toString()} color="#a855f7" />
                    <StatsCard icon={Clock} label="Allocated" value={stats.allocated.toString()} color="#3b82f6" />
                    <StatsCard icon={ListFilter} label="Assigned" value={stats.assigned.toString()} color="#eab308" />
                    <StatsCard icon={CheckCircle} label="In Progress" value={stats.inProgress.toString()} color="#22c55e" />
                </div>

                {/* Search and Filter */}
                <div
                    className="mb-6 p-4 rounded-xl"
                    style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(148, 163, 184, 0.2)'
                    }}
                >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search cases..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)'
                                }}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2">
                            <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="All" />
                            <FilterButton active={filter === 'ALLOCATED'} onClick={() => setFilter('ALLOCATED')} label="Allocated" />
                            <FilterButton active={filter === 'ASSIGNED'} onClick={() => setFilter('ASSIGNED')} label="Assigned" />
                            <FilterButton active={filter === 'IN_PROGRESS'} onClick={() => setFilter('IN_PROGRESS')} label="In Progress" />
                        </div>
                    </div>
                </div>

                {/* Cases Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-400">Loading cases...</p>
                        </div>
                    </div>
                ) : filteredCases.length === 0 ? (
                    <div className="text-center py-20">
                        <XCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No cases found</h3>
                        <p className="text-slate-400">
                            {searchTerm
                                ? 'Try adjusting your search criteria'
                                : 'You don\'t have any cases allocated yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCases.map((caseItem) => (
                            <CaseCard
                                key={caseItem.id}
                                case={caseItem}
                                onClick={() => window.location.href = `/manager/assign-cases?caseId=${caseItem.id}`}
                                showAgent
                                showDebtor
                            />
                        ))}
                    </div>
                )}
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
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))'
                    : 'rgba(30, 41, 59, 0.5)',
                border: active ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
                color: active ? '#c084fc' : '#94a3b8'
            }}
        >
            {label}
        </button>
    );
}
