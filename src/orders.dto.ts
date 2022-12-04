import { Expose } from 'class-transformer';
import { Order } from './entities/order.entity';
import {
  CheckoutData,
  IIngredient,
  IOrderItem,
  OrderPlacedPayload,
} from './orders.interface';

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

    return res;
  }
  id: number;

  @Expose({ name: 'items' })
  orderItems: OrderItemDTO[];

  @Expose({ name: 'total_price' })
  totalPrice: number;
}

export class CheckoutBody implements CheckoutData {
  address: string;

  @Expose({ name: 'payment_id' })
  paymentId: number;

  @Expose({ name: 'delivery_courier_id' })
  courierId: number;
}

export class OrderPlacedPayloadDTO implements OrderPlacedPayload {
  static toDTO(value: OrderPlacedPayload) {
    const res = new OrderPlacedPayloadDTO();

    res.orderId = value.orderId;
    res.cartItems = value.cartItems;
    res.courierId = value.courierId;
    res.paymentId = value.paymentId;
    res.userId = value.userId;
    res.timestamp = value.timestamp;
  }
  orderId: number;
  cartItems: IOrderItem[];
  courierId: number;
  paymentId: number;
  userId: number;
  timestamp: Date;
}
