import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Clock, Trash2 } from 'lucide-react';
import MobileNav from './MobileNav';
import PageEditorModal from './PageEditorModal';

const MyPagesPage = ({ currentUser }) => {
    const [pages, setPages] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Charger les pages depuis localStorage
    useEffect(() => {
        const savedPages = localStorage.getItem(`pages_${currentUser?.id}`);
        if (savedPages) {
            setPages(JSON.parse(savedPages));
        }
    }, [currentUser]);

    // Sauvegarder les pages dans localStorage
    const savePages = (newPages) => {
        setPages(newPages);
        localStorage.setItem(`pages_${currentUser?.id}`, JSON.stringify(newPages));
    };

    const handleCreatePage = (pageData) => {
        const newPage = {
            id: Date.now().toString(),
            ...pageData,
            userId: currentUser?.id
        };
        savePages([newPage, ...pages]);
    };

    const handleDeletePage = (pageId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
            savePages(pages.filter(p => p.id !== pageId));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Mes Pages</h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Vos documents et notes personnels ({pages.length})
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden md:inline">Nouvelle Page</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
                {pages.length === 0 ? (
                    <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Aucune page pour l'instant</h2>
                        <p className="text-slate-500 mb-6">
                            Créez votre première page pour commencer à organiser vos idées
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                            Créer ma première page
                        </button>
                        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-left max-w-md mx-auto">
                            <p className="text-sm text-blue-900 font-medium mb-2">💡 À quoi servent les pages ?</p>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Prendre des notes de réunion</li>
                                <li>• Organiser vos idées de projets</li>
                                <li>• Créer des documentations</li>
                                <li>• Garder une trace de vos réflexions</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pages.map((page) => (
                            <div
                                key={page.id}
                                className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-slate-900 flex-1 pr-2 line-clamp-2">
                                        {page.title}
                                    </h3>
                                    <button
                                        onClick={() => handleDeletePage(page.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded transition text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {page.content && (
                                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                                        {page.content}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(page.createdAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Page Editor Modal */}
            <PageEditorModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleCreatePage}
            />

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
};

export default MyPagesPage;
