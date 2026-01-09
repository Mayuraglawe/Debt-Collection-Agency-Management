"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, WorkflowCase } from '@/lib/supabase';
import { AuthGuard } from '@/components/auth-guard';
import { Phone, Mail, MessageSquare, DollarSign, FileText, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';

type ActionType = 'CALL' | 'EMAIL' | 'SMS' | 'PAYMENT' | 'NEGOTIATION' | 'NOTE';
type OutcomeType = 'PTP' | 'RPC' | 'BROKEN_PROMISE' | 'DISPUTE' | 'PAYMENT_RECEIVED' | 'NO_CONTACT' | 'LEFT_MESSAGE' | 'CALLBACK_REQUESTED';

export default function AgentActionsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const caseId = searchParams.get('caseId');

    const [caseData, setCaseData] = useState<WorkflowCase | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [actionType, setActionType] = useState<ActionType>('CALL');
    const [outcome, setOutcome] = useState<OutcomeType>('RPC');
    const [notes, setNotes] = useState('');
    const [duration, setDuration] = useState('');
    const [promiseAmount, setPromiseAmount] = useState('');
    const [promiseDate, setPromiseDate] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [nextFollowUp, setNextFollowUp] = useState('');

    useEffect(() => {
        if (caseId) {
            fetchCase();
        }
    }, [caseId]);

    const fetchCase = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('workflow_cases')
                .select('*')
                .eq('id', caseId)
                .single();

            if (error) throw error;
            setCaseData(data);
        } catch (error) {
            console.error('Error fetching case:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAction = async () => {
        if (!caseId || !user?.id) {
            alert('Missing required information');
            return;
        }

        setSaving(true);
        try {
            // Insert agent action
            const { error: actionError } = await supabase
                .from('agent_actions')
                .insert({
                    case_id: caseId,
                    agent_id: user.id,
                    action_type: actionType,
                    outcome: outcome,
                    notes: notes,
                    duration_seconds: duration ? parseInt(duration) * 60 : null,
                    promise_amount: promiseAmount ? parseFloat(promiseAmount) : null,
                    promise_date: promiseDate || null,
                    payment_amount: paymentAmount ? parseFloat(paymentAmount) : null,
                    next_follow_up: nextFollowUp || null,
                    compliant: true,
                    created_at: new Date().toISOString()
                });

            if (actionError) throw actionError;

            // Update case status if needed
            let updateData: any = { updated_at: new Date().toISOString() };

            if (outcome === 'PAYMENT_RECEIVED' && paymentAmount) {
                const newRecovered = (caseData?.recovered_amount || 0) + parseFloat(paymentAmount);
                updateData.recovered_amount = newRecovered;
                if (newRecovered >= (caseData?.amount || 0)) {
                    updateData.status = 'RESOLVED';
                }
            }

            if (nextFollowUp) {
                updateData.next_follow_up = nextFollowUp;
            }

            if (outcome !== 'NO_CONTACT' && outcome !== 'LEFT_MESSAGE') {
                updateData.last_contact_date = new Date().toISOString();
            }

            const { error: updateError } = await supabase
                .from('workflow_cases')
                .update(updateData)
                .eq('id', caseId);

            if (updateError) throw updateError;

            alert('Action logged successfully!');

            // Reset form
            setNotes('');
            setDuration('');
            setPromiseAmount('');
            setPromiseDate('');
            setPaymentAmount('');
            setNextFollowUp('');

            fetchCase(); // Refresh case data
        } catch (error) {
            console.error('Error logging action:', error);
            alert('Failed to log action');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AuthGuard allowedRoles={['AGENT']}>
                <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Loading case...</p>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard allowedRoles={['AGENT']}>
            <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
                {/* Header */}
                <div className="mb-8">
                    <Button
                        onClick={() => router.back()}
                        className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg"
                        style={{ background: 'rgba(71, 85, 105, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Worklist
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Take Action</h1>
                            <p className="text-slate-400">Log your interaction with debtor</p>
                        </div>
                    </div>
                </div>

                {/* Case Info */}
                {caseData && (
                    <div className="mb-6 p-5 rounded-xl" style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Case Number</p>
                                <p className="text-white font-semibold">{caseData.case_number}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Outstanding Amount</p>
                                <p className="text-white font-semibold">₹{caseData.amount.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Recovered</p>
                                <p className="text-green-400 font-semibold">₹{(caseData.recovered_amount || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Priority</p>
                                <span className={`text-xs px-2 py-1 rounded ${caseData.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                                        caseData.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-300' :
                                            'bg-blue-500/20 text-blue-300'
                                    }`}>
                                    {caseData.priority}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Action Type Selection */}
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Select Action Type</h2>
                        <div className="space-y-3">
                            <ActionButton icon={Phone} label="Phone Call" active={actionType === 'CALL'} onClick={() => setActionType('CALL')} color="#06b6d4" />
                            <ActionButton icon={Mail} label="Email" active={actionType === 'EMAIL'} onClick={() => setActionType('EMAIL')} color="#8b5cf6" />
                            <ActionButton icon={MessageSquare} label="SMS" active={actionType === 'SMS'} onClick={() => setActionType('SMS')} color="#22c55e" />
                            <ActionButton icon={DollarSign} label="Payment Received" active={actionType === 'PAYMENT'} onClick={() => setActionType('PAYMENT')} color="#f59e0b" />
                            <ActionButton icon={FileText} label="Add Note" active={actionType === 'NOTE'} onClick={() => setActionType('NOTE')} color="#64748b" />
                        </div>
                    </div>

                    {/* Action Details Form */}
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Action Details</h2>
                        <div className="space-y-4 p-6 rounded-xl" style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                            {/* Outcome */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Outcome</label>
                                <select
                                    value={outcome}
                                    onChange={(e) => setOutcome(e.target.value as OutcomeType)}
                                    className="w-full px-4 py-3 rounded-xl text-white"
                                    style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                                >
                                    <option value="RPC">Right Party Contact</option>
                                    <option value="PTP">Promise to Pay</option>
                                    <option value="PAYMENT_RECEIVED">Payment Received</option>
                                    <option value="NO_CONTACT">No Contact</option>
                                    <option value="LEFT_MESSAGE">Left Message</option>
                                    <option value="CALLBACK_REQUESTED">Callback Requested</option>
                                    <option value="DISPUTE">Dispute</option>
                                    <option value="BROKEN_PROMISE">Broken Promise</option>
                                </select>
                            </div>

                            {/* Duration (for calls) */}
                            {actionType === 'CALL' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-white"
                                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                                        placeholder="Enter call duration"
                                    />
                                </div>
                            )}

                            {/* Promise Amount & Date */}
                            {outcome === 'PTP' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Promise Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={promiseAmount}
                                            onChange={(e) => setPromiseAmount(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl text-white"
                                            style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                                            placeholder="Amount promised"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Promise Date</label>
                                        <input
                                            type="date"
                                            value={promiseDate}
                                            onChange={(e) => setPromiseDate(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl text-white"
                                            style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Payment Amount */}
                            {outcome === 'PAYMENT_RECEIVED' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Payment Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-white"
                                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                                        placeholder="Amount received"
                                    />
                                </div>
                            )}

                            {/* Next Follow-up */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Next Follow-up Date</label>
                                <input
                                    type="datetime-local"
                                    value={nextFollowUp}
                                    onChange={(e) => setNextFollowUp(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-white"
                                    style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl text-white resize-none"
                                    style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                                    placeholder="Add notes about this interaction..."
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={handleSubmitAction}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold"
                                style={{
                                    background: saving ? 'rgba(6, 182, 212, 0.5)' : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                                    boxShadow: '0 10px 30px -10px rgba(6, 182, 212, 0.5)'
                                }}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Log Action
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

function ActionButton({ icon: Icon, label, active, onClick, color }: any) {
    return (
        <button
            onClick={onClick}
            className="w-full p-4 rounded-xl flex items-center gap-3 transition-all"
            style={{
                background: active ? `${color}20` : 'rgba(30, 41, 59, 0.5)',
                border: active ? `2px solid ${color}50` : '1px solid rgba(148, 163, 184, 0.2)',
                backdropFilter: 'blur(12px)'
            }}
        >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <span className={`font-medium ${active ? 'text-white' : 'text-slate-300'}`}>{label}</span>
        </button>
    );
}
