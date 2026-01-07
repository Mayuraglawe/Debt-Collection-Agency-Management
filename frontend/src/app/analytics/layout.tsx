"use client";

import { Sidebar } from "@/components/layout/sidebar";

export default function AnalyticsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
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
    );
}
