import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Users, Search, Mail, Phone, MapPin, Calendar,
    Award, TrendingUp, CheckCircle, Clock, MoreVertical,
    UserPlus, Filter, Download
} from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useSocket } from '../hooks/useSocket';
import { useTasks } from '../hooks/useTasks';
import { useWorkspace } from '../context/WorkspaceContext';
import MobileNav from './MobileNav';

const TeamPage = ({ currentUser }) => {
    const navigate = useNavigate();
    const { currentWorkspace } = useWorkspace();
    const { socket } = useSocket(currentUser?.id);
    const { users, onlineUsers } = useUsers(socket);
    const { tasks } = useTasks(socket);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Calculate stats per user
    const getUserStats = (userId) => {
        const userTasks = tasks.filter(t => t.assigneeId === userId || t.ownerId === userId);
        const completed = userTasks.filter(t => t.status === 'done').length;
        const inProgress = userTasks.filter(t => t.status === 'doing').length;
        const total = userTasks.length;

        return {
            total,
            completed,
            inProgress,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' ? true :
            filterStatus === 'online' ? onlineUsers.some(u => u.id === user.id) :
                !onlineUsers.some(u => u.id === user.id);

        return matchesSearch && matchesStatus;
    });

    // Team global stats
    const teamStats = {
        total: users.length,
        online: onlineUsers.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'done').length
    };

    const darkMode = document.documentElement.classList.contains('dark');
    const theme = {
        bg: darkMode ? 'bg-[#0d1117]' : 'bg-[#faf9f7]',
        card: darkMode ? 'bg-[#21262d]' : 'bg-white',
        cardBorder: darkMode ? 'border-gray-700' : 'border-gray-200',
        text: darkMode ? 'text-gray-100' : 'text-gray-900',
        textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    };

    return (
        <div className={`min-h-screen ${theme.bg} pb-20 md:pb-0`}>
            {/* Header */}
            <div className={`${theme.card} border-b ${theme.cardBorder} sticky top-0 z-10`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Link to="/modern" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition md:hidden">
                                <ArrowLeft className={`w-5 h-5 ${theme.textMuted}`} />
                            </Link>
                            <div>
                                <h1 className={`text-2xl font-bold ${theme.text} flex items-center gap-2`}>
                                    <Users className="w-6 h-6 text-violet-600" />
                                    Team
                                </h1>
                                <p className={`text-sm ${theme.textMuted} mt-1`}>
                                    {teamStats.total} members • {teamStats.online} online
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                if (currentWorkspace) {
                                    navigate(`/workspaces/${currentWorkspace.id}?tab=members`);
                                } else {
                                    alert("Please create or select a workspace first to invite members.");
                                }
                            }}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                        >
                            <UserPlus className="w-4 h-4" />
                            Invite
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search team members..."
                                className={`w-full pl-10 pr-4 py-2 border ${theme.cardBorder} ${theme.card} ${theme.text} rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className={`px-4 py-2 border ${theme.cardBorder} ${theme.card} ${theme.text} rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                            >
                                <option value="all">All</option>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </select>
                            <button className={`p-2 border ${theme.cardBorder} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition`}>
                                <Download className={`w-5 h-5 ${theme.textMuted}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<Users className="w-5 h-5 text-blue-600" />}
                        label="Members"
                        value={teamStats.total}
                        bg="bg-blue-50 dark:bg-blue-900/30"
                        darkMode={darkMode}
                    />
                    <StatCard
                        icon={<div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />}
                        label="Online"
                        value={teamStats.online}
                        bg="bg-emerald-50 dark:bg-emerald-900/30"
                        darkMode={darkMode}
                    />
                    <StatCard
                        icon={<CheckCircle className="w-5 h-5 text-violet-600" />}
                        label="Tasks Completed"
                        value={teamStats.completedTasks}
                        bg="bg-violet-50 dark:bg-violet-900/30"
                        darkMode={darkMode}
                    />
                    <StatCard
                        icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
                        label="Completion Rate"
                        value={`${teamStats.totalTasks > 0 ? Math.round((teamStats.completedTasks / teamStats.totalTasks) * 100) : 0}%`}
                        bg="bg-amber-50 dark:bg-amber-900/30"
                        darkMode={darkMode}
                    />
                </div>

                {/* Team Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map(user => {
                        const stats = getUserStats(user.id);
                        const isOnline = onlineUsers.some(u => u.id === user.id);

                        return (
                            <div key={user.id} className={`${theme.card} rounded-xl border ${theme.cardBorder} p-6 hover:shadow-lg transition`}>
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {user.avatar || user.name.charAt(0)}
                                            </div>
                                            {isOnline && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold ${theme.text}`}>{user.name}</h3>
                                            <p className={`text-xs ${theme.textMuted}`}>
                                                {isOnline ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                                        <MoreVertical className={`w-4 h-4 ${theme.textMuted}`} />
                                    </button>
                                </div>

                                {/* Contact Info */}
                                {user.email && (
                                    <div className={`flex items-center gap-2 text-sm ${theme.textMuted} mb-2`}>
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                )}

                                {/* Stats */}
                                <div className={`mt-4 pt-4 border-t ${theme.cardBorder}`}>
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div>
                                            <div className={`text-lg font-bold ${theme.text}`}>{stats.total}</div>
                                            <div className={`text-xs ${theme.textMuted}`}>Tasks</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-emerald-600">{stats.completed}</div>
                                            <div className={`text-xs ${theme.textMuted}`}>Done</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-blue-600">{stats.inProgress}</div>
                                            <div className={`text-xs ${theme.textMuted}`}>Active</div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-3">
                                        <div className={`flex items-center justify-between text-xs ${theme.textMuted} mb-1`}>
                                            <span>Progress</span>
                                            <span className="font-semibold">{stats.completionRate}%</span>
                                        </div>
                                        <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full h-2`}>
                                            <div
                                                className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all"
                                                style={{ width: `${stats.completionRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Badge */}
                                {user.isAdmin && (
                                    <div className="mt-3 flex items-center gap-2 text-xs">
                                        <Award className="w-4 h-4 text-amber-500" />
                                        <span className="text-amber-700 dark:text-amber-400 font-medium">Administrator</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className={`w-16 h-16 ${theme.textMuted} mx-auto mb-4`} />
                        <h3 className={`text-lg font-semibold ${theme.text} mb-2`}>No members found</h3>
                        <p className={theme.textMuted}>Try adjusting your search filters</p>
                    </div>
                )}
            </div>

            <MobileNav />
        </div>
    );
};

const StatCard = ({ icon, label, value, bg, darkMode }) => (
    <div className={`${bg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
                {icon}
            </div>
            <div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{value}</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</div>
            </div>
        </div>
    </div>
);

export default TeamPage;
