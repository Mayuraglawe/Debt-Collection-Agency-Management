"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { AuthGuard } from '@/components/auth-guard';
import { CreditCard, CheckCircle, DollarSign, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const caseId = searchParams.get('caseId');

    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
    const [transactionId, setTransactionId] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

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

    const handleProcessPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }

        setProcessing(true);
        try {
            const amount = parseFloat(paymentAmount);
            const newRecovered = (caseData.recovered_amount || 0) + amount;

            // Log payment action
            const { error: actionError } = await supabase
                .from('agent_actions')
                .insert({
                    case_id: caseId,
                    agent_id: user?.id,
                    action_type: 'PAYMENT',
                    outcome: 'PAYMENT_RECEIVED',
                    payment_amount: amount,
                    notes: `${paymentMethod}: ${transactionId || 'N/A'}\n${notes}`,
                    compliant: true,
                    created_at: new Date().toISOString()
                });

            if (actionError) throw actionError;

            // Update case with new recovered amount
            const updateData: any = {
                recovered_amount: newRecovered,
                last_contact_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Mark as resolved if fully paid
            if (newRecovered >= caseData.amount) {
                updateData.status = 'RESOLVED';
            } else {
                updateData.status = 'IN_PROGRESS';
            }

            const { error: updateError } = await supabase
                .from('workflow_cases')
                .update(updateData)
                .eq('id', caseId);

            if (updateError) throw updateError;

            alert(`Payment of ₹${amount.toLocaleString()} processed successfully!`);
            router.push('/agent/worklist');
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Failed to process payment');
        } finally {
            setProcessing(false);
        }
    };

    const remainingAmount = caseData ? caseData.amount - (caseData.recovered_amount || 0) : 0;

    return (
        <AuthGuard allowedRoles={['AGENT']}>
            <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Process Payment</h1>
                            <p className="text-slate-400">Record debtor payment</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-400">Loading case...</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto">
                        {/* Case Summary */}
                        <div className="mb-6 p-6 rounded-xl" style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                            <h2 className="text-lg font-semibold text-white mb-4">Case Summary</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Case Number</p>
                                    <p className="text-white font-semibold">{caseData?.case_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Total Amount</p>
                                    <p className="text-white font-semibold">₹{caseData?.amount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Already Recovered</p>
                                    <p className="text-green-400 font-semibold">₹{(caseData?.recovered_amount || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <p className="text-sm text-slate-400 mb-1">Remaining Amount</p>
                                <p className="text-2xl font-bold text-orange-400">₹{remainingAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <div className="p-6 rounded-xl" style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                            <h2 className="text-lg font-semibold text-white mb-6">Payment Details</h2>

                            <div className="space-y-5">
                                {/* Payment Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Payment Amount (₹) *</label>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-white text-lg font-semibold"
                                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(34, 197, 94, 0.3)' }}
                                        placeholder="0.00"
                                    />
                                    <div className="mt-2 flex gap-2">
                                        <button
                                            onClick={() => setPaymentAmount(remainingAmount.toString())}
                                            className="px-3 py-1 text-xs rounded bg-green-500/20 text-green-300 border border-green-500/30"
                                        >
                                            Full Amount
                                        </button>
                                        <button
                                            onClick={() => setPaymentAmount((remainingAmount / 2).toString())}
                                            className="px-3 py-1 text-xs rounded bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                        >
                                            50%
                                        </button>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Payment Method *</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-white"
                                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                                    >
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="UPI">UPI</option>
                                        <option value="CHECK">Check</option>
                                        <option value="CASH">Cash</option>
                                        <option value="CARD">Credit/Debit Card</option>
                                    </select>
                                </div>

                                {/* Transaction ID */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Transaction ID / Reference Number</label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-white"
                                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                                        placeholder="Enter transaction reference"
                                    />
                                </div>

                                {/* Payment Date */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Payment Date *</label>
                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-white"
                                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Additional Notes</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl text-white resize-none"
                                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                                        placeholder="Add any additional information..."
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <Button
                                        onClick={handleProcessPayment}
                                        disabled={processing || !paymentAmount}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg"
                                        style={{
                                            background: processing || !paymentAmount
                                                ? 'rgba(34, 197, 94, 0.3)'
                                                : 'linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)',
                                            boxShadow: '0 10px 30px -10px rgba(34, 197, 94, 0.5)'
                                        }}
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                Process Payment of ₹{paymentAmount ? parseFloat(paymentAmount).toLocaleString() : '0'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
