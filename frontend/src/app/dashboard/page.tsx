"use client";

import { useState } from "react";
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

const caseDistribution = [
    { name: "Open", value: 198, color: "#3b82f6" },
    { name: "In Progress", value: 153, color: "#f59e0b" },
    { name: "Escalated", value: 54, color: "#ef4444" },
    { name: "Settled", value: 342, color: "#22c55e" },
    { name: "Closed", value: 252, color: "#64748b" },
];

const agents = [
    { id: "predictive", name: "Predictive Agent", status: "ACTIVE", icon: Brain, color: "#3b82f6", accuracy: 94.5, lastTask: "Predicted recovery for Case #1234" },
    { id: "negotiation", name: "Negotiation Agent", status: "ACTIVE", icon: Bot, color: "#a855f7", accuracy: 88.2, lastTask: "Generated payment plan for Debtor #567" },
    { id: "compliance", name: "Compliance Agent", status: "ACTIVE", icon: Shield, color: "#22c55e", accuracy: 99.8, lastTask: "Validated communication for Case #890" },
    { id: "rpa", name: "RPA Agent", status: "IDLE", icon: Zap, color: "#f59e0b", accuracy: 97.1, lastTask: "Scheduled 15 follow-up emails" },
];

const recentCases = [
    { id: "DCA-2024-1234", debtor: "Rahul Sharma", amount: 125000, status: "IN_PROGRESS", priority: "HIGH", recovery: 78 },
    { id: "DCA-2024-1235", debtor: "Priya Patel", amount: 89000, status: "OPEN", priority: "MEDIUM", recovery: 65 },
    { id: "DCA-2024-1236", debtor: "Amit Kumar", amount: 234000, status: "ESCALATED", priority: "CRITICAL", recovery: 34 },
    { id: "DCA-2024-1237", debtor: "Sunita Reddy", amount: 56000, status: "SETTLED", priority: "LOW", recovery: 100 },
    { id: "DCA-2024-1238", debtor: "Vikram Singh", amount: 178000, status: "IN_PROGRESS", priority: "HIGH", recovery: 72 },
];

const kpis = [
    { title: "Total Cases", value: "1,236", change: 12.5, icon: Briefcase, color: "#3b82f6" },
    { title: "Recovered Amount", value: "₹8.25 Cr", change: 8.3, icon: DollarSign, color: "#22c55e" },
    { title: "Recovery Rate", value: "68.5%", change: 5.2, icon: TrendingUp, color: "#a855f7" },
    { title: "Avg. Resolution", value: "23 days", change: -15.4, icon: Clock, color: "#f59e0b" },
];

