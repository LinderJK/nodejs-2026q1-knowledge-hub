export interface Comment {
  id: string;
  content: string;
  articleId: string;
  authorId: string | null;
  createdAt: number;
}

export enum CommentSortBy {
  CREATED_AT = 'createdAt',
}
