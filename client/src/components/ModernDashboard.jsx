import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Search, Bell, Plus, User, ChevronRight, ChevronLeft,
    FileText, Settings, Users, Calendar, TrendingUp, Filter,
    MessageSquare, Menu, CheckSquare, DollarSign, Trash2, Pin, Tag,
    Clock, Home, FolderOpen, Target, BarChart3, PieChart, Star,
    Zap, BookOpen, Video, Phone, Heart, Moon, Sun, Command,
    ArrowUp, ArrowDown, Minus, AlertCircle, X, MoreHorizontal,
    Copy, Archive, Share2, Eye, ChevronDown
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useUsers } from '../hooks/useUsers';
import { useSocket } from '../hooks/useSocket';
import { useQuickTodos } from '../hooks/useQuickTodos';
import TaskDetailModal from './TaskDetailModal';
import MobileNav from './MobileNav';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSearch } from '../context/SearchContext';

const ModernDashboard = ({ currentUser, hideLayout = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { currentWorkspace } = useWorkspace();
    const { socket } = useSocket(currentUser?.id);
    const { tasks, createTask, updateTask, deleteTask } = useTasks(socket, currentWorkspace?.id);
    const { users, onlineUsers } = useUsers(socket);
    const { todos, addTodo, toggleTodo, deleteTodo } = useQuickTodos(currentUser, currentWorkspace?.id);
    const { openSearch } = useSearch();

    // State
    const [selectedTask, setSelectedTask] = useState(null);
    // showSearch removed
    const [isCreating, setIsCreating] = useState(false);
    const [newTodoContent, setNewTodoContent] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Pro Features State
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('flowspaces_darkmode') === 'true');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ status: 'all', priority: 'all', pinned: false });
    const [pinnedTasks, setPinnedTasks] = useState(() => {
        const saved = localStorage.getItem('flowspaces_pinned');
        return saved ? JSON.parse(saved) : [];
    });
    const [viewMode, setViewMode] = useState('list');

    // Dark mode effect
    useEffect(() => {
        localStorage.setItem('flowspaces_darkmode', darkMode);
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd+K handled globally
            
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault();
                setIsCreating(true);
            }
            if (e.key === 'Escape') {
                // Global context handles search closing, we handle filters
                setShowFilters(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Task helpers - show all tasks user has access to
    // Task helpers
    // If we are in a workspace context (tasks are already filtered by hook), show all.
    // Otherwise show only personal tasks.
    const userTasks = currentWorkspace?.id ? tasks : tasks.filter(t => 
        t.ownerId === currentUser?.id || 
        t.assigneeId === currentUser?.id ||
        t.userId === currentUser?.id ||
        !t.workspaceId
    );
    const pendingTasks = userTasks.filter(t => t.status !== 'done');
    const doingTasks = userTasks.filter(t => t.status === 'doing');
    const doneTasks = userTasks.filter(t => t.status === 'done');

    // Filter tasks
    const filteredTasks = userTasks.filter(task => {
        if (filters.status !== 'all' && task.status !== filters.status) return false;
        if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
        if (filters.pinned && !pinnedTasks.includes(task.id)) return false;
        return true;
    });

    // Toggle pin
    const togglePin = (taskId) => {
        const newPinned = pinnedTasks.includes(taskId)
            ? pinnedTasks.filter(id => id !== taskId)
            : [...pinnedTasks, taskId];
        setPinnedTasks(newPinned);
        localStorage.setItem('flowspaces_pinned', JSON.stringify(newPinned));
    };

    // Greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const today = new Date();
    const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Theme colors
    const theme = {
        bg: darkMode ? 'bg-[#0d1117]' : 'bg-[#faf9f7]',
        sidebar: darkMode ? 'bg-[#161b22]' : 'bg-[#1a1a2e]',
        card: darkMode ? 'bg-[#21262d]' : 'bg-white',
        cardBorder: darkMode ? 'border-gray-700' : 'border-gray-100',
        text: darkMode ? 'text-gray-100' : 'text-gray-900',
        textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
        hover: darkMode ? 'hover:bg-[#30363d]' : 'hover:bg-gray-50',
    };

    return (
        <div className={`flex h-screen overflow-hidden ${theme.bg} transition-colors duration-300`}>
            
            {/* ==========================================
                DARK SIDEBAR
               ========================================== */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`
                w-60 ${theme.sidebar} text-gray-300 flex flex-col
                fixed md:relative inset-y-0 left-0 z-50
                transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo + Theme Toggle */}
                <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            F
                        </div>
                        <span className="text-white font-semibold text-lg">FlowSpaces</span>
                    </div>
                    <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                        title={darkMode ? 'Light mode' : 'Dark mode'}
                    >
                        {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
                    </button>
                </div>

                {/* Workspace Switcher */}
                <div className="px-2 pb-2">
                    <WorkspaceSwitcher />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Main</p>
                    
                    <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
                    <NavItem icon={<Calendar size={18} />} label="Calendar" to="/calendar" />
                    <NavItem icon={<Users size={18} />} label="Team" badge={onlineUsers.length} to="/team" />
                    <NavItem icon={<BarChart3 size={18} />} label="Analytics" to="/dashboard-general" />
                    <NavItem icon={<BookOpen size={18} />} label="Wiki" to="/wiki" />

                    <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mt-6 mb-3">Tools</p>
                    
                    <NavItem icon={<FileText size={18} />} label="My Pages" to="/my-pages" />
                    <NavItem icon={<DollarSign size={18} />} label="Expenses" to="/expenses" />
                    <NavItem icon={<Archive size={18} />} label="Drafts" to="/drafts" />
                    <NavItem icon={<Settings size={18} />} label="Settings" to="/profile" />
                </nav>

                {/* Keyboard Shortcuts Hint */}
                <div className="p-4 border-t border-gray-700/50">
                    <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center justify-between">
                            <span>Search</span>
                            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">⌘K</kbd>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>New task</span>
                            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">⌘N</kbd>
                        </div>
                    </div>
                </div>

                {/* User */}
                <div className="p-4 border-t border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {currentUser?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{currentUser?.name || 'User'}</p>
                            <p className="text-xs text-gray-500">Online</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ==========================================
                MAIN CONTENT
               ========================================== */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* Top Bar */}
                <header className={`h-16 ${theme.card} backdrop-blur-sm border-b ${theme.cardBorder} flex items-center justify-between px-6 sticky top-0 z-30`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                            <Menu size={20} className={theme.text} />
                        </button>
                        
                        {/* Search */}
                        <button onClick={() => setShowSearch(true)} className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-full text-sm transition`}>
                            <Search size={16} className={theme.textMuted} />
                            <span className={`hidden md:inline ${theme.textMuted}`}>Search...</span>
                            <kbd className={`hidden md:inline px-1.5 py-0.5 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded text-[10px] ${theme.textMuted} border ${theme.cardBorder}`}>⌘K</kbd>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Quick Add */}
                        <button 
                            onClick={() => setIsCreating(true)}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition shadow-lg shadow-violet-500/25"
                        >
                            <Plus size={16} />
                            New Task
                        </button>
                        
                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2 ${theme.hover} rounded-full`}
                            >
                                <Bell size={20} className={theme.textMuted} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                            {showNotifications && (
                                <div className={`absolute right-0 top-full mt-2 w-80 ${theme.card} border ${theme.cardBorder} rounded-xl shadow-xl z-50 p-4`}>
                                    <h3 className={`font-semibold ${theme.text} mb-2`}>Notifications</h3>
                                    <p className={`text-sm ${theme.textMuted}`}>No new notifications</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Avatar */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="w-9 h-9 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer"
                            >
                                {currentUser?.name?.charAt(0) || 'U'}
                            </button>
                            {showUserMenu && (
                                <div className={`absolute right-0 top-full mt-2 w-48 ${theme.card} border ${theme.cardBorder} rounded-xl shadow-xl z-50 overflow-hidden`}>
                                    <Link to="/profile" className={`block px-4 py-3 ${theme.text} ${theme.hover} text-sm`}>
                                        Settings
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            localStorage.removeItem('currentUser');
                                            window.location.href = '/login';
                                        }}
                                        className={`block w-full text-left px-4 py-3 text-red-600 ${theme.hover} text-sm`}
                                    >
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    
                    {/* Greeting */}
                    <div className="mb-8">
                        <h1 className={`text-2xl font-bold ${theme.text}`}>
                            {getGreeting()}, {currentUser?.name?.split(' ')[0] || 'User'} 👋
                        </h1>
                        <p className={theme.textMuted + ' mt-1'}>
                            Here's an overview of your day. You have <span className="font-semibold text-violet-500">{pendingTasks.length} tasks</span> pending.
                        </p>
                    </div>

                    {/* Bento Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <BentoCard color="mint" darkMode={darkMode}>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tasks:</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className={`text-2xl font-bold ${theme.text}`}>{pendingTasks.length}</span>
                                <span className={theme.textMuted}>pending</span>
                            </div>
                            <div className="flex items-end gap-1 h-10 mt-4">
                                {[40, 60, 35, 80, 55, 70, 45].map((h, i) => (
                                    <div key={i} className="flex-1 bg-emerald-600/30 rounded-t" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </BentoCard>

                        <BentoCard color="pink" darkMode={darkMode}>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">In Progress:</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className={`text-2xl font-bold ${theme.text}`}>{doingTasks.length}</span>
                                <span className={theme.textMuted}>active</span>
                            </div>
                            <div className="mt-4 flex gap-2">
                                {doingTasks.slice(0, 3).map((t, i) => (
                                    <div key={i} className="w-8 h-8 rounded-lg bg-pink-600/20 flex items-center justify-center">
                                        <Clock size={14} className="text-pink-600" />
                                    </div>
                                ))}
                            </div>
                        </BentoCard>

                        <BentoCard color="lavender" darkMode={darkMode}>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed:</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className={`text-2xl font-bold ${theme.text}`}>{doneTasks.length}</span>
                                <span className={theme.textMuted}>this week</span>
                            </div>
                            <div className="mt-4 flex justify-center">
                                <ProgressRing percent={userTasks.length > 0 ? Math.round((doneTasks.length / userTasks.length) * 100) : 0} />
                            </div>
                        </BentoCard>

                        <BentoCard color="peach" darkMode={darkMode}>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Team:</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className={`text-2xl font-bold ${theme.text}`}>{onlineUsers.length}</span>
                                <span className={theme.textMuted}>online</span>
                            </div>
                            <div className="mt-4 flex -space-x-2">
                                {onlineUsers.slice(0, 5).map((user, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-xs font-medium ring-2 ring-white dark:ring-gray-800">
                                        {user.name?.charAt(0)}
                                    </div>
                                ))}
                            </div>
                        </BentoCard>
                    </div>

                    {/* Tasks Section with Filters */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Tasks List */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Header with Filters */}
                            <div className="flex items-center justify-between">
                                <h2 className={`text-lg font-bold ${theme.text}`}>My Tasks</h2>
                                <div className="flex items-center gap-2">
                                    {/* Filter Button */}
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`flex items-center gap-2 px-3 py-2 ${showFilters || filters.status !== 'all' || filters.priority !== 'all' || filters.pinned ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' : `${darkMode ? 'bg-gray-800' : 'bg-gray-100'} ${theme.textMuted}`} rounded-lg text-sm transition`}
                                    >
                                        <Filter size={16} />
                                        Filters
                                        {(filters.status !== 'all' || filters.priority !== 'all' || filters.pinned) && (
                                            <span className="w-2 h-2 bg-violet-500 rounded-full" />
                                        )}
                                    </button>
                                    
                                    {/* View Mode */}
                                    <div className={`flex ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-1`}>
                                        <button 
                                            onClick={() => setViewMode('list')}
                                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                                        >
                                            <BarChart3 size={16} className={viewMode === 'list' ? 'text-violet-600' : theme.textMuted} />
                                        </button>
                                        <button 
                                            onClick={() => setViewMode('kanban')}
                                            className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                                        >
                                            <LayoutDashboard size={16} className={viewMode === 'kanban' ? 'text-violet-600' : theme.textMuted} />
                                        </button>
                                    </div>

                                    {/* Add Button (Mobile) */}
                                    <button 
                                        onClick={() => setIsCreating(true)}
                                        className="sm:hidden p-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Filters Panel */}
                            {showFilters && (
                                <div className={`${theme.card} rounded-xl p-4 border ${theme.cardBorder} space-y-3`}>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-medium ${theme.text}`}>Filter by:</span>
                                        <button 
                                            onClick={() => setFilters({ status: 'all', priority: 'all', pinned: false })}
                                            className="text-xs text-violet-600 hover:underline"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <FilterChip label="All" active={filters.status === 'all'} onClick={() => setFilters({...filters, status: 'all'})} darkMode={darkMode} />
                                        <FilterChip label="To Do" active={filters.status === 'todo'} onClick={() => setFilters({...filters, status: 'todo'})} darkMode={darkMode} />
                                        <FilterChip label="In Progress" active={filters.status === 'doing'} onClick={() => setFilters({...filters, status: 'doing'})} darkMode={darkMode} />
                                        <FilterChip label="Done" active={filters.status === 'done'} onClick={() => setFilters({...filters, status: 'done'})} darkMode={darkMode} />
                                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                                        <FilterChip label="📌 Pinned" active={filters.pinned} onClick={() => setFilters({...filters, pinned: !filters.pinned})} darkMode={darkMode} />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`text-xs ${theme.textMuted} mr-2`}>Priority:</span>
                                        <FilterChip label="All" active={filters.priority === 'all'} onClick={() => setFilters({...filters, priority: 'all'})} darkMode={darkMode} />
                                        <FilterChip label="🔴 Urgent" active={filters.priority === 'urgent'} onClick={() => setFilters({...filters, priority: 'urgent'})} darkMode={darkMode} />
                                        <FilterChip label="🟠 High" active={filters.priority === 'high'} onClick={() => setFilters({...filters, priority: 'high'})} darkMode={darkMode} />
                                        <FilterChip label="🟡 Medium" active={filters.priority === 'medium'} onClick={() => setFilters({...filters, priority: 'medium'})} darkMode={darkMode} />
                                        <FilterChip label="⚪ Low" active={filters.priority === 'low'} onClick={() => setFilters({...filters, priority: 'low'})} darkMode={darkMode} />
                                    </div>
                                </div>
                            )}

                            {/* Tasks List */}
                            <div className={`${theme.card} rounded-2xl shadow-sm border ${theme.cardBorder} overflow-hidden`}>
                                {filteredTasks.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center`}>
                                            <CheckSquare size={24} className={theme.textMuted} />
                                        </div>
                                        <p className={theme.textMuted}>
                                            {filters.status !== 'all' || filters.priority !== 'all' || filters.pinned 
                                                ? 'No tasks match the filters' 
                                                : 'No tasks yet'}
                                        </p>
                                        <button 
                                            onClick={() => setIsCreating(true)}
                                            className="mt-4 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition"
                                        >
                                            Create a task
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {filteredTasks
                                            .sort((a, b) => {
                                                const aPinned = pinnedTasks.includes(a.id);
                                                const bPinned = pinnedTasks.includes(b.id);
                                                if (aPinned && !bPinned) return -1;
                                                if (!aPinned && bPinned) return 1;
                                                return 0;
                                            })
                                            .map((task) => (
                                            <TaskRow
                                                key={task.id}
                                                task={task}
                                                isPinned={pinnedTasks.includes(task.id)}
                                                onPin={() => togglePin(task.id)}
                                                onClick={() => setSelectedTask(task)}
                                                darkMode={darkMode}
                                                theme={theme}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Todos */}
                            <QuickTodos 
                                todos={todos}
                                newTodoContent={newTodoContent}
                                setNewTodoContent={setNewTodoContent}
                                addTodo={addTodo}
                                toggleTodo={toggleTodo}
                                deleteTodo={deleteTodo}
                                darkMode={darkMode}
                                theme={theme}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Mini Calendar */}
                            <div className={`${theme.card} rounded-2xl p-5 shadow-sm border ${theme.cardBorder}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-violet-600 capitalize">{monthName}</h3>
                                    <div className="flex gap-1">
                                        <button className={`p-1.5 ${theme.hover} rounded-lg`}><ChevronLeft size={16} className={theme.textMuted} /></button>
                                        <button className={`p-1.5 ${theme.hover} rounded-lg`}><ChevronRight size={16} className={theme.textMuted} /></button>
                                    </div>
                                </div>
                                <MiniCalendar today={today} tasks={userTasks} darkMode={darkMode} theme={theme} />

                            </div>

                            {/* Today's Timeline */}
                            <div className={`${theme.card} rounded-2xl p-5 shadow-sm border ${theme.cardBorder}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className={`font-bold ${theme.text}`}>{today.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</h3>
                                        <p className={`text-xs ${theme.textMuted}`}>Today's Timeline</p>
                                    </div>
                                </div>
                                <Timeline tasks={pendingTasks} darkMode={darkMode} theme={theme} />
                            </div>

                            {/* Team Online */}
                            <TeamOnline users={onlineUsers} darkMode={darkMode} theme={theme} />
                        </div>
                    </div>
                </main>

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

        </div>
    );
};

// ============================================
// COMPONENTS
// ============================================

const NavItem = ({ icon, label, active, badge, to }) => {
    const content = (
        <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition ${
            active ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}>
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </div>
            {badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-white/20' : 'bg-emerald-600/20 text-emerald-400'}`}>
                    {badge}
                </span>
            )}
        </div>
    );
    return to ? <Link to={to}>{content}</Link> : content;
};

const BentoCard = ({ children, color, darkMode }) => {
    const colors = {
        mint: darkMode ? 'bg-emerald-900/30 border-emerald-800' : 'bg-[#d4edda]',
        pink: darkMode ? 'bg-pink-900/30 border-pink-800' : 'bg-[#f8d7da]',
        lavender: darkMode ? 'bg-violet-900/30 border-violet-800' : 'bg-[#e8daef]',
        peach: darkMode ? 'bg-orange-900/30 border-orange-800' : 'bg-[#fce4d6]',
    };
    return (
        <div className={`${colors[color]} rounded-2xl p-5 ${darkMode ? 'border' : ''}`}>
            {children}
        </div>
    );
};

const ProgressRing = ({ percent }) => (
    <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${percent} 100`} strokeLinecap="round" className="text-violet-600" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{percent}%</span>
    </div>
);

const FilterChip = ({ label, active, onClick, darkMode }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
            active 
                ? 'bg-violet-600 text-white' 
                : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
        {label}
    </button>
);

const TaskRow = ({ task, isPinned, onPin, onClick, darkMode, theme }) => {
    const priorityIcons = {
        urgent: <AlertCircle size={14} className="text-red-500" />,
        high: <ArrowUp size={14} className="text-orange-500" />,
        medium: <Minus size={14} className="text-yellow-500" />,
        low: <ArrowDown size={14} className="text-gray-400" />,
    };

    const statusLabels = {
        done: 'Done',
        doing: 'In Progress',
        todo: 'To Do',
    };

    return (
        <div onClick={onClick} className={`flex items-center gap-4 p-4 ${theme.hover} cursor-pointer transition group relative`}>
            {isPinned && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 rounded-l" />
            )}
            
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                task.status === 'done' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                task.status === 'doing' ? 'bg-blue-100 dark:bg-blue-900/30' : 
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
                {task.status === 'done' ? (
                    <CheckSquare size={18} className="text-emerald-600" />
                ) : (
                    <Clock size={18} className={task.status === 'doing' ? 'text-blue-600' : theme.textMuted} />
                )}
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {isPinned && <Pin size={12} className="text-violet-500" />}
                    <h4 className={`font-medium truncate ${task.status === 'done' ? 'text-gray-400 line-through' : theme.text}`}>
                        {task.title}
                    </h4>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    {priorityIcons[task.priority]}
                    <span className={`text-xs ${theme.textMuted}`}>{formatRelativeTime(task.updatedAt)}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                <button 
                    onClick={(e) => { e.stopPropagation(); onPin(); }}
                    className={`p-1.5 rounded-lg ${isPinned ? 'text-violet-500' : theme.textMuted} hover:bg-violet-100 dark:hover:bg-violet-900/30`}
                    title={isPinned ? 'Unpin' : 'Pin'}
                >
                    <Pin size={14} />
                </button>
            </div>
            
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                task.status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                task.status === 'doing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
                {statusLabels[task.status] || 'To Do'}
            </span>
        </div>
    );
};

const QuickTodos = ({ todos, newTodoContent, setNewTodoContent, addTodo, toggleTodo, deleteTodo, darkMode, theme }) => (
    <div className={`${darkMode ? 'bg-amber-900/20 border border-amber-800' : 'bg-[#fff9e6]'} rounded-2xl p-5`}>
        <h3 className={`font-bold ${theme.text} flex items-center gap-2 mb-4`}>
            <CheckSquare size={18} className="text-amber-500" />
            Quick Todos
        </h3>
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
                placeholder="Add a quick task..."
                className={`flex-1 px-4 py-2.5 ${theme.card} border ${theme.cardBorder} rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/50 ${theme.text}`}
            />
            <button
                onClick={() => { if (newTodoContent.trim()) { addTodo(newTodoContent); setNewTodoContent(''); }}}
                className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition"
            >
                <Plus size={18} />
            </button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
            {todos.map(todo => (
                <div key={todo.id} className={`flex items-center gap-3 p-2 rounded-lg ${darkMode ? 'hover:bg-amber-900/30' : 'hover:bg-white/50'} group`}>
                    <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                            todo.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                    >
                        {todo.completed && <CheckSquare size={12} className="text-white" />}
                    </button>
                    <span className={`flex-1 text-sm ${todo.completed ? 'text-gray-400 line-through' : theme.text}`}>
                        {todo.content}
                    </span>
                    <button onClick={() => deleteTodo(todo.id)} className={`opacity-0 group-hover:opacity-100 ${theme.textMuted} hover:text-red-500`}>
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
            {todos.length === 0 && <p className={`text-sm ${theme.textMuted} text-center py-2`}>No quick tasks</p>}
        </div>
    </div>
);

const MiniCalendar = ({ today, tasks, darkMode, theme }) => {
    const daysOfWeek = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startPadding = (firstDay.getDay() + 6) % 7;
    const days = [];
    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);
    const taskDays = new Set(tasks.filter(t => t.dueDate).map(t => new Date(t.dueDate).getDate()));

    return (
        <div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {daysOfWeek.map(d => <div key={d} className={`text-xs font-medium ${theme.textMuted} py-1`}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => (
                    <div key={i} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition cursor-pointer ${
                        !day ? 'invisible' :
                        day === today.getDate() ? 'bg-violet-600 text-white' :
                        taskDays.has(day) ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' :
                        `${theme.text} ${theme.hover}`
                    }`}>
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
};

const Timeline = ({ tasks, darkMode, theme }) => {
    const icons = [Zap, Heart, Target, CheckSquare];
    const colors = ['violet', 'pink', 'amber', 'emerald'];
    
    return (
        <div className="space-y-4">
            {tasks.slice(0, 4).map((task, i) => (
                <div key={task.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${colors[i % 4]}-100 dark:bg-${colors[i % 4]}-900/30`}>
                            {React.createElement(icons[i % 4], { size: 14, className: `text-${colors[i % 4]}-600` })}
                        </div>
                        {i < 3 && <div className={`w-0.5 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} mt-1`} />}
                    </div>
                    <div className="flex-1 pb-4">
                        <p className={`text-sm font-medium ${theme.text} truncate`}>{task.title}</p>
                        <p className={`text-xs ${theme.textMuted} mt-0.5`}>{formatRelativeTime(task.updatedAt)}</p>
                    </div>
                </div>
            ))}
            {tasks.length === 0 && <p className={`text-sm ${theme.textMuted} text-center py-4`}>No pending tasks</p>}
        </div>
    );
};

const TeamOnline = ({ users, darkMode, theme }) => (
    <div className={`${darkMode ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-[#e8f5e9]'} rounded-2xl p-5`}>
        <h3 className={`font-bold ${theme.text} flex items-center gap-2 mb-4`}>
            <Users size={18} className="text-emerald-600" />
            Online ({users.length})
        </h3>
        <div className="flex flex-wrap gap-2">
            {users.map(user => (
                <div key={user.id} className={`flex items-center gap-2 px-3 py-1.5 ${theme.card} rounded-full shadow-sm`}>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className={`text-sm font-medium ${theme.text}`}>{user.name}</span>
                </div>
            ))}
            {users.length === 0 && <p className={`text-sm ${theme.textMuted}`}>No one online</p>}
        </div>
    </div>
);

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
}

export default ModernDashboard;