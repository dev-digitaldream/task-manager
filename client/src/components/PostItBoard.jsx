import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, MoreHorizontal, Clock, AlertTriangle, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../hooks/useSocket';

// Helper to calculate post-it color based on priority and deadline
const getPostItColor = (task) => {
    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const daysUntilDue = dueDate ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : null;

    // Priority-based colors (if no deadline)
    if (task.priority === 'urgent') {
        return { bg: 'bg-red-100', border: 'border-red-300', accent: 'bg-red-500' };
    }
    
    // Deadline-based colors (overrides priority for urgency)
    if (dueDate) {
        if (daysUntilDue < 0) {
            // Overdue - Red
            return { bg: 'bg-red-100', border: 'border-red-300', accent: 'bg-red-500' };
        }
        if (daysUntilDue <= 2) {
            // Due soon (0-2 days) - Orange
            return { bg: 'bg-orange-100', border: 'border-orange-300', accent: 'bg-orange-500' };
        }
        if (daysUntilDue <= 7) {
            // Due this week - Yellow
            return { bg: 'bg-yellow-100', border: 'border-yellow-300', accent: 'bg-yellow-500' };
        }
    }
    
    // Default - Green (no rush)
    return { bg: 'bg-green-100', border: 'border-green-300', accent: 'bg-green-500' };
};

