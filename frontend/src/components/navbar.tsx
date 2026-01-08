"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, Shield } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'MANAGER':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'AGENT':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'VIEWER':
                return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
            default:
                return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        }
    };

    if (!user) return null;

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Brand */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-blue-400" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Atlas DCA
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/cases" className="text-slate-300 hover:text-white transition-colors">
                            Cases
                        </Link>
                        <Link href="/analytics" className="text-slate-300 hover:text-white transition-colors">
                            Analytics
                        </Link>
                        <Link href="/agents" className="text-slate-300 hover:text-white transition-colors">
                            AI Agents
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-slate-400" />
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-medium text-white">
                                        {user.full_name || user.email}
                                    </p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700/50 rounded-lg shadow-2xl overflow-hidden">
                                <div className="p-4 border-b border-slate-700/50">
                                    <p className="text-sm font-medium text-white truncate">
                                        {user.full_name || 'User'}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    <span className={`mt-2 inline-block text-xs px-2 py-1 rounded-full border ${getRoleBadgeColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </div>

                                <div className="p-2">
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Link>

                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
