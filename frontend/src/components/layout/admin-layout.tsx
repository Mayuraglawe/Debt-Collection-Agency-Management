"use client";

import { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { Sidebar } from '@/components/layout/sidebar';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export function AdminLayout({ children, title = "Admin Panel", description = "Manage your debt collection operations" }: AdminLayoutProps) {
    return (
        <AuthGuard>
            <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
                <Sidebar />
                <main className="flex-1 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                        {/* Header */}
                        <div className="bg-slate-900/50 border-b border-slate-700/50 backdrop-blur-sm">
                            <div className="max-w-7xl mx-auto px-6 py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
                                        <p className="text-slate-400 mt-1">{description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-500">Last updated</div>
                                        <div className="text-white font-medium">{new Date().toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-w-7xl mx-auto px-6 py-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}