import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Users, Search, Mail, Phone, MapPin, Calendar,
    Award, TrendingUp, CheckCircle, Clock, MoreVertical,
    UserPlus, Filter, Download
} from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useSocket } from '../hooks/useSocket';
import { useTasks } from '../hooks/useTasks';
import MobileNav from './MobileNav';

const TeamPage = ({ currentUser }) => {
    const { socket } = useSocket(currentUser?.id);
    const { users, onlineUsers } = useUsers(socket);
    const { tasks } = useTasks(socket);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, online, offline

    // Calculer les stats par utilisateur
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

    // Filtrer les utilisateurs
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' ? true :
            filterStatus === 'online' ? onlineUsers.some(u => u.id === user.id) :
                !onlineUsers.some(u => u.id === user.id);

        return matchesSearch && matchesStatus;
    });

    // Stats globales de l'équipe
    const teamStats = {
        total: users.length,
        online: onlineUsers.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'done').length
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Link to="/modern" className="p-2 hover:bg-slate-100 rounded-lg transition md:hidden">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="w-6 h-6 text-indigo-600" />
                                    Équipe
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    {teamStats.total} membres • {teamStats.online} en ligne
                                </p>
                            </div>
                        </div>
                        <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                            <UserPlus className="w-4 h-4" />
                            Inviter
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher un membre..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="all">Tous</option>
                                <option value="online">En ligne</option>
                                <option value="offline">Hors ligne</option>
                            </select>
                            <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                                <Download className="w-5 h-5 text-slate-600" />
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
                        label="Membres"
                        value={teamStats.total}
                        bg="bg-blue-50"
                    />
                    <StatCard
                        icon={<div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />}
                        label="En ligne"
                        value={teamStats.online}
                        bg="bg-emerald-50"
                    />
                    <StatCard
                        icon={<CheckCircle className="w-5 h-5 text-indigo-600" />}
                        label="Tâches terminées"
                        value={teamStats.completedTasks}
                        bg="bg-indigo-50"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
                        label="Taux de complétion"
                        value={`${teamStats.totalTasks > 0 ? Math.round((teamStats.completedTasks / teamStats.totalTasks) * 100) : 0}%`}
                        bg="bg-amber-50"
                    />
                </div>

                {/* Team Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map(user => {
                        const stats = getUserStats(user.id);
                        const isOnline = onlineUsers.some(u => u.id === user.id);

                        return (
                            <div key={user.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {user.avatar || user.name.charAt(0)}
                                            </div>
                                            {isOnline && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{user.name}</h3>
                                            <p className="text-xs text-slate-500">
                                                {isOnline ? 'En ligne' : 'Hors ligne'}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-1 hover:bg-slate-100 rounded transition">
                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>

                                {/* Contact Info */}
                                {user.email && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div>
                                            <div className="text-lg font-bold text-slate-900">{stats.total}</div>
                                            <div className="text-xs text-slate-500">Tâches</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-emerald-600">{stats.completed}</div>
                                            <div className="text-xs text-slate-500">Terminées</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-blue-600">{stats.inProgress}</div>
                                            <div className="text-xs text-slate-500">En cours</div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                                            <span>Progression</span>
                                            <span className="font-semibold">{stats.completionRate}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                                                style={{ width: `${stats.completionRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Badge */}
                                {user.isAdmin && (
                                    <div className="mt-3 flex items-center gap-2 text-xs">
                                        <Award className="w-4 h-4 text-amber-500" />
                                        <span className="text-amber-700 font-medium">Administrateur</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun membre trouvé</h3>
                        <p className="text-slate-500">Essayez de modifier vos filtres de recherche</p>
                    </div>
                )}
            </div>

            <MobileNav />
        </div>
    );
};

const StatCard = ({ icon, label, value, bg }) => (
    <div className={`${bg} rounded-xl p-4 border border-slate-200`}>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-600">{label}</div>
            </div>
        </div>
    </div>
);

export default TeamPage;
