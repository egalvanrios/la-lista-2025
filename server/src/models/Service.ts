import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm'
import { User } from './User'
import { Review } from './Review'
import { Booking } from './Booking'

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  title!: string

  @Column()
  description!: string

  @Column()
  category!: string

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number

  @Column({ type: 'varchar', nullable: true })
  priceUnit!: string | null

  @ManyToOne(() => User, user => user.services)
  provider!: User

  @OneToMany(() => Review, (review: Review) => review.service)
  reviews!: Review[]

  @OneToMany(() => Booking, booking => booking.service)
  bookings!: Booking[]

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating!: number

  @Column({ default: 0 })
  reviewCount!: number

  @Column({ default: true })
  isActive!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
} 