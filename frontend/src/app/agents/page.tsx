"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Bot,
    Shield,
    Zap,
    Play,
    Pause,
    Settings,
    Activity,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme-context";

const initialAgents = [
    {
        id: "predictive",
        name: "Predictive Agent",
        type: "PREDICTIVE",
        icon: Brain,
        description: "Analyzes debtor profiles and predicts recovery probability using ML models.",
        status: "ACTIVE",
        uptime: "99.8%",
        tasksToday: 156,
        tasksTotal: 12847,
        accuracy: 94.5,
        avgResponseTime: 245,
        lastActive: "2 seconds ago",
        color: "#3b82f6",
        recentActions: [
            { action: "Predicted recovery for Case #1234", time: "2s ago", success: true },
            { action: "Updated risk score for Debtor #567", time: "15s ago", success: true },
            { action: "Batch prediction for 50 cases", time: "1m ago", success: true },
            { action: "Model retrained with new data", time: "5m ago", success: true },
        ],
    },
    {
        id: "negotiation",
        name: "Negotiation Agent",
        type: "NEGOTIATION",
        icon: Bot,
        description: "Generates personalized communication strategies and payment plans.",
        status: "ACTIVE",
        uptime: "99.5%",
        tasksToday: 89,
        tasksTotal: 8562,
        accuracy: 88.2,
        avgResponseTime: 512,
        lastActive: "5 seconds ago",
        color: "#a855f7",
        recentActions: [
            { action: "Generated payment plan for Case #890", time: "5s ago", success: true },
            { action: "Sent follow-up strategy to RPA", time: "30s ago", success: true },
            { action: "Escalated Case #456 to manual review", time: "2m ago", success: false },
            { action: "Updated communication template", time: "10m ago", success: true },
        ],
    },
    {
        id: "compliance",
        name: "Compliance Agent",
        type: "COMPLIANCE",
        icon: Shield,
        description: "Ensures all communications and actions comply with regulations.",
        status: "ACTIVE",
        uptime: "100%",
        tasksToday: 312,
        tasksTotal: 21034,
        accuracy: 99.8,
        avgResponseTime: 89,
        lastActive: "1 second ago",
        color: "#22c55e",
        recentActions: [
            { action: "Validated email for Case #1234", time: "1s ago", success: true },
            { action: "Blocked prohibited phrase in SMS", time: "10s ago", success: true },
            { action: "Checked communication time window", time: "20s ago", success: true },
            { action: "Audit log exported", time: "5m ago", success: true },
        ],
    },
    {
        id: "rpa",
        name: "RPA Agent",
        type: "RPA",
        icon: Zap,
        description: "Automates follow-ups via email, SMS, and schedules calls.",
        status: "IDLE",
        uptime: "99.2%",
        tasksToday: 45,
        tasksTotal: 34210,
        accuracy: 97.1,
        avgResponseTime: 1250,
        lastActive: "30 seconds ago",
        color: "#f59e0b",
        recentActions: [
            { action: "Scheduled 15 follow-up emails", time: "30s ago", success: true },
            { action: "Sent SMS batch to 50 debtors", time: "5m ago", success: true },
            { action: "Email delivery failed for 2 cases", time: "10m ago", success: false },
            { action: "Updated SMS template", time: "15m ago", success: true },
        ],
    },
];

