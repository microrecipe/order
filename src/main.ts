import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const restPort = process.env.ORDER_REST_PORT || 80;

  await app.listen(restPort);

  logger.log(`HTTP service running on port: ${restPort}`);
}
bootstrap();
