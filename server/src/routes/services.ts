import { Router, Request, Response } from 'express'
import { AppDataSource } from '../config/database'
import { Service } from '../models/Service'
import { auth } from '../middleware/auth'

const router = Router()
const serviceRepository = AppDataSource.getRepository(Service)

interface ServiceQuery {
  query?: string
  category?: string
  page?: string
  limit?: string
}

// Get all services with optional search and category filter
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query
    const queryBuilder = serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('service.reviews', 'reviews')
      .leftJoinAndSelect('reviews.user', 'user')

    if (search) {
      queryBuilder.andWhere(
        '(service.title ILIKE :search OR service.description ILIKE :search)',
        { search: `%${search}%` }
      )
    }

    if (category) {
      queryBuilder.andWhere('service.category = :category', { category })
    }

    const services = await queryBuilder.getMany()

    // Calculate average rating and review count
    const servicesWithStats = services.map(service => {
      const { reviews, ...serviceData } = service
      const rating = reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0

      return {
        ...serviceData,
        rating,
        reviewCount: reviews.length,
      }
    })

    res.json(servicesWithStats)
  } catch (error) {
    console.error('Error fetching services:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get individual service with reviews
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const service = await serviceRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['provider', 'reviews', 'reviews.user'],
    })

    if (!service) {
      return res.status(404).json({ message: 'Service not found' })
    }

    // Calculate average rating
    const rating = service.reviews.length > 0
      ? service.reviews.reduce((acc, review) => acc + review.rating, 0) / service.reviews.length
      : 0

    const serviceWithStats = {
      ...service,
      rating,
      reviewCount: service.reviews.length,
    }

    res.json(serviceWithStats)
  } catch (error) {
    console.error('Error fetching service:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Create new service (protected, provider only)
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const { title, description, category, price } = req.body
    const provider = (req as any).user

    if (provider.role !== 'PROVIDER') {
      return res.status(403).json({ message: 'Only providers can create services' })
    }

    const service = serviceRepository.create({
      title,
      description,
      category,
      price,
      provider,
    })

    await serviceRepository.save(service)
    res.status(201).json(service)
  } catch (error) {
    console.error('Error creating service:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Update service (protected, provider only)
router.patch('/:id', auth, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const service = await serviceRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['provider'],
    })

    if (!service) {
      return res.status(404).json({ message: 'Service not found' })
    }

    if (service.provider.id !== (req as any).user.id) {
      return res.status(403).json({ message: 'Not authorized to update this service' })
    }

    const { title, description, category, price } = req.body
    serviceRepository.merge(service, { title, description, category, price })
    const result = await serviceRepository.save(service)

    res.json(result)
  } catch (error) {
    console.error('Error updating service:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Delete service (protected, provider only)
router.delete('/:id', auth, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const service = await serviceRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['provider'],
    })

    if (!service) {
      return res.status(404).json({ message: 'Service not found' })
    }

    if (service.provider.id !== (req as any).user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this service' })
    }

    await serviceRepository.remove(service)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting service:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router 