import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, FileText } from 'lucide-react';

const ExpenseModal = ({ onClose, onAdd, currentUser }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('other');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const darkMode = document.documentElement.classList.contains('dark');
    const theme = {
        card: darkMode ? 'bg-[#21262d]' : 'bg-white',
        cardBorder: darkMode ? 'border-gray-700' : 'border-slate-200',
        text: darkMode ? 'text-gray-100' : 'text-slate-900',
        textMuted: darkMode ? 'text-gray-400' : 'text-slate-500',
        input: darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-slate-300 text-slate-900',
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description || !amount) return;

        onAdd({
            description,
            amount: parseFloat(amount),
            category,
            date
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className={`${theme.card} rounded-xl shadow-2xl max-w-md w-full border ${theme.cardBorder}`}>
                <div className={`p-6 border-b ${theme.cardBorder} flex items-center justify-between`}>
                    <h2 className={`text-xl font-bold ${theme.text} flex items-center gap-2`}>
                        <DollarSign className="w-6 h-6 text-violet-600" />
                        New Expense
                    </h2>
                    <button onClick={onClose} className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'} rounded-lg transition`}>
                        <X className={`w-5 h-5 ${theme.textMuted}`} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Description</label>
                        <div className="relative">
                            <FileText className={`absolute left-3 top-2.5 w-5 h-5 ${theme.textMuted}`} />
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                                placeholder="Client lunch, Taxi, etc."
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Amount ($)</label>
                            <div className="relative">
                                <DollarSign className={`absolute left-3 top-2.5 w-5 h-5 ${theme.textMuted}`} />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Date</label>
                            <div className="relative">
                                <Calendar className={`absolute left-3 top-2.5 w-5 h-5 ${theme.textMuted}`} />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Category</label>
                        <div className="relative">
                            <Tag className={`absolute left-3 top-2.5 w-5 h-5 ${theme.textMuted}`} />
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                            >
                                <option value="transport">Transport</option>
                                <option value="food">Food & Dining</option>
                                <option value="equipment">Equipment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 ${theme.textMuted} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'} rounded-lg transition`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium shadow-sm"
                        >
                            Add Expense
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseModal;
