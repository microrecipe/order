import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Body, Query } from '@nestjs/common/decorators';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { UserPayload } from './auth/auth.decorator';
import { JwtAuthGuard } from './auth/auth.guard';
import { OrderStatus } from './entities/order.entity';
import { CheckoutBody, OrderItemDTO, OrdersDTO } from './orders.dto';
import { TopicNames } from './orders.enum';
import { PaymentPaidPayload, UserType } from './orders.interface';

@Controller('orders')
@UseInterceptors(ClassSerializerInterceptor)
export class AppController {
  constructor(private readonly service: AppService) {}

  @Post('carts/recipes/:recipeId')
  @UseGuards(JwtAuthGuard)
  async addToCartFromRecipeId(
    @Param('recipeId') recipeId: number,
    @UserPayload() user: UserType,
  ): Promise<OrdersDTO> {
    return await this.service.addToCartFromRecipeId(recipeId, user);
  }

  @Get('carts')
  @UseGuards(JwtAuthGuard)
  async listItemsInCart(
    @UserPayload() user: UserType,
  ): Promise<OrderItemDTO[]> {
    return await this.service.listItemsInCart(user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listOrders(
    @UserPayload() user: UserType,
    @Query('order_status') orderStatus: OrderStatus,
  ): Promise<OrdersDTO[]> {
    return await this.service.listOrders(user, orderStatus);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(
    @UserPayload() user: UserType,
    @Body() body: CheckoutBody,
  ): Promise<string> {
    return await this.service.checkout(body, user);
  }

  @EventPattern(TopicNames.paymentPaid)
  async handlePaymentPaid(
    @Payload() message: PaymentPaidPayload,
  ): Promise<void> {
    return await this.service.handlePaymentPaid(message.order.orderId);
  }
}
