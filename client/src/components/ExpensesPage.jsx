import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Download } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseModal from './ExpenseModal';
import ExpenseList from './ExpenseList';
import ExpenseChart from './ExpenseChart';
import MobileNav from './MobileNav';

const ExpensesPage = ({ currentUser }) => {
    const { expenses, stats, addExpense, updateExpenseStatus, deleteExpense } = useExpenses(currentUser);
    const [showModal, setShowModal] = useState(false);

    const exportToCSV = () => {
        const headers = ['Date', 'Description', 'Catégorie', 'Montant', 'Statut'];
        const rows = expenses.map(e => [
            new Date(e.date).toLocaleDateString('fr-FR'),
            e.description,
            e.category,
            e.amount.toFixed(2),
            e.status === 'pending' ? 'En attente' : 'Remboursé'
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `notes-de-frais-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/modern"
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Notes de Frais</h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Gérez vos dépenses professionnelles
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                            >
                                <Download className="w-4 h-4" />
                                Exporter CSV
                            </button>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Nouvelle Dépense
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <p className="text-sm text-slate-600 mb-1">Total des Dépenses</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.total.toFixed(2)} €</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-6">
                        <p className="text-sm text-orange-700 mb-1">En Attente de Remboursement</p>
                        <p className="text-3xl font-bold text-orange-700">{stats.pending.toFixed(2)} €</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6">
                        <p className="text-sm text-emerald-700 mb-1">Déjà Remboursé</p>
                        <p className="text-3xl font-bold text-emerald-700">{stats.reimbursed.toFixed(2)} €</p>
                    </div>
                </div>

                {/* Chart and List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <ExpenseChart expenses={expenses} />
                    </div>
                    <div className="lg:col-span-2">
                        <ExpenseList
                            expenses={expenses}
                            onUpdateStatus={updateExpenseStatus}
                            onDelete={deleteExpense}
                        />
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <ExpenseModal
                    onClose={() => setShowModal(false)}
                    onAdd={addExpense}
                    currentUser={currentUser}
                />
            )}

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
};

export default ExpensesPage;
