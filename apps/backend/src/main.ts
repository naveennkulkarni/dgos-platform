import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Enable Graceful Shutdowns (Fixes the hanging terminal)
  app.enableShutdownHooks(); 
  
  // 2. ENABLE CORS: Allows Next.js (Port 3001) to read the data
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();