export default function DashboardPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showNewCaseModal, setShowNewCaseModal] = useState(false);
    const [lastUpdated, setLastUpdated] = useState("Just now");

    // Theme-aware colors
    const bgColor = theme === "light" ? "#f8fafc" : "transparent";
    const cardBg = theme === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(15, 23, 42, 0.6)";
    const borderColor = theme === "light" ? "rgba(148, 163, 184, 0.4)" : "rgba(51, 65, 85, 0.5)";
    const textColor = theme === "light" ? "#1e293b" : "#f1f5f9";
    const mutedColor = theme === "light" ? "#64748b" : "#94a3b8";
    const inputBg = theme === "light" ? "rgba(241, 245, 249, 0.9)" : "rgba(30, 41, 59, 0.5)";
    const gridColor = theme === "light" ? "#e2e8f0" : "#334155";

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLastUpdated("Just now");
        setIsRefreshing(false);
    };

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

    return (
        <div style={{ minHeight: '100vh', background: bgColor }}>
            <Header title="Dashboard" subtitle="Welcome back! Here's your collection overview." />

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

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
                                onClick={() => {
                                    if (kpi.title === "Total Cases") router.push('/cases');
                                    else if (kpi.title === "Recovery Rate") router.push('/analytics');
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '6px' }}>{kpi.title}</p>
                                        <p style={{ fontSize: '26px', fontWeight: 700, color: textColor, marginBottom: '6px' }}>{kpi.value}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {kpi.change > 0 ? (
                                                <TrendingUp style={{ width: '12px', height: '12px', color: '#4ade80' }} />
                                            ) : (
                                                <TrendingDown style={{ width: '12px', height: '12px', color: '#f87171' }} />
                                            )}
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: kpi.change > 0 ? '#4ade80' : '#f87171' }}>
                                                {kpi.change > 0 ? '+' : ''}{kpi.change}%
                                            </span>
                                            <span style={{ fontSize: '11px', color: mutedColor }}>vs last month</span>
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '10px',
                                        background: `${kpi.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon style={{ width: '20px', height: '20px', color: kpi.color }} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px' }}>
                    {/* Recovery Trends */}
                    <div style={{
                        padding: '20px',
                        borderRadius: '14px',
                        background: cardBg,
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${borderColor}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: textColor }}>Recovery Trends</h3>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6' }} />
                                    <span style={{ fontSize: '12px', color: mutedColor }}>Recovered</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#a855f7' }} />
                                    <span style={{ fontSize: '12px', color: mutedColor }}>Target</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={recoveryData}>
                                    <defs>
                                        <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                    <XAxis dataKey="month" stroke={mutedColor} fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke={mutedColor} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}L`} />
                                    <Tooltip
                                        contentStyle={{
                                            background: theme === 'light' ? '#ffffff' : '#1e293b',
                                            border: `1px solid ${borderColor}`,
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            color: textColor
                                        }}
                                        labelStyle={{ color: textColor }}
                                    />
                                    <Area type="monotone" dataKey="recovered" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRecovered)" />
                                    <Area type="monotone" dataKey="target" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Case Distribution */}
                    <div style={{
                        padding: '20px',
                        borderRadius: '14px',
                        background: cardBg,
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${borderColor}`
                    }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: textColor, marginBottom: '12px' }}>Case Distribution</h3>
                        <div style={{ display: 'flex', alignItems: 'center', height: '200px' }}>
                            <div style={{ width: '55%', height: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={caseDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                                            {caseDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: theme === 'light' ? '#ffffff' : '#1e293b',
                                                border: `1px solid ${borderColor}`,
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {caseDistribution.map((item) => (
                                    <div
                                        key={item.name}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                                        onClick={() => router.push(`/cases?status=${item.name.toUpperCase().replace(' ', '_')}`)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }} />
                                            <span style={{ fontSize: '12px', color: mutedColor }}>{item.name}</span>
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: textColor }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
                    {/* AI Agents */}
                    <div style={{
                        padding: '20px',
                        borderRadius: '14px',
                        background: cardBg,
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${borderColor}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: textColor }}>AI Agents</h3>
                            <Badge variant="success" style={{ fontSize: '10px' }}>4 Active</Badge>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {agents.map((agent) => {
                                const Icon = agent.icon;
                                return (
                                    <motion.div
                                        key={agent.id}
                                        whileHover={{ x: 4 }}
                                        onClick={() => router.push('/agents')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px',
                                            borderRadius: '10px',
                                            background: inputBg,
                                            cursor: 'pointer',
                                            border: `1px solid ${borderColor}`
                                        }}
                                    >
                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: agent.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon style={{ width: '18px', height: '18px', color: 'white' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 500, color: textColor }}>{agent.name}</span>
                                                <Badge variant={agent.status === "ACTIVE" ? "success" : "outline"} style={{ fontSize: '9px', padding: '1px 5px' }}>{agent.status}</Badge>
                                            </div>
                                            <p style={{ fontSize: '11px', color: mutedColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.lastTask}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>{agent.accuracy}%</p>
                                            <p style={{ fontSize: '10px', color: mutedColor }}>accuracy</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Cases */}
                    <div style={{
                        padding: '20px',
                        borderRadius: '14px',
                        background: cardBg,
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${borderColor}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: textColor }}>Recent Cases</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/cases')}
                                style={{ gap: '4px', fontSize: '12px', padding: '4px 8px' }}
                            >
                                View All <ArrowRight style={{ width: '12px', height: '12px' }} />
                            </Button>
                        </div>
                        <div style={{ overflow: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                                        {['Case ID', 'Debtor', 'Amount', 'Status', 'Priority', 'Recovery'].map((header) => (
                                            <th key={header} style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: mutedColor, textTransform: 'uppercase' }}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentCases.map((caseItem) => (
                                        <tr
                                            key={caseItem.id}
                                            onClick={() => router.push(`/cases?id=${caseItem.id}`)}
                                            style={{ borderBottom: `1px solid ${theme === 'light' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(51, 65, 85, 0.3)'}`, cursor: 'pointer', transition: 'background 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '10px', fontSize: '12px', fontFamily: 'monospace', color: '#60a5fa' }}>{caseItem.id}</td>
                                            <td style={{ padding: '10px', fontSize: '12px', color: textColor, fontWeight: 500 }}>{caseItem.debtor}</td>
                                            <td style={{ padding: '10px', fontSize: '12px', color: mutedColor }}>{formatCurrency(caseItem.amount)}</td>
                                            <td style={{ padding: '10px' }}><Badge className={getStatusColor(caseItem.status)} style={{ fontSize: '10px' }}>{caseItem.status.replace('_', ' ')}</Badge></td>
                                            <td style={{ padding: '10px' }}><Badge className={getPriorityColor(caseItem.priority)} style={{ fontSize: '10px' }}>{caseItem.priority}</Badge></td>
                                            <td style={{ padding: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ flex: 1, height: '4px', background: inputBg, borderRadius: '2px', maxWidth: '60px' }}>
                                                        <div style={{ height: '100%', width: `${caseItem.recovery}%`, background: caseItem.recovery > 70 ? '#22c55e' : caseItem.recovery > 40 ? '#f59e0b' : '#ef4444', borderRadius: '2px' }} />
                                                    </div>
                                                    <span style={{ fontSize: '11px', fontWeight: 600, color: textColor }}>{caseItem.recovery}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
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
                                background: 'rgba(0, 0, 0, 0.6)',
                                zIndex: 9998
                            }}
                        />
                        <div
                            style={{
                                position: 'fixed',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 9999,
                                padding: '20px',
                                pointerEvents: 'none'
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                style={{
                                    width: '100%',
                                    maxWidth: '500px',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    background: theme === 'light' ? '#ffffff' : '#0f172a',
                                    border: `1px solid ${borderColor}`,
                                    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                                    pointerEvents: 'auto'
                                }}
                            >
                                <div style={{ padding: '20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: textColor }}>Create New Case</h2>
                                    <button
                                        onClick={() => setShowNewCaseModal(false)}
                                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <X style={{ width: '18px', height: '18px', color: mutedColor }} />
                                    </button>
                                </div>
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '8px' }}>Debtor Name *</label>
                                        <input placeholder="Enter debtor name" style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '8px' }}>Amount *</label>
                                            <input type="number" placeholder="₹0" style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '8px' }}>Priority</label>
                                            <select style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HIGH">High</option>
                                                <option value="CRITICAL">Critical</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '8px' }}>Due Date</label>
                                        <input type="date" style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none' }} />
                                    </div>
                                </div>
                                <div style={{ padding: '16px 20px', borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <Button variant="outline" onClick={() => setShowNewCaseModal(false)}>Cancel</Button>
                                    <Button onClick={() => {
                                        alert('Case created successfully! (Demo)');
                                        setShowNewCaseModal(false);
                                    }}>
                                        <Check style={{ width: '16px', height: '16px' }} />
                                        Create Case
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

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
