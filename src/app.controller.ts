import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Query } from '@nestjs/common/decorators';
import { AppService } from './app.service';
import { UserPayload } from './auth/auth.decorator';
import { JwtAuthGuard } from './auth/auth.guard';
import { OrderStatus } from './entities/order.entity';
import { OrderItemDTO, OrdersDTO } from './orders.dto';
import { UserType } from './orders.interface';

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
}
