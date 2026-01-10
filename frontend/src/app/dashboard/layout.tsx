import { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
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

