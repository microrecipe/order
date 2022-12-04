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
import { AppService } from './app.service';
import { UserPayload } from './auth/auth.decorator';
import { JwtAuthGuard } from './auth/auth.guard';
import { OrderStatus } from './entities/order.entity';
import { CheckoutBody, OrderItemDTO, OrdersDTO } from './orders.dto';
import { UserType } from './orders.interface';

@Controller('orders')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class AppController {
  constructor(private readonly service: AppService) {}

  @Post('carts/recipes/:recipeId')
  async addToCartFromRecipeId(
    @Param('recipeId') recipeId: number,
    @UserPayload() user: UserType,
  ): Promise<OrdersDTO> {
    return await this.service.addToCartFromRecipeId(recipeId, user);
  }

  @Get('carts')
  async listItemsInCart(
    @UserPayload() user: UserType,
  ): Promise<OrderItemDTO[]> {
    return await this.service.listItemsInCart(user);
  }

  @Get()
  async listOrders(
    @UserPayload() user: UserType,
    @Query('order_status') orderStatus: OrderStatus,
  ): Promise<OrdersDTO[]> {
    return await this.service.listOrders(user, orderStatus);
  }

  @Post('checkout')
  async checkout(
    @UserPayload() user: UserType,
    @Body() body: CheckoutBody,
  ): Promise<string> {
    return await this.service.checkout(body, user);
  }
}
