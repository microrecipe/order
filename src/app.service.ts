import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderItemDTO, OrdersDTO } from './orders.dto';
import {
  IngredientsService,
  IOrderItem,
  IRecipe,
  RecipesService,
  UserType,
} from './orders.interface';
import { ClientPackageNames } from './package-names.enum';

@Injectable()
export class AppService implements OnModuleInit {
  private recipesService: RecipesService;
  private ingredientsService: IngredientsService;

  constructor(
    @Inject(ClientPackageNames.recipeGRPC)
    private recipeGrpcClient: ClientGrpc,
    @Inject(ClientPackageNames.ingredientGRPC)
    private ingredientGrpcClient: ClientGrpc,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  onModuleInit() {
    this.recipesService =
      this.recipeGrpcClient.getService<RecipesService>('RecipesService');

    this.ingredientsService =
      this.ingredientGrpcClient.getService<IngredientsService>(
        'IngredientsService',
      );
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
          orderStatus: null,
        }),
      );
    }

    return order;
  }

  private async setOrderItems(items: OrderItem[]): Promise<IOrderItem[]> {
    const orderItems: IOrderItem[] = [];

    for (const item of items) {
      await this.ingredientsService
        .getIngredientById({
          id: item.ingredientId,
        })
        .forEach((val) => {
          orderItems.push({ ...item, ingredient: val });
        });
    }

    return orderItems;
  }

  async addToCartFromRecipeId(
    recipeId: number,
    user: UserType,
  ): Promise<OrdersDTO> {
    const order = await this.getOrder(user);

    let recipe: IRecipe;

    await this.recipesService.getRecipeById({ id: recipeId }).forEach((val) => {
      recipe = val;
    });

    const orderItems = await this.orderItemsRepository.findBy({
      order: { id: order.id },
    });

    for (const ingredient of recipe.ingredients) {
      const orderItem = orderItems.find(
        (item) => item.ingredientId === ingredient.id,
      );

      if (!orderItem) {
        await this.orderItemsRepository.save(
          this.orderItemsRepository.create({
            order: { id: order.id },
            ingredientId: ingredient.id,
            price: ingredient.price,
            quantity: ingredient.quantity,
          }),
        );
      } else {
        orderItem.quantity += ingredient.quantity;
        await this.orderItemsRepository.save(orderItem);
      }
    }

    const _orderItems = await this.setOrderItems(
      await this.orderItemsRepository.find({
        where: {
          order: { id: order.id },
        },
        order: {
          id: 'asc',
        },
      }),
    );

    return OrdersDTO.toDTO(order, _orderItems);
  }

  async listItemsInCart(user: UserType): Promise<OrderItemDTO[]> {
    const order = await this.getOrder(user);

    const orderItems = await this.setOrderItems(
      await this.orderItemsRepository.find({
        where: {
          order: { id: order.id },
        },
        order: {
          id: 'asc',
        },
      }),
    );

    return orderItems.map((item) => OrderItemDTO.toDTO(item));
  }
}
