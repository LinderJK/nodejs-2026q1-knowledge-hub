import { Injectable, NotFoundException } from "@nestjs/common";
import { Article, ArticleStatus } from "./types/article.types";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { ArticleQueryDto } from "./dto/article-query.dto";
import { UserService } from "../user/user.service";
import { CategoryService } from "../category/category.service";
import { InMemoryStore } from "../../common/store/in-memory.store";

@Injectable()
export class ArticleService {
  

  constructor(
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly store: InMemoryStore
  ) {
  }

  async getArticles(query?: ArticleQueryDto): Promise<Article[]> {
    const { status, categoryId, tag } = query ?? {};

    return this.store.articles.filter((article) => {
      if (status && article.status !== status) return false;
      if (categoryId && article.categoryId !== categoryId) return false;
      if (tag && !article.tags.includes(tag)) return false;
      return true;
    });
  }

  async getArticleById(id: string): Promise<Article> {
    const article = this.store.articles.find((a) => a.id === id);
    if (!article) {
      throw new NotFoundException("Article not found");
    }
    return article;
  }

  async createArticle(dto: CreateArticleDto): Promise<Article> {
    const now = Date.now();
    const author = await this.userService.getUserById(dto.authorId);
    const category = await this.categoryService.getCategoryById(dto.categoryId);
    const newArticle: Article = {
      id: crypto.randomUUID(),
      title: dto.title,
      content: dto.content,
      status: dto.status ?? ArticleStatus.DRAFT,
      authorId: author?.id ?? null,
      categoryId: category?.id ?? null,
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
      throw new NotFoundException("Article not found");
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
      throw new NotFoundException("Article not found");
    }
    this.store.articles.splice(idx, 1);

    // delete comments by this article
    this.store.comments = this.store.comments.filter((c) => c.articleId !== id);
  }
}

