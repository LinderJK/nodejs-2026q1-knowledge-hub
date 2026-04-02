import { Injectable, NotFoundException } from '@nestjs/common';
import { Article, ArticleStatus } from './types/article.types';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import { InMemoryStore } from '../../common/store/in-memory.store';
import {
  GetListQueryDto,
  PaginatedListDto,
} from 'src/common/store/get-list.dto';
import { SortOrder } from 'src/common/types/sort.types';
import { ArticleSortBy } from './types/article.types';

@Injectable()
export class ArticleService {
  constructor(private readonly store: InMemoryStore) {}

  getArticles(query?: ArticleQueryDto): PaginatedListDto<Article> {
    const q = query ?? ({} as ArticleQueryDto);
    let list = [...this.store.articles];

    if (q.status !== undefined) {
      list = list.filter((a) => a.status === q.status);
    }
    if (q.categoryId !== undefined && q.categoryId !== '') {
      list = list.filter((a) => a.categoryId === q.categoryId);
    }
    if (q.tag !== undefined && q.tag !== '') {
      list = list.filter((a) => a.tags.includes(q.tag));
    }

    const listQuery: GetListQueryDto<Article> = {
      page: q.page,
      limit: q.limit,
      sortBy: (q.sortBy ?? ArticleSortBy.CREATED_AT) as keyof Article,
      sortOrder: q.sortOrder ?? SortOrder.ASC,
    };

    return this.store.getFilteredAndSortedList(list, listQuery);
  }

  async getArticleById(id: string): Promise<Article> {
    const article = this.store.articles.find((a) => a.id === id);
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  createArticle(dto: CreateArticleDto): Article {
    const now = Date.now();
    let authorId: string | null = dto.authorId ?? null;
    let categoryId: string | null = dto.categoryId ?? null;

    // if (dto.authorId != null && dto.authorId !== '') {
    //   const user = this.store.users.find((u) => u.id === dto.authorId);
    //   if (!user) {
    //     throw new NotFoundException('User not found');
    //   }
    //   authorId = user.id;
    // }
    // if (dto.categoryId != null && dto.categoryId !== '') {
    //   const category = this.store.categories.find((c) => c.id === dto.categoryId);
    //   if (!category) {
    //     throw new NotFoundException('Category not found');
    //   }
    //   categoryId = category.id;
    // }

    const newArticle: Article = {
      id: crypto.randomUUID(),
      title: dto.title,
      content: dto.content,
      status: dto.status ?? ArticleStatus.DRAFT,
      authorId,
      categoryId,
      tags: dto.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };

    this.store.articles.push(newArticle);
    return newArticle;
  }

  async updateArticle(id: string, dto: UpdateArticleDto): Promise<Article> {
    const idx = this.store.articles.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new NotFoundException('Article not found');
    }

    const current = this.store.articles[idx];
    const updated: Article = {
      ...current,
      ...dto,
      updatedAt: Date.now(),
    };

    this.store.articles[idx] = updated;
    return updated;
  }

  async deleteArticle(id: string): Promise<void> {
    const idx = this.store.articles.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new NotFoundException('Article not found');
    }
    this.store.articles.splice(idx, 1);

    // delete comments by this article
    this.store.comments = this.store.comments.filter((c) => c.articleId !== id);
  }
}
