import { Router, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { AuthenticatedRequest } from '../middleware/auth';
import { badRequest, notFound } from '../middleware/errorHandler';

const router = Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// POST /api/predictions/recovery - Get recovery prediction for a case
router.post('/recovery', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { case_id, features } = req.body;

        if (!case_id) throw badRequest('case_id is required');

        // Get case details if features not provided
        let predictionFeatures = features;
        let debtorId: string | null = null;

        if (!features) {
            const { data: caseData, error } = await supabaseAdmin
                .from('case_summary')
                .select('*')
                .eq('id', case_id)
                .single();

            if (error || !caseData) throw notFound('Case not found');

            debtorId = caseData.debtor_id;
            predictionFeatures = {
                debt_amount: caseData.amount,
                days_past_due: caseData.days_past_due,
                original_amount: caseData.original_amount,
                communication_count: caseData.communication_count || 0,
                transaction_count: caseData.transaction_count || 0,
            };
        }

        // Call ML service for prediction (or simulate if not available)
        let prediction;
        try {
            const response = await fetch(`${ML_SERVICE_URL}/predictions/recovery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(predictionFeatures),
            });

            if (response.ok) {
                prediction = await response.json();
            } else {
                throw new Error('ML service unavailable');
            }
        } catch (mlError) {
            // Fallback simulation if ML service is not running
            const probability = calculateSimulatedProbability(predictionFeatures);
            prediction = {
                recovery_probability: probability,
                risk_category: probability >= 0.7 ? 'LOW_RISK' : probability >= 0.4 ? 'MEDIUM_RISK' : 'HIGH_RISK',
                recommended_strategy: probability >= 0.7 ? 'STANDARD_FOLLOW_UP' : probability >= 0.4 ? 'NEGOTIATION_OFFER' : 'ESCALATION',
            };
        }

        // Get debtor_id if not already fetched
        if (!debtorId) {
            const { data: caseData } = await supabaseAdmin
                .from('cases')
                .select('debtor_id')
                .eq('id', case_id)
                .single();
            debtorId = caseData?.debtor_id;
        }

        // Save prediction to database
        const { data: savedPrediction, error: saveError } = await supabaseAdmin
            .from('predictions')
            .insert({
                case_id,
                debtor_id: debtorId,
                recovery_probability: prediction.recovery_probability,
                risk_category: prediction.risk_category,
                recommended_strategy: prediction.recommended_strategy,
                model_version: '1.0.0',
                model_name: 'xgboost_recovery_v1',
                features: predictionFeatures,
                confidence_score: prediction.confidence_score || 0.85,
            })
            .select()
            .single();

        if (saveError) console.error('Failed to save prediction:', saveError);

        // Update case with prediction
        await supabaseAdmin
            .from('cases')
            .update({
                recovery_probability: prediction.recovery_probability,
                recommended_strategy: prediction.recommended_strategy,
            })
            .eq('id', case_id);

        // Log agent action
        await supabaseAdmin.from('agent_logs').insert({
            agent_type: 'PREDICTIVE',
            action: 'RECOVERY_PREDICTION',
            case_id,
            debtor_id: debtorId,
            input_data: predictionFeatures,
            output_data: prediction,
            result_status: 'SUCCESS',
        });

        res.json({
            prediction_id: savedPrediction?.id,
            case_id,
            ...prediction,
            features: predictionFeatures,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/predictions/case/:id - Get predictions for a case
router.get('/case/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('predictions')
            .select('*')
            .eq('case_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        next(error);
    }
});

// POST /api/predictions/batch - Batch predictions for multiple cases
router.post('/batch', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { case_ids } = req.body;

        if (!case_ids || !Array.isArray(case_ids)) {
            throw badRequest('case_ids array is required');
        }

        const results = [];
        for (const case_id of case_ids.slice(0, 50)) { // Limit to 50 cases
            try {
                const { data: caseData } = await supabaseAdmin
                    .from('case_summary')
                    .select('*')
                    .eq('id', case_id)
                    .single();

                if (caseData) {
                    const probability = calculateSimulatedProbability({
                        debt_amount: caseData.amount,
                        days_past_due: caseData.days_past_due,
                        original_amount: caseData.original_amount,
                    });

                    results.push({
                        case_id,
                        recovery_probability: probability,
                        risk_category: probability >= 0.7 ? 'LOW_RISK' : probability >= 0.4 ? 'MEDIUM_RISK' : 'HIGH_RISK',
                        status: 'SUCCESS',
                    });

                    // Update case
                    await supabaseAdmin
                        .from('cases')
                        .update({ recovery_probability: probability })
                        .eq('id', case_id);
                }
            } catch (err) {
                results.push({ case_id, status: 'FAILED', error: 'Processing error' });
            }
        }

        res.json({
            processed: results.length,
            results,
        });
    } catch (error) {
        next(error);
    }
});

// Helper function for simulated prediction
function calculateSimulatedProbability(features: any): number {
    const { debt_amount = 0, days_past_due = 0, original_amount = 1 } = features;

    // Simple heuristic-based calculation
    const amountFactor = 1 - Math.min(debt_amount / 500000, 0.5); // Lower debt = higher recovery
    const dpFactor = 1 - Math.min(days_past_due / 180, 0.6); // Fewer days past due = higher
    const paymentRatio = original_amount > 0 ? 1 - (debt_amount / original_amount) : 0;

    const base = 0.3;
    const probability = base + (amountFactor * 0.25) + (dpFactor * 0.3) + (paymentRatio * 0.15);

    return Math.min(Math.max(probability, 0.05), 0.95);
}

export { router as predictionRoutes };
