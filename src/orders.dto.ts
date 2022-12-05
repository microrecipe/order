import { Expose } from 'class-transformer';
import { Order, OrderStatus } from './entities/order.entity';
import { CheckoutData, IIngredient, IOrderItem } from './orders.interface';

export class OrderItemDTO {
  static toDTO(orderItem: IOrderItem) {
    const res = new OrderItemDTO();

    res.id = orderItem.id;
    res.price = orderItem.price;
    res.ingredient = {
      id: orderItem.ingredient.id,
      name: orderItem.ingredient.name,
    };
    res.quantity = orderItem.quantity;

    return res;
  }
  id: number;

  ingredient: IIngredient;

  price: number;

  quantity: number;
}

export class OrdersDTO {
  static toDTO(order: Order, orderItems: IOrderItem[]) {
    const res = new OrdersDTO();

    res.id = order.id;
    res.orderItems = orderItems.map((orderItem) =>
      OrderItemDTO.toDTO(orderItem),
    );
    res.totalPrice = orderItems
      .map((orderItem) => orderItem.price * orderItem.quantity)
      .reduce((a, b) => a + b, 0);

    res.orderStatus = order.orderStatus;

    return res;
  }
  id: number;

  @Expose({ name: 'items' })
  orderItems: OrderItemDTO[];

  @Expose({ name: 'total_price' })
  totalPrice: number;

  @Expose({ name: 'status' })
  orderStatus: OrderStatus;
}

export class CheckoutBody implements CheckoutData {
  address: string;

  @Expose({ name: 'payment_id' })
  paymentId: number;

  @Expose({ name: 'delivery_courier_id' })
  courierId: number;
}
