"use client";

import { CasePriority } from '@/lib/supabase';
import { AlertCircle, AlertTriangle, Info, Flame } from 'lucide-react';

interface PriorityIndicatorProps {
    priority: CasePriority;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function PriorityIndicator({ priority, showLabel = true, size = 'md' }: PriorityIndicatorProps) {
    const config = {
        CRITICAL: {
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.1)',
            icon: Flame,
            label: 'Critical',
        },
        HIGH: {
            color: '#f97316',
            bgColor: 'rgba(249, 115, 22, 0.1)',
            icon: AlertCircle,
            label: 'High',
        },
        MEDIUM: {
            color: '#eab308',
            bgColor: 'rgba(234, 179, 8, 0.1)',
            icon: AlertTriangle,
            label: 'Medium',
        },
        LOW: {
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.1)',
            icon: Info,
            label: 'Low',
        },
    };

    const sizeConfig = {
        sm: { icon: 12, padding: '4px', fontSize: '10px' },
        md: { icon: 16, padding: '6px', fontSize: '12px' },
        lg: { icon: 20, padding: '8px', fontSize: '14px' },
    };

    const { color, bgColor, icon: Icon, label } = config[priority];
    const { icon: iconSize, padding, fontSize } = sizeConfig[size];

    return (
        <div
            className="inline-flex items-center gap-1.5 rounded-full border"
            style={{
                backgroundColor: bgColor,
                borderColor: color + '40',
                padding: showLabel ? padding : '4px',
            }}
        >
            <Icon
                style={{
                    width: iconSize,
                    height: iconSize,
                    color: color,
                }}
            />
            {showLabel && (
                <span
                    className="font-medium pr-1"
                    style={{
                        color: color,
                        fontSize: fontSize,
                    }}
                >
                    {label}
                </span>
            )}
        </div>
    );
}
