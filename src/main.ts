import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes';
import { NestFactory } from '@nestjs/core';
import { KafkaOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.connectMicroservice<KafkaOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'microrecipe',
        brokers: process.env.KAFKA_BROKERS.split(','),
      },
      consumer: {
        groupId: 'order',
      },
    },
  });

  await app.startAllMicroservices();

  const restPort = process.env.ORDER_REST_PORT || 80;

  await app.listen(restPort);

  logger.log(`HTTP service running on port: ${restPort}`);
}
bootstrap();
