import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface Notification {
  type: string
  message: string
  data?: any
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  removeNotification: (index: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: { token },
    })

    newSocket.on('notification', (notification: Notification) => {
      addNotification(notification)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [token])

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification])
  }

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
} 