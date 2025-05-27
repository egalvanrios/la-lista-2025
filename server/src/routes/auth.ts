import { Router, Request, Response, RequestHandler } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { AppDataSource } from '../config/database'
import { User, UserRole } from '../models/User'
import { auth } from '../middleware/auth'

const router = Router()
const userRepository = AppDataSource.getRepository(User)

// Register new user
router.post('/register', (async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role = UserRole.HOMEOWNER } = req.body

    // Check if user already exists
    const existingUser = await userRepository.findOneBy({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    })

    await userRepository.save(user)

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}) as RequestHandler)

// Login user
router.post('/login', (async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await userRepository.findOneBy({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}) as RequestHandler)

// Get current user
router.get('/me', auth, (async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOne({
      where: { id: (req as any).user.id },
      relations: ['services', 'reviews'],
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}) as RequestHandler)

// Update user profile
router.patch('/me', auth, (async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOneBy({ id: (req as any).user.id })
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Don't allow password update through this endpoint
    const { password, ...updateData } = req.body

    userRepository.merge(user, updateData)
    const result = await userRepository.save(user)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result

    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}) as RequestHandler)

export default router 