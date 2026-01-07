"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: number;
    change?: number;
    icon: LucideIcon;
    format?: "number" | "currency" | "percentage";
    glowColor?: "primary" | "success" | "warning" | "destructive";
    delay?: number;
}

const glowColors = {
    primary: { bg: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', shadow: 'rgba(59, 130, 246, 0.2)' },
    success: { bg: 'linear-gradient(135deg, #22c55e, #10b981)', shadow: 'rgba(34, 197, 94, 0.2)' },
    warning: { bg: 'linear-gradient(135deg, #f59e0b, #f97316)', shadow: 'rgba(245, 158, 11, 0.2)' },
    destructive: { bg: 'linear-gradient(135deg, #ef4444, #f43f5e)', shadow: 'rgba(239, 68, 68, 0.2)' },
};

export function KPICard({
    title,
    value,
    change,
    icon: Icon,
    format = "number",
    glowColor = "primary",
    delay = 0,
}: KPICardProps) {
    const formattedValue = () => {
        switch (format) {
            case "currency":
                return formatCurrency(value);
            case "percentage":
                return formatPercentage(value);
            default:
                return value.toLocaleString("en-IN");
        }
    };

    const colors = glowColors[glowColor];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.08 }}
            className="glass"
            style={{
                padding: '24px',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
            }}
            whileHover={{
                boxShadow: `0 8px 32px ${colors.shadow}`,
                y: -4
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px'
            }}>
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontSize: '14px',
                        color: '#94a3b8',
                        fontWeight: 500,
                        marginBottom: '8px'
                    }}>
                        {title}
                    </p>
                    <motion.p
                        style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: '#f1f5f9',
                            marginBottom: '8px',
                            lineHeight: 1.2
                        }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: delay * 0.08 + 0.15 }}
                    >
                        {formattedValue()}
                    </motion.p>
                    {change !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {change >= 0 ? (
                                <TrendingUp style={{ width: '14px', height: '14px', color: '#4ade80' }} />
                            ) : (
                                <TrendingDown style={{ width: '14px', height: '14px', color: '#f87171' }} />
                            )}
                            <span style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: change >= 0 ? '#4ade80' : '#f87171'
                            }}>
                                {change >= 0 ? "+" : ""}{change}%
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                                vs last month
                            </span>
                        </div>
                    )}
                </div>
                <div
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: colors.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <Icon style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
            </div>
        </motion.div>
    );
}
