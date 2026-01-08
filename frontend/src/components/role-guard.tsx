"use client";

import { UserRole } from '@/lib/supabase';
import { useRoleCheck } from '@/hooks/use-role-check';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: UserRole | UserRole[];
    fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
    const { hasRole } = useRoleCheck();

    if (!hasRole(allowedRoles)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
