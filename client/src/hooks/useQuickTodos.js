import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useQuickTodos = (currentUser, workspaceId) => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTodos = useCallback(async () => {
        if (!currentUser?.id) return;

        try {
            let url = `${API_URL}/todos?userId=${currentUser.id}`;
            if (workspaceId) url += `&workspaceId=${workspaceId}`;
            
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setTodos(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id, workspaceId]);

    const addTodo = async (content) => {
        try {
            const body = { content, userId: currentUser.id };
            if (workspaceId) body.workspaceId = workspaceId;

            const res = await fetch(`${API_URL}/todos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
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
