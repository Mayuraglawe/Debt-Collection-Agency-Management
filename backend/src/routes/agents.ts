import { Router, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Agent types and their status
const AGENTS = [
    { id: 'predictive', type: 'PREDICTIVE', name: 'Predictive Agent', description: 'ML-based recovery prediction' },
    { id: 'negotiation', type: 'NEGOTIATION', name: 'Negotiation Agent', description: 'Payment plan generation' },
    { id: 'compliance', type: 'COMPLIANCE', name: 'Compliance Agent', description: 'Regulatory compliance checking' },
    { id: 'rpa', type: 'RPA', name: 'RPA Agent', description: 'Automated follow-ups' },
];

// GET /api/agents - List all agents with status
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Get agent performance from view
        const { data: performance, error } = await supabaseAdmin
            .from('agent_performance')
            .select('*');

        if (error) throw error;

        // Merge with agent definitions
        const agents = AGENTS.map(agent => {
            const perf = performance?.find(p => p.agent_type === agent.type);
            return {
                ...agent,
                status: perf ? 'ACTIVE' : 'IDLE',
                total_actions: perf?.total_actions || 0,
                successful_actions: perf?.successful_actions || 0,
                failed_actions: perf?.failed_actions || 0,
                avg_duration_ms: perf?.avg_duration_ms || 0,
                success_rate: perf?.total_actions
                    ? ((perf.successful_actions / perf.total_actions) * 100).toFixed(1)
                    : '0',
                last_action_at: perf?.last_action_at || null,
            };
        });

        res.json(agents);
    } catch (error) {
        next(error);
    }
});

// GET /api/agents/:type/logs - Get agent logs
router.get('/:type/logs', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { type } = req.params;
        const { limit = '50', page = '1' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const from = (pageNum - 1) * limitNum;

        const { data, error, count } = await supabaseAdmin
            .from('agent_logs')
            .select('*', { count: 'exact' })
            .eq('agent_type', type.toUpperCase())
            .order('created_at', { ascending: false })
            .range(from, from + limitNum - 1);

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

// POST /api/agents/:type/trigger - Manually trigger agent
router.post('/:type/trigger', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { type } = req.params;
        const { case_id, action } = req.body;

        const startTime = Date.now();

        // Log the trigger
        const { data: logEntry, error } = await supabaseAdmin
            .from('agent_logs')
            .insert({
                agent_type: type.toUpperCase() as 'PREDICTIVE' | 'NEGOTIATION' | 'COMPLIANCE' | 'RPA',
                action: action || 'MANUAL_TRIGGER',
                case_id,
                input_data: req.body,
                result_status: 'PROCESSING',
            })
            .select()
            .single();

        if (error) throw error;

        // Simulate agent processing (in real implementation, this would call the ML service or RPA)
        const result = await simulateAgentAction(type.toUpperCase(), case_id, action);

        // Update log with result
        await supabaseAdmin
            .from('agent_logs')
            .update({
                output_data: result,
                result_status: result.success ? 'SUCCESS' : 'FAILED',
                duration_ms: Date.now() - startTime,
            })
            .eq('id', logEntry.id);

        res.json({
            log_id: logEntry.id,
            agent_type: type.toUpperCase(),
            result,
            duration_ms: Date.now() - startTime,
        });
    } catch (error) {
        next(error);
    }
});

// Helper function to simulate agent actions
async function simulateAgentAction(type: string, caseId: string | null, action: string) {
    switch (type) {
        case 'PREDICTIVE':
            // Would call ML service for prediction
            return {
                success: true,
                recovery_probability: Math.random() * 0.5 + 0.3,
                risk_category: 'MEDIUM_RISK',
                recommended_strategy: 'NEGOTIATION_OFFER',
            };

        case 'NEGOTIATION':
            // Would generate payment plan
            return {
                success: true,
                plan_type: 'INSTALLMENT',
                suggested_amount: 5000,
                duration_months: 6,
                discount_offered: 10,
            };

        case 'COMPLIANCE':
            // Would check compliance rules
            return {
                success: true,
                compliant: true,
                rules_checked: ['COMMUNICATION_HOURS', 'MAX_CALLS', 'REQUIRED_DISCLOSURE'],
                violations: [],
            };

        case 'RPA':
            // Would schedule automated actions
            return {
                success: true,
                scheduled_actions: [
                    { type: 'EMAIL', scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
                    { type: 'SMS', scheduled_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() },
                ],
            };

        default:
            return { success: false, error: 'Unknown agent type' };
    }
}

export { router as agentRoutes };
