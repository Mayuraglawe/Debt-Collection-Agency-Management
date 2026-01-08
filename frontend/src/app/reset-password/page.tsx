"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { updatePassword } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const validatePassword = (pwd: string) => {
        if (pwd.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(pwd)) return 'Password must contain an uppercase letter';
        if (!/[a-z]/.test(pwd)) return 'Password must contain a lowercase letter';
        if (!/[0-9]/.test(pwd)) return 'Password must contain a number';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        const { error: updateError } = await updatePassword(newPassword);

        if (updateError) {
            setError(updateError.message || 'Failed to reset password');
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push('/sign-in');
            }, 2000);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
                    <p className="text-slate-400">Redirecting to sign in...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-gradient-radial from-blue-500/10 to-transparent blur-3xl" />
                <div className="absolute bottom-[-50%] right-[-50%] w-full h-full bg-gradient-radial from-purple-500/10 to-transparent blur-3xl" />
            </div>

            {/* Reset Password Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                            New Password
                        </h1>
                        <p className="text-slate-400">Enter your new password below</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* New Password Input */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                Min 8 characters, uppercase, lowercase, and number required
                            </p>
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Resetting...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    Reset Password
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            )}
                        </Button>
                    </form>

                    {/* Back to Sign In */}
                    <div className="mt-6 text-center">
                        <Link href="/sign-in" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                            ← Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
