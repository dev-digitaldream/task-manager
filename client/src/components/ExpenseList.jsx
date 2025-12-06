import React, { useState } from 'react';
import { Euro, Calendar, Tag, Check, X, Trash2, Filter } from 'lucide-react';

const ExpenseList = ({ expenses, onUpdateStatus, onDelete }) => {
    const [filter, setFilter] = useState('all'); // all, pending, reimbursed
    const [categoryFilter, setCategoryFilter] = useState('all');

    const filteredExpenses = expenses.filter(expense => {
        const statusMatch = filter === 'all' || expense.status === filter;
        const categoryMatch = categoryFilter === 'all' || expense.category === categoryFilter;
        return statusMatch && categoryMatch;
    });

    const getCategoryLabel = (category) => {
        const labels = {
            transport: 'Transport',
            food: 'Restauration',
            equipment: 'Matériel',
            other: 'Autre'
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category) => {
        const colors = {
            transport: 'bg-blue-100 text-blue-700',
            food: 'bg-amber-100 text-amber-700',
            equipment: 'bg-purple-100 text-purple-700',
            other: 'bg-slate-100 text-slate-700'
        };
        return colors[category] || colors.other;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200">
            {/* Filters */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Filtres:</span>
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="text-sm border border-slate-200 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="reimbursed">Remboursé</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-sm border border-slate-200 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="all">Toutes catégories</option>
                    <option value="transport">Transport</option>
                    <option value="food">Restauration</option>
                    <option value="equipment">Matériel</option>
                    <option value="other">Autre</option>
                </select>

                <span className="ml-auto text-xs text-slate-500">
                    {filteredExpenses.length} dépense{filteredExpenses.length > 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Catégorie</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Montant</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Statut</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredExpenses.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-400">
                                    Aucune dépense trouvée
                                </td>
                            </tr>
                        ) : (
                            filteredExpenses.map(expense => (
                                <tr key={expense.id} className="hover:bg-slate-50 transition">
                                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {formatDate(expense.date)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                                        {expense.description}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                                            <Tag className="w-3 h-3" />
                                            {getCategoryLabel(expense.category)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">
                                        {expense.amount.toFixed(2)} €
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {expense.status === 'pending' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                                                En attente
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                                <Check className="w-3 h-3" />
                                                Remboursé
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            {expense.status === 'pending' && (
                                                <button
                                                    onClick={() => onUpdateStatus(expense.id, 'reimbursed')}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                                                    title="Marquer comme remboursé"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            {expense.status === 'reimbursed' && (
                                                <button
                                                    onClick={() => onUpdateStatus(expense.id, 'pending')}
                                                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition"
                                                    title="Marquer comme en attente"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm('Supprimer cette dépense ?')) {
                                                        onDelete(expense.id);
                                                    }
                                                }}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                                                title="Supprimer"
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
