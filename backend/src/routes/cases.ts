import { Router, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { AuthenticatedRequest } from '../middleware/auth';
import { badRequest, notFound } from '../middleware/errorHandler';

const router = Router();

// GET /api/cases - List all cases with filters
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const {
            status,
            priority,
            assigned_agent_id,
            search,
            page = '1',
            limit = '20',
            sort_by = 'created_at',
            sort_order = 'desc',
        } = req.query;

        let query = supabaseAdmin
            .from('case_summary')
            .select('*', { count: 'exact' });

        // Apply filters
        if (status) query = query.eq('status', status);
        if (priority) query = query.eq('priority', priority);
        if (assigned_agent_id) query = query.eq('assigned_agent_id', assigned_agent_id);
        if (search) {
            query = query.or(`case_number.ilike.%${search}%,debtor_name.ilike.%${search}%`);
        }

        // Pagination
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;

        query = query
            .order(sort_by as string, { ascending: sort_order === 'asc' })
            .range(from, to);

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

// GET /api/cases/:id - Get case details
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const { data: caseData, error } = await supabaseAdmin
            .from('case_summary')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !caseData) {
            throw notFound('Case not found');
        }

        // Get communications
        const { data: communications } = await supabaseAdmin
            .from('communications')
            .select('*')
            .eq('case_id', id)
            .order('created_at', { ascending: false })
            .limit(10);

        // Get transactions
        const { data: transactions } = await supabaseAdmin
            .from('transactions')
            .select('*')
            .eq('case_id', id)
            .order('created_at', { ascending: false });

        // Get predictions
        const { data: predictions } = await supabaseAdmin
            .from('predictions')
            .select('*')
            .eq('case_id', id)
            .order('created_at', { ascending: false })
            .limit(5);

        res.json({
            ...caseData,
            communications,
            transactions,
            predictions,
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/cases - Create new case
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { debtor_id, amount, due_date, priority, notes } = req.body;

        if (!debtor_id || !amount || !due_date) {
            throw badRequest('Missing required fields: debtor_id, amount, due_date');
        }

        const { data, error } = await supabaseAdmin
            .from('cases')
            .insert({
                debtor_id,
                amount: parseFloat(amount),
                original_amount: parseFloat(amount),
                due_date,
                priority: priority || 'MEDIUM',
                notes,
                created_by: req.user?.id,
            })
            .select()
            .single();

        if (error) throw error;

        // Update debtor total debt
        await supabaseAdmin.rpc('update_debtor_total_debt', {
            p_debtor_id: debtor_id,
            p_amount: parseFloat(amount),
        });

        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
});

// PUT /api/cases/:id - Update case
router.put('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabaseAdmin
            .from('cases')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw notFound('Case not found');

        res.json(data);
    } catch (error) {
        next(error);
    }
});

// POST /api/cases/:id/escalate - Escalate case
router.post('/:id/escalate', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { reason, escalate_to } = req.body;

        const { data, error } = await supabaseAdmin
            .from('cases')
            .update({
                status: 'ESCALATED',
                priority: 'CRITICAL',
                escalation_reason: reason,
                escalated_to: escalate_to,
                escalated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Log agent action
        await supabaseAdmin.from('agent_logs').insert({
            agent_type: 'COMPLIANCE',
            action: 'CASE_ESCALATED',
            case_id: id,
            output_data: { reason, escalated_to: escalate_to },
            result_status: 'SUCCESS',
        });

        res.json(data);
    } catch (error) {
        next(error);
    }
});

// POST /api/cases/:id/settle - Mark case as settled
router.post('/:id/settle', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { settlement_amount, payment_method, reference_number } = req.body;

        // Get case details first
        const { data: caseData, error: fetchError } = await supabaseAdmin
            .from('cases')
            .select('*, debtor_id')
            .eq('id', id)
            .single();

        if (fetchError || !caseData) {
            throw notFound('Case not found');
        }

        // Create transaction
        await supabaseAdmin.from('transactions').insert({
            case_id: id,
            debtor_id: caseData.debtor_id,
            amount: settlement_amount || caseData.amount,
            type: 'RECOVERY',
            method: payment_method,
            reference_number,
            note: 'Case settled',
        });

        // Update case
        const { data, error } = await supabaseAdmin
            .from('cases')
            .update({
                status: 'SETTLED',
                settlement_amount: settlement_amount || caseData.amount,
                settled_at: new Date().toISOString(),
                amount: 0,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        next(error);
    }
});

export { router as caseRoutes };
