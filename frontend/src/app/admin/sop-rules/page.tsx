"use client";

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { supabase } from '@/lib/supabase';
import { FileText, Plus, Edit2, Trash2, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SOPRule {
    id: string;
    name: string;
    category: string;
    description: string;
    priority: number;
    isActive: boolean;
    createdAt: string;
}

export default function SOPRulesPage() {
    const [rules, setRules] = useState<SOPRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sop_rules')
                .select('*')
                .order('priority', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map database fields to component interface
            const mappedRules = (data || []).map(rule => ({
                id: rule.id,
                name: rule.name,
                category: rule.category,
                description: rule.description,
                priority: rule.priority,
                isActive: rule.is_active,
                createdAt: rule.created_at
            }));

            setRules(mappedRules);
        } catch (error) {
            console.error('Error fetching SOP rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('sop_rules')
                .update({ is_active: !currentStatus })
                .eq('id', ruleId);

            if (error) throw error;
            fetchRules(); // Refresh the list
        } catch (error) {
            console.error('Error updating rule status:', error);
        }
    };

    const categories = ['ALL', 'Communication', 'Financial', 'Escalation', 'Compliance'];

    const filteredRules = selectedCategory === 'ALL'
        ? rules
        : rules.filter(r => r.category === selectedCategory);

    const stats = {
        total: rules.length,
        active: rules.filter(r => r.isActive).length,
        critical: rules.filter(r => r.priority === 1).length,
    };

    return (
        <AuthGuard allowedRoles={['ADMIN']}>
            <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">SOP & Rules Management</h1>
                                <p className="text-slate-400">Define and manage collection strategies and compliance rules</p>
                            </div>
                        </div>
                        <Button
                            className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold"
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                                boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.5)'
                            }}
                        >
                            <Plus className="w-5 h-5" />
                            Add Rule
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StatsCard label="Total Rules" value={stats.total.toString()} color="#10b981" />
                    <StatsCard label="Active Rules" value={stats.active.toString()} color="#3b82f6" />
                    <StatsCard label="Critical Priority" value={stats.critical.toString()} color="#ef4444" />
                </div>

                {/* Category Filter */}
                <div className="mb-6 flex gap-2 flex-wrap">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: selectedCategory === cat
                                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(20, 184, 166, 0.2))'
                                    : 'rgba(30, 41, 59, 0.5)',
                                border: selectedCategory === cat ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
                                color: selectedCategory === cat ? '#6ee7b7' : '#94a3b8'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Rules Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-400">Loading rules...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredRules.map(rule => (
                            <div
                                key={rule.id}
                                className="p-6 rounded-xl"
                                style={{
                                    background: 'rgba(30, 41, 59, 0.5)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)'
                                }}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                                            {rule.priority === 1 && (
                                                <div className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30">
                                                    <span className="text-xs text-red-300 font-medium">Critical</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-2.5 py-1 rounded-full inline-block" style={{ background: '#10b98120', border: '1px solid #10b98130' }}>
                                            <span className="text-xs text-emerald-300 font-medium">{rule.category}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="p-2 rounded-lg transition-all hover:bg-white/5"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4 text-blue-400" />
                                        </button>
                                        <button
                                            className="p-2 rounded-lg transition-all hover:bg-white/5"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-slate-300 text-sm mb-4">{rule.description}</p>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                    <span className="text-xs text-slate-500">
                                        Created {new Date(rule.createdAt).toLocaleDateString()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs ${rule.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                            {rule.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <ToggleSwitch checked={rule.isActive} onChange={() => toggleRuleStatus(rule.id, rule.isActive)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Compliance Templates Section */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Communication Templates</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <TemplateCard
                            title="First Contact Email"
                            description="Professional email template for initial debtor contact"
                            category="Email"
                        />
                        <TemplateCard
                            title="Payment Reminder SMS"
                            description="Short SMS template for payment reminders"
                            category="SMS"
                        />
                        <TemplateCard
                            title="Legal Notice"
                            description="Formal legal notice template for escalated cases"
                            category="Legal"
                        />
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

function StatsCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div
            className="p-4 rounded-xl"
            style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.2)'
            }}
        >
            <p className="text-sm text-slate-400 mb-1">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
        </div>
    );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            className="relative w-10 h-5 rounded-full transition-all"
            style={{
                background: checked ? '#22c55e' : '#475569'
            }}
        >
            <div
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform"
                style={{
                    transform: checked ? 'translateX(20px)' : 'translateX(0)'
                }}
            />
        </button>
    );
}

function TemplateCard({ title, description, category }: { title: string; description: string; category: string }) {
    return (
        <div
            className="p-5 rounded-xl cursor-pointer transition-all hover:scale-105"
            style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.2)'
            }}
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{title}</h3>
                <div className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/30">
                    <span className="text-xs text-blue-300">{category}</span>
                </div>
            </div>
            <p className="text-sm text-slate-400">{description}</p>
        </div>
    );
}
