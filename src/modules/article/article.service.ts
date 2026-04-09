import { Injectable, NotFoundException } from '@nestjs/common';
import { Article } from './types/article.types';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import { PrismaService } from 'src/integrations/prisma.service';
import { ArticleStatus } from 'generated/prisma/enums';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async getArticles(query?: ArticleQueryDto): Promise<Article[]> {
    const q = query ?? {};
    return this.prisma.article.findMany({
      where: {
        status: q.status ?? undefined,
        categoryId: q.categoryId || undefined,
        tags: q.tag ? { some: { tag: { name: q.tag } } } : undefined,
      },
      orderBy: {
        [q.sortBy ?? 'createdAt']: q.sortOrder ?? 'asc',
      },
      skip: ((q.page ?? 1) - 1) * (q.limit ?? 10),
      take: q.limit ?? 10,
    });
  }

  async getArticleById(id: string): Promise<Article> {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async createArticle(dto: CreateArticleDto): Promise<Article> {
    return this.prisma.article.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status ?? ArticleStatus.DRAFT,
        authorId: dto.authorId ?? null,
        categoryId: dto.categoryId ?? null,
        ...this.tagsUpdate(dto.tags),
      },
    });
  }

  async updateArticle(id: string, dto: UpdateArticleDto): Promise<Article> {
    const found = await this.prisma.article.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Article not found');
    return this.prisma.article.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status ?? undefined,
        ...this.relationUpdate(dto),
        ...this.tagsUpdate(dto.tags),
      },
    });
  }

  private relationUpdate(dto: UpdateArticleDto) {
    return {
      title: dto.title,
      content: dto.content,
      status: dto.status ?? undefined,
      author: dto.authorId === undefined ? undefined : dto.authorId === null ? { disconnect: true } : { connect: { id: dto.authorId } },
    };
  }

  private tagsUpdate(
    tags: string[],
  ) {
    return tags.map((name) => ({
      tag: {
        connectOrCreate: { where: { name }, create: { name } },
      },
    }));
  }

  async deleteArticle(id: string): Promise<void> {
    const found = await this.prisma.article.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Article not found');
    await this.prisma.article.delete({ where: { id } });
  }
}
