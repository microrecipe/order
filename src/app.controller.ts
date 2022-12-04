import {
  ClassSerializerInterceptor,
  Controller,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UserPayload } from './auth/auth.decorator';
import { JwtAuthGuard } from './auth/auth.guard';
import { OrdersDTO } from './orders.dto';
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
}
