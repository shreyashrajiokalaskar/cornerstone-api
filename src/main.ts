import { ExceptionErrorFilter, ReponseInterceptor } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();

  // Enable the global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically remove properties not in the DTO
      transform: true, // Automatically transform payloads to DTO instances
      forbidNonWhitelisted: true, // Optional: Throw an error if non-whitelisted props are sent
    }),
  );
  const port = process.env.PORT || 3333;
  app.useGlobalInterceptors(new ReponseInterceptor());
  app.useGlobalFilters(new ExceptionErrorFilter());
  app.useLogger(['debug', 'error', 'fatal', 'log', 'verbose', 'warn']);
  await app.listen(port);
  console.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}
bootstrap();
