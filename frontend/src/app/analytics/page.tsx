"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Download,
    Calendar,
    DollarSign,
    Target,
    Users,
    Activity,
    RefreshCw,
    Loader2,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart as RechartsPie,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
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

const agentPerformanceData = [
    { name: "Predictive", tasks: 1247 },
    { name: "Negotiation", tasks: 856 },
    { name: "Compliance", tasks: 2103 },
    { name: "RPA", tasks: 3421 },
];

const caseStatusData = [
    { name: "Settled", value: 423, color: "#22c55e" },
    { name: "In Progress", value: 312, color: "#f59e0b" },
    { name: "Open", value: 245, color: "#3b82f6" },
    { name: "Escalated", value: 67, color: "#ef4444" },
    { name: "Closed", value: 89, color: "#64748b" },
];

const collectionByChannel = [
    { channel: "Email", amount: 32500000, count: 456 },
    { channel: "SMS", amount: 18200000, count: 324 },
    { channel: "Call", amount: 24800000, count: 189 },
    { channel: "Letter", amount: 7000000, count: 67 },
];

const kpiCards = [
    { title: "Total Recovered", value: 82500000, change: 12.5, format: "currency", icon: DollarSign, color: "#22c55e" },
    { title: "Recovery Rate", value: 68.5, change: 5.2, format: "percentage", icon: Target, color: "#3b82f6" },
    { title: "Active Debtors", value: 1847, change: -8.3, format: "number", icon: Users, color: "#a855f7" },
    { title: "Avg Collection Time", value: 23, change: -15.4, format: "days", icon: Activity, color: "#f59e0b" },
];

