"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, UserProfile } from '@/lib/supabase';
import { AdminLayout } from '@/components/layout/admin-layout';
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
        <AdminLayout 
            title="User Management"
            description="Manage system users and permissions"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-600/50">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-cyan-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                            <p className="text-sm text-slate-400">Total Users</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-600/50">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-red-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.admins}</p>
                            <p className="text-sm text-slate-400">Admins</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-600/50">
                    <div className="flex items-center gap-3">
                        <UserPlus className="w-8 h-8 text-purple-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.managers}</p>
                            <p className="text-sm text-slate-400">Managers</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-600/50">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.agents}</p>
                            <p className="text-sm text-slate-400">Agents</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-600/50">
                    <div className="flex items-center gap-3">
                        <Check className="w-8 h-8 text-green-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.active}</p>
                            <p className="text-sm text-slate-400">Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        title="Filter by role"
                        className="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="AGENT">Agent</option>
                        <option value="VIEWER">Viewer</option>
                    </select>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/40 border border-slate-600/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="text-left p-4 text-sm font-semibold text-slate-300">User</th>
                                <th className="text-left p-4 text-sm font-semibold text-slate-300">Role</th>
                                <th className="text-left p-4 text-sm font-semibold text-slate-300">Department</th>
                                <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                                <th className="text-left p-4 text-sm font-semibold text-slate-300">Last Login</th>
                                <th className="text-right p-4 text-sm font-semibold text-slate-300">Actions</th>
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
                                        <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white text-sm">
                                                        {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{u.full_name || 'No name'}</p>
                                                        <p className="text-sm text-slate-400">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(u.role)}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-300">{u.department || 'N/A'}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                                    u.is_active 
                                                        ? 'bg-green-500/20 text-green-300 border-green-500/40'
                                                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                                                }`}>
                                                    {u.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-300 text-sm">
                                                {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => toggleUserStatus(u.id, u.is_active)}
                                                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 transition-colors"
                                                        title={u.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {u.is_active ? (
                                                            <X className="w-4 h-4 text-red-400" />
                                                        ) : (
                                                            <Check className="w-4 h-4 text-green-400" />
                                                        )}
                                                    </button>
                                                    <button 
                                                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 transition-colors"
                                                        title="Edit user"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-blue-400" />
                                                    </button>
                                                    <button 
                                                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 transition-colors"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
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
        </AdminLayout>
    );
}

