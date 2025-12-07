import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useExpenses = (currentUser, workspaceId) => {
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState({ pending: 0, reimbursed: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchExpenses = useCallback(async () => {
        if (!currentUser?.id) return;

        try {
            setLoading(true);
            let url = `${API_URL}/expenses?userId=${currentUser.id}`;
            let statsUrl = `${API_URL}/expenses/stats?userId=${currentUser.id}`;
            
            if (workspaceId) {
                url += `&workspaceId=${workspaceId}`;
                statsUrl += `&workspaceId=${workspaceId}`;
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch expenses');
            const data = await res.json();
            setExpenses(data);

            const statsRes = await fetch(statsUrl);
            if (!statsRes.ok) throw new Error('Failed to fetch stats');
            const statsData = await statsRes.json();
            setStats(statsData);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id, workspaceId]);

    const addExpense = async (expenseData) => {
        try {
            const body = { ...expenseData, userId: currentUser.id };
            if (workspaceId) body.workspaceId = workspaceId;

            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('Failed to add expense');
            const newExpense = await res.json();
            setExpenses(prev => [newExpense, ...prev]);
            fetchExpenses(); // Refresh stats
            return newExpense;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const updateExpenseStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/expenses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to update expense');
            const updated = await res.json();
            setExpenses(prev => prev.map(e => e.id === id ? updated : e));
            fetchExpenses(); // Refresh stats
            return updated;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deleteExpense = async (id) => {
        try {
            const res = await fetch(`${API_URL}/expenses/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete expense');
            setExpenses(prev => prev.filter(e => e.id !== id));
            fetchExpenses(); // Refresh stats
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    return {
        expenses,
        stats,
        loading,
        error,
        addExpense,
        updateExpenseStatus,
        deleteExpense,
        refresh: fetchExpenses
    };
};
