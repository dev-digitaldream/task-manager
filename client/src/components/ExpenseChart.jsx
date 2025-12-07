import React from 'react';
import { TrendingUp, PieChart } from 'lucide-react';

const ExpenseChart = ({ expenses, theme, symbol = '$' }) => {
    const darkMode = document.documentElement.classList.contains('dark');
    
    // Calculate totals by category
    const categoryTotals = expenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
            acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
    }, {});

    const categories = [
        { key: 'transport', label: 'Transport', color: 'bg-blue-500' },
        { key: 'food', label: 'Food & Dining', color: 'bg-amber-500' },
        { key: 'equipment', label: 'Equipment', color: 'bg-purple-500' },
        { key: 'other', label: 'Other', color: 'bg-slate-500' }
    ];

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    const maxAmount = Math.max(...Object.values(categoryTotals), 1);

    return (
        <div className={`${darkMode ? 'bg-[#21262d] border-gray-700' : 'bg-white border-slate-200'} rounded-lg border p-6`}>
            <div className="flex items-center gap-2 mb-6">
                <PieChart className="w-5 h-5 text-violet-600" />
                <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>Expenses by Category</h3>
            </div>

            {total === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No expenses to display</p>
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
                                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>{category.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>{symbol}{amount.toFixed(2)}</span>
                                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>({percentage.toFixed(0)}%)</span>
                                    </div>
                                </div>
                                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-slate-100'} rounded-full h-2.5 overflow-hidden`}>
                                    <div
                                        className={`${category.color} h-full rounded-full transition-all duration-500 ease-out`}
                                        style={{ width: `${barWidth}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Total */}
                    <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>Total</span>
                            <span className="text-lg font-bold text-violet-600">{symbol}{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseChart;
