import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Clock, Trash2 } from 'lucide-react';
import MobileNav from './MobileNav';
import PageEditorModal from './PageEditorModal';

const MyPagesPage = ({ currentUser }) => {
    const [pages, setPages] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const darkMode = document.documentElement.classList.contains('dark');
    const theme = {
        bg: darkMode ? 'bg-[#0d1117]' : 'bg-[#faf9f7]',
        card: darkMode ? 'bg-[#21262d]' : 'bg-white',
        cardBorder: darkMode ? 'border-gray-700' : 'border-gray-200',
        text: darkMode ? 'text-gray-100' : 'text-gray-900',
        textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    };

    // Load pages from API
    useEffect(() => {
        if (currentUser?.id) {
            fetch(`/api/pages?userId=${currentUser.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setPages(data);
                })
                .catch(err => console.error(err));
        }
    }, [currentUser]);

    const handleCreatePage = async (pageData) => {
        try {
            const res = await fetch('/api/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...pageData,
                    userId: currentUser?.id
                })
            });
            if (res.ok) {
                const newPage = await res.json();
                setPages([newPage, ...pages]);
            }
        } catch (error) {
            console.error('Failed to create page', error);
        }
    };

    const handleDeletePage = async (pageId) => {
        if (confirm('Are you sure you want to delete this page?')) {
            try {
                const res = await fetch(`/api/pages/${pageId}`, { method: 'DELETE' });
                if (res.ok) {
                    setPages(pages.filter(p => p.id !== pageId));
                }
            } catch (error) {
                console.error('Failed to delete page', error);
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`min-h-screen ${theme.bg} pb-20 md:pb-0`}>
            {/* Header */}
            <div className={`${theme.card} border-b ${theme.cardBorder}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/modern"
                                className={`p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg transition md:hidden`}
                            >
                                <ArrowLeft className={`w-5 h-5 ${theme.textMuted}`} />
                            </Link>
                            <div>
                                <h1 className={`text-xl md:text-2xl font-bold ${theme.text} flex items-center gap-2`}>
                                    <FileText className="w-6 h-6 text-violet-600" />
                                    My Pages
                                </h1>
                                <p className={`text-sm ${theme.textMuted} mt-1`}>
                                    Your personal documents and notes ({pages.length})
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden md:inline">New Page</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
                {pages.length === 0 ? (
                    <div className={`${theme.card} rounded-lg border ${theme.cardBorder} p-12 text-center`}>
                        <FileText className={`w-16 h-16 ${theme.textMuted} mx-auto mb-4`} />
                        <h2 className={`text-xl font-bold ${theme.text} mb-2`}>No pages yet</h2>
                        <p className={`${theme.textMuted} mb-6`}>
                            Create your first page to start organizing your ideas
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium"
                        >
                            Create my first page
                        </button>
                        <div className={`mt-8 p-4 ${darkMode ? 'bg-violet-900/20 border-violet-800' : 'bg-violet-50 border-violet-100'} border rounded-lg text-left max-w-md mx-auto`}>
                            <p className={`text-sm ${darkMode ? 'text-violet-100' : 'text-violet-900'} font-medium mb-2`}>💡 What are pages for?</p>
                            <ul className={`text-xs ${darkMode ? 'text-violet-300' : 'text-violet-700'} space-y-1`}>
                                <li>• Take meeting notes</li>
                                <li>• Organize your project ideas</li>
                                <li>• Create documentation</li>
                                <li>• Keep track of your thoughts</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pages.map((page) => (
                            <div
                                key={page.id}
                                className={`${theme.card} rounded-lg border ${theme.cardBorder} p-5 hover:shadow-md transition group`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className={`font-semibold ${theme.text} flex-1 pr-2 line-clamp-2`}>
                                        {page.title}
                                    </h3>
                                    <button
                                        onClick={() => handleDeletePage(page.id)}
                                        className={`opacity-0 group-hover:opacity-100 p-1.5 ${darkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'} rounded transition text-red-600`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {page.content && (
                                    <p className={`text-sm ${theme.textMuted} mb-4 line-clamp-3`}>
                                        {page.content}
                                    </p>
                                )}

                                <div className={`flex items-center gap-2 text-xs ${theme.textMuted}`}>
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