export default function AgentsPage() {
    const { theme } = useTheme();
    const [agents, setAgents] = useState(initialAgents);
    const [selectedAgent, setSelectedAgent] = useState(agents[0]);
    const [activeTab, setActiveTab] = useState<'metrics' | 'activity'>('metrics');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const toggleAgentStatus = (agentId: string) => {
        setAgents(prev => prev.map(agent => {
            if (agent.id === agentId) {
                const newStatus = agent.status === "ACTIVE" ? "IDLE" : "ACTIVE";
                const updatedAgent = { ...agent, status: newStatus };
                if (selectedAgent.id === agentId) {
                    setSelectedAgent(updatedAgent);
                }
                return updatedAgent;
            }
            return agent;
        }));
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

    const activeAgentsCount = agents.filter(a => a.status === "ACTIVE").length;

    return (
        <div style={{ minHeight: '100vh', background: bgColor }}>
            <Header title="AI Agents" subtitle="Monitor and configure your AI agent fleet" />

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Overall Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {[
                        { icon: Activity, label: "Agents Online", value: `${activeAgentsCount}/${agents.length}`, color: "#22c55e" },
                        { icon: CheckCircle, label: "Tasks Today", value: agents.reduce((sum, a) => sum + a.tasksToday, 0).toString(), color: "#3b82f6" },
                        { icon: TrendingUp, label: "Avg Accuracy", value: `${(agents.reduce((sum, a) => sum + a.accuracy, 0) / agents.length).toFixed(1)}%`, color: "#a855f7" },
                        { icon: Clock, label: "Avg Response", value: `${Math.round(agents.reduce((sum, a) => sum + a.avgResponseTime, 0) / agents.length)}ms`, color: "#f59e0b" },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -2 }}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: cardBg,
                                backdropFilter: 'blur(12px)',
                                border: `1px solid ${borderColor}`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <stat.icon style={{ width: '20px', height: '20px', color: stat.color }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '20px', fontWeight: 700, color: textColor }}>{stat.value}</p>
                                    <p style={{ fontSize: '12px', color: mutedColor }}>{stat.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                    {/* Agent List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 600, color: textColor }}>Agent Fleet</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                style={{ gap: '6px' }}
                            >
                                {isRefreshing ? (
                                    <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <RefreshCw style={{ width: '14px', height: '14px' }} />
                                )}
                            </Button>
                        </div>
                        {agents.map((agent, index) => {
                            const Icon = agent.icon;
                            return (
                                <motion.div
                                    key={agent.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedAgent(agent)}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        background: cardBg,
                                        backdropFilter: 'blur(12px)',
                                        border: selectedAgent.id === agent.id ? '2px solid #3b82f6' : `1px solid ${borderColor}`,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: agent.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon style={{ width: '22px', height: '22px', color: 'white' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <p style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>{agent.name}</p>
                                                <Badge variant={agent.status === "ACTIVE" ? "success" : "outline"} style={{ fontSize: '10px' }}>
                                                    {agent.status}
                                                </Badge>
                                            </div>
                                            <p style={{ fontSize: '12px', color: mutedColor }}>{agent.tasksToday} tasks today</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>{agent.accuracy}%</p>
                                            <p style={{ fontSize: '11px', color: mutedColor }}>accuracy</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Agent Details */}
                    <div style={{ padding: '24px', borderRadius: '16px', background: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${borderColor}` }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: selectedAgent.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <selectedAgent.icon style={{ width: '28px', height: '28px', color: 'white' }} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: textColor, marginBottom: '4px' }}>{selectedAgent.name}</h2>
                                    <p style={{ fontSize: '13px', color: mutedColor }}>{selectedAgent.description}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button
                                    variant={selectedAgent.status === "ACTIVE" ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => toggleAgentStatus(selectedAgent.id)}
                                    style={{ gap: '8px' }}
                                >
                                    {selectedAgent.status === "ACTIVE" ? (
                                        <><Pause style={{ width: '14px', height: '14px' }} /> Pause</>
                                    ) : (
                                        <><Play style={{ width: '14px', height: '14px' }} /> Start</>
                                    )}
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Settings style={{ width: '14px', height: '14px' }} />
                                </Button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                            {(['metrics', 'activity'] as const).map((tab) => (
                                <motion.button
                                    key={tab}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: activeTab === tab ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))' : 'transparent',
                                        color: activeTab === tab ? '#60a5fa' : mutedColor,
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {tab}
                                </motion.button>
                            ))}
                        </div>

                        {/* Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'metrics' && (
                                <motion.div
                                    key="metrics"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                                        {[
                                            { label: "Uptime", value: selectedAgent.uptime, color: "#22c55e" },
                                            { label: "Tasks Today", value: selectedAgent.tasksToday.toString() },
                                            { label: "Total Tasks", value: selectedAgent.tasksTotal.toLocaleString() },
                                            { label: "Avg Response", value: `${selectedAgent.avgResponseTime}ms` },
                                        ].map((metric, i) => (
                                            <div key={i} style={{ padding: '16px', borderRadius: '10px', background: inputBg }}>
                                                <p style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>{metric.label}</p>
                                                <p style={{ fontSize: '20px', fontWeight: 700, color: metric.color || textColor }}>{metric.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '13px', color: mutedColor }}>Accuracy</span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>{selectedAgent.accuracy}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: inputBg, borderRadius: '4px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${selectedAgent.accuracy}%` }}
                                                transition={{ duration: 1 }}
                                                style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #a855f7)', borderRadius: '4px' }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'activity' && (
                                <motion.div
                                    key="activity"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                                >
                                    {selectedAgent.recentActions.map((action, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: inputBg }}
                                        >
                                            {action.success ? (
                                                <CheckCircle style={{ width: '16px', height: '16px', color: '#22c55e', flexShrink: 0 }} />
                                            ) : (
                                                <XCircle style={{ width: '16px', height: '16px', color: '#ef4444', flexShrink: 0 }} />
                                            )}
                                            <span style={{ flex: 1, fontSize: '13px', color: textColor }}>{action.action}</span>
                                            <span style={{ fontSize: '11px', color: mutedColor }}>{action.time}</span>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
