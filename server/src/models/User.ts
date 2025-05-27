import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Service } from './Service'
import { Review } from './Review'
import { Booking } from './Booking'

export enum UserRole {
  HOMEOWNER = 'homeowner',
  PROVIDER = 'provider',
  ADMIN = 'admin'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  firstName!: string

  @Column()
  lastName!: string

  @Column({ unique: true })
  email!: string

  @Column()
  password!: string

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.HOMEOWNER
  })
  role!: UserRole

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null

  @Column({ type: 'varchar', nullable: true })
  address!: string | null

  @Column({ type: 'varchar', nullable: true })
  city!: string | null

  @Column({ type: 'varchar', nullable: true })
  state!: string | null

  @Column({ type: 'varchar', nullable: true })
  zipCode!: string | null

  @Column({ type: 'varchar', nullable: true })
  companyName!: string | null

  @Column({ type: 'varchar', nullable: true })
  licenseNumber!: string | null

  @Column({ type: 'varchar', nullable: true })
  insurance!: string | null

  @Column({ default: false })
  isVerified!: boolean

  @OneToMany(() => Service, (service: Service) => service.provider)
  services!: Service[]

  @OneToMany(() => Review, (review: Review) => review.user)
  reviews!: Review[]

  @OneToMany(() => Booking, booking => booking.homeowner)
  bookings!: Booking[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
} 