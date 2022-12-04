import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'ingredient_id',
    type: 'int',
    nullable: true,
  })
  ingredientId: number;

  @ManyToOne(() => Order, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  order: Order;

  @Column({
    name: 'price',
    type: 'float',
    nullable: true,
  })
  price: number;

  @Column({
    name: 'quantity',
    type: 'int',
    nullable: true,
  })
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
