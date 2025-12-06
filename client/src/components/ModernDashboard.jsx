import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Layout, Search, Bell, Plus, Briefcase, User, Zap, ChevronRight,
    FileText, Settings, Users, Sparkles, Lock, Globe, Share2, Eye,
    MessageSquare, Loader, LayoutGrid, List, Menu, X, CheckSquare, Euro, Trash2, Star
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useUsers } from '../hooks/useUsers';
import { useSocket } from '../hooks/useSocket';
import { useExpenses } from '../hooks/useExpenses';
import { useQuickTodos } from '../hooks/useQuickTodos';
import TaskDetailModal from './TaskDetailModal';
import SearchModal from './SearchModal';
import ExpenseModal from './ExpenseModal';
import MobileNav from './MobileNav';
import KanbanBoard from './KanbanBoard';

const ModernDashboard = ({ currentUser }) => {
    const { socket } = useSocket(currentUser?.id);
    const { tasks, createTask, updateTask, deleteTask } = useTasks(socket);
    const { users, onlineUsers } = useUsers(socket);
    const { expenses, stats: expenseStats, addExpense } = useExpenses(currentUser);
    const { todos, addTodo, toggleTodo, deleteTodo } = useQuickTodos(currentUser);

    const [activeTab, setActiveTab] = useState('all');
    const [selectedTask, setSelectedTask] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [newTodoContent, setNewTodoContent] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' ou 'kanban'
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('flowspace_favorites');
        return saved ? JSON.parse(saved) : [];
    });
    const [showAddFavorite, setShowAddFavorite] = useState(false);
    const [newFavorite, setNewFavorite] = useState({ title: '', url: '' });

    // Raccourci clavier pour la recherche
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Séparer les tâches
    const privateTasks = tasks.filter(t => !t.isPublic && t.userId === currentUser?.id);
    const publicTasks = tasks.filter(t => t.isPublic);
    const pendingTasks = privateTasks.filter(t => t.status !== 'done');

    // Statistiques
    const stats = {
        personalTasks: `${pendingTasks.length} en attente`,
        teamUpdates: `${publicTasks.length} nouvelles`,
        docsReviewed: tasks.length > 0
            ? `${Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)}% complété`
            : '0% complété'
    };

    // Activités récentes
    const recentActivities = publicTasks
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 4)
        .map(task => ({
            user: task.owner?.name || task.user?.name || 'Utilisateur',
            action: task.status === 'done' ? 'a terminé' : 'a publié',
            target: task.title,
            time: formatRelativeTime(task.updatedAt),
            isAi: false
        }));

    const handleCreateTask = () => {
        setIsCreating(true);
    };

    return (
        <div className="flex h-screen w-full bg-white text-slate-900 font-sans overflow-hidden">

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-40 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                    <Menu className="w-6 h-6 text-slate-700" />
                </button>
                <h1 className="text-lg font-bold text-slate-900">FlowSpace</h1>
                <button
                    onClick={() => setShowSearch(true)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                    <Search className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            {/* Sidebar Overlay (mobile) */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <div className={`
                w-64 bg-slate-50 border-r border-slate-200 flex flex-col
                md:relative fixed inset-y-0 left-0 z-50 transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo / Workspace Switcher */}
                <div className="p-4 flex items-center gap-3 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                    <div>
                        <h2 className="text-sm font-bold">FlowSpace</h2>
                        <p className="text-xs text-slate-500">Plan Entreprise</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                </div>

                {/* Navigation Sections */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">

                    {/* Section: Espace Personnel */}
                    <div>
                        <div className="flex items-center px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <User className="w-3 h-3 mr-2" /> Mon Espace
                        </div>
                        <ul className="space-y-1">
                            <NavItem icon={<Sparkles className="w-4 h-4 text-indigo-500" />} label="Ma Journée" active to="/modern" />
                            <NavItem icon={<FileText className="w-4 h-4" />} label="Mes Pages" to="/my-pages" />
                            <NavItem icon={<Lock className="w-4 h-4" />} label="Brouillons" badge={privateTasks.length.toString()} to="/drafts" />
                            <NavItem icon={<Euro className="w-4 h-4" />} label="Dépenses" to="/expenses" />
                        </ul>
                    </div>

                    {/* Section: Espace Entreprise */}
                    <div>
                        <div className="flex items-center px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <Briefcase className="w-3 h-3 mr-2" /> Entreprise
                        </div>
                        <ul className="space-y-1">
                            <NavItem icon={<Layout className="w-4 h-4" />} label="Dashboard Général" to="/dashboard-general" />
                            <NavItem icon={<Users className="w-4 h-4" />} label="Équipe" badge={onlineUsers.length.toString()} to="/team" />
                            <NavItem icon={<Globe className="w-4 h-4" />} label="Wiki Public" to="/wiki" />
                        </ul>
                    </div>

                    {/* Section: Favoris */}
                    <div>
                        <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Favoris</span>
                            <button
                                onClick={() => setShowAddFavorite(!showAddFavorite)}
                                className="p-1 hover:bg-slate-100 rounded transition"
                                title="Ajouter un favori"
                            >
                                <Plus className="w-3 h-3 text-slate-500" />
                            </button>
                        </div>

                        {showAddFavorite && (
                            <div className="px-2 mb-2 space-y-2">
                                <input
                                    type="text"
                                    placeholder="Titre"
                                    value={newFavorite.title}
                                    onChange={(e) => setNewFavorite({ ...newFavorite, title: e.target.value })}
                                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="URL (ex: /wiki)"
                                    value={newFavorite.url}
                                    onChange={(e) => setNewFavorite({ ...newFavorite, url: e.target.value })}
                                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={() => {
                                        if (newFavorite.title && newFavorite.url) {
                                            const updated = [...favorites, { ...newFavorite, id: Date.now() }];
                                            setFavorites(updated);
                                            localStorage.setItem('flowspace_favorites', JSON.stringify(updated));
                                            setNewFavorite({ title: '', url: '' });
                                            setShowAddFavorite(false);
                                        }
                                    }}
                                    className="w-full px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                                >
                                    Ajouter
                                </button>
                            </div>
                        )}

                        <ul className="space-y-1">
                            {favorites.map((fav) => (
                                <div key={fav.id} className="group relative">
                                    <NavItem
                                        icon={<Star className="w-4 h-4 text-amber-500" />}
                                        label={fav.title}
                                        to={fav.url}
                                    />
                                    <button
                                        onClick={() => {
                                            const updated = favorites.filter(f => f.id !== fav.id);
                                            setFavorites(updated);
                                            localStorage.setItem('flowspace_favorites', JSON.stringify(updated));
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition"
                                        title="Supprimer"
                                    >
                                        <X className="w-3 h-3 text-red-600" />
                                    </button>
                                </div>
                            ))}
                            {favorites.length === 0 && !showAddFavorite && (
                                <li className="px-2 py-2 text-xs text-slate-400 italic">
                                    Aucun favori. Cliquez sur + pour en ajouter.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-200">
                    <Link to="/profile" className="flex items-center gap-3 text-sm font-medium text-slate-600 cursor-pointer hover:text-indigo-600 mb-4">
                        <Settings className="w-4 h-4" /> Paramètres
                    </Link>

                    {/* AI Assistant Promo */}
                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-bold text-indigo-700">AI Assistant</span>
                            <span className="ml-auto px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full">PRO</span>
                        </div>
                        <p className="text-[10px] text-indigo-600 leading-tight mb-2">
                            Résumés automatiques, suggestions intelligentes.
                        </p>
                        <button className="w-full py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition">
                            Activer (10€/mois)
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-white pt-14 md:pt-0">

                {/* Top Navigation Bar (Desktop only) */}
                <header className="hidden md:flex h-14 border-b border-slate-200 items-center justify-between px-6 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="hover:text-slate-900 cursor-pointer">FlowSpace</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-900 font-medium">Ma Journée</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search Bar */}
                        <div className="relative group">
                            <div
                                onClick={() => setShowSearch(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md text-slate-500 text-sm cursor-pointer border border-transparent hover:border-slate-300 transition w-64"
                            >
                                <Search className="w-4 h-4" />
                                <span>Rechercher (⌘K)</span>
                            </div>
                        </div>

                        {/* Notifications */}
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* User Avatar */}
                        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full border-2 border-white shadow-sm cursor-pointer flex items-center justify-center text-white text-sm font-bold">
                            {currentUser?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                {/* Main Content Scroll Area */}
                <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-20 md:pb-6">

                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bonjour, {currentUser?.name || 'Utilisateur'} 👋</h1>
                        <p className="text-slate-500">Voici ce qui se passe dans votre workspace hybride aujourd'hui.</p>
                    </div>

                    {/* KPI / Quick Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <StatCard
                            title="Tâches Personnelles"
                            value={stats.personalTasks}
                            icon={<User className="w-5 h-5 text-emerald-600" />}
                            bg="bg-emerald-50"
                            border="border-emerald-100"
                        />
                        <StatCard
                            title="Mises à jour d'Équipe"
                            value={stats.teamUpdates}
                            icon={<Users className="w-5 h-5 text-blue-600" />}
                            bg="bg-blue-50"
                            border="border-blue-100"
                        />
                        <StatCard
                            title="Documents Partagés"
                            value={stats.docsReviewed}
                            icon={<Briefcase className="w-5 h-5 text-indigo-600" />}
                            bg="bg-indigo-50"
                            border="border-indigo-100"
                        />
                    </div>

                    {/* Split View: Personal vs Company */}
                    <div className="flex flex-col lg:flex-row gap-8 h-full">

                        {/* Left: Personal Context */}
                        <div className="flex-1 flex flex-col h-full min-h-0">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-slate-400" />
                                    Mon Espace Privé
                                </h3>
                                <div className="flex items-center gap-3">
                                    {/* View Toggle */}
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                            title="Vue Liste"
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('kanban')}
                                            className={`p-1.5 rounded-md transition ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                            title="Vue Kanban"
                                        >
                                            <LayoutGrid className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleCreateTask}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Nouveau
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0">
                                {viewMode === 'kanban' ? (
                                    <KanbanBoard
                                        tasks={privateTasks}
                                        onTaskClick={setSelectedTask}
                                        onStatusChange={(taskId, newStatus) => updateTask(taskId, { status: newStatus })}
                                    />
                                ) : (
                                    <div className="space-y-3">
                                        {privateTasks.length === 0 ? (
                                            <div className="bg-white p-8 rounded-lg border border-slate-200 text-center">
                                                <Lock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                <p className="text-slate-500 mb-4">Aucune tâche privée</p>
                                                <button
                                                    onClick={handleCreateTask}
                                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition"
                                                >
                                                    Créer ma première tâche
                                                </button>
                                            </div>
                                        ) : (
                                            privateTasks.slice(0, viewMode === 'list' ? undefined : 4).map((task) => (
                                                <DocCard
                                                    key={task.id}
                                                    title={task.title}
                                                    tag={task.status === 'done' ? 'Terminé' : task.status === 'doing' ? 'En cours' : 'Brouillon'}
                                                    time={formatRelativeTime(task.updatedAt)}
                                                    private
                                                    views={0}
                                                    comments={task.comments?.length || 0}
                                                    onClick={() => setSelectedTask(task)}
                                                    color={task.color}
                                                    icon={task.icon}
                                                />
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Widget: Quick Todos */}
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4 text-slate-400" />
                                        Quick Todos
                                    </h3>
                                </div>
                                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                    <div className="p-3 border-b border-slate-100 bg-slate-50">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newTodoContent}
                                                onChange={(e) => setNewTodoContent(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && newTodoContent.trim()) {
                                                        addTodo(newTodoContent);
                                                        setNewTodoContent('');
                                                    }
                                                }}
                                                placeholder="Ajouter une tâche rapide..."
                                                className="flex-1 bg-white border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (newTodoContent.trim()) {
                                                        addTodo(newTodoContent);
                                                        setNewTodoContent('');
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                                        {todos.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-slate-400">
                                                Aucune tâche rapide
                                            </div>
                                        ) : (
                                            todos.map(todo => (
                                                <div key={todo.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 group">
                                                    <button
                                                        onClick={() => toggleTodo(todo.id)}
                                                        className={`w-4 h-4 rounded border flex items-center justify-center transition ${todo.completed
                                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                                            : 'border-slate-300 hover:border-indigo-500'
                                                            }`}
                                                    >
                                                        {todo.completed && <CheckSquare className="w-3 h-3" />}
                                                    </button>
                                                    <span className={`text-sm flex-1 ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                        {todo.content}
                                                    </span>
                                                    <button
                                                        onClick={() => deleteTodo(todo.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Company Context */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-slate-400" />
                                    Activité de l'Entreprise
                                </h3>
                                <button className="text-sm text-indigo-600 font-medium hover:underline">
                                    Voir tout
                                </button>
                            </div>

                            <div className="space-y-4">
                                {recentActivities.map((activity, index) => (
                                    <div key={index} className="flex gap-3 items-start p-3 rounded-lg hover:bg-slate-50 transition">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 mt-1">
                                            {activity.user.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-900">
                                                <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-medium text-indigo-600">{activity.target}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentActivities.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        Aucune activité récente
                                    </div>
                                )}
                            </div>

                            {/* Widget: Team Status */}
                            <div className="mt-8">
                                <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                                    <Users className="w-4 h-4 text-slate-400" />
                                    En ligne ({onlineUsers.length})
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {onlineUsers.map(user => (
                                        <div key={user.id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-medium text-slate-700">{user.name}</span>
                                        </div>
                                    ))}
                                    {onlineUsers.length === 0 && (
                                        <span className="text-sm text-slate-500">Personne en ligne</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </main>

                {/* Mobile Navigation */}
                <MobileNav />
            </div>

            {/* Modals */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    currentUser={currentUser}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                />
            )}

            {isCreating && (
                <TaskDetailModal
                    currentUser={currentUser}
                    onClose={() => setIsCreating(false)}
                    onCreate={createTask}
                />
            )}

            <SearchModal
                isOpen={showSearch}
                onClose={() => setShowSearch(false)}
                tasks={tasks}
                onTaskClick={(task) => {
                    setSelectedTask(task);
                    setShowSearch(false);
                }}
            />

            {showExpenseModal && (
                <ExpenseModal
                    isOpen={showExpenseModal}
                    onClose={() => setShowExpenseModal(false)}
                    onAdd={addExpense}
                />
            )}

        </div>
    );
};

// Helper Components
const NavItem = ({ icon, label, badge, active, to }) => {
    const content = (
        <div className={`
            flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition group
            ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
        `}>
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </div>
            {badge && (
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full group-hover:bg-slate-300 transition">
                    {badge}
                </span>
            )}
        </div>
    );

    if (to) {
        return <Link to={to}>{content}</Link>;
    }

    return content;
};

const StatCard = ({ title, value, icon, bg, border }) => (
    <div className={`p-4 rounded-xl border ${bg} ${border} flex items-start justify-between transition hover:shadow-md`}>
        <div>
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className="p-2 bg-white rounded-lg shadow-sm">
            {icon}
        </div>
    </div>
);

const DocCard = ({ title, tag, time, private: isPrivate, views, comments, onClick, color, icon }) => (
    <div
        onClick={onClick}
        className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition cursor-pointer relative overflow-hidden"
    >
        {color && (
            <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: color }}
            />
        )}

        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color ? 'bg-opacity-10' : 'bg-slate-100'} text-slate-500`} style={{ backgroundColor: color ? `${color}20` : undefined }}>
                {icon ? (
                    <span className="material-icons" style={{ fontSize: '20px', color: color || undefined }}>{icon}</span>
                ) : (
                    isPrivate ? <Lock className="w-5 h-5" /> : <FileText className="w-5 h-5" />
                )}
            </div>
            <div>
                <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">{title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${tag === 'Terminé' ? 'bg-emerald-100 text-emerald-700' :
                        tag === 'En cours' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                        {tag}
                    </span>
                    <span>• {time}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
            {comments > 0 && (
                <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">{comments}</span>
                </div>
            )}
            <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    </div>
);

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
}

export default ModernDashboard;