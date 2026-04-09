import { Comment as PrismaComment } from 'generated/prisma/client';
export type Comment = PrismaComment;

export enum CommentSortBy {
  CREATED_AT = 'createdAt',
}
