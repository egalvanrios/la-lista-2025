import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { AppDataSource } from './config/database'
import { initializeWebSocket } from './websocket'
import authRoutes from './routes/auth'
import serviceRoutes from './routes/services'
import bookingRoutes from './routes/bookings'

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const httpServer = createServer(app)

// Initialize WebSocket
const io = initializeWebSocket(httpServer)

// Make io accessible to routes
app.set('io', io)

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/bookings', bookingRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

// Start server
const PORT = process.env.PORT || 3000

AppDataSource.initialize()
  .then(() => {
    console.log('Database connection initialized')
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Error during Data Source initialization:', error)
  }) 