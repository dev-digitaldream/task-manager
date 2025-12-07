import React, { useState } from 'react';
import { DollarSign, Calendar, Tag, Check, X, Trash2, Filter } from 'lucide-react';

const ExpenseList = ({ expenses, onUpdateStatus, onDelete, theme, symbol = '$' }) => {
    const [filter, setFilter] = useState('all'); // all, pending, reimbursed
    const [categoryFilter, setCategoryFilter] = useState('all');
    
    const darkMode = document.documentElement.classList.contains('dark');
    // ... theme is passed as prop now, or we can keep the local fallback if needed, but let's use the one passed or keep consistent logic.
    // Actually the parent passes `theme` so we should use it, but `ExpensesPage` defines `theme` locally inside the component.
    // Let's assume the passed theme is complete. But wait, in the previous file `filteredExpenses` relies on `darkMode` which is recalculated here.
    // Let's keep `darkMode` calculation as safeguard.


    const filteredExpenses = expenses.filter(expense => {
        const statusMatch = filter === 'all' || expense.status === filter;
        const categoryMatch = categoryFilter === 'all' || expense.category === categoryFilter;
        return statusMatch && categoryMatch;
    });

    const getCategoryLabel = (category) => {
        const labels = {
            transport: 'Transport',
            food: 'Food & Dining',
            equipment: 'Equipment',
            other: 'Other'
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category) => {
        const colors = {
            transport: darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
            food: darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700',
            equipment: darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700',
            other: darkMode ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-700'
        };
        return colors[category] || colors.other;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className={`${theme.card} rounded-lg border ${theme.cardBorder}`}>
            {/* Filters */}
            <div className={`p-4 border-b ${theme.cardBorder} flex flex-wrap items-center gap-4`}>
                <div className="flex items-center gap-2">
                    <Filter className={`w-4 h-4 ${theme.textMuted}`} />
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Filters:</span>
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={`text-sm border ${theme.cardBorder} ${theme.card} ${theme.text} rounded-md px-3 py-1.5 focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reimbursed">Reimbursed</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={`text-sm border ${theme.cardBorder} ${theme.card} ${theme.text} rounded-md px-3 py-1.5 focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                >
                    <option value="all">All Categories</option>
                    <option value="transport">Transport</option>
                    <option value="food">Food & Dining</option>
                    <option value="equipment">Equipment</option>
                    <option value="other">Other</option>
                </select>

                <span className={`ml-auto text-xs ${theme.textMuted}`}>
                    {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className={`${theme.tableBg} border-b ${theme.cardBorder}`}>
                        <tr>
                            <th className={`px-4 py-3 text-left text-xs font-semibold ${theme.textMuted} uppercase tracking-wider`}>Date</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold ${theme.textMuted} uppercase tracking-wider`}>Description</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold ${theme.textMuted} uppercase tracking-wider`}>Category</th>
                            <th className={`px-4 py-3 text-right text-xs font-semibold ${theme.textMuted} uppercase tracking-wider`}>Amount</th>
                            <th className={`px-4 py-3 text-center text-xs font-semibold ${theme.textMuted} uppercase tracking-wider`}>Status</th>
                            <th className={`px-4 py-3 text-center text-xs font-semibold ${theme.textMuted} uppercase tracking-wider`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme.cardBorder}`}>
                        {filteredExpenses.length === 0 ? (
                            <tr>
                                <td colSpan="6" className={`px-4 py-8 text-center text-sm ${theme.textMuted}`}>
                                    No expenses found
                                </td>
                            </tr>
                        ) : (
                            filteredExpenses.map(expense => (
                                <tr key={expense.id} className={`${theme.hover} transition`}>
                                    <td className={`px-4 py-3 text-sm ${theme.textMuted} whitespace-nowrap`}>
                                        <div className="flex items-center gap-2">
                                            <Calendar className={`w-3.5 h-3.5 ${theme.textMuted}`} />
                                            {formatDate(expense.date)}
                                        </div>
                                    </td>
                                    <td className={`px-4 py-3 text-sm ${theme.text} font-medium`}>
                                        {expense.description}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                                            <Tag className="w-3 h-3" />
                                            {getCategoryLabel(expense.category)}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-3 text-sm text-right font-semibold ${theme.text}`}>
                                        {symbol}{expense.amount.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {expense.status === 'pending' ? (
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 ${darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'} rounded-full text-xs font-medium`}>
                                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                                                Pending
                                            </span>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'} rounded-full text-xs font-medium`}>
                                                <Check className="w-3 h-3" />
                                                Reimbursed
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            {expense.status === 'pending' && (
                                                <button
                                                    onClick={() => onUpdateStatus(expense.id, 'reimbursed')}
                                                    className={`p-1.5 text-emerald-600 ${darkMode ? 'hover:bg-emerald-900/30' : 'hover:bg-emerald-50'} rounded-md transition`}
                                                    title="Mark as reimbursed"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            {expense.status === 'reimbursed' && (
                                                <button
                                                    onClick={() => onUpdateStatus(expense.id, 'pending')}
                                                    className={`p-1.5 text-orange-600 ${darkMode ? 'hover:bg-orange-900/30' : 'hover:bg-orange-50'} rounded-md transition`}
                                                    title="Mark as pending"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this expense?')) {
                                                        onDelete(expense.id);
                                                    }
                                                }}
                                                className={`p-1.5 text-red-600 ${darkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'} rounded-md transition`}
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpenseList;
