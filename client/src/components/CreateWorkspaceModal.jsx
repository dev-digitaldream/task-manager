import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Building } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

const CreateWorkspaceModal = ({ isOpen, onClose }) => {
    const { createWorkspace } = useWorkspace();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState('🏢');
    const [currency, setCurrency] = useState('EUR');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await createWorkspace(name, description, logo, currency);
            onClose();
            setName('');
            setDescription('');
            setCurrency('EUR');
        } catch (err) {
            setError(err.message || 'Failed to create workspace');
        } finally {
            setIsLoading(false);
        }
    };

    // Use Portal to render at body level, escaping sidebar containment
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-[#1c2128] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">New Workspace</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a new space for your team</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Workspace Name
                        </label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description (Optional)
                        </label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="What is this workspace for?"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all dark:text-white resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Currency
                        </label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all dark:text-white"
                        >
                            <option value="EUR">Euro (€)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="GBP">British Pound (£)</option>
                            <option value="JPY">Japanese Yen (¥)</option>
                            <option value="CHF">Swiss Franc (Fr)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Workspace Logo
                        </label>
                        <div className="flex gap-3">
                            {['🏢', '🚀', '💻', '🎨', '⚡️', '🌍', '🛠️', '🛒'].map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setLogo(emoji)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all ${
                                        logo === emoji 
                                            ? 'bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-500' 
                                            : 'bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !name}
                            className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? 'Creating...' : (
                                <>
                                    <Building size={16} />
                                    Create Workspace
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default CreateWorkspaceModal;
