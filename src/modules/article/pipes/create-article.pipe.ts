import { BadRequestException, PipeTransform } from '@nestjs/common';
import { CreateArticleDto } from '../dto/create-article.dto';

export class CreateArticlePipe implements PipeTransform {
  transform(value: CreateArticleDto) {
    const { title, content } = value;
    if (title.trim() === '') {
      throw new BadRequestException('Title is required and cannot be empty');
    }
    if (content.trim() === '') {
      throw new BadRequestException('Content is required and cannot be empty');
    }
    return value;
  }
}
