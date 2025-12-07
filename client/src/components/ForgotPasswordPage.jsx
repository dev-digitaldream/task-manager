import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle, Sparkles } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const resetToken = searchParams.get('token');
    
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const darkMode = document.documentElement.classList.contains('dark');
    const theme = {
        bg: darkMode ? 'bg-[#0d1117]' : 'bg-gradient-to-br from-violet-50 to-purple-100',
        card: darkMode ? 'bg-[#161b22]' : 'bg-white',
        cardBorder: darkMode ? 'border-gray-700' : 'border-gray-200',
        text: darkMode ? 'text-gray-100' : 'text-gray-900',
        textMuted: darkMode ? 'text-gray-400' : 'text-gray-600',
        input: darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900',
    };

    // Request password reset
    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Request failed');
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Reset password with token
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetToken, newPassword })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Reset failed');
            }

            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Success state
    if (success) {
        return (
            <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`}>
                <div className={`${theme.card} rounded-2xl shadow-2xl p-8 w-full max-w-md border ${theme.cardBorder} text-center`}>
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className={`text-2xl font-bold ${theme.text} mb-2`}>
                        {resetToken ? 'Password Reset!' : 'Check Your Email'}
                    </h2>
                    <p className={`${theme.textMuted} mb-6`}>
                        {resetToken 
                            ? 'Your password has been reset successfully. Redirecting to login...'
                            : 'If an account exists with that email, you will receive a password reset link.'
                        }
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition font-medium"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`}>
            <div className={`${theme.card} rounded-2xl shadow-2xl p-8 w-full max-w-md border ${theme.cardBorder}`}>
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl mb-4">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <h1 className={`text-2xl font-bold ${theme.text}`}>
                        {resetToken ? 'Reset Password' : 'Forgot Password'}
                    </h1>
                    <p className={`text-sm ${theme.textMuted} mt-2`}>
                        {resetToken 
                            ? 'Enter your new password below'
                            : 'Enter your email to receive a reset link'
                        }
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={resetToken ? handleResetPassword : handleRequestReset} className="space-y-5">
                    {!resetToken ? (
                        // Request reset form
                        <div>
                            <label className={`block text-sm font-medium ${theme.textMuted} mb-2`}>
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    required
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                                />
                            </div>
                        </div>
                    ) : (
                        // Reset password form
                        <>
                            <div>
                                <label className={`block text-sm font-medium ${theme.textMuted} mb-2`}>
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme.textMuted} mb-2`}>
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className={`p-3 rounded-lg text-sm ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition font-medium shadow-lg shadow-violet-500/25 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                        ) : (
                            resetToken ? 'Reset Password' : 'Send Reset Link'
                        )}
                    </button>
                </form>

                {/* Back to login */}
                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className={`inline-flex items-center gap-2 text-sm ${theme.textMuted} hover:text-violet-600 transition`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
