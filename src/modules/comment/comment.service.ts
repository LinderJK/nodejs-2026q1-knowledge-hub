import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Comment, CommentSortBy } from './types/comment.types';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments-query.dto';
import { PrismaService } from 'src/integrations/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  getComments(query: GetCommentsQueryDto): Promise<Comment[]> {
    const q = query ?? ({} as GetCommentsQueryDto);
    return this.prisma.comment
      .findMany({
      where: {
        articleId: q.articleId,
      },
      orderBy: {
        [q.sortBy ?? CommentSortBy.CREATED_AT]: q.sortOrder ?? 'asc',
      },
      skip: ((q.page ?? 1) - 1) * (q.limit ?? 10),
      take: q.limit ?? 10,
      })
      .then((comments) => comments.map((comment) => this.toApiComment(comment)));
  }

  async getCommentById(id: string): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return this.toApiComment(comment);
  }

  async createComment(dto: CreateCommentDto): Promise<Comment> {
    const article = await this.prisma.article.findUnique({
      where: { id: dto.articleId },
      select: { id: true },
    });
    if (!article) {
      throw new UnprocessableEntityException(
        'Article not found, check if the article exists',
      );
    }
    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        articleId: article.id,
        authorId: dto.authorId ?? null,
      },
    });
    return this.toApiComment(comment);
  }

  async deleteComment(id: string): Promise<void> {
    const found = await this.prisma.comment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException('Comment not found');
    }
    await this.prisma.comment.delete({ where: { id } });
  }

  private toApiComment(comment: {
    id: string;
    content: string;
    articleId: string;
    authorId: string | null;
    createdAt: Date;
  }): Comment {
    return {
      id: comment.id,
      content: comment.content,
      articleId: comment.articleId,
      authorId: comment.authorId,
      createdAt: comment.createdAt.getTime(),
    };
  }
}
