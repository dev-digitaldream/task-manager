import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Euro, User } from 'lucide-react';

const MobileNav = () => {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Accueil', path: '/modern' },
        { icon: FileText, label: 'Pages', path: '/my-pages' },
        { icon: Euro, label: 'Dépenses', path: '/expenses' },
        { icon: User, label: 'Profil', path: '/profile' }
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${isActive
                                    ? 'text-indigo-600 bg-indigo-50'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;
