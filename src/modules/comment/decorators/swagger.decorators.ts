import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCommentDto } from '../dto/create-comment.dto';

export const ApiGetComments = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get comments by articleId' }),
    ApiQuery({
      name: 'articleId',
      required: true,
      type: String,
      description: 'Article id (uuid v4)',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({ status: 200, description: 'Successful operation' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
  );
};

export const ApiCreateComment = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create comment' }),
    ApiBody({ type: CreateCommentDto, description: 'Comment data' }),
    ApiResponse({ status: 201, description: 'Comment created' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({
      status: 422,
      description: 'Article not found, check if the article exists',
    }),
  );
};

export const ApiDeleteComment = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete comment' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Comment id',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({ status: 204, description: 'Comment deleted' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
};
