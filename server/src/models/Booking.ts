import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'
import { Service } from './Service'

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Service, (service) => service.bookings)
  service!: Service

  @ManyToOne(() => User, (user) => user.bookings)
  homeowner!: User

  @Column()
  date!: Date

  @Column()
  time!: string

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING
  })
  status!: BookingStatus

  @Column({ nullable: true })
  notes!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
} 