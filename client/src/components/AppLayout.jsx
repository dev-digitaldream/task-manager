import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Search, Bell, Plus, ChevronRight, ChevronLeft,
    FileText, Settings, Users, Calendar, BarChart3, Menu,
    DollarSign, Archive, BookOpen, Moon, Sun, LogOut, StickyNote
} from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useSocket } from '../hooks/useSocket';
import MobileNav from './MobileNav';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { useSearch } from '../context/SearchContext'; // Import useSearch

const AppLayout = ({ children, currentUser }) => {
    const location = useLocation();
    const { socket } = useSocket(currentUser?.id);
    const { onlineUsers } = useUsers(socket);
    const { openSearch } = useSearch(); // Use context
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('flowspaces_darkmode') === 'true');

    // Dark mode effect
    useEffect(() => {
        localStorage.setItem('flowspaces_darkmode', darkMode);
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    // Resend-style theme - dark sidebar, white content
    const theme = {
        bg: 'bg-white',
        sidebar: 'bg-[#0a0a0a]', // Pure dark sidebar
        card: 'bg-white',
        cardBorder: 'border-gray-200',
        text: 'text-gray-900',
        textMuted: 'text-gray-500',
        hover: 'hover:bg-gray-100',
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/modern' },
        { icon: StickyNote, label: 'Board', path: '/board' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: Users, label: 'Team', path: '/team', badge: onlineUsers.length },
        { icon: BarChart3, label: 'Analytics', path: '/dashboard-general' },
        { icon: BookOpen, label: 'Wiki', path: '/wiki' },
    ];

    const toolItems = [
        { icon: FileText, label: 'My Pages', path: '/my-pages' },
        { icon: DollarSign, label: 'Expenses', path: '/expenses' },
        { icon: Archive, label: 'Drafts', path: '/drafts' },
        { icon: Settings, label: 'Settings', path: '/profile' },
    ];

    return (
        <div className={`flex h-screen overflow-hidden ${theme.bg} transition-colors duration-300`}>
            
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
                w-60 ${theme.sidebar} text-gray-300 flex flex-col
                fixed md:relative inset-y-0 left-0 z-50
                transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo + Theme Toggle */}
                <div className="p-5 flex items-center justify-between border-b border-gray-800">
                    <Link to="/modern" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold text-sm">
                            F
                        </div>
                        <span className="text-white font-semibold text-lg">FlowSpaces</span>
                    </Link>
                </div>
                
                {/* Workspace Switcher */}
                <div className="px-2 pb-2">
                    <WorkspaceSwitcher />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Main</p>
                    
                    {navItems.map((item) => (
                        <NavItem 
                            key={item.path}
                            icon={<item.icon size={18} />} 
                            label={item.label} 
                            to={item.path}
                            active={location.pathname === item.path}
                            badge={item.badge}
                        />
                    ))}

                    <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mt-6 mb-3">Tools</p>
                    
                    {toolItems.map((item) => (
                        <NavItem 
                            key={item.path}
                            icon={<item.icon size={18} />} 
                            label={item.label} 
                            to={item.path}
                            active={location.pathname === item.path}
                        />
                    ))}
                </nav>

                {/* Keyboard Shortcuts */}
                <div className="p-4 border-t border-gray-700/50">
                    <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center justify-between">
                            <span>Search</span>
                            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">⌘K</kbd>
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
                        <button
                            onClick={() => {
                                localStorage.removeItem('currentUser');
                                window.location.href = '/login';
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Sign out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* Top Bar */}
                <header className={`h-16 ${theme.card} backdrop-blur-sm border-b ${theme.cardBorder} flex items-center justify-between px-6 sticky top-0 z-30`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                            <Menu size={20} className={theme.text} />
                        </button>
                        
                        {/* Breadcrumb */}
                        <div className={`hidden md:flex items-center gap-2 text-sm ${theme.textMuted}`}>
                            <span>FlowSpaces</span>
                            <ChevronRight size={14} />
                            <span className={theme.text + ' font-medium'}>
                                {navItems.find(i => i.path === location.pathname)?.label || 
                                 toolItems.find(i => i.path === location.pathname)?.label || 
                                 'Dashboard'}
                            </span>
                        </div>
                        
                        {/* Search */}
                        <button onClick={openSearch} className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-full text-sm transition`}>
                            <Search size={16} className={theme.textMuted} />
                            <span className={`hidden md:inline ${theme.textMuted}`}>Search...</span>
                            <kbd className={`hidden md:inline px-1.5 py-0.5 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded text-[10px] ${theme.textMuted} border ${theme.cardBorder}`}>⌘K</kbd>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <button className={`relative p-2 ${theme.hover} rounded-full`}>
                            <Bell size={20} className={theme.textMuted} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        
                        {/* Avatar */}
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
                            {currentUser?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>

                <MobileNav />
            </div>

            {/* Search Modal */}

        </div>
    );
};

const NavItem = ({ icon, label, to, active, badge }) => (
    <Link to={to}>
        <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition ${
            active ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
        }`}>
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </div>
            {badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-white/20' : 'bg-gray-700 text-gray-400'}`}>
                    {badge}
                </span>
            )}
        </div>
    </Link>
);

export default AppLayout;
