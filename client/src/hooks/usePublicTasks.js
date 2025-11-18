import { useState, useEffect, useCallback } from 'react'

export function usePublicTasks(socket) {
  const [publicTasks, setPublicTasks] = useState([])

  const fetchPublicTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks/public')
      if (response.ok) {
        const data = await response.json()
        setPublicTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch public tasks:', error)
    }
  }, [])

  useEffect(() => {
    fetchPublicTasks()
  }, [fetchPublicTasks])

  useEffect(() => {
    if (!socket) return
    if (typeof socket.on !== 'function') {
      console.warn('Socket object does not have .on method')
      return
    }

    const handlePublicTasksUpdated = () => {
      fetchPublicTasks()
    }

    socket.on('tasks:public_updated', handlePublicTasksUpdated)

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('tasks:public_updated', handlePublicTasksUpdated)
      }
    }
  }, [socket, fetchPublicTasks])

  return {
    publicTasks
  }
}
