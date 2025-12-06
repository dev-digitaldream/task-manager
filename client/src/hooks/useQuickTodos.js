import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useQuickTodos = (currentUser) => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTodos = useCallback(async () => {
        if (!currentUser?.id) return;

        try {
            const res = await fetch(`${API_URL}/todos?userId=${currentUser.id}`);
            if (res.ok) {
                const data = await res.json();
                setTodos(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id]);

    const addTodo = async (content) => {
        try {
            const res = await fetch(`${API_URL}/todos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, userId: currentUser.id })
            });
            if (res.ok) {
                const newTodo = await res.json();
                setTodos(prev => [newTodo, ...prev]);
                return newTodo;
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleTodo = async (id, completed) => {
        // Optimistic update
        setTodos(prev => prev.map(t => t.id === id ? { ...t, completed } : t));

        try {
            await fetch(`${API_URL}/todos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed })
            });
        } catch (err) {
            console.error(err);
            fetchTodos(); // Revert on error
        }
    };

    const deleteTodo = async (id) => {
        // Optimistic update
        setTodos(prev => prev.filter(t => t.id !== id));

        try {
            await fetch(`${API_URL}/todos/${id}`, {
                method: 'DELETE'
            });
        } catch (err) {
            console.error(err);
            fetchTodos(); // Revert on error
        }
    };

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    return {
        todos,
        loading,
        addTodo,
        toggleTodo,
        deleteTodo
    };
};
