import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Comment, CommentSortBy } from './types/comment.types';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ArticleService } from '../article/article.service';
import { GetCommentsQueryDto } from './dto/get-comments-query.dto';
import { UserService } from '../user/user.service';
import { InMemoryStore } from 'src/common/store/in-memory.store';
import {
  GetListQueryDto,
  PaginatedListDto,
} from 'src/common/store/get-list.dto';
import { SortOrder } from 'src/common/types/sort.types';

@Injectable()
export class CommentService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly articleService: ArticleService,
    private readonly userService: UserService,
  ) {}

  async getComments(
    query: GetCommentsQueryDto,
  ): Promise<PaginatedListDto<Comment>> {
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
    return this.store.getFilteredAndSortedList(list, listQuery);
  }

  async createComment(dto: CreateCommentDto): Promise<Comment> {
    const article = await this.articleService.getArticleById(dto.articleId);
    if (!article) {
      throw new UnprocessableEntityException(
        'Article not found, check if the article exists',
      );
    }
    const author = await this.userService.getUserById(dto.authorId);

    const newComment: Comment = {
      id: crypto.randomUUID(),
      content: dto.content,
      articleId: article.id,
      authorId: author?.id ?? null,
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
