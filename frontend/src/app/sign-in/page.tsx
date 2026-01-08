"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Mail, Lock, ArrowRight, AlertCircle, Shield, Sparkles, BarChart3, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignInPage() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('🔐 Attempting login for:', email);

        try {
            // Add timeout to prevent infinite loading (30 seconds)
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Login timeout - please check your connection and try again')), 30000)
            );

            console.log('📤 Calling signIn...');
            const loginPromise = signIn(email, password);

            const result = await Promise.race([loginPromise, timeoutPromise]);
            console.log('📥 Login result:', result);

            const { error: signInError } = result as { error: { message: string } | null };

            if (signInError) {
                console.error('❌ Sign in error:', signInError);
                setError(signInError.message || 'Invalid email or password');
                setLoading(false);
            } else {
                console.log('✅ Login successful, redirecting...');
                // Small delay to ensure session is saved
                await new Promise(resolve => setTimeout(resolve, 500));
                router.push('/dashboard');
            }
        } catch (err) {
            console.error('💥 Login exception:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    const features = [
        { icon: BarChart3, text: 'Real-time Analytics Dashboard' },
        { icon: Bot, text: 'AI-Powered Collection Agents' },
        { icon: Shield, text: 'Compliance-First Approach' },
        { icon: Sparkles, text: 'Smart Recovery Predictions' },
    ];

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
                </div>

                {/* Grid Pattern Overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-3 mb-12"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Atlas DCA</h2>
                            <p className="text-sm text-slate-400">Debt Collection Management</p>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6"
                    >
                        Welcome back to your
                        <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Command Center
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-slate-400 mb-10 max-w-md"
                    >
                        Manage your entire debt collection workflow with AI-powered insights and automation.
                    </motion.p>

                    {/* Feature List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-4"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <feature.icon className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-slate-300">{feature.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Sign In Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">Atlas DCA</span>
                    </div>

                    {/* Card */}
                    <div
                        className="rounded-3xl p-8 sm:p-10"
                        style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(148, 163, 184, 0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Sign In
                            </h1>
                            <p className="text-slate-400">Enter your credentials to access your account</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-xl flex items-start gap-3"
                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                            >
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">{error}</p>
                            </motion.div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pr-4 py-4 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        style={{
                                            paddingLeft: '56px',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '1px solid rgba(148, 163, 184, 0.2)'
                                        }}
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pr-4 py-4 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        style={{
                                            paddingLeft: '56px',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '1px solid rgba(148, 163, 184, 0.2)'
                                        }}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 text-base font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.5)'
                                }}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Sign In</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="my-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-slate-700/50" />
                            <span className="text-sm text-slate-500">or</span>
                            <div className="flex-1 h-px bg-slate-700/50" />
                        </div>

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <p className="text-slate-400">
                                Don't have an account?{' '}
                                <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-8 text-center">
                        <Link href="/" className="text-sm text-slate-500 hover:text-slate-400 transition-colors inline-flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            Back to home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
