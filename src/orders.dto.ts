import { Expose } from 'class-transformer';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

export class OrderItemDTO {
  static toDTO(orderItem: OrderItem) {
    const res = new OrderItemDTO();

    res.id = orderItem.id;
    res.ingredientId = orderItem.ingredientId;
    res.price = orderItem.price;
    res.quantity = orderItem.quantity;

    return res;
  }
  id: number;

  @Expose({ name: 'ingredient_id' })
  ingredientId: number;

  price: number;

  quantity: number;
}

export class CartsDTO {
  static toDTO(order: Order, orderItems: OrderItem[]) {
    const res = new CartsDTO();

    res.id = order.id;
    res.orderItems = orderItems.map((orderItem) =>
      OrderItemDTO.toDTO(orderItem),
    );
    res.totalPrice = orderItems
      .map((orderItem) => orderItem.price * orderItem.quantity)
      .reduce((a, b) => a + b, 0);

    return res;
  }
  id: number;

  @Expose({ name: 'order_items' })
  orderItems: OrderItemDTO[];

  @Expose({ name: 'total_price' })
  totalPrice: number;
}
