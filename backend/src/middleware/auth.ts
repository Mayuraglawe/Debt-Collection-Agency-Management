import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';
import { unauthorized } from './errorHandler';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // For development, allow requests without auth
            if (process.env.NODE_ENV === 'development') {
                req.user = {
                    id: 'dev-user-id',
                    email: 'dev@atlas-dca.com',
                    role: 'ADMIN',
                };
                return next();
            }
            throw unauthorized('Missing or invalid authorization header');
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw unauthorized('Invalid or expired token');
        }

        // Get user profile with role
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        req.user = {
            id: user.id,
            email: user.email || '',
            role: profile?.role || 'AGENT',
        };

        next();
    } catch (error) {
        next(error);
    }
}

export function requireRole(...roles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(unauthorized('User not authenticated'));
        }

        if (!roles.includes(req.user.role)) {
            return next(unauthorized(`Requires one of roles: ${roles.join(', ')}`));
        }

        next();
    };
}
