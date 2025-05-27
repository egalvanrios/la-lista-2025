import { Router, Request, Response } from 'express'
import { AppDataSource } from '../config/database'
import { Booking, BookingStatus } from '../models/Booking'
import { auth } from '../middleware/auth'

const router = Router()
const bookingRepository = AppDataSource.getRepository(Booking)

// Get all bookings for the current user
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    const queryBuilder = bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('booking.homeowner', 'homeowner')

    if (user.role === 'HOMEOWNER') {
      queryBuilder.where('homeowner.id = :userId', { userId: user.id })
    } else if (user.role === 'PROVIDER') {
      queryBuilder.where('provider.id = :userId', { userId: user.id })
    }

    const bookings = await queryBuilder.getMany()
    res.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Create a new booking
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const { serviceId, date, time, notes } = req.body
    const homeowner = (req as any).user

    if (homeowner.role !== 'HOMEOWNER') {
      return res.status(403).json({ message: 'Only homeowners can create bookings' })
    }

    const booking = bookingRepository.create({
      service: { id: serviceId },
      homeowner,
      date: new Date(date),
      time,
      notes,
      status: BookingStatus.PENDING
    })

    await bookingRepository.save(booking)
    res.status(201).json(booking)
  } catch (error) {
    console.error('Error creating booking:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Update booking status (provider only)
router.patch('/:id/status', auth, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { status } = req.body
    const provider = (req as any).user

    if (provider.role !== 'PROVIDER') {
      return res.status(403).json({ message: 'Only providers can update booking status' })
    }

    const booking = await bookingRepository.findOne({
      where: { id: req.params.id },
      relations: ['service', 'service.provider']
    })

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    if (booking.service.provider.id !== provider.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' })
    }

    booking.status = status
    await bookingRepository.save(booking)
    res.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Cancel booking (homeowner only)
router.delete('/:id', auth, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const homeowner = (req as any).user

    if (homeowner.role !== 'HOMEOWNER') {
      return res.status(403).json({ message: 'Only homeowners can cancel bookings' })
    }

    const booking = await bookingRepository.findOne({
      where: { id: req.params.id },
      relations: ['homeowner']
    })

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    if (booking.homeowner.id !== homeowner.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' })
    }

    booking.status = BookingStatus.CANCELLED
    await bookingRepository.save(booking)
    res.status(204).send()
  } catch (error) {
    console.error('Error cancelling booking:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router 