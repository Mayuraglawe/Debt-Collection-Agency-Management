"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Moon, Sun, X, User, LogOut, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";


interface HeaderProps {
    title: string;
    subtitle?: string;
}

const notifications = [
    { id: 1, title: "Case #1234 Escalated", message: "Recovery probability dropped below 30%", time: "2m ago", read: false },
    { id: 2, title: "Payment Received", message: "₹50,000 received for Case #1235", time: "15m ago", read: false },
    { id: 3, title: "Agent Alert", message: "RPA Agent completed batch processing", time: "1h ago", read: true },
];

export function Header({ title, subtitle }: HeaderProps) {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [notificationList, setNotificationList] = useState(notifications);
    const { theme, toggleTheme } = useTheme();
    const userMenuRef = useRef<HTMLDivElement>(null);

    const unreadCount = notificationList.filter(n => !n.read).length;

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
            case 'MANAGER': return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' };
            case 'AGENT': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' };
            default: return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' };
        }
    };

    const markAsRead = (id: number) => {
        setNotificationList(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotificationList(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/cases?search=${encodeURIComponent(searchQuery)}`;
            setSearchQuery("");
            setShowSearch(false);
        }
    };

    const bgColor = theme === "light" ? "rgba(241, 245, 249, 0.95)" : "rgba(15, 23, 42, 0.95)";
    const borderColor = theme === "light" ? "rgba(148, 163, 184, 0.3)" : "rgba(51, 65, 85, 0.5)";
    const textColor = theme === "light" ? "#1e293b" : "#f1f5f9";
    const mutedColor = theme === "light" ? "#64748b" : "#94a3b8";
    const inputBg = theme === "light" ? "rgba(226, 232, 240, 0.8)" : "rgba(30, 41, 59, 0.8)";



    return (
        <header
            className={`h-16 flex items-center justify-between px-6 relative z-50 backdrop-blur-xl border-b ${
                theme === "light" ? "bg-slate-100/95 border-slate-400/30" : "bg-slate-900/95 border-slate-600/50"
            }`}
        >
            <div>
                <h1 className={`text-xl font-semibold mb-0.5 ${
                    theme === "light" ? "text-slate-800" : "text-slate-100"
                }`}>
                    {title}
                </h1>
                {subtitle && (
                    <p className={`text-xs ${
                        theme === "light" ? "text-slate-600" : "text-slate-400"
                    }`}>{subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-2">
                {/* Search */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.form
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 240, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            onSubmit={handleSearch}
                            className="relative overflow-hidden"
                        >
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search cases, debtors..."
                                className={`w-full h-9 pl-3 pr-9 rounded-xl border border-blue-500/50 text-xs outline-none ${
                                    theme === "light" 
                                        ? "bg-slate-200/80 text-slate-800" 
                                        : "bg-slate-800/80 text-slate-100"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1"
                                title="Close search"
                            >
                                <X style={{ width: '14px', height: '14px', color: mutedColor }} />
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Search Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSearch(!showSearch)}
                    className={`w-9 h-9 rounded-xl border-none cursor-pointer flex items-center justify-center transition-all ${
                        showSearch ? 'bg-blue-500/20' : 'bg-transparent'
                    }`}
                    title="Search"
                >
                    <Search style={{ width: '18px', height: '18px', color: showSearch ? '#60a5fa' : mutedColor }} />
                </motion.button>

                {/* Notifications */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`w-9 h-9 rounded-xl border-none cursor-pointer flex items-center justify-center relative transition-all ${
                            showNotifications ? 'bg-blue-500/20' : 'bg-transparent'
                        }`}
                        title="Notifications"
                    >
                        <Bell style={{ width: '18px', height: '18px', color: showNotifications ? '#60a5fa' : mutedColor }} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </motion.button>

                    {/* Notifications Dropdown */}
                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="fixed top-18 right-6 w-80 rounded-xl overflow-hidden z-[9999] border shadow-2xl"
                                style={{
                                    background: theme === 'light' ? '#ffffff' : '#0f172a',
                                    borderColor: borderColor
                                }}
                            >
                                <div className={`p-4 border-b flex justify-between items-center ${
                                    theme === "light" ? "border-slate-400/30" : "border-slate-600/50"
                                }`}>
                                    <h3 className={`text-sm font-semibold ${
                                        theme === "light" ? "text-slate-800" : "text-slate-100"
                                    }`}>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-blue-400 bg-transparent border-none cursor-pointer"
                                            title="Mark all as read"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-75 overflow-auto">
                                    {notificationList.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            className={`p-3 px-4 border-b cursor-pointer transition-all ${
                                                notification.read 
                                                    ? 'bg-transparent' 
                                                    : 'bg-blue-500/5'
                                            } ${
                                                theme === 'light' ? 'border-slate-400/20' : 'border-slate-600/30'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs font-medium ${
                                                    theme === "light" ? "text-slate-800" : "text-slate-100"
                                                }`}>{notification.title}</span>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className={`text-xs mb-1 ${
                                                theme === "light" ? "text-slate-600" : "text-slate-400"
                                            }`}>{notification.message}</p>
                                            <p className={`text-xs ${
                                                theme === 'light' ? 'text-slate-500' : 'text-slate-500'
                                            }`}>{notification.time}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className={`p-3 border-t text-center ${
                                    theme === "light" ? "border-slate-400/30" : "border-slate-600/50"
                                }`}>
                                    <button
                                        onClick={() => { setShowNotifications(false); window.location.href = '/settings'; }}
                                        className="text-xs text-blue-400 bg-transparent border-none cursor-pointer"
                                        title="View all notifications"
                                    >
                                        View all notifications
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Theme Toggle */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-xl border-none bg-transparent cursor-pointer flex items-center justify-center transition-all"
                    title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    <motion.div
                        initial={false}
                        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                    >
                        {theme === 'dark' ? (
                            <Moon style={{ width: '18px', height: '18px', color: mutedColor }} />
                        ) : (
                            <Sun style={{ width: '18px', height: '18px', color: '#fbbf24' }} />
                        )}
                    </motion.div>
                </motion.button>

                {/* User Menu */}
                {user && (
                    <div className="relative" ref={userMenuRef}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className={`flex items-center gap-2.5 p-1.5 px-3 rounded-xl border cursor-pointer transition-all ${
                                showUserMenu ? '' : ''
                            }`}
                            style={{
                                borderColor: borderColor,
                                background: showUserMenu ? inputBg : 'transparent'
                            }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <User style={{ width: '16px', height: '16px', color: 'white' }} />
                            </div>
                            <div className="text-left">
                                <p className={`text-xs font-medium m-0 ${
                                    theme === "light" ? "text-slate-800" : "text-slate-100"
                                }`}>
                                    {user.full_name || user.email?.split('@')[0] || 'User'}
                                </p>
                                <span 
                                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                        user.role === 'ADMIN' ? 'role-badge-admin' :
                                        user.role === 'MANAGER' ? 'role-badge-manager' :
                                        user.role === 'COMPLIANCE_OFFICER' ? 'role-badge-compliance' :
                                        user.role === 'VIEWER' ? 'role-badge-viewer' :
                                        'role-badge-agent'
                                    }`}
                                >
                                    {user.role || 'AGENT'}
                                </span>
                            </div>
                        </motion.button>

                        {/* User Dropdown Menu */}
                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-2 w-50 rounded-xl overflow-hidden z-[9999] border shadow-2xl"
                                    style={{
                                        background: theme === 'light' ? '#ffffff' : '#1e293b',
                                        borderColor: borderColor
                                    }}
                                >
                                    <div className={`p-3 px-4 border-b ${
                                        theme === 'light' ? 'border-slate-400/30' : 'border-slate-600/50'
                                    }`}>
                                        <p className={`text-sm font-medium m-0 ${
                                            theme === 'light' ? 'text-slate-800' : 'text-slate-100'
                                        }`}>
                                            {user.full_name || 'User'}
                                        </p>
                                        <p className={`text-xs mt-0.5 mb-0 ${
                                            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                                        }`}>
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => { setShowUserMenu(false); router.push('/settings'); }}
                                            className={`w-full flex items-center gap-2.5 p-2.5 px-3 rounded-lg border-none bg-transparent cursor-pointer text-sm transition-colors hover:bg-slate-700/50 ${
                                                theme === 'light' ? 'text-slate-800 hover:bg-slate-200/50' : 'text-slate-100'
                                            }`}
                                        >
                                            <Settings className={`w-4 h-4 ${
                                                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                                            }`} />
                                            Settings
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-2.5 p-2.5 px-3 rounded-lg border-none bg-transparent cursor-pointer text-red-400 text-sm transition-colors hover:bg-red-500/10"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>


            {/* Click outside to close notifications */}
            {showNotifications && (
                <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setShowNotifications(false)}
                />
            )}
        </header>
    );
}
