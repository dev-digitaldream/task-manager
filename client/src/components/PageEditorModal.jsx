import React, { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';

const PageEditorModal = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title.trim()) {
            alert('Veuillez entrer un titre');
            return;
        }

        onSave({
            title: title.trim(),
            content: content.trim(),
            createdAt: new Date().toISOString()
        });

        setTitle('');
        setContent('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-xl font-bold text-slate-900">Nouvelle Page</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Titre de la page
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Notes de réunion, Idées de projet..."
                            className="w-full px-4 py-3 text-lg font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Contenu
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Commencez à écrire..."
                            rows={12}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            💡 Astuce : Utilisez cette page pour noter vos idées, prendre des notes de réunion, ou organiser vos pensées.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition font-medium"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        Créer la page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PageEditorModal;
