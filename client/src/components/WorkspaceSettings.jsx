import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    Building, Users, Mail, Save, Trash2, Shield, 
    Check, X, Copy, RefreshCw 
} from 'lucide-react';
// Removed import AppLayout from './AppLayout';
import { useWorkspace } from '../context/WorkspaceContext';
import IntegrationsSettings from './IntegrationsSettings';

const WorkspaceSettings = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { workspaces, refreshWorkspaces } = useWorkspace();
    
    // State
    const [workspace, setWorkspace] = useState(null);
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [activeTab, setActiveTab] = useState('general'); // general, members

    // Effect to set active tab from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['general', 'members'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Current user's info (from localStorage)
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    useEffect(() => {
        if (id && currentUser) {
            fetchData();
        }
    }, [id, currentUser?.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [wsRes, memRes, invRes] = await Promise.all([
                fetch(`/api/workspaces/${id}?userId=${currentUser.id}`),
                fetch(`/api/workspaces/${id}/members?userId=${currentUser.id}`),
                fetch(`/api/workspaces/${id}/invitations?userId=${currentUser.id}`)
            ]);

            if (wsRes.ok) setWorkspace(await wsRes.json());
            if (memRes.ok) setMembers(await memRes.json());
            if (invRes.ok) setInvitations(await invRes.json());
            
        } catch (error) {
            console.error('Error fetching workspace data:', error);
            setMessage({ type: 'error', text: 'Failed to load workspace data' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateWorkspace = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/workspaces/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: workspace.name,
                    description: workspace.description,
                    logo: workspace.logo,
                    currency: workspace.currency,
                    userId: currentUser.id
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Workspace updated successfully' });
                refreshWorkspaces();
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update workspace' });
        } finally {
            setSaving(false);
        }
    };

    const [inviting, setInviting] = useState(false); // Add this state

    const handleInvite = async (e) => {
        e.preventDefault();
        console.log('Sending invitation to:', inviteEmail);
        
        if (!inviteEmail) return;
        
        setInviting(true);
        try {
            const res = await fetch(`/api/workspaces/${id}/invitations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: inviteEmail,
                    userId: currentUser.id,
                    role: 'member'
                })
            });

            console.log('Invite response status:', res.status);

            if (res.ok) {
                setInviteEmail('');
                setMessage({ type: 'success', text: 'Invitation sent' });
                fetchData(); // Refresh lists
            } else {
                const data = await res.json();
                console.error('Invite error:', data);
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Handle Invite Error:', error);
            setMessage({ type: 'error', text: error.message });
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            const res = await fetch(`/api/workspaces/${id}/members/${memberId}?userId=${currentUser.id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleRevokeInvitation = async (invitationId) => {
        try {
            const res = await fetch(`/api/workspaces/${id}/invitations/${invitationId}?userId=${currentUser.id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <>
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        </>
    );

    if (!workspace) return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">Workspace not found</div>
        </>
    );

    const isOwner = workspace.userRole === 'owner';
    const isAdmin = ['owner', 'admin'].includes(workspace.userRole);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
            <div className="max-w-4xl mx-auto p-6">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-violet-500/20">
                        {workspace.logo || '🏢'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{workspace.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400">Settings & Members</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-8">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                            activeTab === 'general' 
                                ? 'text-violet-600 dark:text-violet-400' 
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        General
                        {activeTab === 'general' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                            activeTab === 'members' 
                                ? 'text-violet-600 dark:text-violet-400' 
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Members & Invitations
                        {activeTab === 'members' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('integrations')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                            activeTab === 'integrations' 
                                ? 'text-violet-600 dark:text-violet-400' 
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Integrations
                        {activeTab === 'integrations' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Messages */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                        {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
                        {message.text}
                    </div>
                )}

                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Building size={20} className="text-violet-500" />
                                Workspace Details
                            </h3>
                            
                            <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Workspace Name
                                    </label>
                                    <input 
                                        type="text" 
                                        value={workspace.name}
                                        onChange={(e) => setWorkspace({...workspace, name: e.target.value})}
                                        disabled={!isAdmin}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none dark:text-white transition-all disabled:opacity-60"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea 
                                        rows={3}
                                        value={workspace.description || ''}
                                        onChange={(e) => setWorkspace({...workspace, description: e.target.value})}
                                        disabled={!isAdmin}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none dark:text-white transition-all resize-none disabled:opacity-60"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Logo Emoji
                                    </label>
                                    <div className="flex gap-3">
                                        {['🏢', '🚀', '💻', '🎨', '⚡️', '🌍', '🛠️', '🛒'].map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                disabled={!isAdmin}
                                                onClick={() => setWorkspace({...workspace, logo: emoji})}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all ${
                                                    workspace.logo === emoji 
                                                        ? 'bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-500' 
                                                        : 'bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Default Currency
                                    </label>
                                    <select
                                        value={workspace.currency || 'EUR'}
                                        onChange={(e) => setWorkspace({...workspace, currency: e.target.value})}
                                        disabled={!isAdmin}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all dark:text-white disabled:opacity-60"
                                    >
                                        <option value="EUR">Euro (€)</option>
                                        <option value="USD">US Dollar ($)</option>
                                        <option value="GBP">British Pound (£)</option>
                                        <option value="JPY">Japanese Yen (¥)</option>
                                        <option value="CHF">Swiss Franc (Fr)</option>
                                    </select>
                                </div>

                                {isAdmin && (
                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {isOwner && (
                            <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 p-6">
                                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                                    <Trash2 size={20} />
                                    Danger Zone
                                </h3>
                                <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">
                                    Once you delete a workspace, there is no going back. Please be certain.
                                </p>
                                <button className="px-4 py-2 bg-white dark:bg-[#0d1117] border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    Delete Workspace
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* MEMBERS TAB */}
                {activeTab === 'members' && (
                    <div className="space-y-8">
                        
                        {/* Invite Form */}
                        {isAdmin && (
                            <div className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Mail size={20} className="text-violet-500" />
                                    Invite Team Members
                                </h3>
                                <form onSubmit={handleInvite} className="flex gap-3">
                                    <input 
                                        type="email" 
                                        required
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="colleague@example.com"
                                        className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none dark:text-white"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={inviting} // Add disabled
                                        className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {inviting ? 'Sending...' : 'Send Invite'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Members List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Users size={20} className="text-gray-400" />
                                Current Members ({members.length})
                            </h3>
                            
                            <div className="grid gap-3">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-gray-700 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {member.user.avatar ? (
                                                    <img src={member.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    member.user.name?.charAt(0) || 'U'
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{member.user.name}</p>
                                                <p className="text-sm text-gray-500">{member.user.email}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                member.role === 'owner' 
                                                    ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                                                    : member.role === 'admin'
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                                    : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                            }`}>
                                                {member.role}
                                            </span>
                                            
                                            {isAdmin && member.userId !== currentUser.id && (
                                                <button 
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Remove member"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pending Invitations */}
                        {invitations.length > 0 && isAdmin && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Mail size={20} className="text-gray-400" />
                                    Pending Invitations ({invitations.length})
                                </h3>
                                
                                <div className="grid gap-3">
                                    {invitations.map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-gray-700 rounded-xl border-dashed">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                                                    <Mail size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{inv.email}</p>
                                                    <p className="text-sm text-gray-500">Expires in 7 days</p>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleRevokeInvitation(inv.id)}
                                                className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* INTEGRATIONS TAB */}
                {activeTab === 'integrations' && (
                    <div className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                        <IntegrationsSettings userId={currentUser.id} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceSettings;
