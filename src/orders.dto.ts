import { Expose } from 'class-transformer';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';

export class CartItemDTO {
  static toDTO(cartItem: CartItem) {
    const res = new CartItemDTO();

    res.id = cartItem.id;
    res.ingredientId = cartItem.ingredientId;
    res.price = cartItem.price;
    res.quantity = cartItem.quantity;

    return res;
  }
  id: number;

  @Expose({ name: 'ingredient_id' })
  ingredientId: number;

  price: number;

  quantity: number;
}

export class CartsDTO {
  static toDTO(cart: Cart, cartItems: CartItem[]) {
    const res = new CartsDTO();

    res.id = cart.id;
    res.cartItems = cartItems.map((cartItem) => CartItemDTO.toDTO(cartItem));
    res.totalPrice = cartItems
      .map((cartItem) => cartItem.price * cartItem.quantity)
      .reduce((a, b) => a + b, 0);

    return res;
  }
  id: number;

  @Expose({ name: 'cart_items' })
  cartItems: CartItemDTO[];

  @Expose({ name: 'total_price' })
  totalPrice: number;
}
