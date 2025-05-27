import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'
import { User } from './models/User'

interface AuthenticatedSocket extends Socket {
  user?: User
}

export const initializeWebSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  })

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      socket.user = decoded
      next()
    } catch (err) {
      next(new Error('Authentication error'))
    }
  })

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    if (!socket.user) return

    // Join user-specific room
    socket.join(`user:${socket.user.id}`)

    // Join provider-specific room if user is a provider
    if (socket.user.role === 'PROVIDER') {
      socket.join('providers')
    }

    // Join homeowner-specific room if user is a homeowner
    if (socket.user.role === 'HOMEOWNER') {
      socket.join('homeowners')
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user?.id)
    })
  })

  return io
}

// Notification types
export enum NotificationType {
  NEW_BOOKING = 'NEW_BOOKING',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  NEW_REVIEW = 'NEW_REVIEW',
}

interface Notification {
  type: NotificationType
  message: string
  data?: any
}

// Helper function to send notifications
export const sendNotification = (
  io: Server,
  userId: number,
  notification: Notification
) => {
  io.to(`user:${userId}`).emit('notification', notification)
}

// Helper function to send notifications to all providers
export const notifyProviders = (io: Server, notification: Notification) => {
  io.to('providers').emit('notification', notification)
}

// Helper function to send notifications to all homeowners
export const notifyHomeowners = (io: Server, notification: Notification) => {
  io.to('homeowners').emit('notification', notification)
} 