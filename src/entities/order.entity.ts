import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type OrderStatus = 'placed' | 'routed' | 'finished' | 'paid' | 'ordered';

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

  @Column({
    name: 'order_status',
    type: 'enum',
    enum: ['placed', 'routed', 'finished', 'paid', 'ordered'],
    nullable: true,
  })
  orderStatus: OrderStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
