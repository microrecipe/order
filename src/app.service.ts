import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { ClientKafka } from '@nestjs/microservices';
import { ClientGrpc } from '@nestjs/microservices/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItemDTO, OrdersDTO } from './orders.dto';
import {
  IngredientsService,
  ListOrder,
  IOrderItem,
  IRecipe,
  RecipesService,
  UserType,
  CheckoutData,
  OrderPlacedPayload,
  DeliveriesService,
  ICourier,
  PaymentsService,
  IPaymentMethod,
  DeliveryTopicPayload,
} from './orders.interface';
import { ClientPackageNames, TopicNames } from './orders.enum';

@Injectable()
export class AppService implements OnModuleInit {
  private recipesService: RecipesService;
  private ingredientsService: IngredientsService;
  private deliveriesService: DeliveriesService;
  private paymentsService: PaymentsService;

  private logger = new Logger('OrdersService');

  constructor(
    @Inject(ClientPackageNames.recipeGRPC)
    private recipeGrpcClient: ClientGrpc,
    @Inject(ClientPackageNames.ingredientGRPC)
    private ingredientGrpcClient: ClientGrpc,
    @Inject(ClientPackageNames.deliveryGRPC)
    private deliveriesGrpcClient: ClientGrpc,
    @Inject(ClientPackageNames.paymentGRPC)
    private paymentsGrpcService: ClientGrpc,
    @Inject(ClientPackageNames.orderPlacedTopic)
    private orderPlacedTopic: ClientKafka,
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

    this.deliveriesService =
      this.deliveriesGrpcClient.getService<DeliveriesService>(
        'DeliveriesService',
      );

    this.paymentsService =
      this.paymentsGrpcService.getService<PaymentsService>('PaymentsService');
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
    let order = await this.ordersRepository.findOneBy({
      userId: user.id,
      orderStatus: IsNull(),
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
    const order = await this.ordersRepository.findOneBy({
      userId: user.id,
      orderStatus: IsNull(),
    });

    const orderItems = await this.setOrderItems(
      await this.orderItemsRepository.find({
        where: {
          order: { id: order?.id, orderStatus: IsNull() },
        },
        order: {
          id: 'asc',
        },
      }),
    );

    return orderItems.map((item) => OrderItemDTO.toDTO(item));
  }

  async listOrders(
    user: UserType,
    orderStatus: OrderStatus,
  ): Promise<OrdersDTO[]> {
    const orders = await this.ordersRepository.findBy({
      userId: user.id,
      orderStatus,
    });

    const ordersList: ListOrder[] = [];

    for (const order of orders) {
      const orderItems = await this.setOrderItems(
        await this.orderItemsRepository.find({
          where: {
            order: { id: order?.id, orderStatus: IsNull() },
          },
          order: {
            id: 'asc',
          },
        }),
      );

      ordersList.push({ order, orderItems });
    }

    return ordersList.map((val) => OrdersDTO.toDTO(val.order, val.orderItems));
  }

  async checkout(data: CheckoutData, user: UserType): Promise<string> {
    const order = await this.ordersRepository.findOneBy({
      userId: user.id,
      orderStatus: IsNull(),
    });

    if (!order) {
      throw new BadRequestException('Cart is empty');
    }

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

    if (orderItems.length < 1) {
      throw new BadRequestException('Cart is empty');
    }

    let courier: ICourier;

    await this.deliveriesService
      .getCourierById({
        id: data.courierId,
      })
      .forEach((val) => {
        courier = val;
      });

    let paymentMethod: IPaymentMethod;

    await this.paymentsService
      .getPaymentMethodById({ id: data.paymentId })
      .forEach((val) => {
        paymentMethod = val;
      });

    order.orderStatus = 'placed';

    await this.ordersRepository.save(order);

    this.orderPlacedTopic.emit<any, OrderPlacedPayload>(
      TopicNames.orderPlaced,
      {
        orderId: order.id,
        cartItems: orderItems.map((item) => ({
          ingredient: { id: item.ingredient.id, name: item.ingredient.name },
          quantity: item.quantity,
          price: item.price,
        })),
        courier,
        paymentMethod,
        userId: user.id,
        timestamp: order.updatedAt,
        address: data.address,
      },
    );

    return 'Order placed';
  }

  async handlePaymentPaid(orderId: number): Promise<void> {
    const order = await this.ordersRepository.findOneByOrFail({
      id: orderId,
    });

    order.orderStatus = 'paid';

    await this.ordersRepository.save(order);

    return;
  }

  async handleDeliveryOrdered(data: DeliveryTopicPayload): Promise<void> {
    const order = await this.ordersRepository.findOneByOrFail({
      id: data.order.orderId,
    });

    order.orderStatus = 'ordered';

    await this.ordersRepository.save(order);

    return;
  }

  async handleDeliveryRouted(data: DeliveryTopicPayload): Promise<void> {
    const order = await this.ordersRepository.findOneByOrFail({
      id: data.order.orderId,
    });

    order.orderStatus = 'routed';

    await this.ordersRepository.save(order);

    return;
  }

  async handleDeliveryFinished(data: DeliveryTopicPayload): Promise<void> {
    const order = await this.ordersRepository.findOneByOrFail({
      id: data.order.orderId,
    });

    order.orderStatus = 'finished';

    await this.ordersRepository.save(order);

    this.logger.log('order finished');

    return;
  }
}
