import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Search, Bell, Plus, Briefcase, User, Zap, ChevronRight, ChevronLeft,
    FileText, Settings, Users, Sparkles, Lock, Globe, Calendar, TrendingUp,
    MessageSquare, LayoutGrid, List, Menu, X, CheckSquare, Euro, Trash2, Star,
    Clock, ArrowUpRight, MoreHorizontal, Home, FolderOpen, Target
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
    const location = useLocation();
    const { socket } = useSocket(currentUser?.id);
    const { tasks, createTask, updateTask, deleteTask } = useTasks(socket);
    const { users, onlineUsers } = useUsers(socket);
    const { expenses, stats: expenseStats, addExpense } = useExpenses(currentUser);
    const { todos, addTodo, toggleTodo, deleteTodo } = useQuickTodos(currentUser);

    const [selectedTask, setSelectedTask] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [newTodoContent, setNewTodoContent] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [viewMode, setViewMode] = useState('list');

    // Keyboard shortcut for search
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

    // Task statistics
    const privateTasks = tasks.filter(t => !t.isPublic && t.userId === currentUser?.id);
    const publicTasks = tasks.filter(t => t.isPublic);
    const pendingTasks = privateTasks.filter(t => t.status !== 'done');
    const todayTasks = privateTasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        const today = new Date();
        return dueDate.toDateString() === today.toDateString();
    });

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    };

    // Recent activities
    const recentActivities = publicTasks
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map(task => ({
            user: task.owner?.name || task.user?.name || 'Utilisateur',
            avatar: task.owner?.avatar || task.user?.avatar || '👤',
            action: task.status === 'done' ? 'a terminé' : 'travaille sur',
            target: task.title,
            time: formatRelativeTime(task.updatedAt)
        }));

    return (
        <div className="flex h-screen w-full overflow-hidden">
            
            {/* ==========================================
                PREMIUM DARK SIDEBAR
               ========================================== */}
            
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`
                sidebar-premium fixed md:relative inset-y-0 left-0 z-50
                ${sidebarCollapsed ? 'w-20' : 'w-64'}
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                transition-all duration-300 ease-out
            `}>
                {/* Logo Section */}
                <div className="p-4 flex items-center gap-3 border-b border-slate-800">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
                        F
                    </div>
                    {!sidebarCollapsed && (
                        <div className="flex-1">
                            <h2 className="text-white font-bold">FlowSpaces</h2>
                            <p className="text-xs text-slate-500">Workspace Pro</p>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
                    >
                        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar dark-scrollbar">
                    
                    {/* Main Navigation */}
                    <div>
                        {!sidebarCollapsed && (
                            <p className="nav-section-title">Principal</p>
                        )}
                        <ul className="space-y-1">
                            <SidebarNavItem 
                                icon={<Home className="w-5 h-5" />} 
                                label="Accueil" 
                                to="/modern" 
                                active={location.pathname === '/modern'}
                                collapsed={sidebarCollapsed}
                            />
                            <SidebarNavItem 
                                icon={<Target className="w-5 h-5" />} 
                                label="Ma Journée" 
                                to="/modern" 
                                badge={todayTasks.length > 0 ? todayTasks.length : null}
                                collapsed={sidebarCollapsed}
                            />
                            <SidebarNavItem 
                                icon={<FolderOpen className="w-5 h-5" />} 
                                label="Mes Pages" 
                                to="/my-pages"
                                collapsed={sidebarCollapsed}
                            />
                            <SidebarNavItem 
                                icon={<Euro className="w-5 h-5" />} 
                                label="Dépenses" 
                                to="/expenses"
                                collapsed={sidebarCollapsed}
                            />
                        </ul>
                    </div>

                    {/* Workspace */}
                    <div>
                        {!sidebarCollapsed && (
                            <p className="nav-section-title">Workspace</p>
                        )}
                        <ul className="space-y-1">
                            <SidebarNavItem 
                                icon={<LayoutDashboard className="w-5 h-5" />} 
                                label="Dashboard" 
                                to="/dashboard-general"
                                collapsed={sidebarCollapsed}
                            />
                            <SidebarNavItem 
                                icon={<Users className="w-5 h-5" />} 
                                label="Équipe" 
                                to="/team"
                                badge={onlineUsers.length > 0 ? onlineUsers.length : null}
                                badgeColor="emerald"
                                collapsed={sidebarCollapsed}
                            />
                            <SidebarNavItem 
                                icon={<Globe className="w-5 h-5" />} 
                                label="Wiki" 
                                to="/wiki"
                                collapsed={sidebarCollapsed}
                            />
                            <SidebarNavItem 
                                icon={<Calendar className="w-5 h-5" />} 
                                label="Calendrier" 
                                to="/calendar"
                                collapsed={sidebarCollapsed}
                            />
                        </ul>
                    </div>

                </nav>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-slate-800 space-y-3">
                    {!sidebarCollapsed && (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-indigo-400" />
                                <span className="text-xs font-semibold text-indigo-300">AI Assistant</span>
                                <span className="ml-auto px-1.5 py-0.5 bg-indigo-500 text-white text-[9px] font-bold rounded">PRO</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mb-2">
                                Résumés automatiques et suggestions intelligentes.
                            </p>
                            <button className="w-full py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-500 transition">
                                Activer
                            </button>
                        </div>
                    )}
                    
                    <Link 
                        to="/profile" 
                        className={`flex items-center gap-3 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <Settings className="w-5 h-5" />
                        {!sidebarCollapsed && <span className="text-sm font-medium">Paramètres</span>}
                    </Link>
                </div>
            </aside>

            {/* ==========================================
                MAIN CONTENT AREA
               ========================================== */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
                    {/* Mobile Menu */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
                    >
                        <Menu className="w-5 h-5 text-slate-600" />
                    </button>

                    {/* Breadcrumb */}
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <span className="text-slate-400">FlowSpaces</span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                        <span className="text-slate-900 font-medium">Ma Journée</span>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <button
                            onClick={() => setShowSearch(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 text-sm transition"
                        >
                            <Search className="w-4 h-4" />
                            <span className="hidden md:inline">Rechercher</span>
                            <kbd className="hidden md:inline px-1.5 py-0.5 bg-white rounded text-[10px] text-slate-400 border border-slate-200">⌘K</kbd>
                        </button>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-xl hover:bg-slate-100 transition">
                            <Bell className="w-5 h-5 text-slate-600" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>

                        {/* User Avatar */}
                        <div className="avatar avatar-md avatar-gradient cursor-pointer">
                            {currentUser?.avatar || currentUser?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8 custom-scrollbar">
                    
                    {/* Greeting Header */}
                    <div className="greeting-header">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            {getGreeting()}, {currentUser?.name?.split(' ')[0] || 'Utilisateur'} 👋
                        </h1>
                        <p className="greeting-subtitle">
                            Voici un aperçu de votre journée. Vous avez <span className="font-semibold text-indigo-600">{pendingTasks.length} tâches</span> en attente.
                        </p>
                    </div>

                    {/* Bento Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-animation">
                        <BentoStatCard
                            title="Tâches du jour"
                            value={todayTasks.length}
                            subtitle="échéances aujourd'hui"
                            icon={<Target className="w-5 h-5 text-emerald-600" />}
                            color="mint"
                            trend="+2"
                            trendUp
                        />
                        <BentoStatCard
                            title="En attente"
                            value={pendingTasks.length}
                            subtitle="tâches à compléter"
                            icon={<Clock className="w-5 h-5 text-amber-600" />}
                            color="peach"
                        />
                        <BentoStatCard
                            title="Équipe"
                            value={onlineUsers.length}
                            subtitle="membres en ligne"
                            icon={<Users className="w-5 h-5 text-blue-600" />}
                            color="sky"
                        />
                        <BentoStatCard
                            title="Progression"
                            value={tasks.length > 0 ? `${Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)}%` : '0%'}
                            subtitle="tâches terminées"
                            icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                            color="lavender"
                        />
                    </div>

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Tasks Section - 2 columns */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Tasks Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-slate-400" />
                                        Mes Tâches
                                    </h2>
                                    <p className="text-sm text-slate-500">{privateTasks.length} tâches personnelles</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* View Toggle */}
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('kanban')}
                                            className={`p-2 rounded-md transition ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <LayoutGrid className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="btn-primary"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Nouvelle</span>
                                    </button>
                                </div>
                            </div>

                            {/* Tasks List or Kanban */}
                            <div className="bento-card bento-card-white p-0 overflow-hidden">
                                {viewMode === 'kanban' ? (
                                    <div className="p-4">
                                        <KanbanBoard
                                            tasks={privateTasks}
                                            onTaskClick={setSelectedTask}
                                            onStatusChange={(taskId, newStatus) => updateTask(taskId, { status: newStatus })}
                                        />
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {privateTasks.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                    <CheckSquare className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <p className="text-slate-500 mb-4">Aucune tâche pour le moment</p>
                                                <button onClick={() => setIsCreating(true)} className="btn-primary">
                                                    <Plus className="w-4 h-4" />
                                                    Créer une tâche
                                                </button>
                                            </div>
                                        ) : (
                                            privateTasks.map((task) => (
                                                <TaskRow
                                                    key={task.id}
                                                    task={task}
                                                    onClick={() => setSelectedTask(task)}
                                                />
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Quick Todos */}
                            <div className="bento-card bento-card-cream">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4 text-amber-600" />
                                        Quick Todos
                                    </h3>
                                    <span className="text-xs text-slate-500">
                                        {todos.filter(t => t.completed).length}/{todos.length} terminées
                                    </span>
                                </div>
                                
                                <div className="flex gap-2 mb-4">
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
                                        className="input-field"
                                    />
                                    <button
                                        onClick={() => {
                                            if (newTodoContent.trim()) {
                                                addTodo(newTodoContent);
                                                setNewTodoContent('');
                                            }
                                        }}
                                        className="btn-primary px-3"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    {todos.map(todo => (
                                        <div key={todo.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 group transition">
                                            <button
                                                onClick={() => toggleTodo(todo.id)}
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                                                    todo.completed 
                                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                        : 'border-slate-300 hover:border-indigo-500'
                                                }`}
                                            >
                                                {todo.completed && <CheckSquare className="w-3 h-3" />}
                                            </button>
                                            <span className={`flex-1 text-sm ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                {todo.content}
                                            </span>
                                            <button
                                                onClick={() => deleteTodo(todo.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {todos.length === 0 && (
                                        <p className="text-sm text-slate-400 text-center py-4">Aucune tâche rapide</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            
                            {/* Mini Calendar */}
                            <MiniCalendar tasks={privateTasks} />
                            
                            {/* Team Activity */}
                            <div className="bento-card bento-card-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-blue-500" />
                                        Activité récente
                                    </h3>
                                    <Link to="/team" className="text-xs text-indigo-600 font-medium hover:underline">
                                        Voir tout
                                    </Link>
                                </div>
                                
                                <div className="space-y-3">
                                    {recentActivities.length > 0 ? (
                                        recentActivities.map((activity, index) => (
                                            <div key={index} className="flex gap-3 items-start">
                                                <div className="avatar avatar-sm bg-gradient-to-br from-indigo-500 to-purple-500">
                                                    {activity.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-slate-900 truncate">
                                                        <span className="font-medium">{activity.user}</span>
                                                        <span className="text-slate-500"> {activity.action} </span>
                                                        <span className="font-medium text-indigo-600">{activity.target}</span>
                                                    </p>
                                                    <p className="text-xs text-slate-400">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400 text-center py-4">Aucune activité récente</p>
                                    )}
                                </div>
                            </div>

                            {/* Online Team Members */}
                            <div className="bento-card bento-card-lavender">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <Users className="w-4 h-4 text-purple-600" />
                                    En ligne ({onlineUsers.length})
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {onlineUsers.map(user => (
                                        <div key={user.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-soft" />
                                            <span className="text-sm font-medium text-slate-700">{user.name}</span>
                                        </div>
                                    ))}
                                    {onlineUsers.length === 0 && (
                                        <p className="text-sm text-slate-500">Personne en ligne</p>
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

// ============================================
// HELPER COMPONENTS
// ============================================

const SidebarNavItem = ({ icon, label, to, badge, badgeColor = 'slate', active, collapsed }) => {
    const content = (
        <div className={`nav-item ${active ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}>
            {icon}
            {!collapsed && <span className="flex-1">{label}</span>}
            {!collapsed && badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    badgeColor === 'emerald' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-slate-700 text-slate-300'
                }`}>
                    {badge}
                </span>
            )}
        </div>
    );

    return to ? <Link to={to}>{content}</Link> : content;
};

const BentoStatCard = ({ title, value, subtitle, icon, color, trend, trendUp }) => {
    const colorClasses = {
        mint: 'bento-card-mint',
        pink: 'bento-card-pink',
        lavender: 'bento-card-lavender',
        peach: 'bento-card-peach',
        sky: 'bento-card-sky',
        cream: 'bento-card-cream',
    };

    return (
        <div className={`bento-card ${colorClasses[color] || 'bento-card-white'}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="stat-icon">{icon}</div>
                {trend && (
                    <div className={`stat-trend ${trendUp ? 'positive' : 'negative'}`}>
                        <ArrowUpRight className={`w-3 h-3 ${trendUp ? '' : 'rotate-90'}`} />
                        {trend}
                    </div>
                )}
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{title}</div>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
    );
};

const TaskRow = ({ task, onClick }) => {
    const priorityColors = {
        urgent: 'bg-red-500',
        high: 'bg-amber-500',
        medium: 'bg-blue-500',
        low: 'bg-slate-300'
    };

    return (
        <div
            onClick={onClick}
            className="task-card flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer relative group"
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${priorityColors[task.priority] || priorityColors.medium}`} />
            
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                task.color ? '' : 'bg-slate-100'
            }`} style={{ backgroundColor: task.color ? `${task.color}20` : undefined }}>
                {task.icon ? (
                    <span style={{ color: task.color }}>{task.icon}</span>
                ) : (
                    <FileText className="w-5 h-5 text-slate-400" />
                )}
            </div>
            
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 truncate group-hover:text-indigo-600 transition">
                    {task.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${
                        task.status === 'done' ? 'badge-done' : 
                        task.status === 'doing' ? 'badge-doing' : 'badge-todo'
                    }`}>
                        {task.status === 'done' ? 'Terminé' : task.status === 'doing' ? 'En cours' : 'À faire'}
                    </span>
                    <span className="text-xs text-slate-400">
                        {formatRelativeTime(task.updatedAt)}
                    </span>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {task.comments?.length > 0 && (
                    <div className="flex items-center gap-1 text-slate-400">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">{task.comments.length}</span>
                    </div>
                )}
                <button className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const MiniCalendar = ({ tasks }) => {
    const today = new Date();
    const currentMonth = today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    const daysOfWeek = ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'];
    
    // Get days in current month
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startPadding = (firstDay.getDay() + 6) % 7; // Monday = 0
    
    const days = [];
    for (let i = 0; i < startPadding; i++) {
        days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(i);
    }
    
    // Check which days have tasks
    const taskDays = new Set(
        tasks
            .filter(t => t.dueDate)
            .map(t => new Date(t.dueDate).getDate())
    );

    return (
        <div className="bento-card bento-card-white">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-indigo-600 capitalize">{currentMonth}</h3>
                <div className="flex gap-1">
                    <button className="p-1 hover:bg-slate-100 rounded transition">
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                    </button>
                    <button className="p-1 hover:bg-slate-100 rounded transition">
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-xs font-medium text-slate-400 py-1">
                        {day}
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                    <div
                        key={index}
                        className={`
                            calendar-day
                            ${day === today.getDate() ? 'today' : ''}
                            ${day && taskDays.has(day) ? 'has-event' : ''}
                            ${!day ? 'invisible' : ''}
                        `}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
};

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