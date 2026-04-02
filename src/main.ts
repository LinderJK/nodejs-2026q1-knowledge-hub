import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('doc', app, documentFactory);
  await app.listen(process.env.PORT || 4000).then(() => {
    console.log(`Server is running on port ${process.env.PORT || 4000}`);
    console.log(`Swagger is running on port ${process.env.PORT || 4000}/doc`);
  });
}
bootstrap();
