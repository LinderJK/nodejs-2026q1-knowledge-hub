import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Article } from './types/article.types';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import { PrismaService } from 'src/integrations/prisma.service';
import { ArticleStatus as PrismaArticleStatus } from 'generated/prisma/enums';
import { ArticleStatus } from './types/article.types';
import { AuthUser } from '../user/types/auth.types';
import { UserRole } from '../user/types/user.types';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async getArticles(query?: ArticleQueryDto): Promise<Article[]> {
    const q = query ?? {};
    const articles = await this.prisma.article.findMany({
      where: {
        status: q.status ? this.toPrismaStatus(q.status) : undefined,
        categoryId: q.categoryId || undefined,
        tags: q.tag ? { some: { tag: { name: q.tag } } } : undefined,
      },
      orderBy: {
        [q.sortBy ?? 'createdAt']: q.sortOrder ?? 'asc',
      },
      include: {
        tags: { include: { tag: true } },
      },
      skip: ((q.page ?? 1) - 1) * (q.limit ?? 10),
      take: q.limit ?? 10,
    });
    return articles.map((article) => this.toApiArticle(article));
  }

  async getArticleById(id: string): Promise<Article> {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
      },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return this.toApiArticle(article);
  }

  async createArticle(dto: CreateArticleDto, actor: AuthUser): Promise<Article> {
    const authorId =
      actor.role === UserRole.ADMIN ? dto.authorId ?? null : actor.userId;

    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: this.toPrismaStatus(dto.status ?? ArticleStatus.DRAFT),
        authorId,
        categoryId: dto.categoryId ?? null,
        tags: this.tagsCreate(dto.tags),
      },
      include: {
        tags: { include: { tag: true } },
      },
    });
    return this.toApiArticle(article);
  }

  async updateArticle(
    id: string,
    dto: UpdateArticleDto,
    actor: AuthUser,
  ): Promise<Article> {
    const found = await this.prisma.article.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Article not found');

    if (actor.role !== UserRole.ADMIN && found.authorId !== actor.userId) {
      throw new ForbiddenException('You can update only your own articles');
    }

    const article = await this.prisma.article.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status ? this.toPrismaStatus(dto.status) : undefined,
        author:
          actor.role !== UserRole.ADMIN || dto.authorId === undefined
            ? undefined
            : dto.authorId === null
              ? { disconnect: true }
              : { connect: { id: dto.authorId } },
        category:
          dto.categoryId === undefined
            ? undefined
            : dto.categoryId === null
              ? { disconnect: true }
              : { connect: { id: dto.categoryId } },
        tags:
          dto.tags === undefined
            ? undefined
            : {
                deleteMany: {},
                create: this.tagsCreate(dto.tags)?.create ?? [],
              },
      },
      include: {
        tags: { include: { tag: true } },
      },
    });
    return this.toApiArticle(article);
  }

  private tagsCreate(tags?: string[]) {
    if (!tags?.length) {
      return undefined;
    }
    return {
      create: tags.map((name) => ({
        tag: {
          connectOrCreate: { where: { name }, create: { name } },
        },
      })),
    };
  }

  private toPrismaStatus(status: ArticleStatus): PrismaArticleStatus {
    switch (status) {
      case ArticleStatus.DRAFT:
        return PrismaArticleStatus.DRAFT;
      case ArticleStatus.PUBLISHED:
        return PrismaArticleStatus.PUBLISHED;
      case ArticleStatus.ARCHIVED:
        return PrismaArticleStatus.ARCHIVED;
    }
  }

  private toApiArticle(article: {
    id: string;
    title: string;
    content: string;
    status: PrismaArticleStatus;
    authorId: string | null;
    categoryId: string | null;
    createdAt: Date;
    updatedAt: Date;
    tags: { tag: { name: string } }[];
  }): Article {
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      status: article.status.toLowerCase() as ArticleStatus,
      authorId: article.authorId,
      categoryId: article.categoryId,
      tags: article.tags.map((item) => item.tag.name),
      createdAt: article.createdAt.getTime(),
      updatedAt: article.updatedAt.getTime(),
    };
  }

  async deleteArticle(id: string, actor: AuthUser): Promise<void> {
    const found = await this.prisma.article.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Article not found');

    if (actor.role !== UserRole.ADMIN && found.authorId !== actor.userId) {
      throw new ForbiddenException('You can delete only your own articles');
    }

    await this.prisma.article.delete({ where: { id } });
  }
}
