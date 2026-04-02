export interface Comment {
  id: string; // uuid v4
  content: string;
  articleId: string; // refers to Article
  authorId: string | null; // refers to User
  createdAt: number; // timestamp of creation
}

export enum CommentSortBy {
  CREATED_AT = 'createdAt',
}
