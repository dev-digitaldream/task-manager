import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, TrendingUp, Users, CheckCircle, Clock,
    Target, Award, Activity, Calendar, BarChart3,
    ArrowUpRight, ArrowDownRight, Zap, Star, Flag
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useUsers } from '../hooks/useUsers';
import { useSocket } from '../hooks/useSocket';
import MobileNav from './MobileNav';

const DashboardPage = ({ currentUser }) => {
    const { socket } = useSocket(currentUser?.id);
    const { tasks } = useTasks(socket);
    const { users, onlineUsers } = useUsers(socket);
    const [timeRange, setTimeRange] = useState('week'); // week, month, year

    // Calculs des statistiques
    const stats = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const completedTasks = tasks.filter(t => t.status === 'done');
        const inProgressTasks = tasks.filter(t => t.status === 'doing');
        const todoTasks = tasks.filter(t => t.status === 'todo');

        // Tâches complétées cette semaine
        const completedThisWeek = completedTasks.filter(t =>
            new Date(t.updatedAt) > weekAgo
        ).length;

        // Tâches complétées le mois dernier
        const completedLastMonth = completedTasks.filter(t => {
            const date = new Date(t.updatedAt);
            return date < weekAgo && date > monthAgo;
        }).length;

        // Calcul du taux de complétion
        const completionRate = tasks.length > 0
            ? Math.round((completedTasks.length / tasks.length) * 100)
            : 0;

        // Productivité (tâches/jour cette semaine)
        const productivity = (completedThisWeek / 7).toFixed(1);

        // Tendance
        const trend = completedThisWeek > completedLastMonth ? 'up' : 'down';
        const trendPercentage = completedLastMonth > 0
            ? Math.round(((completedThisWeek - completedLastMonth) / completedLastMonth) * 100)
            : 0;

        return {
            total: tasks.length,
            completed: completedTasks.length,
            inProgress: inProgressTasks.length,
            todo: todoTasks.length,
            completedThisWeek,
            completionRate,
            productivity,
            trend,
            trendPercentage: Math.abs(trendPercentage),
            activeUsers: onlineUsers.length,
            totalUsers: users.length
        };
    }, [tasks, users, onlineUsers]);

    // Activité récente
    const recentActivity = useMemo(() => {
        return tasks
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 10)
            .map(task => {
                const user = users.find(u => u.id === task.ownerId);
                return {
                    id: task.id,
                    title: task.title,
                    user: user?.name || 'Inconnu',
                    avatar: user?.avatar || '👤',
                    action: task.status === 'done' ? 'a terminé' : 'a mis à jour',
                    time: formatTimeAgo(task.updatedAt),
                    status: task.status
                };
            });
    }, [tasks, users]);

    // Top contributeurs
    const topContributors = useMemo(() => {
        const contributions = {};
        tasks.forEach(task => {
            if (task.status === 'done') {
                const ownerId = task.ownerId;
                contributions[ownerId] = (contributions[ownerId] || 0) + 1;
            }
        });

        return Object.entries(contributions)
            .map(([userId, count]) => {
                const user = users.find(u => u.id === userId);
                return {
                    id: userId,
                    name: user?.name || 'Inconnu',
                    avatar: user?.avatar || '👤',
                    count
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [tasks, users]);

    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
        if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;
        return date.toLocaleDateString('fr-FR');
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/modern"
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Dashboard Général</h1>
                                <p className="text-sm text-slate-500 mt-1 hidden md:block">
                                    Vue d'ensemble de l'activité de l'équipe
                                </p>
                            </div>
                        </div>

                        {/* Time Range Selector */}
                        <div className="hidden md:flex gap-2 bg-slate-100 p-1 rounded-lg">
                            {['week', 'month', 'year'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${timeRange === range
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    {range === 'week' ? 'Semaine' : range === 'month' ? 'Mois' : 'Année'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                    {/* Total Tasks */}
                    <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">Total Tâches</span>
                            <BarChart3 className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl md:text-3xl font-bold text-slate-900">{stats.total}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Toutes les tâches de l'équipe</p>
                    </div>

                    {/* Completed */}
                    <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-4 md:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-emerald-700">Terminées</span>
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl md:text-3xl font-bold text-emerald-700">{stats.completed}</span>
                            <span className="text-xs text-emerald-600 mb-1">{stats.completionRate}%</span>
                        </div>
                        <p className="text-xs text-emerald-600 mt-2">Tâches accomplies avec succès</p>
                    </div>

                    {/* In Progress */}
                    <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 md:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-blue-700">En cours</span>
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl md:text-3xl font-bold text-blue-700">{stats.inProgress}</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">Tâches en cours de réalisation</p>
                    </div>

                    {/* Active Users */}
                    <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-4 md:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-indigo-700">Utilisateurs</span>
                            <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl md:text-3xl font-bold text-indigo-700">{stats.activeUsers}</span>
                            <span className="text-xs text-indigo-600 mb-1">/ {stats.totalUsers}</span>
                        </div>
                        <p className="text-xs text-indigo-600 mt-2">Membres actifs en ce moment</p>
                    </div>
                </div>

                {/* Performance & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Performance Card */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-bold text-slate-900">Performance de l'équipe</h2>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stats.trend === 'up'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {stats.trend === 'up' ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3" />
                                )}
                                {stats.trendPercentage}%
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Indicateurs clés de productivité de votre équipe</p>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm text-slate-600">Productivité</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{stats.productivity}</div>
                                <div className="text-xs text-slate-500 mt-1">tâches/jour</div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-indigo-500" />
                                    <span className="text-sm text-slate-600">Taux de complétion</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{stats.completionRate}%</div>
                                <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${stats.completionRate}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cette semaine */}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Cette semaine</span>
                                <span className="text-2xl font-bold text-slate-900">{stats.completedThisWeek}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">tâches terminées</div>
                        </div>
                    </div>

                    {/* Top Contributors */}
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-bold text-slate-900">Top Contributeurs</h2>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Les membres les plus actifs de l'équipe</p>

                        <div className="space-y-3">
                            {topContributors.map((contributor, index) => (
                                <div key={contributor.id} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                        index === 1 ? 'bg-slate-100 text-slate-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-50 text-slate-600'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
                                        {contributor.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-900 truncate">
                                            {contributor.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {contributor.count} tâches
                                        </div>
                                    </div>
                                    {index === 0 && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-slate-900">Activité Récente</h2>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Les 10 dernières actions de l'équipe en temps réel</p>

                    <div className="space-y-3">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                                    {activity.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm">
                                        <span className="font-medium text-slate-900">{activity.user}</span>
                                        <span className="text-slate-600"> {activity.action} </span>
                                        <span className="font-medium text-slate-900">{activity.title}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">{activity.time}</div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${activity.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                                    activity.status === 'doing' ? 'bg-blue-100 text-blue-700' :
                                        'bg-slate-100 text-slate-700'
                                    }`}>
                                    {activity.status === 'done' ? 'Terminé' :
                                        activity.status === 'doing' ? 'En cours' : 'À faire'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
};

export default DashboardPage;
