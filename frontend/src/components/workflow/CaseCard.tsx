"use client";

import { WorkflowCase, CasePriority, CaseStatus } from '@/lib/supabase';
import { Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getStatusColor, getPriorityColor } from '@/lib/utils';

interface CaseCardProps {
    case: WorkflowCase;
    onClick?: () => void;
    showAgent?: boolean;
    showDebtor?: boolean;
}

export function CaseCard({ case: caseData, onClick, showAgent = false, showDebtor = true }: CaseCardProps) {
    const getPriorityBadgeColor = (priority: CasePriority) => {
        const colors = {
            CRITICAL: 'bg-red-500/20 text-red-300 border-red-500/30',
            HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
            MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            LOW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        };
        return colors[priority] || colors.MEDIUM;
    };

    const getStatusBadgeColor = (status: CaseStatus) => {
        const colors = {
            PENDING: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
            ALLOCATED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            ASSIGNED: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            IN_PROGRESS: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            RESOLVED: 'bg-green-500/20 text-green-300 border-green-500/30',
            ESCALATED: 'bg-red-500/20 text-red-300 border-red-500/30',
            CLOSED: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        };
        return colors[status] || colors.PENDING;
    };

    const isOverdue = caseData.sla_due_date && new Date(caseData.sla_due_date) < new Date();

    return (
        <div
            onClick={onClick}
            className="p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]"
            style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderColor: isOverdue ? 'rgba(239, 68, 68, 0.3)' : 'rgba(148, 163, 184, 0.2)',
                backdropFilter: 'blur(12px)'
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                            {caseData.case_number}
                        </h3>
                        {isOverdue && (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                    </div>
                    {showDebtor && caseData.debtor_name && (
                        <p className="text-sm text-slate-400">
                            {caseData.debtor_name}
                        </p>
                    )}
                    {showAgent && caseData.agent_name && (
                        <p className="text-xs text-slate-500">
                            Agent: {caseData.agent_name}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                    <Badge className={`text-xs px-2 py-1 border ${getPriorityBadgeColor(caseData.priority)}`}>
                        {caseData.priority}
                    </Badge>
                    <Badge className={`text-xs px-2 py-1 border ${getStatusBadgeColor(caseData.status)}`}>
                        {caseData.status.replace('_', ' ')}
                    </Badge>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                    <div>
                        <p className="text-xs text-slate-500">Amount</p>
                        <p className="text-sm font-semibold text-white">
                            {formatCurrency(caseData.amount)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <div>
                        <p className="text-xs text-slate-500">Recovery</p>
                        <p className="text-sm font-semibold text-green-400">
                            {caseData.recovery_probability ? `${caseData.recovery_probability}%` : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            {(caseData.sla_due_date || caseData.next_follow_up) && (
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-700/50">
                    <Clock className="w-3 h-3" />
                    {caseData.sla_due_date && (
                        <span className={isOverdue ? 'text-red-400 font-medium' : ''}>
                            SLA: {new Date(caseData.sla_due_date).toLocaleDateString()}
                        </span>
                    )}
                    {caseData.next_follow_up && (
                        <span>
                            Next: {new Date(caseData.next_follow_up).toLocaleDateString()}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
