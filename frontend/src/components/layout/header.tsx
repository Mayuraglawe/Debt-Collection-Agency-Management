"use client";

import { useState } from "react";
import { Bell, Search, Moon, Sun, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme-context";

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
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [notificationList, setNotificationList] = useState(notifications);
    const { theme, toggleTheme } = useTheme();

    const unreadCount = notificationList.filter(n => !n.read).length;

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
            style={{
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                background: bgColor,
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${borderColor}`,
                position: 'relative',
                zIndex: 1000
            }}
        >
            <div>
                <h1 style={{ fontSize: '20px', fontWeight: 600, color: textColor, marginBottom: '2px' }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{ fontSize: '13px', color: mutedColor }}>{subtitle}</p>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Search */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.form
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 240, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            onSubmit={handleSearch}
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search cases, debtors..."
                                style={{
                                    width: '100%',
                                    height: '36px',
                                    paddingLeft: '12px',
                                    paddingRight: '36px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(59, 130, 246, 0.5)',
                                    background: inputBg,
                                    color: textColor,
                                    fontSize: '13px',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
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
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        border: 'none',
                        background: showSearch ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
                    title="Search"
                >
                    <Search style={{ width: '18px', height: '18px', color: showSearch ? '#60a5fa' : mutedColor }} />
                </motion.button>

                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            border: 'none',
                            background: showNotifications ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            transition: 'all 0.2s ease'
                        }}
                        title="Notifications"
                    >
                        <Bell style={{ width: '18px', height: '18px', color: showNotifications ? '#60a5fa' : mutedColor }} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
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
                                style={{
                                    position: 'fixed',
                                    top: '72px',
                                    right: '24px',
                                    width: '320px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    zIndex: 9999,
                                    background: theme === 'light' ? '#ffffff' : '#0f172a',
                                    border: `1px solid ${borderColor}`,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                                }}
                            >
                                <div style={{ padding: '16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            style={{ fontSize: '12px', color: '#60a5fa', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                                    {notificationList.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            style={{
                                                padding: '12px 16px',
                                                borderBottom: `1px solid ${theme === 'light' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(51, 65, 85, 0.3)'}`,
                                                cursor: 'pointer',
                                                background: notification.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 500, color: textColor }}>{notification.title}</span>
                                                {!notification.read && (
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                                                )}
                                            </div>
                                            <p style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>{notification.message}</p>
                                            <p style={{ fontSize: '11px', color: theme === 'light' ? '#94a3b8' : '#64748b' }}>{notification.time}</p>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '12px', borderTop: `1px solid ${borderColor}`, textAlign: 'center' }}>
                                    <button
                                        onClick={() => { setShowNotifications(false); window.location.href = '/settings'; }}
                                        style={{ fontSize: '12px', color: '#60a5fa', background: 'transparent', border: 'none', cursor: 'pointer' }}
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
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
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
            </div>

            {/* Click outside to close notifications */}
            {showNotifications && (
                <div
                    onClick={() => setShowNotifications(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9998
                    }}
                />
            )}
        </header>
    );
}
