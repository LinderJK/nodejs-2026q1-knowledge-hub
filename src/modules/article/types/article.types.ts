import { Article as PrismaArticle } from 'generated/prisma/client';
export { ArticleStatus } from 'generated/prisma/enums';

export type Article = PrismaArticle;

export enum ArticleSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}
