import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket(userId) {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    // In production, connect to same origin (no URL). In dev, use VITE_SERVER_URL or localhost.
    const isProd = import.meta.env.PROD
    const baseUrl = isProd ? undefined : (import.meta.env.VITE_SERVER_URL || 'http://localhost:3001')
    const socketInstance = io(baseUrl, {
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('Connected to server')
      if (userId) {
        socketInstance.emit('user:join', userId)
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [userId])

  return { socket }
}