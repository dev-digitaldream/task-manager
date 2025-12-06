import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Globe, Search, FileText, Tag, Clock,
    User, ChevronRight, BookOpen, Share2, Eye
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useSocket } from '../hooks/useSocket';
import MobileNav from './MobileNav';
import TaskDetailModal from './TaskDetailModal';

const WikiPage = ({ currentUser }) => {
    const { socket } = useSocket(currentUser?.id);
    const { tasks, updateTask, deleteTask } = useTasks(socket);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDoc, setSelectedDoc] = useState(null);

    // Filtrer uniquement les tâches publiques (Wiki)
    const wikiDocs = tasks.filter(t => t.isPublic);

    // Extraire les catégories (basées sur les tags ou statuts pour l'instant)
    const categories = ['all', ...new Set(wikiDocs.map(d => d.status))];

    // Filtrer les documents
    const filteredDocs = wikiDocs.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || doc.status === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Documents populaires (simulé par le nombre de commentaires ou aléatoire pour l'instant)
    const popularDocs = [...wikiDocs].sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)).slice(0, 3);

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center gap-4 mb-6">
                        <Link to="/modern" className="p-2 hover:bg-slate-100 rounded-lg transition md:hidden">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Globe className="w-6 h-6 text-indigo-600" />
                                Wiki Public
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Base de connaissances partagée de l'entreprise
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher dans la documentation..."
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar: Categories & Popular */}
                    <div className="space-y-8">
                        {/* Categories */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-slate-500" />
                                Catégories
                            </h3>
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${selectedCategory === cat
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="capitalize">{cat === 'all' ? 'Tout voir' : cat}</span>
                                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">
                                            {cat === 'all' ? wikiDocs.length : wikiDocs.filter(d => d.status === cat).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Popular Docs */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-slate-500" />
                                Populaires
                            </h3>
                            <div className="space-y-4">
                                {popularDocs.map(doc => (
                                    <div
                                        key={doc.id}
                                        onClick={() => setSelectedDoc(doc)}
                                        className="group cursor-pointer"
                                    >
                                        <h4 className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                                            {doc.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                            <Eye className="w-3 h-3" />
                                            <span>{doc.comments?.length * 12 + 45} vues</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Doc Grid */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredDocs.map(doc => (
                                <div
                                    key={doc.id}
                                    onClick={() => setSelectedDoc(doc)}
                                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-indigo-300 transition cursor-pointer group flex flex-col h-full"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${doc.color ? 'bg-opacity-10' : 'bg-indigo-50'}`} style={{ backgroundColor: doc.color ? `${doc.color}20` : undefined }}>
                                            {doc.icon ? (
                                                <span className="material-icons text-indigo-600" style={{ color: doc.color || undefined }}>{doc.icon}</span>
                                            ) : (
                                                <FileText className="w-6 h-6 text-indigo-600" />
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${doc.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {doc.status}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition">
                                        {doc.title}
                                    </h3>

                                    <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-1">
                                        {doc.description || "Aucune description disponible pour ce document."}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            <span>{doc.owner?.name || 'Anonyme'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(doc.updatedAt).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredDocs.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                                <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun document trouvé</h3>
                                <p className="text-slate-500">Aucun document public ne correspond à votre recherche.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <MobileNav />

            {/* Document Detail Modal */}
            {selectedDoc && (
                <TaskDetailModal
                    task={selectedDoc}
                    currentUser={currentUser}
                    onClose={() => setSelectedDoc(null)}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                />
            )}
        </div>
    );
};

export default WikiPage;
