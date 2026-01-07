"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Briefcase,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    Plus,
    Download,
    RefreshCw,
    ArrowRight,
    Brain,
    Bot,
    Shield,
    Zap,
    X,
    Check,
    Loader2,
    AlertCircle,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getStatusColor, getPriorityColor } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { api, DashboardKPIs, Case, AgentInfo } from "@/lib/supabase";

const recoveryData = [
    { month: "Jan", recovered: 42, target: 50 },
    { month: "Feb", recovered: 48, target: 52 },
    { month: "Mar", recovered: 51, target: 55 },
    { month: "Apr", recovered: 47, target: 53 },
    { month: "May", recovered: 55, target: 58 },
    { month: "Jun", recovered: 62, target: 60 },
    { month: "Jul", recovered: 58, target: 62 },
    { month: "Aug", recovered: 65, target: 65 },
    { month: "Sep", recovered: 71, target: 68 },
    { month: "Oct", recovered: 68, target: 70 },
    { month: "Nov", recovered: 75, target: 72 },
    { month: "Dec", recovered: 82, target: 75 },
];

const agentIcons: Record<string, any> = {
    PREDICTIVE: Brain,
    NEGOTIATION: Bot,
    COMPLIANCE: Shield,
    RPA: Zap,
};

const agentColors: Record<string, string> = {
    PREDICTIVE: "#3b82f6",
    NEGOTIATION: "#a855f7",
    COMPLIANCE: "#22c55e",
    RPA: "#f59e0b",
};

