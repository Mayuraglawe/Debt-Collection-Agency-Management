"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { AuthGuard } from "@/components/auth-guard";

export default function AgentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar />
                <main style={{
                    flex: 1,
                    marginLeft: '260px',
                    minHeight: '100vh',
                    transition: 'margin-left 0.3s ease'
                }}>
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
