"use client";

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Settings, Database, Mail, Bell, Lock, Save, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SystemConfigPage() {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({
        dbBackupEnabled: true,
        dbBackupFrequency: 'daily',
        emailProvider: 'smtp',
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        notificationsEnabled: true,
        smsEnabled: true,
        emailNotifications: true,
        sessionTimeout: '30',
        mfaRequired: false,
        passwordExpiry: '90',
        appName: 'Atlas DCA',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase.from('system_config').select('config_key, config_value');
            if (error) throw error;
            if (data) {
                const cfg: any = { ...config };
                data.forEach((item: any) => {
                    const val = item.config_value;
                    if (item.config_key === 'database') Object.assign(cfg, { dbBackupEnabled: val.dbBackupEnabled, dbBackupFrequency: val.dbBackupFrequency });
                    else if (item.config_key === 'email') Object.assign(cfg, { emailProvider: val.emailProvider, smtpHost: val.smtpHost, smtpPort: val.smtpPort });
                    else if (item.config_key === 'notifications') Object.assign(cfg, { notificationsEnabled: val.notificationsEnabled, smsEnabled: val.smsEnabled, emailNotifications: val.emailNotifications });
                    else if (item.config_key === 'security') Object.assign(cfg, { sessionTimeout: val.sessionTimeout, mfaRequired: val.mfaRequired, passwordExpiry: val.passwordExpiry });
                    else if (item.config_key === 'general') Object.assign(cfg, { appName: val.appName, timezone: val.timezone, dateFormat: val.dateFormat });
                });
                setConfig(cfg);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = [
                { config_key: 'database', config_value: { dbBackupEnabled: config.dbBackupEnabled, dbBackupFrequency: config.dbBackupFrequency } },
                { config_key: 'email', config_value: { emailProvider: config.emailProvider, smtpHost: config.smtpHost, smtpPort: config.smtpPort } },
                { config_key: 'notifications', config_value: { notificationsEnabled: config.notificationsEnabled, smsEnabled: config.smsEnabled, emailNotifications: config.emailNotifications } },
                { config_key: 'security', config_value: { sessionTimeout: config.sessionTimeout, mfaRequired: config.mfaRequired, passwordExpiry: config.passwordExpiry } },
                { config_key: 'general', config_value: { appName: config.appName, timezone: config.timezone, dateFormat: config.dateFormat } }
            ];
            for (const upd of updates) {
                const { error } = await supabase.from('system_config').update({ config_value: upd.config_value, updated_by: user?.id }).eq('config_key', upd.config_key);
                if (error) throw error;
            }
            alert('Configuration saved successfully!');
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Failed to save configuration.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout 
            title="System Configuration"
            description="Manage system settings and preferences"
        >
            <div className="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Settings className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">System Configuration</h1>
                                <p className="text-slate-400">Manage global system settings and integrations</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                            style={{
                                background: saving ? 'rgba(99, 102, 241, 0.5)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)'
                            }}
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Database Settings */}
                    <ConfigSection
                        icon={Database}
                        title="Database Settings"
                        color="#3b82f6"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300">Automated Backups</label>
                                <ToggleSwitch
                                    checked={config.dbBackupEnabled}
                                    onChange={(checked) => setConfig({ ...config, dbBackupEnabled: checked })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Backup Frequency</label>
                                <select
                                    value={config.dbBackupFrequency}
                                    onChange={(e) => setConfig({ ...config, dbBackupFrequency: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-900/60 border border-slate-600/20"
                                    title="Select backup frequency"
                                    aria-label="Select backup frequency"
                                >
                                    <option value="hourly">Hourly</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>
                        </div>
                    </ConfigSection>

                    {/* Email Settings */}
                    <ConfigSection
                        icon={Mail}
                        title="Email Configuration"
                        color="#10b981"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">SMTP Host</label>
                                <input
                                    type="text"
                                    value={config.smtpHost}
                                    onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-slate-900/60 border border-slate-600/20"
                                    placeholder="smtp.gmail.com"
                                    title="Enter SMTP host address"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">SMTP Port</label>
                                <input
                                    type="text"
                                    value={config.smtpPort}
                                    onChange={(e) => setConfig({ ...config, smtpPort: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-slate-900/60 border border-slate-600/20"
                                    placeholder="587"
                                    title="Enter SMTP port number"
                                />
                            </div>
                        </div>
                    </ConfigSection>

                    {/* Notifications */}
                    <ConfigSection
                        icon={Bell}
                        title="Notification Settings"
                        color="#f59e0b"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300">Enable Notifications</label>
                                <ToggleSwitch
                                    checked={config.notificationsEnabled}
                                    onChange={(checked) => setConfig({ ...config, notificationsEnabled: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300">SMS Notifications</label>
                                <ToggleSwitch
                                    checked={config.smsEnabled}
                                    onChange={(checked) => setConfig({ ...config, smsEnabled: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300">Email Notifications</label>
                                <ToggleSwitch
                                    checked={config.emailNotifications}
                                    onChange={(checked) => setConfig({ ...config, emailNotifications: checked })}
                                />
                            </div>
                        </div>
                    </ConfigSection>

                    {/* Security */}
                    <ConfigSection
                        icon={Lock}
                        title="Security Settings"
                        color="#ef4444"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Session Timeout (minutes)</label>
                                <input
                                    type="number"
                                    value={config.sessionTimeout}
                                    onChange={(e) => setConfig({ ...config, sessionTimeout: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 bg-slate-900/60 border border-slate-600/20"
                                    placeholder="30"
                                    title="Enter session timeout in minutes"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300">Require 2FA</label>
                                <ToggleSwitch
                                    checked={config.mfaRequired}
                                    onChange={(checked) => setConfig({ ...config, mfaRequired: checked })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Password Expiry (days)</label>
                                <input
                                    type="number"
                                    value={config.passwordExpiry}
                                    onChange={(e) => setConfig({ ...config, passwordExpiry: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 bg-slate-900/60 border border-slate-600/20"
                                    placeholder="90"
                                    title="Enter password expiry in days"
                                />
                            </div>
                        </div>
                    </ConfigSection>

                    {/* General Settings */}
                    <ConfigSection
                        icon={Globe}
                        title="General Settings"
                        color="#8b5cf6"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Application Name</label>
                                <input
                                    type="text"
                                    value={config.appName}
                                    onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-900/60 border border-slate-600/20"
                                    placeholder="Debt Collection Manager"
                                    title="Enter application name"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Timezone</label>
                                <select
                                    value={config.timezone}
                                    onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-900/60 border border-slate-600/20"
                                    title="Select timezone"
                                    aria-label="Select timezone"
                                >
                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                    <option value="America/New_York">America/New York (EST)</option>
                                    <option value="Europe/London">Europe/London (GMT)</option>
                                </select>
                            </div>
                        </div>
                    </ConfigSection>
                </div>
            </div>
        </AdminLayout>
    );
}

function ConfigSection({ icon: Icon, title, color, children }: any) {
    return (
        <div
            className="p-6 rounded-xl bg-slate-700/50 backdrop-blur-xl border border-slate-600/20"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10">
                    <Icon className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative w-12 h-6 rounded-full transition-all ${
                checked ? 'bg-green-500' : 'bg-slate-600'
            }`}
            title={checked ? 'Toggle off' : 'Toggle on'}
        >
            <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-0'
                }`}
            />
        </button>
    );
}
