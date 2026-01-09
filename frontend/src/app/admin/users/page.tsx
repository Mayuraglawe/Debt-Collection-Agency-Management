"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, UserProfile } from '@/lib/supabase';
import { AuthGuard } from '@/components/auth-guard';
import { Users, UserPlus, Edit2, Trash2, Check, X, Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UserManagementPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('ALL');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = searchTerm === '' ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        managers: users.filter(u => u.role === 'MANAGER').length,
        agents: users.filter(u => u.role === 'AGENT').length,
        active: users.filter(u => u.is_active).length,
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            ADMIN: 'bg-red-500/20 text-red-300 border-red-500/30',
            MANAGER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            AGENT: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            VIEWER: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        };
        return colors[role] || colors.VIEWER;
    };

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: !currentStatus })
                .eq('id', userId);

            if (error) throw error;
            fetchUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    return (
        <AuthGuard allowedRoles={['ADMIN']}>
            <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">User Management</h1>
                                <p className="text-slate-400">Manage system users and permissions</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold"
                            style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                                boxShadow: '0 10px 30px -10px rgba(239, 68, 68, 0.5)'
                            }}
                        >
                            <UserPlus className="w-5 h-5" />
                            Add User
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <StatsCard label="Total Users" value={stats.total.toString()} color="#3b82f6" />
                    <StatsCard label="Admins" value={stats.admins.toString()} color="#ef4444" />
                    <StatsCard label="Managers" value={stats.managers.toString()} color="#a855f7" />
                    <StatsCard label="Agents" value={stats.agents.toString()} color="#0ea5e9" />
                    <StatsCard label="Active" value={stats.active.toString()} color="#22c55e" />
                </div>

                {/* Search and Filters */}
                <div
                    className="mb-6 p-4 rounded-xl"
                    style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(148, 163, 184, 0.2)'
                    }}
                >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)'
                                }}
                            />
                        </div>

                        {/* Role Filters */}
                        <div className="flex gap-2">
                            <FilterButton active={filterRole === 'ALL'} onClick={() => setFilterRole('ALL')} label="All" />
                            <FilterButton active={filterRole === 'ADMIN'} onClick={() => setFilterRole('ADMIN')} label="Admin" />
                            <FilterButton active={filterRole === 'MANAGER'} onClick={() => setFilterRole('MANAGER')} label="Manager" />
                            <FilterButton active={filterRole === 'AGENT'} onClick={() => setFilterRole('AGENT')} label="Agent" />
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div
                    className="rounded-xl overflow-hidden"
                    style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(148, 163, 184, 0.2)'
                    }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">User</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Role</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Department</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Status</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Last Login</th>
                                    <th className="text-right p-4 text-sm font-semibold text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center">
                                            <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-2" />
                                            <p className="text-slate-400">Loading users...</p>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium text-white">{u.full_name || 'N/A'}</p>
                                                    <p className="text-sm text-slate-400">{u.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${getRoleBadgeColor(u.role)}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-300">{u.department || 'N/A'}</td>
                                            <td className="p-4">
                                                {u.is_active ? (
                                                    <div className="flex items-center gap-2 text-green-400">
                                                        <Check className="w-4 h-4" />
                                                        <span className="text-sm">Active</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-red-400">
                                                        <X className="w-4 h-4" />
                                                        <span className="text-sm">Inactive</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-slate-300 text-sm">
                                                {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => toggleUserStatus(u.id, u.is_active)}
                                                        className="p-2 rounded-lg transition-all hover:bg-white/5"
                                                        title={u.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {u.is_active ? (
                                                            <X className="w-4 h-4 text-red-400" />
                                                        ) : (
                                                            <Check className="w-4 h-4 text-green-400" />
                                                        )}
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-lg transition-all hover:bg-white/5"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-blue-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
                background: active
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.2))'
                    : 'rgba(30, 41, 59, 0.5)',
                border: active ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
                color: active ? '#fca5a5' : '#94a3b8'
            }}
        >
            {label}
        </button>
    );
}
