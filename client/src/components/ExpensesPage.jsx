import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Download, DollarSign } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { useWorkspace } from '../context/WorkspaceContext';
import ExpenseModal from './ExpenseModal';
import ExpenseList from './ExpenseList';
import ExpenseChart from './ExpenseChart';
import MobileNav from './MobileNav';

const CURRENCY_SYMBOLS = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'JPY': '¥',
    'CHF': 'Fr'
};

const ExpensesPage = ({ currentUser }) => {
    const { currentWorkspace } = useWorkspace();
    const currency = currentWorkspace?.currency || 'EUR';
    const symbol = CURRENCY_SYMBOLS[currency] || currency;

    const { expenses, stats, addExpense, updateExpenseStatus, deleteExpense } = useExpenses(currentUser, currentWorkspace?.id);
    const [showModal, setShowModal] = useState(false);

    const darkMode = document.documentElement.classList.contains('dark');
    const theme = {
        bg: darkMode ? 'bg-[#0d1117]' : 'bg-[#faf9f7]',
        card: darkMode ? 'bg-[#21262d]' : 'bg-white',
        cardBorder: darkMode ? 'border-gray-700' : 'border-gray-200',
        text: darkMode ? 'text-gray-100' : 'text-gray-900',
        textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Description', 'Category', 'Amount', 'Status'];
        const rows = expenses.map(e => [
            new Date(e.date).toLocaleDateString('en-US'),
            e.description,
            e.category,
            e.amount.toFixed(2),
            e.status === 'pending' ? 'Pending' : 'Reimbursed'
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className={`min-h-screen ${theme.bg} pb-20 md:pb-0`}>
            {/* Header */}
            <div className={`${theme.card} border-b ${theme.cardBorder}`}>
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/modern"
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition md:hidden"
                            >
                                <ArrowLeft className={`w-5 h-5 ${theme.textMuted}`} />
                            </Link>
                            <div>
                                <h1 className={`text-2xl font-bold ${theme.text} flex items-center gap-2`}>
                                    <DollarSign className="w-6 h-6 text-violet-600" />
                                    Expenses
                                </h1>
                                <p className={`text-sm ${theme.textMuted} mt-1`}>
                                    Manage your business expenses
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={exportToCSV}
                                className={`flex items-center gap-2 px-4 py-2 ${theme.text} ${theme.card} border ${theme.cardBorder} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition`}
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export CSV</span>
                            </button>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">New Expense</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className={`${theme.card} border ${theme.cardBorder} rounded-lg p-6`}>
                        <p className={`text-sm ${theme.textMuted} mb-1`}>Total Expenses</p>
                        <p className={`text-3xl font-bold ${theme.text}`}>{symbol}{stats.total.toFixed(2)}</p>
                    </div>
                    <div className={`${darkMode ? 'bg-orange-900/30 border-orange-800' : 'bg-orange-50 border-orange-100'} border rounded-lg p-6`}>
                        <p className={`text-sm ${darkMode ? 'text-orange-400' : 'text-orange-700'} mb-1`}>Pending Reimbursement</p>
                        <p className={`text-3xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>{symbol}{stats.pending.toFixed(2)}</p>
                    </div>
                    <div className={`${darkMode ? 'bg-emerald-900/30 border-emerald-800' : 'bg-emerald-50 border-emerald-100'} border rounded-lg p-6`}>
                        <p className={`text-sm ${darkMode ? 'text-emerald-400' : 'text-emerald-700'} mb-1`}>Already Reimbursed</p>
                        <p className={`text-3xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{symbol}{stats.reimbursed.toFixed(2)}</p>
                    </div>
                </div>

                {/* Chart and List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List */}
                    <div className="lg:col-span-2">
                        <ExpenseList
                            expenses={expenses}
                            onStatusChange={updateExpenseStatus}
                            onDelete={deleteExpense}
                            theme={theme}
                            symbol={symbol}
                        />
                    </div>

                    {/* Charts */}
                    <div className="lg:col-span-1">
                        <ExpenseChart expenses={expenses} theme={theme} symbol={symbol} />
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
