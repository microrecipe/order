import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { ClientPackageNames } from './package-names.enum';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { JwtStrategy } from './auth/jwt.strategy';
import { OrderItem } from './entities/order-item.entity';

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
      {
        name: ClientPackageNames.ingredientGRPC,
        transport: Transport.GRPC,
        options: {
          package: 'ingredients',
          protoPath: join(__dirname, '../src/proto/ingredients.proto'),
          url: `${process.env.INGREDIENT_HOST}:${process.env.INGREDIENT_GRPC_PORT}`,
        },
      },
      {
        name: ClientPackageNames.deliveryGRPC,
        transport: Transport.GRPC,
        options: {
          package: 'deliveries',
          protoPath: join(__dirname, '../src/proto/deliveries.proto'),
          url: `${process.env.DELIVERY_HOST}:${process.env.DELIVERY_GRPC_PORT}`,
        },
      },
      {
        name: ClientPackageNames.orderPlacedTopic,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'microrecipe',
            brokers: process.env.KAFKA_BROKERS.split(','),
          },
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
    TypeOrmModule.forFeature([Order, OrderItem]),
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
