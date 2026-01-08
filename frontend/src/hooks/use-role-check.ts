import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/supabase';

export function useRoleCheck() {
    const { user } = useAuth();

    const hasRole = (roles: UserRole | UserRole[]): boolean => {
        if (!user) return false;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        return allowedRoles.includes(user.role);
    };

    const isAdmin = (): boolean => hasRole('ADMIN');
    const isManager = (): boolean => hasRole(['ADMIN', 'MANAGER']);
    const isAgent = (): boolean => hasRole(['ADMIN', 'MANAGER', 'AGENT']);
    const isViewer = (): boolean => hasRole(['ADMIN', 'MANAGER', 'AGENT', 'VIEWER']);

    return {
        hasRole,
        isAdmin,
        isManager,
        isAgent,
        isViewer,
        role: user?.role,
    };
}
