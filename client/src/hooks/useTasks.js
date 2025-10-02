import { useState, useEffect, useCallback } from 'react'

export function useTasks(socket) {
  const [tasks, setTasks] = useState([])

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    if (!socket) return

    const handleTaskCreated = (task) => {
      setTasks(prev => [task, ...prev])
    }

    const handleTaskUpdated = (updatedTask) => {
      setTasks(prev => 
        prev.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      )
    }

    const handleTaskDeleted = (taskId) => {
      setTasks(prev => prev.filter(task => task.id !== taskId))
    }

    socket.on('task:created', handleTaskCreated)
    socket.on('task:updated', handleTaskUpdated)
    socket.on('task:deleted', handleTaskDeleted)

    return () => {
      socket.off('task:created', handleTaskCreated)
      socket.off('task:updated', handleTaskUpdated)
      socket.off('task:deleted', handleTaskDeleted)
    }
  }, [socket])

  const createTask = async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create task')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error
    }
  }

  const updateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update task')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  }

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      // Optimistic update even if websockets are momentarily down
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  }

  const addComment = async (taskId, content, authorId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, authorId }),
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  }

  const setTaskVisibility = async (taskId, visibilityData) => {
    // Optimistic update
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, isPublic: visibilityData.isPublic, publicSummary: visibilityData.publicSummary }
          : task
      )
    )

    try {
      const response = await fetch(`/api/tasks/${taskId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visibilityData),
      })

      if (!response.ok) {
        throw new Error('Failed to update task visibility')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to update task visibility:', error)
      // Rollback optimistic update on error
      fetchTasks()
      throw error
    }
  }

  return {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    setTaskVisibility
  }
}