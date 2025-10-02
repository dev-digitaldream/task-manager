import { useState, useEffect, useCallback } from 'react'

export function useUsers(socket) {
  const [users, setUsers] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (!socket) return

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users)
    }

    const handleUsersUpdated = () => {
      fetchUsers()
    }

    socket.on('users:online', handleOnlineUsers)
    socket.on('users:updated', handleUsersUpdated)

    return () => {
      socket.off('users:online', handleOnlineUsers)
      socket.off('users:updated', handleUsersUpdated)
    }
  }, [socket, fetchUsers])

  const createUser = async (userData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
      }
      
      const user = await response.json()
      await fetchUsers() // Refresh users list
      return user
    } catch (error) {
      console.error('Failed to create user:', error)
      throw error
    }
  }

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to delete user')
      }
      await fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  }

  return {
    users,
    onlineUsers,
    createUser,
    deleteUser
  }
}