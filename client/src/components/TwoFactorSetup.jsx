import React, { useState } from 'react';
import { Shield, Smartphone, Copy, CheckCircle, X, AlertTriangle } from 'lucide-react';

const TwoFactorSetup = ({ userId, onClose, onComplete }) => {
    const [step, setStep] = useState(1); // 1: intro, 2: scan QR, 3: verify, 4: backup codes
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedBackup, setCopiedBackup] = useState(false);

    const darkMode = document.documentElement.classList.contains('dark');
    const theme = {
        bg: darkMode ? 'bg-[#161b22]' : 'bg-white',
        cardBorder: darkMode ? 'border-gray-700' : 'border-gray-200',
        text: darkMode ? 'text-gray-100' : 'text-gray-900',
        textMuted: darkMode ? 'text-gray-400' : 'text-gray-600',
        input: darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900',
    };

    // Start 2FA setup - get QR code
    const startSetup = async () => {
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/2fa/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Setup failed');
            }

            setQrCode(data.qrCode);
            setSecret(data.secret);
            setBackupCodes(data.backupCodes);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Verify the code and enable 2FA
    const verifyAndEnable = async () => {
        if (verificationCode.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code: verificationCode })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            setStep(4); // Show backup codes
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        if (type === 'secret') {
            setCopiedSecret(true);
            setTimeout(() => setCopiedSecret(false), 2000);
        } else {
            setCopiedBackup(true);
            setTimeout(() => setCopiedBackup(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${theme.bg} rounded-2xl shadow-2xl w-full max-w-md border ${theme.cardBorder} overflow-hidden`}>
                {/* Header */}
                <div className={`p-6 border-b ${theme.cardBorder} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                            <Shield className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                            <h2 className={`text-lg font-bold ${theme.text}`}>Two-Factor Authentication</h2>
                            <p className={`text-sm ${theme.textMuted}`}>Step {step} of 4</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition`}>
                        <X className={`w-5 h-5 ${theme.textMuted}`} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Introduction */}
                    {step === 1 && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Smartphone className="w-10 h-10 text-violet-600" />
                            </div>
                            <h3 className={`text-xl font-bold ${theme.text} mb-3`}>Secure Your Account</h3>
                            <p className={`${theme.textMuted} mb-6`}>
                                Add an extra layer of security by requiring a code from your phone when you sign in.
                            </p>
                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} text-left mb-6`}>
                                <h4 className={`font-medium ${theme.text} mb-2`}>You'll need:</h4>
                                <ul className={`text-sm ${theme.textMuted} space-y-2`}>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        An authenticator app (Google Authenticator, Authy, 1Password)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        Your phone ready to scan a QR code
                                    </li>
                                </ul>
                            </div>
                            <button
                                onClick={startSetup}
                                disabled={isLoading}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition font-medium"
                            >
                                {isLoading ? 'Setting up...' : 'Continue'}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Scan QR Code */}
                    {step === 2 && (
                        <div className="text-center">
                            <h3 className={`text-lg font-bold ${theme.text} mb-4`}>Scan QR Code</h3>
                            <p className={`${theme.textMuted} text-sm mb-4`}>
                                Open your authenticator app and scan this QR code
                            </p>
                            
                            {/* QR Code */}
                            <div className="bg-white p-4 rounded-xl inline-block mb-4">
                                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                            </div>

                            {/* Manual entry */}
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} mb-6`}>
                                <p className={`text-xs ${theme.textMuted} mb-2`}>Can't scan? Enter this code manually:</p>
                                <div className="flex items-center gap-2">
                                    <code className={`flex-1 text-sm ${theme.text} font-mono bg-transparent`}>{secret}</code>
                                    <button
                                        onClick={() => copyToClipboard(secret, 'secret')}
                                        className={`p-1.5 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition`}
                                    >
                                        {copiedSecret ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className={`w-4 h-4 ${theme.textMuted}`} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(3)}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition font-medium"
                            >
                                I've Scanned the Code
                            </button>
                        </div>
                    )}

                    {/* Step 3: Verify Code */}
                    {step === 3 && (
                        <div className="text-center">
                            <h3 className={`text-lg font-bold ${theme.text} mb-4`}>Verify Setup</h3>
                            <p className={`${theme.textMuted} text-sm mb-6`}>
                                Enter the 6-digit code from your authenticator app
                            </p>

                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                className={`w-full text-center text-3xl font-mono tracking-[0.5em] py-4 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                            />

                            {error && (
                                <div className={`mt-4 p-3 rounded-lg text-sm ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                                    {error}
                                </div>
                            )}

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setStep(2)}
                                    className={`flex-1 py-3 border ${theme.cardBorder} rounded-xl ${theme.text} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition font-medium`}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={verifyAndEnable}
                                    disabled={isLoading || verificationCode.length !== 6}
                                    className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition font-medium disabled:opacity-50"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Enable'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Backup Codes */}
                    {step === 4 && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className={`text-lg font-bold ${theme.text} mb-2`}>2FA Enabled!</h3>
                            <p className={`${theme.textMuted} text-sm mb-6`}>
                                Save these backup codes in a safe place. You can use them if you lose access to your authenticator app.
                            </p>

                            <div className={`p-4 rounded-xl ${darkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border mb-4`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                                    <span className={`font-medium text-sm ${darkMode ? 'text-amber-100' : 'text-amber-900'}`}>
                                        Save these codes now! They won't be shown again.
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {backupCodes.map((code, i) => (
                                        <code key={i} className={`text-sm font-mono ${theme.text} ${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 rounded`}>
                                            {code}
                                        </code>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                                className={`w-full py-2 mb-4 border ${theme.cardBorder} rounded-xl ${theme.text} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition font-medium flex items-center justify-center gap-2`}
                            >
                                {copiedBackup ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                {copiedBackup ? 'Copied!' : 'Copy All Codes'}
                            </button>

                            <button
                                onClick={() => {
                                    if (onComplete) onComplete();
                                    onClose();
                                }}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition font-medium"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TwoFactorSetup;
