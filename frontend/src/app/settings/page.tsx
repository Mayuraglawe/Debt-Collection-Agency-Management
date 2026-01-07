"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Bell,
    Shield,
    Palette,
    Database,
    Key,
    Mail,
    Phone,
    Globe,
    Save,
    Moon,
    Sun,
    Monitor,
    Check,
    Loader2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme-context";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'appearance' | 'integrations'>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        sms: true,
        push: false,
        weekly: false,
    });

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        alert('Settings saved successfully!');
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'integrations', label: 'Integrations', icon: Database },
    ] as const;

    const bgColor = theme === "light" ? "#f8fafc" : "transparent";
    const cardBg = theme === "light" ? "rgba(255, 255, 255, 0.8)" : "rgba(15, 23, 42, 0.6)";
    const borderColor = theme === "light" ? "rgba(148, 163, 184, 0.3)" : "rgba(51, 65, 85, 0.5)";
    const textColor = theme === "light" ? "#1e293b" : "#f1f5f9";
    const mutedColor = theme === "light" ? "#64748b" : "#94a3b8";
    const inputBg = theme === "light" ? "rgba(241, 245, 249, 0.8)" : "rgba(30, 41, 59, 0.5)";

    return (
        <div style={{ minHeight: '100vh', background: bgColor }}>
            <Header title="Settings" subtitle="Configure your platform preferences" />

            <div style={{ padding: '24px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))' : 'transparent',
                                color: activeTab === tab.id ? '#60a5fa' : mutedColor,
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <tab.icon style={{ width: '16px', height: '16px' }} />
                            {tab.label}
                        </motion.button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            padding: '24px',
                            borderRadius: '16px',
                            background: cardBg,
                            backdropFilter: 'blur(12px)',
                            border: `1px solid ${borderColor}`
                        }}
                    >
                        {activeTab === 'profile' && (
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: textColor, marginBottom: '8px' }}>Profile Information</h3>
                                <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '24px' }}>Update your account details and preferences</p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        fontWeight: 700,
                                        color: 'white'
                                    }}>
                                        AD
                                    </div>
                                    <div>
                                        <Button variant="outline" size="sm">Change Avatar</Button>
                                        <p style={{ fontSize: '11px', color: mutedColor, marginTop: '8px' }}>JPG, PNG or GIF. Max 2MB.</p>
                                    </div>
                                </div>

                                <div style={{ height: '1px', background: borderColor, margin: '24px 0' }} />

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
                                    {[
                                        { label: 'Full Name', value: 'Admin User', type: 'text' },
                                        { label: 'Email', value: 'admin@atlas-dca.com', type: 'email' },
                                        { label: 'Phone', value: '+91 98765 43210', type: 'tel' },
                                        { label: 'Role', value: 'System Administrator', disabled: true },
                                    ].map((field, i) => (
                                        <div key={i}>
                                            <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '8px' }}>{field.label}</label>
                                            <input
                                                type={field.type || 'text'}
                                                defaultValue={field.value}
                                                disabled={field.disabled}
                                                style={{
                                                    width: '100%',
                                                    height: '40px',
                                                    padding: '0 12px',
                                                    borderRadius: '10px',
                                                    border: `1px solid ${borderColor}`,
                                                    background: field.disabled ? borderColor : inputBg,
                                                    color: textColor,
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button onClick={handleSave} disabled={isSaving} style={{ gap: '8px' }}>
                                        {isSaving ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '16px', height: '16px' }} />}
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: textColor, marginBottom: '8px' }}>Notification Preferences</h3>
                                <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '24px' }}>Choose how you want to be notified</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { key: 'email', icon: Mail, title: "Email Notifications", description: "Receive email updates about case activity" },
                                        { key: 'sms', icon: Phone, title: "SMS Alerts", description: "Get SMS for critical escalations" },
                                        { key: 'push', icon: Bell, title: "Push Notifications", description: "Browser push notifications for real-time updates" },
                                        { key: 'weekly', icon: Globe, title: "Weekly Reports", description: "Receive weekly performance summary" },
                                    ].map((item) => (
                                        <motion.div
                                            key={item.key}
                                            whileHover={{ x: 4 }}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: inputBg }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <item.icon style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '14px', fontWeight: 500, color: textColor }}>{item.title}</p>
                                                    <p style={{ fontSize: '12px', color: mutedColor }}>{item.description}</p>
                                                </div>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                                                style={{
                                                    width: '44px',
                                                    height: '24px',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    background: notifications[item.key as keyof typeof notifications] ? '#3b82f6' : borderColor,
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <motion.div
                                                    animate={{ x: notifications[item.key as keyof typeof notifications] ? 20 : 2 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '2px',
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '10px',
                                                        background: 'white'
                                                    }}
                                                />
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: textColor, marginBottom: '8px' }}>Security Settings</h3>
                                <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '24px' }}>Manage your account security</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '8px' }}>Current Password</label>
                                        <input type="password" placeholder="Enter current password" style={{ width: '100%', maxWidth: '400px', height: '40px', padding: '0 12px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '800px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '8px' }}>New Password</label>
                                            <input type="password" placeholder="Enter new password" style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: mutedColor, marginBottom: '8px' }}>Confirm Password</label>
                                            <input type="password" placeholder="Confirm new password" style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none' }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ height: '1px', background: borderColor, margin: '24px 0' }} />

                                <motion.div whileHover={{ x: 4 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: inputBg, marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Key style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: 500, color: textColor }}>Two-Factor Authentication</p>
                                            <p style={{ fontSize: '12px', color: mutedColor }}>Add an extra layer of security</p>
                                        </div>
                                    </div>
                                    <Badge variant="success">Enabled</Badge>
                                </motion.div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: textColor, marginBottom: '8px' }}>Appearance</h3>
                                <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '24px' }}>Customize the look and feel</p>

                                <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '16px' }}>Theme</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '450px' }}>
                                    {[
                                        { id: 'light', label: 'Light', icon: Sun, color: '#fbbf24' },
                                        { id: 'dark', label: 'Dark', icon: Moon, color: '#a855f7' },
                                        { id: 'system', label: 'System', icon: Monitor, color: '#3b82f6' },
                                    ].map((t) => (
                                        <motion.button
                                            key={t.id}
                                            whileHover={{ y: -4 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                if (t.id === 'system') {
                                                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                                    setTheme(prefersDark ? 'dark' : 'light');
                                                } else {
                                                    setTheme(t.id as 'dark' | 'light');
                                                }
                                            }}
                                            style={{
                                                padding: '24px 20px',
                                                borderRadius: '12px',
                                                border: theme === t.id || (t.id === 'system' && false) ? '2px solid #3b82f6' : `1px solid ${borderColor}`,
                                                background: theme === t.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.2s ease',
                                                position: 'relative'
                                            }}
                                        >
                                            {theme === t.id && (
                                                <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Check style={{ width: '12px', height: '12px', color: 'white' }} />
                                                </div>
                                            )}
                                            <t.icon style={{ width: '28px', height: '28px', color: t.color, margin: '0 auto 12px' }} />
                                            <p style={{ fontSize: '14px', fontWeight: 500, color: textColor }}>{t.label}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'integrations' && (
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: textColor, marginBottom: '8px' }}>API & Integrations</h3>
                                <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '24px' }}>Connect external services and view API keys</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { name: "Backend API", status: "connected", endpoint: "http://localhost:5000" },
                                        { name: "ML Service", status: "connected", endpoint: "http://localhost:8000" },
                                        { name: "SendGrid (Email)", status: "connected", endpoint: "api.sendgrid.com" },
                                        { name: "Twilio (SMS)", status: "pending", endpoint: "Not configured" },
                                    ].map((service, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ x: 4 }}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: inputBg }}
                                        >
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 500, color: textColor }}>{service.name}</p>
                                                <p style={{ fontSize: '12px', color: mutedColor }}>{service.endpoint}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Badge variant={service.status === "connected" ? "success" : "warning"}>
                                                    {service.status}
                                                </Badge>
                                                <Button variant="outline" size="sm">
                                                    {service.status === "connected" ? "Configure" : "Connect"}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
