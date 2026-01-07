"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Search,
    Filter,
    Phone,
    Mail,
    MessageSquare,
    Eye,
    X,
    Check,
    Download,
    RefreshCw,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getStatusColor, getPriorityColor } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { api } from "@/lib/supabase";



export default function CasesPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPriority, setSelectedPriority] = useState("all");
    const [showNewCaseModal, setShowNewCaseModal] = useState(false);
    const [showCaseDetails, setShowCaseDetails] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Fetch cases from API
    const fetchCases = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await api.get<{ data: any[] }>('/cases?limit=100');
            const mappedCases = (result?.data || []).map((c: any) => ({
                id: c.case_number,
                debtor: {
                    name: c.debtor_name || 'Unknown',
                    email: c.debtor_email || '',
                    phone: c.debtor_phone || ''
                },
                amount: c.amount,
                originalAmount: c.original_amount,
                status: c.status,
                priority: c.priority,
                recoveryProb: Math.round((c.recovery_probability || 0) * 100),
                dueDate: c.due_date,
                daysPastDue: c.days_past_due || 0,
                lastContact: c.updated_at,
                assignedAgent: c.assigned_agent_id || null,
            }));
            setCases(mappedCases);
        } catch (err) {
            console.error('Failed to fetch cases:', err);
            setError('Failed to load cases');
            // Fallback to empty array
            setCases([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
    }, []);

    const statusCounts = {
        all: cases.length,
        OPEN: cases.filter((c) => c.status === "OPEN").length,
        IN_PROGRESS: cases.filter((c) => c.status === "IN_PROGRESS").length,
        ESCALATED: cases.filter((c) => c.status === "ESCALATED").length,
        SETTLED: cases.filter((c) => c.status === "SETTLED").length,
    };

    const filteredCases = cases.filter((caseItem) => {
        const matchesSearch =
            caseItem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            caseItem.debtor.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            selectedStatus === "all" || caseItem.status === selectedStatus;
        const matchesPriority =
            selectedPriority === "all" || caseItem.priority === selectedPriority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const selectedCase = cases.find(c => c.id === showCaseDetails);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchCases();
        setIsRefreshing(false);
    };

    const handleExport = () => {
        const csvContent = [
            ["Case ID", "Debtor", "Amount", "Status", "Priority", "Recovery %"],
            ...filteredCases.map(c => [c.id, c.debtor.name, c.amount, c.status, c.priority, c.recoveryProb])
        ].map(row => row.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cases-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleCall = (phone: string) => {
        window.open(`tel:${phone.replace(/\s/g, '')}`, '_blank');
    };

    const handleEmail = (email: string) => {
        window.open(`mailto:${email}`, '_blank');
    };

    const handleSMS = (phone: string) => {
        window.open(`sms:${phone.replace(/\s/g, '')}`, '_blank');
    };

    const bgColor = theme === "light" ? "#f8fafc" : "transparent";
    const cardBg = theme === "light" ? "rgba(255, 255, 255, 0.8)" : "rgba(15, 23, 42, 0.6)";
    const borderColor = theme === "light" ? "rgba(148, 163, 184, 0.3)" : "rgba(51, 65, 85, 0.5)";
    const textColor = theme === "light" ? "#1e293b" : "#f1f5f9";
    const mutedColor = theme === "light" ? "#64748b" : "#94a3b8";
    const inputBg = theme === "light" ? "rgba(241, 245, 249, 0.8)" : "rgba(30, 41, 59, 0.5)";

    return (
        <div style={{ minHeight: '100vh', background: bgColor }}>
            <Header title="Case Management" subtitle="Track and manage all debt collection cases" />

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Stats Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <motion.div
                            key={status}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedStatus(status)}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: cardBg,
                                backdropFilter: 'blur(12px)',
                                border: selectedStatus === status ? '2px solid #3b82f6' : `1px solid ${borderColor}`,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <p style={{ fontSize: '24px', fontWeight: 700, color: textColor }}>{count}</p>
                            <p style={{ fontSize: '12px', color: mutedColor, textTransform: 'capitalize' }}>
                                {status === "all" ? "All Cases" : status.replace("_", " ")}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <div
                    style={{
                        padding: '16px',
                        borderRadius: '12px',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        background: cardBg,
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${borderColor}`
                    }}
                >
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: mutedColor }} />
                        <input
                            placeholder="Search by case ID or debtor name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                height: '40px',
                                paddingLeft: '40px',
                                paddingRight: '12px',
                                borderRadius: '10px',
                                border: `1px solid ${borderColor}`,
                                background: inputBg,
                                color: textColor,
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        style={{
                            height: '40px',
                            padding: '0 12px',
                            borderRadius: '10px',
                            border: `1px solid ${borderColor}`,
                            background: inputBg,
                            color: textColor,
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ gap: '8px' }}
                    >
                        <Filter style={{ width: '16px', height: '16px' }} />
                        More Filters
                    </Button>
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
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        style={{ gap: '8px' }}
                    >
                        <Download style={{ width: '16px', height: '16px' }} />
                        Export
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setShowNewCaseModal(true)}
                        style={{ gap: '8px' }}
                    >
                        <Plus style={{ width: '16px', height: '16px' }} />
                        New Case
                    </Button>
                </div>

                {/* Cases List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredCases.map((caseItem, index) => (
                        <motion.div
                            key={caseItem.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -2 }}
                            style={{
                                padding: '20px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                background: cardBg,
                                backdropFilter: 'blur(12px)',
                                border: `1px solid ${borderColor}`,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                {/* Case Info */}
                                <div style={{ flex: 1, minWidth: 0 }} onClick={() => setShowCaseDetails(caseItem.id)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <span style={{ fontFamily: 'monospace', color: '#60a5fa', fontSize: '14px' }}>{caseItem.id}</span>
                                        <Badge className={getStatusColor(caseItem.status)}>
                                            {caseItem.status.replace("_", " ")}
                                        </Badge>
                                        <Badge className={getPriorityColor(caseItem.priority)}>
                                            {caseItem.priority}
                                        </Badge>
                                    </div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: textColor, marginBottom: '12px' }}>
                                        {caseItem.debtor.name}
                                    </h3>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                        <div>
                                            <p style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>Outstanding</p>
                                            <p style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>
                                                {formatCurrency(caseItem.amount)}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>Original Amount</p>
                                            <p style={{ fontSize: '14px', fontWeight: 500, color: mutedColor }}>
                                                {formatCurrency(caseItem.originalAmount)}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>Days Past Due</p>
                                            <p style={{
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                color: caseItem.daysPastDue > 60 ? '#f87171' : caseItem.daysPastDue > 30 ? '#fbbf24' : textColor
                                            }}>
                                                {caseItem.daysPastDue} days
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>Assigned Agent</p>
                                            <p style={{ fontSize: '14px', fontWeight: 500, color: mutedColor }}>
                                                {caseItem.assignedAgent || "Unassigned"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recovery Probability */}
                                <div style={{ width: '100px', textAlign: 'center' }}>
                                    <div style={{ position: 'relative', width: '70px', height: '70px', margin: '0 auto 8px' }}>
                                        <svg style={{ width: '70px', height: '70px', transform: 'rotate(-90deg)' }}>
                                            <circle cx="35" cy="35" r="30" fill="none" stroke={theme === 'light' ? '#e2e8f0' : '#1e293b'} strokeWidth="6" />
                                            <circle
                                                cx="35" cy="35" r="30" fill="none" stroke="url(#gradient)" strokeWidth="6"
                                                strokeDasharray={`${2 * Math.PI * 30}`}
                                                strokeDashoffset={`${2 * Math.PI * 30 * (1 - caseItem.recoveryProb / 100)}`}
                                                strokeLinecap="round"
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#3b82f6" />
                                                    <stop offset="100%" stopColor="#a855f7" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: textColor }}>
                                            {caseItem.recoveryProb}%
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '11px', color: mutedColor }}>Recovery Probability</p>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleCall(caseItem.debtor.phone)}
                                        title="Call"
                                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: inputBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Phone style={{ width: '14px', height: '14px', color: '#22c55e' }} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleEmail(caseItem.debtor.email)}
                                        title="Email"
                                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: inputBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Mail style={{ width: '14px', height: '14px', color: '#3b82f6' }} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleSMS(caseItem.debtor.phone)}
                                        title="SMS"
                                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: inputBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <MessageSquare style={{ width: '14px', height: '14px', color: '#a855f7' }} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowCaseDetails(caseItem.id)}
                                        title="View Details"
                                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: inputBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Eye style={{ width: '14px', height: '14px', color: mutedColor }} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredCases.length === 0 && (
                    <div style={{ padding: '48px', borderRadius: '12px', textAlign: 'center', background: cardBg, border: `1px solid ${borderColor}` }}>
                        <p style={{ color: mutedColor }}>No cases found matching your filters.</p>
                        <Button
                            variant="outline"
                            style={{ marginTop: '16px' }}
                            onClick={() => { setSearchQuery(""); setSelectedStatus("all"); setSelectedPriority("all"); }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* New Case Modal */}
            <AnimatePresence>
                {showNewCaseModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowNewCaseModal(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', zIndex: 100 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{
                                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                width: '100%', maxWidth: '500px', borderRadius: '16px', zIndex: 101, overflow: 'hidden',
                                background: theme === 'light' ? '#f8fafc' : '#0f172a', border: `1px solid ${borderColor}`
                            }}
                        >
                            <div style={{ padding: '20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 600, color: textColor }}>Create New Case</h2>
                                <button onClick={() => setShowNewCaseModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                    <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '8px' }}>Email</label>
                                    <input type="email" placeholder="debtor@email.com" style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '8px' }}>Phone</label>
                                    <input type="tel" placeholder="+91 98765 43210" style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ padding: '16px 20px', borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <Button variant="outline" onClick={() => setShowNewCaseModal(false)}>Cancel</Button>
                                <Button onClick={() => { alert('Case created successfully!'); setShowNewCaseModal(false); }}>
                                    <Check style={{ width: '16px', height: '16px' }} />
                                    Create Case
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Case Details Modal */}
            <AnimatePresence>
                {showCaseDetails && selectedCase && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowCaseDetails(null)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', zIndex: 100 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            style={{
                                position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '500px',
                                background: theme === 'light' ? '#f8fafc' : '#0f172a', zIndex: 101, overflow: 'auto',
                                borderLeft: `1px solid ${borderColor}`
                            }}
                        >
                            <div style={{ padding: '20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 600, color: textColor }}>Case Details</h2>
                                <button onClick={() => setShowCaseDetails(null)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X style={{ width: '18px', height: '18px', color: mutedColor }} />
                                </button>
                            </div>
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Badge className={getStatusColor(selectedCase.status)}>{selectedCase.status.replace('_', ' ')}</Badge>
                                    <Badge className={getPriorityColor(selectedCase.priority)}>{selectedCase.priority}</Badge>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>Case ID</p>
                                    <p style={{ fontSize: '16px', fontWeight: 600, color: textColor, fontFamily: 'monospace' }}>{selectedCase.id}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>Debtor</p>
                                    <p style={{ fontSize: '16px', fontWeight: 600, color: textColor }}>{selectedCase.debtor.name}</p>
                                    <p style={{ fontSize: '14px', color: mutedColor }}>{selectedCase.debtor.email}</p>
                                    <p style={{ fontSize: '14px', color: mutedColor }}>{selectedCase.debtor.phone}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div><p style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>Outstanding</p><p style={{ fontSize: '18px', fontWeight: 700, color: textColor }}>{formatCurrency(selectedCase.amount)}</p></div>
                                    <div><p style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>Original</p><p style={{ fontSize: '18px', fontWeight: 500, color: mutedColor }}>{formatCurrency(selectedCase.originalAmount)}</p></div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Button onClick={() => handleCall(selectedCase.debtor.phone)} style={{ flex: 1, gap: '8px' }}>
                                        <Phone style={{ width: '16px', height: '16px' }} /> Call
                                    </Button>
                                    <Button variant="outline" onClick={() => handleEmail(selectedCase.debtor.email)} style={{ flex: 1, gap: '8px' }}>
                                        <Mail style={{ width: '16px', height: '16px' }} /> Email
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
