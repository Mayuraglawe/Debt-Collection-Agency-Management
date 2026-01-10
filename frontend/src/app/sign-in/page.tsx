"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield, ArrowRight, Brain, BarChart3 } from 'lucide-react';

export default function SignInPage() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Login timeout - please check your connection and try again')), 30000)
            );

            const loginPromise = signIn(email.trim(), password);
            const result = await Promise.race([loginPromise, timeoutPromise]);
            const { error: signInError } = result as { error: { message: string } | null };

            if (signInError) {
                setError(signInError.message || 'Invalid email or password');
                setLoading(false);
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Navigation Header */}
            <nav className="absolute top-0 left-0 right-0 z-10 p-6">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <Link href="/" className="flex items-center gap-3 group transition-all duration-300">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-slate-800">Atlas DCA</span>
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-slate-600 text-sm">Don't have an account?</span>
                        <Link href="/sign-up" className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all duration-300 font-medium">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-indigo-700/90" />
                
                {/* Decorative Elements */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute top-1/2 left-10 w-24 h-24 bg-white/10 rounded-full blur-lg" />
                
                <div className="relative z-10 flex flex-col justify-center items-center px-12 py-20 text-center">
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold text-white mb-6">
                            Welcome back to
                            <span className="block text-blue-200">Atlas DCA</span>
                        </h1>
                        <p className="text-blue-100 text-lg leading-relaxed mb-8">
                            Sign in to access your AI-powered debt collection management platform
                        </p>
                        
                        {/* Features */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 justify-center">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Brain className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white/90">AI-Powered Recovery Predictions</span>
                            </div>
                            <div className="flex items-center gap-3 justify-center">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white/90">Real-Time Analytics Dashboard</span>
                            </div>
                            <div className="flex items-center gap-3 justify-center">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white/90">Compliance-First Automation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-slate-800">Atlas DCA</span>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back!</h2>
                        <p className="text-slate-600">Sign in to access your dashboard and continue optimizing your QA process.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <span className="text-red-700 text-sm">{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900 placeholder-slate-500"
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900 placeholder-slate-500"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <Link 
                                href="/forgot-password" 
                                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    {/* OAuth Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-slate-300"></div>
                        <div className="mx-4 text-sm text-slate-500 font-medium">OR</div>
                        <div className="flex-1 border-t border-slate-300"></div>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="space-y-3">
                        <button 
                            type="button"
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>

                        <button 
                            type="button"
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                            Continue with Apple
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-600 text-sm">
                            Don't have an Account?{' '}
                            <Link 
                                href="/sign-up" 
                                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
