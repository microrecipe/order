import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrdersDTO } from './orders.dto';
import { IRecipe, RecipesService, UserType } from './orders.interface';
import { ClientPackageNames } from './package-names.enum';

@Injectable()
export class AppService implements OnModuleInit {
  private recipesService: RecipesService;

  constructor(
    @Inject(ClientPackageNames.recipeGRPC)
    private recipeGrpcClient: ClientGrpc,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  onModuleInit() {
    this.recipesService =
      this.recipeGrpcClient.getService<RecipesService>('RecipesService');
  }

  async addToCartFromRecipeId(
    recipeId: number,
    user: UserType,
  ): Promise<OrdersDTO> {
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

    let recipe: IRecipe;

    await this.recipesService.getRecipeById({ id: recipeId }).forEach((val) => {
      recipe = val;
    });

    const cart = await this.orderItemsRepository.findBy({
      order: { id: order.id },
    });

    for (const ingredient of recipe.ingredients) {
      const orderItem = cart.find(
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

    const orderItems = await this.orderItemsRepository.find({
      where: {
        order: { id: order.id },
      },
      order: {
        id: 'asc',
      },
    });

    return OrdersDTO.toDTO(order, orderItems);
  }
}
