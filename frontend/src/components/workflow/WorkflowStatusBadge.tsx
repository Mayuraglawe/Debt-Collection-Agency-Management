"use client";

import { CaseStatus } from '@/lib/supabase';
import { Circle, CheckCircle, Clock, AlertTriangle, XCircle, Ban } from 'lucide-react';

interface WorkflowStatusBadgeProps {
    status: CaseStatus;
    showIcon?: boolean;
}

export function WorkflowStatusBadge({ status, showIcon = true }: WorkflowStatusBadgeProps) {
    const config = {
        PENDING: {
            color: '#94a3b8',
            bgColor: 'rgba(148, 163, 184, 0.1)',
            icon: Circle,
            label: 'Pending',
        },
        ALLOCATED: {
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.1)',
            icon: Clock,
            label: 'Allocated',
        },
        ASSIGNED: {
            color: '#8b5cf6',
            bgColor: 'rgba(139, 92, 246, 0.1)',
            icon: Clock,
            label: 'Assigned',
        },
        IN_PROGRESS: {
            color: '#eab308',
            bgColor: 'rgba(234, 179, 8, 0.1)',
            icon: Clock,
            label: 'In Progress',
        },
        RESOLVED: {
            color: '#22c55e',
            bgColor: 'rgba(34, 197, 94, 0.1)',
            icon: CheckCircle,
            label: 'Resolved',
        },
        ESCALATED: {
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.1)',
            icon: AlertTriangle,
            label: 'Escalated',
        },
        CLOSED: {
            color: '#6b7280',
            bgColor: 'rgba(107, 114, 128, 0.1)',
            icon: Ban,
            label: 'Closed',
        },
    };

    const { color, bgColor, icon: Icon, label } = config[status];

    return (
        <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium"
            style={{
                backgroundColor: bgColor,
                borderColor: color + '40',
                color: color,
            }}
        >
            {showIcon && <Icon className="w-3 h-3" />}
            {label}
        </div>
    );
}
