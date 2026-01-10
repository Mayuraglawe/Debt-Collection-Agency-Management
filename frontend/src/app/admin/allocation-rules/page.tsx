"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Settings, Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RuleConditions {
    amount?: { min: number };
    city?: string;
    recovery_probability?: { min: number };
    priority?: string;
}

type RuleType = 'VALUE_BASED' | 'GEO_BASED' | 'RECOVERY_BASED' | 'PRIORITY_BASED' | 'CUSTOM';

interface AllocationRule {
    id: string;
    rule_name: string;
    rule_type: RuleType;
    description: string;
    priority: number;
    is_active: boolean;
    conditions: RuleConditions;
    target_agency: string;
    times_applied: number;
    success_rate: number;
}

export default function AllocationRulesPage() {
    const { user } = useAuth();
    const [rules, setRules] = useState<AllocationRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState<AllocationRule | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('ALL');

    // Form state
    const [formData, setFormData] = useState({
        rule_name: '',
        rule_type: 'VALUE_BASED' as RuleType,
        description: '',
        priority: 100,
        target_agency: 'DCA Standard',
        conditions: {} as RuleConditions
    });

    const filteredRules = rules.filter(rule => {
        const matchesSearch = searchTerm === '' ||
            rule.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rule.target_agency.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || rule.rule_type === filterType;
        return matchesSearch && matchesType;
    });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('allocation_rules')
                .select('*')
                .order('priority', { ascending: true });

            if (error) throw error;
            setRules(data || []);
        } catch (error) {
            console.error('Error fetching rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('allocation_rules')
                .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
                .eq('id', ruleId);

            if (error) throw error;
            fetchRules();
        } catch (error) {
            console.error('Error toggling rule:', error);
        }
    };

    const handleSaveRule = async () => {
        try {
            const ruleData = {
                ...formData,
                conditions: buildConditions(),
                created_by: user?.id,
                updated_at: new Date().toISOString()
            };

            if (editingRule) {
                const { error } = await supabase
                    .from('allocation_rules')
                    .update(ruleData)
                    .eq('id', editingRule.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('allocation_rules')
                    .insert(ruleData);
                if (error) throw error;
            }

            setShowModal(false);
            setEditingRule(null);
            resetForm();
            fetchRules();
        } catch (error) {
            console.error('Error saving rule:', error);
            alert('Failed to save rule');
        }
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;

        try {
            const { error } = await supabase
                .from('allocation_rules')
                .delete()
                .eq('id', ruleId);

            if (error) throw error;
            fetchRules();
        } catch (error) {
            console.error('Error deleting rule:', error);
        }
    };

    const buildConditions = () => {
        const conditions: any = {};

        if (formData.rule_type === 'VALUE_BASED') {
            conditions.amount = { min: (document.getElementById('min_amount') as HTMLInputElement)?.value || 0 };
        } else if (formData.rule_type === 'GEO_BASED') {
            conditions.city = (document.getElementById('city') as HTMLInputElement)?.value || '';
        } else if (formData.rule_type === 'RECOVERY_BASED') {
            conditions.recovery_probability = { min: (document.getElementById('min_recovery') as HTMLInputElement)?.value || 0 };
        } else if (formData.rule_type === 'PRIORITY_BASED') {
            conditions.priority = (document.getElementById('priority_level') as HTMLSelectElement)?.value || 'HIGH';
        }

        return conditions;
    };

    const resetForm = () => {
        setFormData({
            rule_name: '',
            rule_type: 'VALUE_BASED',
            description: '',
            priority: 100,
            target_agency: 'DCA Standard',
            conditions: {}
        });
    };

    const openEditModal = (rule: AllocationRule) => {
        setEditingRule(rule);
        setFormData({
            rule_name: rule.rule_name,
            rule_type: rule.rule_type,
            description: rule.description,
            priority: rule.priority,
            target_agency: rule.target_agency,
            conditions: rule.conditions
        });
        setShowModal(true);
    };

    return (
        <AdminLayout 
            title="Allocation Rules Engine"
            description="Configure automated case distribution logic"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatsCard 
                    label="Total Rules" 
                    value={rules.length.toString()} 
                    color="#8b5cf6"
                    icon={<Settings className="w-5 h-5" />}
                />
                <StatsCard 
                    label="Active Rules" 
                    value={rules.filter(r => r.is_active).length.toString()} 
                    color="#22c55e"
                    icon={<Eye className="w-5 h-5" />}
                />
                <StatsCard 
                    label="Inactive Rules" 
                    value={rules.filter(r => !r.is_active).length.toString()} 
                    color="#64748b"
                    icon={<EyeOff className="w-5 h-5" />}
                />
                <StatsCard 
                    label="Total Applications" 
                    value={rules.reduce((sum, r) => sum + r.times_applied, 0).toString()} 
                    color="#3b82f6"
                    icon={<Settings className="w-5 h-5" />}
                />
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search rules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        title="Filter by rule type"
                        aria-label="Filter rules by type"
                    >
                        <option value="ALL">All Types</option>
                        <option value="VALUE_BASED">Value Based</option>
                        <option value="GEO_BASED">Geography Based</option>
                        <option value="RECOVERY_BASED">Recovery Based</option>
                        <option value="PRIORITY_BASED">Priority Based</option>
                    </select>
                    <Button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        Add Rule
                    </Button>
                </div>
            </div>

            {/* Rules List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Loading rules...</p>
                    </div>
                ) : filteredRules.length === 0 ? (
                    <div className="text-center py-20 rounded-xl bg-slate-800/40 border border-slate-600/50">
                        <Settings className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {searchTerm || filterType !== 'ALL' ? 'No Matching Rules' : 'No Rules Configured'}
                        </h3>
                        <p className="text-slate-400 mb-4">
                            {searchTerm || filterType !== 'ALL' 
                                ? 'Try adjusting your search or filter criteria' 
                                : 'Create your first allocation rule to automate case distribution'
                            }
                        </p>
                        {!searchTerm && filterType === 'ALL' && (
                            <Button
                                onClick={() => { resetForm(); setShowModal(true); }}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Your First Rule
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredRules.map((rule) => (
                        <RuleCard
                            key={rule.id}
                            rule={rule}
                            onToggle={() => toggleRuleStatus(rule.id, rule.is_active)}
                            onEdit={() => openEditModal(rule)}
                            onDelete={() => handleDeleteRule(rule.id)}
                        />
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-2xl rounded-xl p-6 bg-slate-900/95 border border-slate-600/50">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                {editingRule ? 'Edit Rule' : 'Create New Rule'}
                            </h2>
                            <button 
                                onClick={() => { setShowModal(false); setEditingRule(null); }} 
                                className="text-slate-400 hover:text-white"
                                title="Close modal"
                                aria-label="Close modal"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Rule Name *</label>
                                <input
                                    type="text"
                                    value={formData.rule_name}
                                    onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-white bg-slate-800/60 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    placeholder="e.g., High Value Cases"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Rule Type *</label>
                                <select
                                    value={formData.rule_type}
                                    onChange={(e) => setFormData({ ...formData, rule_type: e.target.value as RuleType })}
                                    className="w-full px-4 py-3 rounded-xl text-white bg-slate-800/60 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    title="Select rule type"
                                    aria-label="Select rule type"
                                >
                                    <option value="VALUE_BASED">Value Based (Amount Range)</option>
                                    <option value="GEO_BASED">Geography Based (City/Region)</option>
                                    <option value="RECOVERY_BASED">Recovery Probability Based</option>
                                    <option value="PRIORITY_BASED">Priority Level Based</option>
                                    <option value="CUSTOM">Custom Logic</option>
                                </select>
                            </div>

                            {/* Dynamic Condition Fields */}
                            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                                <h3 className="text-sm font-semibold text-white mb-3">Conditions</h3>
                                {formData.rule_type === 'VALUE_BASED' && (
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Minimum Amount (₹)</label>
                                        <input
                                            id="min_amount"
                                            type="number"
                                            defaultValue={formData.conditions?.amount?.min || 0}
                                            className="w-full px-3 py-2 rounded-lg text-white text-sm bg-slate-800/60 border border-slate-600/50"
                                            placeholder="100000"
                                        />
                                    </div>
                                )}
                                {formData.rule_type === 'GEO_BASED' && (
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">City Name</label>
                                        <input
                                            id="city"
                                            type="text"
                                            defaultValue={formData.conditions?.city || ''}
                                            className="w-full px-3 py-2 rounded-lg text-white text-sm bg-slate-800/60 border border-slate-600/50"
                                            placeholder="Mumbai"
                                        />
                                    </div>
                                )}
                                {formData.rule_type === 'RECOVERY_BASED' && (
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Minimum Recovery Probability (%)</label>
                                        <input
                                            id="min_recovery"
                                            type="number"
                                            defaultValue={formData.conditions?.recovery_probability?.min || 70}
                                            className="w-full px-3 py-2 rounded-lg text-white text-sm bg-slate-800/60 border border-slate-600/50"
                                            placeholder="70"
                                        />
                                    </div>
                                )}
                                {formData.rule_type === 'PRIORITY_BASED' && (
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Priority Level</label>
                                        <select
                                            id="priority_level"
                                            defaultValue={formData.conditions?.priority || 'HIGH'}
                                            className="w-full px-3 py-2 rounded-lg text-white text-sm bg-slate-800/60 border border-slate-600/50"
                                            title="Select priority level"
                                            aria-label="Select priority level"
                                        >
                                            <option value="CRITICAL">Critical</option>
                                            <option value="HIGH">High</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="LOW">Low</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Target Agency *</label>
                                <select
                                    value={formData.target_agency}
                                    onChange={(e) => setFormData({ ...formData, target_agency: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-white bg-slate-800/60 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    title="Select target agency"
                                    aria-label="Select target agency"
                                >
                                    <option value="DCA Prime">DCA Prime (High Value)</option>
                                    <option value="DCA Elite">DCA Elite (High Recovery)</option>
                                    <option value="DCA West">DCA West (Regional)</option>
                                    <option value="DCA Standard">DCA Standard (Default)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Priority (Lower = Higher Priority)</label>
                                <input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl text-white bg-slate-800/60 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    placeholder="100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl text-white resize-none bg-slate-800/60 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    placeholder="Describe when this rule should apply..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={handleSaveRule}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingRule ? 'Update Rule' : 'Create Rule'}
                                </Button>
                                <Button
                                    onClick={() => { setShowModal(false); setEditingRule(null); }}
                                    className="px-6 py-3 rounded-xl font-semibold bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700/70"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function StatsCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
    const colorMap: Record<string, string> = {
        '#3b82f6': 'bg-blue-500/10 text-blue-500',
        '#22c55e': 'bg-green-500/10 text-green-500',
        '#f59e0b': 'bg-amber-500/10 text-amber-500',
        '#ef4444': 'bg-red-500/10 text-red-500',
        '#8b5cf6': 'bg-purple-500/10 text-purple-500'
    };
    const colorClass = colorMap[color] || 'bg-blue-500/10 text-blue-500';
    
    return (
        <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-600/50 hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center opacity-80 ${colorClass}`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-sm text-slate-400">{label}</p>
                </div>
            </div>
        </div>
    );
}

function RuleCard({ rule, onToggle, onEdit, onDelete }: any) {
    const getPriorityColor = (priority: number) => {
        if (priority <= 20) return '#ef4444';
        if (priority <= 50) return '#f59e0b';
        return '#3b82f6';
    };

    const formatConditions = (conditions: any, type: string) => {
        if (type === 'VALUE_BASED' && conditions.amount) {
            return `Amount ≥ ₹${conditions.amount.min?.toLocaleString()}`;
        }
        if (type === 'GEO_BASED' && conditions.city) {
            return `City: ${conditions.city}`;
        }
        if (type === 'RECOVERY_BASED' && conditions.recovery_probability) {
            return `Recovery ≥ ${conditions.recovery_probability.min}%`;
        }
        if (type === 'PRIORITY_BASED' && conditions.priority) {
            return `Priority: ${conditions.priority}`;
        }
        return 'Custom conditions';
    };

    return (
        <div className={`p-6 rounded-xl bg-slate-800/40 border transition-all hover:bg-slate-800/60 ${
            rule.is_active 
                ? 'border-cyan-500/30 shadow-lg shadow-cyan-500/10' 
                : 'border-slate-600/50'
        }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{rule.rule_name}</h3>
                        <span 
                            className="text-xs px-3 py-1 rounded-full font-medium border"
                            data-priority={rule.priority.toLowerCase()}
                        >
                            Priority: {rule.priority}
                        </span>
                        {rule.is_active ? (
                            <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/40 font-medium">
                                Active
                            </span>
                        ) : (
                            <span className="text-xs px-3 py-1 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/40 font-medium">
                                Inactive
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{rule.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                            Type: {rule.rule_type.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Target: {rule.target_agency}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            Applied: {rule.times_applied} times
                        </span>
                        {rule.success_rate && (
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Success: {rule.success_rate}%
                            </span>
                        )}
                    </div>
                    <div className="inline-block px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <span className="text-xs text-cyan-300 font-medium">{formatConditions(rule.conditions, rule.rule_type)}</span>
                    </div>
                </div>
                <div className="flex gap-2 ml-4">
                    <button
                        onClick={onToggle}
                        className="p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 transition-colors"
                        title={rule.is_active ? 'Deactivate' : 'Activate'}
                    >
                        {rule.is_active ? 
                            <Eye className="w-4 h-4 text-green-400" /> : 
                            <EyeOff className="w-4 h-4 text-slate-500" />
                        }
                    </button>
                    <button 
                        onClick={onEdit} 
                        className="p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 transition-colors" 
                        title="Edit"
                    >
                        <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button 
                        onClick={onDelete} 
                        className="p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 transition-colors" 
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}
