import { DataSource } from 'typeorm'
import { Service } from '../models/Service'
import { User } from '../models/User'
import { Review } from '../models/Review'
import { Booking } from '../models/Booking'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'la_lista_2025',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [Service, User, Review, Booking],
  migrations: [],
  subscribers: [],
}) 