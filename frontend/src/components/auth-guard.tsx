"use client";

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/lib/supabase';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    redirectTo?: string;
}

export function AuthGuard({ children, allowedRoles, redirectTo = '/sign-in' }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Check if user is authenticated
            if (!user) {
                router.push(redirectTo);
                return;
            }

            // Check if user has required role
            if (allowedRoles && !allowedRoles.includes(user.role)) {
                router.push('/unauthorized');
                return;
            }
        }
    }, [user, loading, allowedRoles, router, redirectTo]);

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Don't render children if not authenticated or not authorized
    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
        return null;
    }

    return <>{children}</>;
}
