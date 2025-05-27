import { AppDataSource } from './config/database'
import { User, UserRole } from './models/User'
import { Service } from './models/Service'
import { Review } from './models/Review'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    await AppDataSource.initialize()
    console.log('Database connection initialized')

    // Clear all tables using CASCADE
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.query('TRUNCATE TABLE "reviews", "services", "users" CASCADE')
    await queryRunner.release()

    // Create users
    const userRepository = AppDataSource.getRepository(User)
    const serviceRepository = AppDataSource.getRepository(Service)
    const reviewRepository = AppDataSource.getRepository(Review)

    // Create homeowners
    const homeowner1 = userRepository.create({
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.HOMEOWNER,
    })

    const homeowner2 = userRepository.create({
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.HOMEOWNER,
    })

    const homeowner3 = userRepository.create({
      email: 'alice@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Alice',
      lastName: 'Brown',
      role: UserRole.HOMEOWNER,
    })

    // Create service providers
    const provider1 = userRepository.create({
      email: 'mike@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Mike',
      lastName: 'Johnson',
      role: UserRole.PROVIDER,
    })

    const provider2 = userRepository.create({
      email: 'sarah@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Sarah',
      lastName: 'Williams',
      role: UserRole.PROVIDER,
    })

    const provider3 = userRepository.create({
      email: 'david@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'David',
      lastName: 'Miller',
      role: UserRole.PROVIDER,
    })

    await userRepository.save([homeowner1, homeowner2, homeowner3, provider1, provider2, provider3])

    // Create services
    const services = [
      {
        title: 'Professional House Cleaning',
        description: 'Thorough cleaning service for your home, including dusting, vacuuming, and sanitizing.',
        category: 'Cleaning',
        price: 150,
        provider: provider1,
      },
      {
        title: 'Plumbing Services',
        description: 'Expert plumbing services for repairs, installations, and maintenance.',
        category: 'Plumbing',
        price: 200,
        provider: provider1,
      },
      {
        title: 'Electrical Repairs',
        description: 'Licensed electrician for all your electrical needs.',
        category: 'Electrical',
        price: 180,
        provider: provider2,
      },
      {
        title: 'Interior Painting',
        description: 'Professional interior painting services with premium quality paints.',
        category: 'Painting',
        price: 300,
        provider: provider2,
      },
    ]

    const savedServices = await serviceRepository.save(services)

    // Create reviews
    const reviews = [
      {
        rating: 5,
        comment: 'Excellent service! Very professional and thorough.',
        service: savedServices[0],
        reviewer: homeowner1,
      },
      {
        rating: 4,
        comment: 'Great work, but a bit pricey.',
        service: savedServices[1],
        reviewer: homeowner2,
      },
      {
        rating: 5,
        comment: 'Highly recommended! Fixed all our electrical issues.',
        service: savedServices[2],
        reviewer: homeowner1,
      },
      {
        rating: 4,
        comment: 'Good quality work, very clean and professional.',
        service: savedServices[3],
        reviewer: homeowner2,
      },
    ]

    await reviewRepository.save(reviews)

    console.log('Database seeded successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

seed() 