import React from 'react';
import { TrendingUp, PieChart } from 'lucide-react';

const ExpenseChart = ({ expenses }) => {
    // Calculer les totaux par catégorie
    const categoryTotals = expenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
            acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
    }, {});

    const categories = [
        { key: 'transport', label: 'Transport', color: 'bg-blue-500' },
        { key: 'food', label: 'Restauration', color: 'bg-amber-500' },
        { key: 'equipment', label: 'Matériel', color: 'bg-purple-500' },
        { key: 'other', label: 'Autre', color: 'bg-slate-500' }
    ];

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    const maxAmount = Math.max(...Object.values(categoryTotals), 1);

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
                <PieChart className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg text-slate-900">Dépenses par Catégorie</h3>
            </div>

            {total === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune dépense à afficher</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {categories.map(category => {
                        const amount = categoryTotals[category.key] || 0;
                        const percentage = total > 0 ? (amount / total) * 100 : 0;
                        const barWidth = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

                        return (
                            <div key={category.key}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-medium text-slate-700">{category.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-900">{amount.toFixed(2)} €</span>
                                        <span className="text-xs text-slate-500">({percentage.toFixed(0)}%)</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`${category.color} h-full rounded-full transition-all duration-500 ease-out`}
                                        style={{ width: `${barWidth}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Total */}
                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">Total</span>
                            <span className="text-lg font-bold text-indigo-600">{total.toFixed(2)} €</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseChart;