// Single Post-it component
const PostIt = ({ task, onToggleSubtask, onAddSubtask, onDeleteSubtask }) => {
    const [newSubtask, setNewSubtask] = useState('');
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const colors = getPostItColor(task);
    
    const completedCount = task.subtasks?.filter(s => s.completed).length || 0;
    const totalCount = task.subtasks?.length || 0;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const handleAddSubtask = async (e) => {
        e.preventDefault();
        if (newSubtask.trim()) {
            await onAddSubtask(task.id, newSubtask.trim());
            setNewSubtask('');
            setIsAddingSubtask(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow relative`}
            style={{ 
                transform: `rotate(${Math.random() * 4 - 2}deg)`,
                minHeight: '200px'
            }}
        >
            {/* Color accent strip */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${colors.accent} rounded-t-lg`} />
            
            {/* Header */}
            <div className="flex items-start justify-between mb-3 pt-1">
                <h3 className="font-semibold text-gray-800 text-sm leading-tight pr-2">
                    {task.title}
                </h3>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {/* Description */}
            {task.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Due date */}
            {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <Calendar size={12} />
                    <span>{formatDate(task.dueDate)}</span>
                </div>
            )}

            {/* Subtasks / Checklist */}
            {totalCount > 0 && (
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                            {completedCount}/{totalCount} completed
                        </span>
                        <span className="text-xs text-gray-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                            className="bg-green-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Subtasks list */}
            <div className="space-y-1 max-h-32 overflow-y-auto">
                {task.subtasks?.slice(0, 5).map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 group">
                        <button
                            onClick={() => onToggleSubtask(task.id, subtask.id, !subtask.completed)}
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                subtask.completed 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            {subtask.completed && <Check size={10} />}
                        </button>
                        <span className={`text-xs flex-1 ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {subtask.content}
                        </span>
                        <button 
                            onClick={() => onDeleteSubtask(task.id, subtask.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
                {task.subtasks?.length > 5 && (
                    <span className="text-xs text-gray-500">+{task.subtasks.length - 5} more...</span>
                )}
            </div>

            {/* Add subtask */}
            {isAddingSubtask ? (
                <form onSubmit={handleAddSubtask} className="mt-2 flex gap-1">
                    <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        placeholder="New item..."
                        className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                        autoFocus
                    />
                    <button type="submit" className="p-1 text-green-600 hover:text-green-700">
                        <Check size={14} />
                    </button>
                    <button type="button" onClick={() => setIsAddingSubtask(false)} className="p-1 text-gray-400 hover:text-gray-600">
                        <X size={14} />
                    </button>
                </form>
            ) : (
                <button
                    onClick={() => setIsAddingSubtask(true)}
                    className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <Plus size={12} />
                    <span>Add item</span>
                </button>
            )}

            {/* Assignee */}
            {task.assignee && (
                <div className="absolute bottom-3 right-3">
                    <div 
                        className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium"
                        title={task.assignee.name}
                    >
                        {task.assignee.avatar || task.assignee.name?.charAt(0)}
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Post-it Board component
const PostItBoard = ({ currentUser }) => {
    const { currentWorkspace } = useWorkspace();
    const { socket } = useSocket(currentUser?.id);
    
    // Local state for manual fetching with loading/error
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch tasks manually for stability
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on mount and when refreshed
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Socket listeners for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleTaskCreated = (task) => {
            setTasks(prev => [task, ...prev]);
        };

        const handleTaskUpdated = (updatedTask) => {
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        };

        const handleTaskDeleted = (taskId) => {
            setTasks(prev => prev.filter(t => t.id !== taskId));
        };

        socket.on('task:created', handleTaskCreated);
        socket.on('task:updated', handleTaskUpdated);
        socket.on('task:deleted', handleTaskDeleted);

        return () => {
            socket.off('task:created', handleTaskCreated);
            socket.off('task:updated', handleTaskUpdated);
            socket.off('task:deleted', handleTaskDeleted);
        };
    }, [socket]);

    // Persist filter in localStorage
    const [filter, setFilterState] = useState(() => {
        return localStorage.getItem('postit_board_filter') || 'all';
    });
    const setFilter = (newFilter) => {
        setFilterState(newFilter);
        localStorage.setItem('postit_board_filter', newFilter);
    };

    // Create task modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', priority: 'medium', dueDate: '' });
    const [creating, setCreating] = useState(false);

    // Create task handler
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;
        
        setCreating(true);
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTask.title.trim(),
                    priority: newTask.priority,
                    dueDate: newTask.dueDate || null,
                    ownerId: currentUser?.id,
                    assigneeId: currentUser?.id
                })
            });
            if (response.ok) {
                setNewTask({ title: '', priority: 'medium', dueDate: '' });
                setShowCreateModal(false);
                fetchTasks();
            }
        } catch (err) {
            console.error('Failed to create task:', err);
        } finally {
            setCreating(false);
        }
    };

    // Filter tasks for display - more permissive to show tasks
    const displayTasks = tasks.filter(task => {
        // Always show tasks based on ownership/assignment first
        const isOwner = task.ownerId === currentUser?.id;
        const isAssignee = task.assigneeId === currentUser?.id;
        const isCreator = task.userId === currentUser?.id;
        const hasNoWorkspace = !task.workspaceId;
        const isInCurrentWorkspace = task.workspaceId === currentWorkspace?.id;

        // For "all" filter - show everything related to the user
        if (filter === 'all') {
            return true; // Show all tasks for now to ensure data loads
        }
        
        // For "mine" filter - show owned or assigned tasks
        if (filter === 'mine') {
            return isOwner || isAssignee || isCreator;
        }
        
        // For "public" filter - show public/shared tasks
        if (filter === 'public') {
            return task.isPublic || (isInCurrentWorkspace && !isOwner);
        }

        return true;
    });

    // Subtask handlers
    const handleToggleSubtask = async (taskId, subtaskId, completed) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed })
            });
            if (response.ok) {
                setTasks(prev => prev.map(task => {
                    if (task.id === taskId) {
                        return {
                            ...task,
                            subtasks: task.subtasks.map(s => 
                                s.id === subtaskId ? { ...s, completed } : s
                            )
                        };
                    }
                    return task;
                }));
            }
        } catch (err) {
            console.error('Failed to toggle subtask:', err);
        }
    };

    const handleAddSubtask = async (taskId, content) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            if (response.ok) {
                const newSubtask = await response.json();
                setTasks(prev => prev.map(task => {
                    if (task.id === taskId) {
                        return {
                            ...task,
                            subtasks: [...(task.subtasks || []), newSubtask]
                        };
                    }
                    return task;
                }));
            }
        } catch (err) {
            console.error('Failed to add subtask:', err);
        }
    };

    const handleDeleteSubtask = async (taskId, subtaskId) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setTasks(prev => prev.map(task => {
                    if (task.id === taskId) {
                        return {
                            ...task,
                            subtasks: task.subtasks.filter(s => s.id !== subtaskId)
                        };
                    }
                    return task;
                }));
            }
        } catch (err) {
            console.error('Failed to delete subtask:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f5f0]">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Task Board</h1>
                            <p className="text-sm text-gray-500">
                                {displayTasks.length} task{displayTasks.length !== 1 ? 's' : ''}
                                {loading && ' (loading...)'}
                            </p>
                        </div>
                        {/* Refresh button */}
                        <button
                            onClick={fetchTasks}
                            disabled={loading}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                            title="Refresh tasks"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        {/* New Task button */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            <Plus size={16} />
                            New Task
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Filter buttons */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'mine', label: 'Mine' },
                                { id: 'public', label: 'Shared' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                        filter === f.id 
                                            ? 'bg-white text-gray-900 shadow-sm' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        
                        {/* Legend */}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full" />
                                <span>OK</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                <span>This week</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                                <span>Soon</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full" />
                                <span>Urgent</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Post-it Grid */}
            <div className="p-6">
                {/* Error state */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="text-red-500" size={20} />
                            <div>
                                <p className="font-medium text-red-800">Error loading tasks</p>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        </div>
                        <button 
                            onClick={fetchTasks}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading state */}
                {loading && tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <Loader2 size={32} className="animate-spin mb-4" />
                        <p className="text-lg font-medium">Loading tasks...</p>
                    </div>
                )}

                {/* Tasks grid */}
                {!loading || tasks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {displayTasks.map(task => (
                            <PostIt
                                key={task.id}
                                task={task}
                                onToggleSubtask={handleToggleSubtask}
                                onAddSubtask={handleAddSubtask}
                                onDeleteSubtask={handleDeleteSubtask}
                            />
                        ))}
                        
                        {/* Empty state */}
                        {displayTasks.length === 0 && !loading && (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                                    <Plus size={24} />
                                </div>
                                <p className="text-lg font-medium">No tasks yet</p>
                                <p className="text-sm mb-4">Create your first task to get started</p>
                                <button 
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                                >
                                    <Plus size={14} className="inline mr-2" />
                                    Create Task
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
                    <div 
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Create New Task</h2>
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreateTask} className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="What needs to be done?"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                                    autoFocus
                                />
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                <div className="flex gap-2">
                                    {['low', 'medium', 'high', 'urgent'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setNewTask(prev => ({ ...prev, priority: p }))}
                                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition ${
                                                newTask.priority === p
                                                    ? (p === 'urgent' ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
                                                        : p === 'high' ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-300'
                                                        : p === 'medium' ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300'
                                                        : 'bg-green-100 text-green-700 ring-2 ring-green-300')
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date (optional)</label>
                                <input
                                    type="date"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newTask.title.trim() || creating}
                                    className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} />
                                            Create Task
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostItBoard;
