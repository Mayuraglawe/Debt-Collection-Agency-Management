"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, Shield, Zap, Users, TrendingUp, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignUpPage() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

    const getPasswordStrength = () => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName.trim()) {
            setError('Please enter your full name');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        const { error: signUpError } = await signUp(email, password, fullName);

        if (signUpError) {
            setError(signUpError.message || 'Failed to create account');
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        }
    };

    const benefits = [
        { icon: Zap, text: 'AI-powered recovery predictions' },
        { icon: Users, text: 'Multi-agent automation' },
        { icon: TrendingUp, text: 'Real-time analytics' },
        { icon: Shield, text: 'Enterprise-grade security' },
    ];

    const passwordStrength = getPasswordStrength();
    const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="mb-6 flex justify-center"
                    >
                        <div className="w-24 h-24 rounded-full flex items-center justify-center bg-green-500/20">
                            <CheckCircle className="w-12 h-12 text-green-400" />
                        </div>
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-3">Account Created!</h2>
                    <p className="text-slate-400 mb-6">Welcome to Atlas DCA</p>
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                        <div className="w-5 h-5 border-2 border-slate-500/30 border-t-slate-400 rounded-full animate-spin" />
                        <span>Redirecting to dashboard...</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
            {/* Navigation Header */}
            <nav className="absolute top-0 left-0 right-0 z-10 p-6">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 group transition-all duration-300 hover:scale-105">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Atlas DCA</span>
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-slate-300 hover:text-white transition-colors font-medium">
                            Home
                        </Link>
                        <Link href="/sign-in" className="px-6 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-all duration-300">
                            Sign In
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Left Panel - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1">
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
                        className="rounded-3xl p-8 sm:p-10 bg-slate-800/50 backdrop-blur-xl border border-slate-600/10 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Create Account
                            </h1>
                            <p className="text-slate-400">Join Atlas DCA and start managing collections</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-500/10 border border-red-500/20"
                            >
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">{error}</p>
                            </motion.div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center pointer-events-none">
                                        <User className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="w-full pl-14 pr-4 py-4 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-900/60 border border-slate-600/20"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Email */}
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
                                        className="w-full pl-14 pr-4 py-4 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-900/60 border border-slate-600/20"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
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
                                        className="w-full pl-14 pr-4 py-4 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-900/60 border border-slate-600/20"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="mt-3">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                                        i <= passwordStrength 
                                                            ? passwordStrength === 1 ? 'bg-red-400' 
                                                            : passwordStrength === 2 ? 'bg-orange-400'
                                                            : passwordStrength === 3 ? 'bg-yellow-400'
                                                            : passwordStrength === 4 ? 'bg-green-400'
                                                            : 'bg-emerald-400'
                                                            : 'bg-slate-600/20'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs ${passwordStrength === 1 ? 'text-red-400' : passwordStrength === 2 ? 'text-orange-400' : passwordStrength === 3 ? 'text-yellow-400' : passwordStrength === 4 ? 'text-green-400' : passwordStrength === 5 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                            {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Enter a password'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full pl-14 pr-4 py-4 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-900/60 border border-slate-600/20"
                                        placeholder="••••••••"
                                    />
                                    {confirmPassword && password === confirmPassword && (
                                        <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 text-base font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Creating account...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Create Account</span>
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

                        {/* Sign In Link */}
                        <div className="text-center">
                            <p className="text-slate-400">
                                Already have an account?{' '}
                                <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                                    Sign in
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

            {/* Right Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden order-1 lg:order-2">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
                </div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-10 bg-grid-pattern" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-3 mb-12"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/30">
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
                        Start your journey to
                        <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                            Smarter Collections
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-slate-400 mb-10 max-w-md"
                    >
                        Join thousands of professionals using Atlas DCA to optimize their debt recovery process.
                    </motion.p>

                    {/* Benefits */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-4"
                    >
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <benefit.icon className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-slate-300">{benefit.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="mt-12 flex gap-8"
                    >
                        <div>
                            <div className="text-3xl font-bold text-white">95%</div>
                            <div className="text-sm text-slate-400">Recovery Rate</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">10K+</div>
                            <div className="text-sm text-slate-400">Cases Managed</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">24/7</div>
                            <div className="text-sm text-slate-400">AI Automation</div>
                        </div>
                    </motion.div>
                </div>
            </div>
            </div>
        </div>
    );
}
