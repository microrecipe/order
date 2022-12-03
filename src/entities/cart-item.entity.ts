import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Cart, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'cart_id' })
  cart: Cart;

  @Column({
    name: 'ingredient_id',
    type: 'int',
    nullable: true,
  })
  ingredientId: number;

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
