import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: true,
  })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
