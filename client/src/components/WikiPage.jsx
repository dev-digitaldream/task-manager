import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Globe, Search, FileText, Tag, Clock,
    User, ChevronRight, BookOpen, Share2, Eye, Plus
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

    // Filter only public tasks (Wiki)
    const wikiDocs = tasks.filter(t => t.isPublic);

    // Extract categories
    const categories = ['all', ...new Set(wikiDocs.map(d => d.status))];

    // Filter documents
    const filteredDocs = wikiDocs.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || doc.status === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Popular docs (by comment count)
    const popularDocs = [...wikiDocs].sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)).slice(0, 3);

    const darkMode = document.documentElement.classList.contains('dark');
    const theme = {
        bg: darkMode ? 'bg-[#0d1117]' : 'bg-[#faf9f7]',
        card: darkMode ? 'bg-[#21262d]' : 'bg-white',
        cardBorder: darkMode ? 'border-gray-700' : 'border-gray-200',
        text: darkMode ? 'text-gray-100' : 'text-gray-900',
        textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    };

    const statusLabels = {
        todo: 'Draft',
        doing: 'In Review',
        done: 'Published'
    };

    return (
        <div className={`min-h-screen ${theme.bg} pb-20 md:pb-0`}>
            {/* Header */}
            <div className={`${theme.card} border-b ${theme.cardBorder} sticky top-0 z-10`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Link to="/modern" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition md:hidden">
                                <ArrowLeft className={`w-5 h-5 ${theme.textMuted}`} />
                            </Link>
                            <div>
                                <h1 className={`text-2xl font-bold ${theme.text} flex items-center gap-2`}>
                                    <Globe className="w-6 h-6 text-violet-600" />
                                    Wiki
                                </h1>
                                <p className={`text-sm ${theme.textMuted} mt-1`}>
                                    Shared company knowledge base
                                </p>
                            </div>
                        </div>
                        <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition">
                            <Plus className="w-4 h-4" />
                            New Article
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search documentation..."
                            className={`w-full pl-12 pr-4 py-3 border ${theme.cardBorder} ${theme.card} ${theme.text} rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm`}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar: Categories & Popular */}
                    <div className="space-y-8">
                        {/* Categories */}
                        <div className={`${theme.card} rounded-xl border ${theme.cardBorder} p-5`}>
                            <h3 className={`font-bold ${theme.text} mb-4 flex items-center gap-2`}>
                                <Tag className={`w-4 h-4 ${theme.textMuted}`} />
                                Categories
                            </h3>
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${selectedCategory === cat
                                                ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                                : `${theme.textMuted} hover:bg-gray-50 dark:hover:bg-gray-800`
                                            }`}
                                    >
                                        <span className="capitalize">{cat === 'all' ? 'All' : statusLabels[cat] || cat}</span>
                                        <span className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${theme.textMuted} px-2 py-0.5 rounded-full text-xs`}>
                                            {cat === 'all' ? wikiDocs.length : wikiDocs.filter(d => d.status === cat).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Popular Docs */}
                        <div className={`${theme.card} rounded-xl border ${theme.cardBorder} p-5`}>
                            <h3 className={`font-bold ${theme.text} mb-4 flex items-center gap-2`}>
                                <BookOpen className={`w-4 h-4 ${theme.textMuted}`} />
                                Popular
                            </h3>
                            <div className="space-y-4">
                                {popularDocs.map(doc => (
                                    <div
                                        key={doc.id}
                                        onClick={() => setSelectedDoc(doc)}
                                        className="group cursor-pointer"
                                    >
                                        <h4 className={`text-sm font-medium ${theme.text} group-hover:text-violet-600 transition line-clamp-1`}>
                                            {doc.title}
                                        </h4>
                                        <div className={`flex items-center gap-2 mt-1 text-xs ${theme.textMuted}`}>
                                            <Eye className="w-3 h-3" />
                                            <span>{(doc.comments?.length || 0) * 12 + 45} views</span>
                                        </div>
                                    </div>
                                ))}
                                {popularDocs.length === 0 && (
                                    <p className={`text-sm ${theme.textMuted}`}>No articles yet</p>
                                )}
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
                                    className={`${theme.card} rounded-xl border ${theme.cardBorder} p-6 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700 transition cursor-pointer group flex flex-col h-full`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-violet-900/30' : 'bg-violet-50'}`}>
                                            <FileText className="w-6 h-6 text-violet-600" />
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                            doc.status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {statusLabels[doc.status] || doc.status}
                                        </span>
                                    </div>

                                    <h3 className={`text-lg font-bold ${theme.text} mb-2 group-hover:text-violet-600 transition`}>
                                        {doc.title}
                                    </h3>

                                    <p className={`${theme.textMuted} text-sm mb-4 line-clamp-3 flex-1`}>
                                        {doc.description || "No description available for this article."}
                                    </p>

                                    <div className={`flex items-center justify-between pt-4 border-t ${theme.cardBorder} text-xs ${theme.textMuted}`}>
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            <span>{doc.owner?.name || 'Anonymous'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(doc.updatedAt).toLocaleDateString('en-US')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredDocs.length === 0 && (
                            <div className={`text-center py-12 ${theme.card} rounded-xl border ${theme.cardBorder} border-dashed`}>
                                <Globe className={`w-12 h-12 ${theme.textMuted} mx-auto mb-4`} />
                                <h3 className={`text-lg font-semibold ${theme.text} mb-2`}>No articles found</h3>
                                <p className={theme.textMuted}>No public documents match your search.</p>
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
