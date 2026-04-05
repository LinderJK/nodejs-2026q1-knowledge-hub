import { BadRequestException, PipeTransform } from '@nestjs/common';
import { CreateCommentDto } from '../dto/create-comment.dto';

export class CommentCreatePipe implements PipeTransform {
  transform(value: CreateCommentDto) {
    const { content, articleId } = value;
    if (content.trim() === '') {
      throw new BadRequestException('Content is required and cannot be empty');
    }
    if (articleId.trim() === '') {
      throw new BadRequestException(
        'ArticleId is required and cannot be empty',
      );
    }
    return value;
  }
}
