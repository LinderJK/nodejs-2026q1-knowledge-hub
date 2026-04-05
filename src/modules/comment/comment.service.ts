import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Comment, CommentSortBy } from './types/comment.types';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments-query.dto';
import { InMemoryStore } from 'src/common/store/in-memory.store';
import { GetListQueryDto } from 'src/common/store/get-list.dto';
import { SortOrder } from 'src/common/types/sort.types';

@Injectable()
export class CommentService {
  constructor(
    private readonly store: InMemoryStore,
  ) {}

  getComments(query: GetCommentsQueryDto): Comment[] {
    const q = query ?? ({} as GetCommentsQueryDto);
    let list = [...this.store.comments];

    if (q.articleId !== undefined && q.articleId !== '') {
      list = list.filter((c) => c.articleId === q.articleId);
    }
    const listQuery: GetListQueryDto<Comment> = {
      page: q.page,
      limit: q.limit,
      sortBy: (q.sortBy ??
        CommentSortBy.CREATED_AT) as unknown as keyof Comment,
      sortOrder: q.sortOrder ?? SortOrder.ASC,
    };
    return this.store.getFilteredAndSortedList(list, listQuery).data;
  }

  async getCommentById(id: string): Promise<Comment> {
    const comment = this.store.comments.find((c) => c.id === id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async createComment(dto: CreateCommentDto): Promise<Comment> {
    const article = this.store.articles.find((a) => a.id === dto.articleId);
    if (!article) {
      throw new UnprocessableEntityException(
        'Article not found, check if the article exists',
      );
    }
    // const author = await this.userService.getUserById(dto.authorId);
    const authorId = dto.authorId ?? null;

    const newComment: Comment = {
      id: crypto.randomUUID(),
      content: dto.content,
      articleId: article.id,
      authorId: authorId,
      createdAt: Date.now(),
    };

    this.store.comments.push(newComment);
    return newComment;
  }

  async deleteComment(id: string): Promise<void> {
    const idx = this.store.comments.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new NotFoundException('Comment not found');
    }
    this.store.comments.splice(idx, 1);
  }
}
