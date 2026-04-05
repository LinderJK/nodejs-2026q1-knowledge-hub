import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Knowledge Hub API')
  .setDescription('API for Knowledge Hub Task')
  .addTag('User', 'User services')
  .addTag('Article', 'Article services')
  .addTag('Category', 'Category services')
  .addTag('Comment', 'Comment services')
  .build();
