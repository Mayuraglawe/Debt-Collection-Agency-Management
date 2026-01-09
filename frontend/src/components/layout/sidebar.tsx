"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Briefcase,
    Bot,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    HelpCircle,
    Upload,
    GitBranch,
    Users,
    FileText,
    UserPlus,
    Shield,
    ListChecks,
    Phone,
    CreditCard,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";

// Role-based navigation items
const getNavItems = (role?: string) => {
    if (role === 'ADMIN') {
        return [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Upload, label: "Data Ingestion", href: "/admin/data-ingestion" },
            { icon: Settings, label: "Allocation Rules", href: "/admin/allocation-rules" },
            { icon: GitBranch, label: "Case Allocation", href: "/admin/case-allocation" },
            { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
            { icon: Users, label: "User Management", href: "/admin/users" },
            { icon: FileText, label: "SOP & Rules", href: "/admin/sop-rules" },
            { icon: Settings, label: "System Config", href: "/admin/system-config" },
        ];
    }

    if (role === 'MANAGER') {
        return [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Briefcase, label: "My Cases", href: "/manager/cases" },
            { icon: UserPlus, label: "Assign Cases", href: "/manager/assign-cases" },
            { icon: Users, label: "Team Performance", href: "/manager/team-dashboard" },
            { icon: Shield, label: "Audit & Compliance", href: "/manager/audit" },
        ];
    }

    // AGENT navigation
    if (role === 'AGENT') {
        return [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: ListChecks, label: "My Worklist", href: "/agent/worklist" },
            { icon: Phone, label: "Take Action", href: "/agent/actions" },
            { icon: CreditCard, label: "Process Payment", href: "/agent/payment" },
        ];
    }

    // COMPLIANCE_OFFICER navigation
    if (role === 'COMPLIANCE_OFFICER') {
        return [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Shield, label: "Compliance Dashboard", href: "/compliance/dashboard" },
            { icon: FileText, label: "Reports", href: "/compliance/reports" },
            { icon: Shield, label: "Audit Trail", href: "/manager/audit" },
        ];
    }

    // Default/VIEWER role
    return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: Briefcase, label: "Cases", href: "/cases" },
        { icon: BarChart3, label: "Analytics", href: "/analytics" },
    ];
};

const bottomNavItems = [
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: HelpCircle, label: "Help", href: "/help" },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { theme } = useTheme();

    const sidebarWidth = collapsed ? 80 : 260;

    const handleLogout = () => {
        // Clear any stored auth tokens
        localStorage.removeItem("atlas-auth-token");
        localStorage.removeItem("atlas-user");

        // Redirect to landing page
        router.push("/");
    };

    const bgColor = theme === "light" ? "rgba(241, 245, 249, 0.95)" : "rgba(15, 23, 42, 0.95)";
    const borderColor = theme === "light" ? "rgba(148, 163, 184, 0.3)" : "rgba(51, 65, 85, 0.5)";
    const textColor = theme === "light" ? "#1e293b" : "#f1f5f9";
    const mutedColor = theme === "light" ? "#64748b" : "#94a3b8";

    return (
        <>
            <motion.aside
                initial={false}
                animate={{ width: sidebarWidth }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    height: '100vh',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    background: bgColor,
                    backdropFilter: 'blur(12px)',
                    borderRight: `1px solid ${borderColor}`
                }}
            >
                {/* Logo */}
                <div style={{
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '0' : '0 20px',
                    borderBottom: `1px solid ${borderColor}`
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>A</span>
                    </div>
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                style={{ marginLeft: '12px' }}
                            >
                                <h1 className="gradient-text" style={{ fontWeight: 700, fontSize: '18px', lineHeight: 1.2 }}>
                                    Atlas DCA
                                </h1>
                                <p style={{ fontSize: '11px', color: mutedColor }}>Debt Collection</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {getNavItems(user?.role).map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ x: collapsed ? 0 : 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: collapsed ? '12px' : '12px 16px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        background: isActive
                                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))'
                                            : 'transparent',
                                        border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <item.icon style={{
                                        width: '20px',
                                        height: '20px',
                                        color: isActive ? '#60a5fa' : mutedColor,
                                        flexShrink: 0
                                    }} />
                                    <AnimatePresence mode="wait">
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                style={{
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: isActive ? '#60a5fa' : textColor
                                                }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Divider */}
                <div style={{ height: '1px', background: borderColor, margin: '0 12px' }} />

                {/* Bottom Navigation */}
                <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {bottomNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ x: collapsed ? 0 : 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: collapsed ? '12px' : '12px 16px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        background: isActive
                                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))'
                                            : 'transparent',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <item.icon style={{ width: '20px', height: '20px', color: mutedColor, flexShrink: 0 }} />
                                    <AnimatePresence mode="wait">
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                style={{ fontSize: '14px', color: textColor }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: borderColor, margin: '0 12px' }} />

                {/* User Profile */}
                <div style={{ padding: '16px 12px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: collapsed ? '10px' : '10px 14px',
                        borderRadius: '12px',
                        background: theme === 'light' ? 'rgba(226, 232, 240, 0.5)' : 'rgba(30, 41, 59, 0.5)',
                        justifyContent: collapsed ? 'center' : 'flex-start'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>AD</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{ flex: 1, minWidth: 0 }}
                                >
                                    <p style={{
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: textColor,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Admin User
                                    </p>
                                    <p style={{
                                        fontSize: '11px',
                                        color: mutedColor,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        admin@atlas-dca.com
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {!collapsed && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowLogoutConfirm(true)}
                                title="Logout"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <LogOut style={{ width: '16px', height: '16px', color: mutedColor }} />
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Collapse Toggle */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        position: 'absolute',
                        right: '-12px',
                        top: '72px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: theme === 'light' ? '#e2e8f0' : '#1e293b',
                        border: `1px solid ${borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    {collapsed ? (
                        <ChevronRight style={{ width: '12px', height: '12px', color: mutedColor }} />
                    ) : (
                        <ChevronLeft style={{ width: '12px', height: '12px', color: mutedColor }} />
                    )}
                </motion.button>
            </motion.aside>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogoutConfirm(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0, 0, 0, 0.6)',
                                zIndex: 100
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '100%',
                                maxWidth: '400px',
                                padding: '24px',
                                borderRadius: '16px',
                                background: theme === 'light' ? '#f8fafc' : '#0f172a',
                                border: `1px solid ${borderColor}`,
                                zIndex: 101,
                                textAlign: 'center'
                            }}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <LogOut style={{ width: '28px', height: '28px', color: '#ef4444' }} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                                Confirm Logout
                            </h3>
                            <p style={{ fontSize: '14px', color: mutedColor, marginBottom: '24px' }}>
                                Are you sure you want to logout? You'll need to sign in again to access your dashboard.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: `1px solid ${borderColor}`,
                                        background: 'transparent',
                                        color: textColor,
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: '#ef4444',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
