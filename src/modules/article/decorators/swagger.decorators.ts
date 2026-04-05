import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { ArticleSortBy, ArticleStatus } from '../types/article.types';
import { SortOrder } from 'src/common/types/sort.types';

export const ApiGetArticles = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get all articles' }),
    ApiQuery({ name: 'status', required: false, enum: ArticleStatus }),
    ApiQuery({ name: 'categoryId', required: false, type: String }),
    ApiQuery({ name: 'tag', required: false, type: String }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'sortBy', required: false, enum: ArticleSortBy }),
    ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder }),
    ApiResponse({ status: 200, description: 'Successful operation' }),
  );
};

export const ApiGetArticleById = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get article by id' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Article id',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({ status: 200, description: 'Successful operation' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
};

export const ApiCreateArticle = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create article' }),
    ApiBody({ type: CreateArticleDto, description: 'Article data' }),
    ApiResponse({ status: 201, description: 'Article created' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
  );
};

export const ApiUpdateArticle = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update article' }),
    ApiBody({ type: UpdateArticleDto, description: 'Article update data' }),
    ApiResponse({ status: 200, description: 'Article updated' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
};

export const ApiDeleteArticle = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete article' }),
    ApiResponse({ status: 204, description: 'Article deleted' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
};
