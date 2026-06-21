import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // This line fixes the 'Failed to fetch' error:
  app.enableCors();
  await app.listen(3000);
}
bootstrap();