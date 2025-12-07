import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
const { useState, useEffect } = React;
import { Building, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';

const AcceptInvitationPage = ({ currentUser }) => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        const fetchInvitation = async () => {
            try {
                const res = await fetch(`/api/workspaces/invitations/${token}`);
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Invalid invitation');
                }
                const data = await res.json();
                setInvitation(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchInvitation();
        }
    }, [token]);

    const handleAccept = async () => {
        if (!currentUser) {
            // Redirect to login with return URL
            navigate(`/login?redirect=/invite/${token}`);
            return;
        }

        setAccepting(true);
        try {
            const res = await fetch('/api/workspaces/invitations/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    userId: currentUser.id
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to accept invitation');
            }

            // Success, redirect to dashboard (or specific workspace if we knew ID, but response has it)
            const membership = await res.json();
            // Store new workspace as current
            localStorage.setItem('lastWorkspaceId', membership.workspaceId);
            // Reload to pick up new workspace access
            window.location.href = '/modern';
        } catch (err) {
            setError(err.message);
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-[#1c2128] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Invitation Error</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                    <button 
                        onClick={() => navigate('/modern')}
                        className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#1c2128] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-violet-500/20 mx-auto mb-6 text-white transform rotate-3">
                        {invitation.workspaceLogo || '🏢'}
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Join {invitation.workspaceName}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        You have been invited to join this workspace on FlowSpaces.
                    </p>

                    {invitation.workspaceDescription && (
                        <div className="bg-gray-50 dark:bg-[#0d1117] p-4 rounded-xl mb-8 text-sm text-gray-600 dark:text-gray-300">
                            "{invitation.workspaceDescription}"
                        </div>
                    )}

                    <div className="space-y-4">
                        {currentUser ? (
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl mb-6">
                                <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Signed in as:</p>
                                <p className="font-medium text-gray-900 dark:text-white">{currentUser.name} ({currentUser.email})</p>
                                {currentUser.email !== invitation.email && (
                                     <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 flex items-center justify-center gap-1">
                                        <AlertCircle size={12} />
                                        Warning: Invitation was sent to {invitation.email}
                                     </p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl mb-6">
                                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                    You need to sign in to accept this invitation.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleAccept}
                            disabled={accepting}
                            className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
                        >
                            {accepting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {currentUser ? 'Accept & Join Workspace' : 'Log in to Accept'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcceptInvitationPage;
