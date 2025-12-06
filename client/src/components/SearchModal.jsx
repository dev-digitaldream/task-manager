import React, { useState, useEffect } from 'react';
import { Search, X, FileText, Clock } from 'lucide-react';

const SearchModal = ({ isOpen, onClose, tasks, onSelectTask }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            return;
        }

        const filtered = tasks.filter(task =>
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
        );

        setResults(filtered.slice(0, 10));
    }, [query, tasks]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSelect = (task) => {
        onSelectTask(task);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-slate-200">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher des tâches..."
                        className="flex-1 outline-none text-slate-900 placeholder-slate-400"
                        autoFocus
                    />
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 rounded transition"
                    >
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                    {query.trim() === '' ? (
                        <div className="p-8 text-center text-slate-500">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm">Tapez pour rechercher dans vos tâches</p>
                            <p className="text-xs text-slate-400 mt-2">⌘K pour ouvrir/fermer</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <p className="text-sm">Aucun résultat pour "{query}"</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {results.map((task) => (
                                <button
                                    key={task.id}
                                    onClick={() => handleSelect(task)}
                                    className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition text-left"
                                >
                                    <div className="p-2 bg-slate-100 rounded flex-shrink-0">
                                        <FileText className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-slate-900 truncate">
                                            {task.title}
                                        </h4>
                                        {task.description && (
                                            <p className="text-xs text-slate-500 truncate mt-1">
                                                {task.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${task.status === 'done'
                                                    ? 'bg-green-100 text-green-700'
                                                    : task.status === 'doing'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {task.status === 'done' ? 'Terminé' : task.status === 'doing' ? 'En cours' : 'À faire'}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(task.updatedAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                        <span>↑↓ pour naviguer</span>
                        <span>↵ pour sélectionner</span>
                    </div>
                    <span>ESC pour fermer</span>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
