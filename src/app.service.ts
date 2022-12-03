import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { Order } from './entities/order.entity';
import { CartsDTO } from './orders.dto';
import { IRecipe, RecipesService, UserType } from './orders.interface';
import { ClientPackageNames } from './package-names.enum';

@Injectable()
export class AppService implements OnModuleInit {
  private recipesService: RecipesService;

  constructor(
    @Inject(ClientPackageNames.recipeGRPC)
    private recipeGrpcClient: ClientGrpc,
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  onModuleInit() {
    this.recipesService =
      this.recipeGrpcClient.getService<RecipesService>('RecipesService');
  }

  private async getCart(user: UserType): Promise<Cart> {
    let cart = await this.cartsRepository.findOneBy({
      userId: user.id,
    });

    if (!cart) {
      cart = await this.cartsRepository.save(
        this.cartsRepository.create({
          userId: user.id,
        }),
      );
    }

    return cart;
  }

  private async getOrder(user: UserType): Promise<Order> {
    let order = await this.ordersRepository.findOneBy({
      userId: user.id,
      orderStatus: null,
    });

    if (!order) {
      order = await this.ordersRepository.save(
        this.ordersRepository.create({
          userId: user.id,
        }),
      );
    }

    return order;
  }

  async addToCartFromRecipeId(
    recipeId: number,
    user: UserType,
  ): Promise<CartsDTO> {
    const cart = await this.getCart(user);

    let recipe: IRecipe;

    await this.recipesService.getRecipeById({ id: recipeId }).forEach((val) => {
      recipe = val;
    });

    const cartItems: CartItem[] = [];

    for (const ingredient of recipe.ingredients) {
      let cartItem = await this.cartItemsRepository.findOneBy({
        ingredientId: ingredient.id,
        cart: { id: cart.id },
      });

      if (!cartItem) {
        cartItem = await this.cartItemsRepository.save(
          this.cartItemsRepository.create({
            cart: { id: cart.id },
            ingredientId: ingredient.id,
            price: ingredient.price,
            quantity: ingredient.quantity,
          }),
        );
      } else {
        cartItem.quantity += ingredient.quantity;
        cartItem = await this.cartItemsRepository.save(cartItem);
      }

      cartItems.push(cartItem);
    }

    return CartsDTO.toDTO(cart, cartItems);
  }
}
