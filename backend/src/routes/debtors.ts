import { Router, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { AuthenticatedRequest } from '../middleware/auth';
import { badRequest, notFound } from '../middleware/errorHandler';

const router = Router();

// GET /api/debtors - List all debtors
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const {
            status,
            search,
            page = '1',
            limit = '20',
            sort_by = 'created_at',
            sort_order = 'desc',
        } = req.query;

        let query = supabaseAdmin
            .from('debtors')
            .select('*', { count: 'exact' });

        if (status) query = query.eq('status', status);
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const from = (pageNum - 1) * limitNum;

        query = query
            .order(sort_by as string, { ascending: sort_order === 'asc' })
            .range(from, from + limitNum - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            data,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: count,
                totalPages: Math.ceil((count || 0) / limitNum),
            },
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/debtors/:id - Get debtor details
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('debtors')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) throw notFound('Debtor not found');

        // Get associated cases
        const { data: cases } = await supabaseAdmin
            .from('cases')
            .select('*')
            .eq('debtor_id', id)
            .order('created_at', { ascending: false });

        res.json({ ...data, cases });
    } catch (error) {
        next(error);
    }
});

// POST /api/debtors - Create debtor
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, address, city, state, postal_code } = req.body;

        if (!name) throw badRequest('Name is required');

        const { data, error } = await supabaseAdmin
            .from('debtors')
            .insert({
                name,
                email,
                phone,
                address,
                city,
                state,
                postal_code,
                created_by: req.user?.id,
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
});

// PUT /api/debtors/:id - Update debtor
router.put('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabaseAdmin
            .from('debtors')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw notFound('Debtor not found');

        res.json(data);
    } catch (error) {
        next(error);
    }
});

// GET /api/debtors/:id/history - Get payment history
router.get('/:id/history', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('transactions')
            .select('*, cases(case_number)')
            .eq('debtor_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        next(error);
    }
});

export { router as debtorRoutes };
