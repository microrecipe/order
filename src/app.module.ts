import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { ClientPackageNames } from './package-names.enum';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Order } from './entities/order.entity';
import { JwtStrategy } from './auth/jwt.strategy';
import { CartItem } from './entities/cart-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: ClientPackageNames.recipeGRPC,
        transport: Transport.GRPC,
        options: {
          package: 'recipes',
          protoPath: join(__dirname, '../src/proto/recipes.proto'),
          url: `${process.env.RECIPE_HOST}:${process.env.RECIPE_GRPC_PORT}`,
        },
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('ORDER_DB_HOST'),
        port: Number(configService.get('ORDER_DB_PORT')),
        username: configService.get('ORDER_DB_USERNAME'),
        password: configService.get('ORDER_DB_PASSWORD'),
        database: configService.get('ORDER_DB_NAME'),
        entities: [__dirname + './**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Cart, Order, CartItem]),
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
