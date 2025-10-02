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
    if (!socket || typeof socket.on !== 'function') return

    const handlePublicTasksUpdated = () => {
      fetchPublicTasks()
    }

    socket.on('tasks:public_updated', handlePublicTasksUpdated)

    return () => {
      socket.off('tasks:public_updated', handlePublicTasksUpdated)
    }
  }, [socket, fetchPublicTasks])

  return {
    publicTasks
  }
}