export default function DashboardPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showNewCaseModal, setShowNewCaseModal] = useState(false);
    const [lastUpdated, setLastUpdated] = useState("Just now");

    // API Data States
    const [kpiData, setKpiData] = useState<DashboardKPIs | null>(null);
    const [casesData, setCasesData] = useState<Case[]>([]);
    const [agentsData, setAgentsData] = useState<AgentInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Theme-aware colors
    const bgColor = theme === "light" ? "#f8fafc" : "transparent";
    const cardBg = theme === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(15, 23, 42, 0.6)";
    const borderColor = theme === "light" ? "rgba(148, 163, 184, 0.4)" : "rgba(51, 65, 85, 0.5)";
    const textColor = theme === "light" ? "#1e293b" : "#f1f5f9";
    const mutedColor = theme === "light" ? "#64748b" : "#94a3b8";
    const inputBg = theme === "light" ? "rgba(241, 245, 249, 0.9)" : "rgba(30, 41, 59, 0.5)";
    const gridColor = theme === "light" ? "#e2e8f0" : "#334155";

    // Fetch data from API
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [kpiResult, casesResult, agentsResult] = await Promise.all([
                api.get<DashboardKPIs>('/analytics/dashboard').catch(() => null),
                api.get<{ data: Case[] }>('/cases?limit=5').catch(() => ({ data: [] })),
                api.get<AgentInfo[]>('/agents').catch(() => []),
            ]);

            if (kpiResult) {
                setKpiData(kpiResult);
            }
            if (casesResult?.data) {
                setCasesData(casesResult.data);
            }
            if (agentsResult && Array.isArray(agentsResult)) {
                setAgentsData(agentsResult);
            }

            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    };

    // Format KPI values
    const formatKpiValue = (value: number, type: string): string => {
        if (type === 'currency') {
            if (value >= 10000000) {
                return `₹${(value / 10000000).toFixed(2)} Cr`;
            } else if (value >= 100000) {
                return `₹${(value / 100000).toFixed(2)} L`;
            }
            return `₹${value.toLocaleString()}`;
        }
        if (type === 'percentage') {
            return `${value.toFixed(1)}%`;
        }
        if (type === 'days') {
            return `${Math.round(value)} days`;
        }
        return value.toLocaleString();
    };

    // Build KPI cards from API data
    const kpis = kpiData ? [
        {
            title: "Total Cases",
            value: formatKpiValue(kpiData.active_cases || 0, 'number'),
            change: 12.5,
            icon: Briefcase,
            color: "#3b82f6"
        },
        {
            title: "Recovered Amount",
            value: formatKpiValue(kpiData.total_recovered || 0, 'currency'),
            change: 8.3,
            icon: DollarSign,
            color: "#22c55e"
        },
        {
            title: "Recovery Rate",
            value: formatKpiValue(kpiData.recovery_rate || 0, 'percentage'),
            change: 5.2,
            icon: TrendingUp,
            color: "#a855f7"
        },
        {
            title: "Avg. Resolution",
            value: formatKpiValue(kpiData.avg_days_past_due || 0, 'days'),
            change: -15.4,
            icon: Clock,
            color: "#f59e0b"
        },
    ] : [];

    // Build case distribution from API data
    const caseDistribution = kpiData ? [
        { name: "Open", value: kpiData.open_cases || 0, color: "#3b82f6" },
        { name: "In Progress", value: kpiData.in_progress_cases || 0, color: "#f59e0b" },
        { name: "Escalated", value: kpiData.escalated_cases || 0, color: "#ef4444" },
        { name: "Settled", value: kpiData.settled_cases || 0, color: "#22c55e" },
    ].filter(item => item.value > 0) : [];

    // Build agent status from API data
    const agents = agentsData.length > 0 ? agentsData.map(agent => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        icon: agentIcons[agent.type] || Bot,
        color: agentColors[agent.type] || "#3b82f6",
        accuracy: parseFloat(agent.success_rate) || 0,
        lastTask: `${agent.total_actions} actions (${agent.successful_actions} successful)`,
    })) : [
        { id: "predictive", name: "Predictive Agent", status: "ACTIVE", icon: Brain, color: "#3b82f6", accuracy: 94.5, lastTask: "ML-based recovery prediction" },
        { id: "negotiation", name: "Negotiation Agent", status: "ACTIVE", icon: Bot, color: "#a855f7", accuracy: 88.2, lastTask: "Payment plan generation" },
        { id: "compliance", name: "Compliance Agent", status: "ACTIVE", icon: Shield, color: "#22c55e", accuracy: 99.8, lastTask: "Regulatory compliance" },
        { id: "rpa", name: "RPA Agent", status: "ACTIVE", icon: Zap, color: "#f59e0b", accuracy: 97.1, lastTask: "Automated follow-ups" },
    ];

    // Use API cases or fallback
    const recentCases = casesData.length > 0 ? casesData.map(c => ({
        id: c.case_number,
        debtor: c.debtor_name || 'Unknown',
        amount: c.amount,
        status: c.status,
        priority: c.priority,
        recovery: Math.round((c.recovery_probability || 0) * 100),
    })) : [];

    const handleExport = () => {
        const csvContent = [
            ["Case ID", "Debtor", "Amount", "Status", "Priority", "Recovery %"],
            ...recentCases.map(c => [c.id, c.debtor, c.amount, c.status, c.priority, c.recovery])
        ].map(row => row.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // Loading state
    if (loading && !kpiData) {
        return (
            <div style={{ minHeight: '100vh', background: bgColor }}>
                <Header title="Dashboard" subtitle="Welcome back! Here's your collection overview." />
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '60vh',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <Loader2 style={{ width: '48px', height: '48px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: mutedColor, fontSize: '14px' }}>Loading dashboard data...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: bgColor }}>
            <Header title="Dashboard" subtitle="Welcome back! Here's your collection overview." />

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Error Banner */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#ef4444',
                            fontSize: '13px'
                        }}
                    >
                        <AlertCircle style={{ width: '16px', height: '16px' }} />
                        {error} - Showing cached/fallback data
                    </motion.div>
                )}

                {/* Quick Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: isRefreshing ? '#f59e0b' : '#22c55e',
                            animation: isRefreshing ? 'pulse 1s infinite' : 'none'
                        }} />
                        <span style={{ fontSize: '13px', color: mutedColor }}>
                            {isRefreshing ? 'Refreshing...' : `Last updated: ${lastUpdated}`}
                        </span>
                        {kpiData && (
                            <Badge variant="outline" style={{ marginLeft: '8px', fontSize: '11px' }}>
                                Live Data
                            </Badge>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            style={{ gap: '6px', fontSize: '13px' }}
                        >
                            {isRefreshing ? (
                                <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <RefreshCw style={{ width: '14px', height: '14px' }} />
                            )}
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            style={{ gap: '6px', fontSize: '13px' }}
                        >
                            <Download style={{ width: '14px', height: '14px' }} />
                            Export
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setShowNewCaseModal(true)}
                            style={{ gap: '6px', fontSize: '13px' }}
                        >
                            <Plus style={{ width: '14px', height: '14px' }} />
                            New Case
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {kpis.map((kpi, index) => {
                        const Icon = kpi.icon;
                        return (
                            <motion.div
                                key={kpi.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4, boxShadow: theme === 'light' ? '0 10px 30px rgba(0,0,0,0.1)' : '0 20px 40px rgba(0,0,0,0.2)' }}
                                style={{
                                    padding: '20px',
                                    borderRadius: '14px',
                                    cursor: 'pointer',
                                    background: cardBg,
                                    backdropFilter: 'blur(12px)',
                                    border: `1px solid ${borderColor}`,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '13px', color: mutedColor, fontWeight: 500 }}>{kpi.title}</span>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: `${kpi.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon style={{ width: '18px', height: '18px', color: kpi.color }} />
                                    </div>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: textColor, marginBottom: '8px' }}>
                                    {kpi.value}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {kpi.change >= 0 ? (
                                        <TrendingUp style={{ width: '14px', height: '14px', color: '#22c55e' }} />
                                    ) : (
                                        <TrendingDown style={{ width: '14px', height: '14px', color: '#22c55e' }} />
                                    )}
                                    <span style={{ fontSize: '12px', color: '#22c55e' }}>
                                        {Math.abs(kpi.change)}% vs last month
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                    {/* Recovery Trends Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            padding: '20px',
                            borderRadius: '14px',
                            background: cardBg,
                            backdropFilter: 'blur(12px)',
                            border: `1px solid ${borderColor}`
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: textColor }}>Recovery Trends</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6' }} />
                                    <span style={{ fontSize: '12px', color: mutedColor }}>Recovered</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#22c55e' }} />
                                    <span style={{ fontSize: '12px', color: mutedColor }}>Target</span>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={recoveryData}>
                                <defs>
                                    <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: mutedColor }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: mutedColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
                                <Tooltip
                                    contentStyle={{
                                        background: cardBg,
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(12px)'
                                    }}
                                />
                                <Area type="monotone" dataKey="recovered" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRecovered)" />
                                <Area type="monotone" dataKey="target" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Case Distribution */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            padding: '20px',
                            borderRadius: '14px',
                            background: cardBg,
                            backdropFilter: 'blur(12px)',
                            border: `1px solid ${borderColor}`
                        }}
                    >
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: textColor, marginBottom: '16px' }}>Case Distribution</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '140px', height: '140px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={caseDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={65}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {caseDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                {caseDistribution.map(item => (
                                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }} />
                                            <span style={{ fontSize: '12px', color: mutedColor }}>{item.name}</span>
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Agents & Recent Cases */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                    {/* AI Agents Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            padding: '20px',
                            borderRadius: '14px',
                            background: cardBg,
                            backdropFilter: 'blur(12px)',
                            border: `1px solid ${borderColor}`
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: textColor }}>AI Agents</h3>
                            <Badge variant="outline" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'none', fontSize: '11px' }}>
                                {agents.filter(a => a.status === 'ACTIVE').length}/{agents.length} Active
                            </Badge>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {agents.map(agent => {
                                const Icon = agent.icon;
                                return (
                                    <motion.div
                                        key={agent.id}
                                        whileHover={{ x: 4 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            background: theme === 'light' ? 'rgba(241, 245, 249, 0.8)' : 'rgba(30, 41, 59, 0.4)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '8px',
                                            background: `${agent.color}15`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Icon style={{ width: '18px', height: '18px', color: agent.color }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 500, color: textColor }}>{agent.name}</span>
                                                <Badge
                                                    style={{
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        background: agent.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                                        color: agent.status === 'ACTIVE' ? '#22c55e' : mutedColor,
                                                        border: 'none'
                                                    }}
                                                >
                                                    {agent.status}
                                                </Badge>
                                            </div>
                                            <span style={{ fontSize: '11px', color: mutedColor }}>{agent.lastTask}</span>
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: agent.color }}>{agent.accuracy}%</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Recent Cases */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{
                            padding: '20px',
                            borderRadius: '14px',
                            background: cardBg,
                            backdropFilter: 'blur(12px)',
                            border: `1px solid ${borderColor}`
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: textColor }}>Recent Cases</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/cases')}
                                style={{ gap: '4px', fontSize: '12px', color: '#3b82f6' }}
                            >
                                View All
                                <ArrowRight style={{ width: '12px', height: '12px' }} />
                            </Button>
                        </div>

                        {recentCases.length === 0 ? (
                            <div style={{
                                padding: '40px 20px',
                                textAlign: 'center',
                                color: mutedColor,
                                fontSize: '13px'
                            }}>
                                <Briefcase style={{ width: '32px', height: '32px', marginBottom: '12px', opacity: 0.5 }} />
                                <p>No cases found. Create a new case to get started.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: mutedColor, fontWeight: 500, borderBottom: `1px solid ${borderColor}` }}>CASE ID</th>
                                            <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: mutedColor, fontWeight: 500, borderBottom: `1px solid ${borderColor}` }}>DEBTOR</th>
                                            <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', color: mutedColor, fontWeight: 500, borderBottom: `1px solid ${borderColor}` }}>AMOUNT</th>
                                            <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '11px', color: mutedColor, fontWeight: 500, borderBottom: `1px solid ${borderColor}` }}>STATUS</th>
                                            <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '11px', color: mutedColor, fontWeight: 500, borderBottom: `1px solid ${borderColor}` }}>PRIORITY</th>
                                            <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', color: mutedColor, fontWeight: 500, borderBottom: `1px solid ${borderColor}` }}>RECOVERY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentCases.map((caseItem, idx) => (
                                            <motion.tr
                                                key={caseItem.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.7 + idx * 0.05 }}
                                                whileHover={{ background: theme === 'light' ? 'rgba(241, 245, 249, 0.6)' : 'rgba(30, 41, 59, 0.3)' }}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => router.push(`/cases/${caseItem.id}`)}
                                            >
                                                <td style={{ padding: '12px', fontSize: '13px', color: '#3b82f6', fontWeight: 500 }}>{caseItem.id}</td>
                                                <td style={{ padding: '12px', fontSize: '13px', color: textColor }}>{caseItem.debtor}</td>
                                                <td style={{ padding: '12px', fontSize: '13px', color: textColor, textAlign: 'right', fontWeight: 500 }}>₹{caseItem.amount.toLocaleString()}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <Badge style={{
                                                        fontSize: '10px',
                                                        padding: '3px 8px',
                                                        background: `${getStatusColor(caseItem.status)}15`,
                                                        color: getStatusColor(caseItem.status),
                                                        border: 'none'
                                                    }}>
                                                        {caseItem.status.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <Badge style={{
                                                        fontSize: '10px',
                                                        padding: '3px 8px',
                                                        background: `${getPriorityColor(caseItem.priority)}15`,
                                                        color: getPriorityColor(caseItem.priority),
                                                        border: 'none'
                                                    }}>
                                                        {caseItem.priority}
                                                    </Badge>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <div style={{
                                                            width: '60px',
                                                            height: '6px',
                                                            background: theme === 'light' ? '#e2e8f0' : '#334155',
                                                            borderRadius: '3px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                width: `${caseItem.recovery}%`,
                                                                height: '100%',
                                                                background: caseItem.recovery >= 70 ? '#22c55e' : caseItem.recovery >= 40 ? '#f59e0b' : '#ef4444',
                                                                borderRadius: '3px'
                                                            }} />
                                                        </div>
                                                        <span style={{ fontSize: '12px', fontWeight: 500, color: textColor, minWidth: '32px' }}>{caseItem.recovery}%</span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* New Case Modal */}
            <AnimatePresence>
                {showNewCaseModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNewCaseModal(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0, 0, 0, 0.5)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 9998
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 9999,
                                pointerEvents: 'none'
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    maxWidth: '500px',
                                    background: cardBg,
                                    borderRadius: '16px',
                                    border: `1px solid ${borderColor}`,
                                    backdropFilter: 'blur(20px)',
                                    padding: '24px',
                                    pointerEvents: 'auto'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: textColor }}>Create New Case</h2>
                                    <button
                                        onClick={() => setShowNewCaseModal(false)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: inputBg,
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: mutedColor
                                        }}
                                    >
                                        <X style={{ width: '16px', height: '16px' }} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '6px' }}>Debtor Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter debtor name"
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: `1px solid ${borderColor}`,
                                                background: inputBg,
                                                color: textColor,
                                                fontSize: '14px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '6px' }}>Amount</label>
                                        <input
                                            type="number"
                                            placeholder="Enter amount"
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: `1px solid ${borderColor}`,
                                                background: inputBg,
                                                color: textColor,
                                                fontSize: '14px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '6px' }}>Priority</label>
                                        <select
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: `1px solid ${borderColor}`,
                                                background: inputBg,
                                                color: textColor,
                                                fontSize: '14px',
                                                outline: 'none'
                                            }}
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                            <option value="CRITICAL">Critical</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                        <Button variant="outline" onClick={() => setShowNewCaseModal(false)} style={{ flex: 1 }}>
                                            Cancel
                                        </Button>
                                        <Button style={{ flex: 1 }}>
                                            <Check style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                                            Create Case
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Global CSS for animations */}
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