export default function AnalyticsPage() {
    const { theme } = useTheme();
    const [timeRange, setTimeRange] = useState("12m");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleExport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            timeRange,
            kpis: kpiCards.map(k => ({ title: k.title, value: k.value, change: k.change })),
            recoveryData,
            agentPerformance: agentPerformanceData,
            caseStatus: caseStatusData,
            channels: collectionByChannel
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsRefreshing(false);
    };

    const bgColor = theme === "light" ? "#f8fafc" : "transparent";
    const cardBg = theme === "light" ? "rgba(255, 255, 255, 0.8)" : "rgba(15, 23, 42, 0.6)";
    const borderColor = theme === "light" ? "rgba(148, 163, 184, 0.3)" : "rgba(51, 65, 85, 0.5)";
    const textColor = theme === "light" ? "#1e293b" : "#f1f5f9";
    const mutedColor = theme === "light" ? "#64748b" : "#94a3b8";
    const inputBg = theme === "light" ? "rgba(241, 245, 249, 0.8)" : "rgba(30, 41, 59, 0.5)";
    const gridColor = theme === "light" ? "#e2e8f0" : "#334155";

    return (
        <div style={{ minHeight: '100vh', background: bgColor }}>
            <Header title="Analytics" subtitle="Deep insights into your collection performance" />

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Calendar style={{ width: '16px', height: '16px', color: mutedColor }} />
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            style={{
                                height: '36px',
                                padding: '0 12px',
                                borderRadius: '8px',
                                border: `1px solid ${borderColor}`,
                                background: inputBg,
                                color: textColor,
                                fontSize: '13px',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="3m">Last 3 Months</option>
                            <option value="6m">Last 6 Months</option>
                            <option value="12m">Last 12 Months</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            style={{ gap: '8px' }}
                        >
                            {isRefreshing ? (
                                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <RefreshCw style={{ width: '16px', height: '16px' }} />
                            )}
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExport} style={{ gap: '8px' }}>
                            <Download style={{ width: '16px', height: '16px' }} />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {kpiCards.map((kpi, index) => {
                        const Icon = kpi.icon;
                        return (
                            <motion.div
                                key={kpi.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4 }}
                                style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    background: cardBg,
                                    backdropFilter: 'blur(12px)',
                                    border: `1px solid ${borderColor}`,
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '8px' }}>{kpi.title}</p>
                                        <p style={{ fontSize: '24px', fontWeight: 700, color: textColor, marginBottom: '8px' }}>
                                            {kpi.format === "currency"
                                                ? formatCurrency(kpi.value)
                                                : kpi.format === "percentage"
                                                    ? `${kpi.value}%`
                                                    : kpi.format === "days"
                                                        ? `${kpi.value} days`
                                                        : kpi.value.toLocaleString()}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {kpi.change > 0 ? (
                                                <TrendingUp style={{ width: '14px', height: '14px', color: '#4ade80' }} />
                                            ) : (
                                                <TrendingDown style={{ width: '14px', height: '14px', color: '#f87171' }} />
                                            )}
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: kpi.change > 0 ? '#4ade80' : '#f87171' }}>
                                                {kpi.change > 0 ? "+" : ""}{kpi.change}%
                                            </span>
                                            <span style={{ fontSize: '11px', color: mutedColor }}>vs last period</span>
                                        </div>
                                    </div>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${kpi.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon style={{ width: '22px', height: '22px', color: kpi.color }} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Recovery Trends */}
                    <div style={{ padding: '20px', borderRadius: '12px', background: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${borderColor}` }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: textColor, marginBottom: '20px' }}>
                            Recovery vs Target
                        </h3>
                        <div style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={recoveryData}>
                                    <defs>
                                        <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                    <XAxis dataKey="month" stroke={mutedColor} fontSize={12} />
                                    <YAxis stroke={mutedColor} fontSize={12} tickFormatter={(v) => `₹${v}L`} />
                                    <Tooltip contentStyle={{ background: theme === 'light' ? '#fff' : '#1e293b', border: `1px solid ${borderColor}`, borderRadius: '8px' }} labelStyle={{ color: textColor }} />
                                    <Area type="monotone" dataKey="recovered" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRecovered)" />
                                    <Area type="monotone" dataKey="target" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Case Status Distribution */}
                    <div style={{ padding: '20px', borderRadius: '12px', background: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${borderColor}` }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: textColor, marginBottom: '20px' }}>
                            Case Status Distribution
                        </h3>
                        <div style={{ display: 'flex', height: '280px' }}>
                            <ResponsiveContainer width="60%" height="100%">
                                <RechartsPie>
                                    <Pie data={caseStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                                        {caseStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: theme === 'light' ? '#fff' : '#1e293b', border: `1px solid ${borderColor}`, borderRadius: '8px' }} />
                                </RechartsPie>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                                {caseStatusData.map((item) => (
                                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color }} />
                                        <span style={{ fontSize: '13px', color: mutedColor }}>{item.name}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Agent Performance */}
                    <div style={{ padding: '20px', borderRadius: '12px', background: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${borderColor}` }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: textColor, marginBottom: '20px' }}>
                            Agent Performance
                        </h3>
                        <div style={{ height: '240px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={agentPerformanceData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                    <XAxis type="number" stroke={mutedColor} fontSize={12} />
                                    <YAxis type="category" dataKey="name" stroke={mutedColor} fontSize={12} width={80} />
                                    <Tooltip contentStyle={{ background: theme === 'light' ? '#fff' : '#1e293b', border: `1px solid ${borderColor}`, borderRadius: '8px' }} />
                                    <Bar dataKey="tasks" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Collection by Channel */}
                    <div style={{ padding: '20px', borderRadius: '12px', background: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${borderColor}` }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: textColor, marginBottom: '20px' }}>
                            Collection by Channel
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {collectionByChannel.map((channel, index) => {
                                const maxAmount = Math.max(...collectionByChannel.map((c) => c.amount));
                                const percentage = (channel.amount / maxAmount) * 100;
                                return (
                                    <motion.div
                                        key={channel.channel}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '13px', color: textColor }}>{channel.channel}</span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>
                                                {formatCurrency(channel.amount)}
                                            </span>
                                        </div>
                                        <div style={{ height: '8px', background: inputBg, borderRadius: '4px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                                                style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #a855f7)', borderRadius: '4px' }}
                                            />
                                        </div>
                                        <p style={{ fontSize: '11px', color: mutedColor, marginTop: '4px' }}>
                                            {channel.count} successful collections
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
