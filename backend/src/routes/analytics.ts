import { Router, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/analytics/dashboard - Dashboard KPIs
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Get KPIs from view
        const { data: kpis, error: kpiError } = await supabaseAdmin
            .from('dashboard_kpis')
            .select('*')
            .single();

        if (kpiError) throw kpiError;

        // Get recent communications count
        const { count: commsCount } = await supabaseAdmin
            .from('communications')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // Get today's predictions count
        const { count: predictionsCount } = await supabaseAdmin
            .from('predictions')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        res.json({
            ...kpis,
            communications_today: commsCount || 0,
            predictions_today: predictionsCount || 0,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/analytics/recovery - Recovery trends
router.get('/recovery', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period as string);

        const { data, error } = await supabaseAdmin
            .from('analytics_snapshots')
            .select('snapshot_date, total_recovered, total_debt, recovery_rate')
            .gte('snapshot_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .order('snapshot_date', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        next(error);
    }
});

// GET /api/analytics/agents - Agent performance
router.get('/agents', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('agent_performance')
            .select('*');

        if (error) throw error;

        res.json(data);
    } catch (error) {
        next(error);
    }
});

// GET /api/analytics/trends - Time-series trends
router.get('/trends', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { metric = 'cases', period = '30' } = req.query;
        const days = parseInt(period as string);

        // Get daily case counts
        const { data, error } = await supabaseAdmin
            .from('cases')
            .select('created_at, status')
            .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        // Group by date
        const grouped = (data || []).reduce((acc: Record<string, any>, item) => {
            const date = item.created_at.split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, total: 0, open: 0, settled: 0, escalated: 0 };
            }
            acc[date].total++;
            if (item.status === 'OPEN') acc[date].open++;
            if (item.status === 'SETTLED') acc[date].settled++;
            if (item.status === 'ESCALATED') acc[date].escalated++;
            return acc;
        }, {});

        res.json(Object.values(grouped));
    } catch (error) {
        next(error);
    }
});

// GET /api/analytics/distribution - Case distribution
router.get('/distribution', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const statuses = ['OPEN', 'IN_PROGRESS', 'ESCALATED', 'SETTLED', 'CLOSED', 'WRITTEN_OFF'];
        const distribution = [];

        for (const status of statuses) {
            const { count } = await supabaseAdmin
                .from('cases')
                .select('*', { count: 'exact', head: true })
                .eq('status', status);

            distribution.push({ status, count: count || 0 });
        }

        res.json(distribution);
    } catch (error) {
        next(error);
    }
});

export { router as analyticsRoutes };
