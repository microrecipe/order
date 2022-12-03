import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';

export type OrderStatus = 'placed' | 'shipping' | 'finished';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: true,
  })
  userId: number;

  @OneToOne(() => Cart, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'cart_id' })
  cart: Cart;

  @Column({
    name: 'order_status',
    type: 'enum',
    enum: ['placed', 'shipping', 'finished'],
    nullable: true,
  })
  orderStatus: OrderStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updateddAt: Date;
}
