import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm'
import { User } from './User'
import { Service } from './Service'

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('decimal', { precision: 2, scale: 1 })
  rating!: number

  @Column()
  comment!: string

  @ManyToOne(() => User, user => user.reviews)
  user!: User

  @ManyToOne(() => Service, service => service.reviews)
  service!: Service

  @Column({ default: false })
  isVerified!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
} 