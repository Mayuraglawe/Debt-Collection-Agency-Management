import { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { Navbar } from '@/components/navbar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard>
            <Navbar />
            {children}
        </AuthGuard>
    );
}
