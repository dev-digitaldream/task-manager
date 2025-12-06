import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, FileText, Clock, Eye } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useSocket } from '../hooks/useSocket';
import MobileNav from './MobileNav';

const DraftsPage = ({ currentUser }) => {
    const { socket } = useSocket(currentUser?.id);
    const { tasks } = useTasks(socket);

    // Filtrer les tâches privées de l'utilisateur
    const drafts = currentUser ? tasks.filter(t => !t.isPublic && t.ownerId === currentUser.id) : [];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            todo: { label: 'À faire', color: 'bg-slate-100 text-slate-700' },
            doing: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
            done: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700' }
        };
        return badges[status] || badges.todo;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/modern"
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <Lock className="w-6 h-6 text-slate-400" />
                                    Brouillons
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Vos tâches privées ({drafts.length})
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {drafts.length === 0 ? (
                    <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                        <Lock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Aucun brouillon</h2>
                        <p className="text-slate-500">
                            Vos tâches privées apparaîtront ici
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {drafts.map(draft => {
                            const badge = getStatusBadge(draft.status);
                            return (
                                <div
                                    key={draft.id}
                                    className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-semibold text-slate-900 flex-1 pr-2">
                                            {draft.title}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    {draft.description && (
                                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                            {draft.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(draft.updatedAt)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Lock className="w-3 h-3" />
                                            Privé
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
};

export default DraftsPage;
