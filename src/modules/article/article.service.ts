import { Injectable, NotFoundException } from "@nestjs/common";
import { Article, ArticleStatus } from "./types/article.types";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { ArticleQueryDto } from "./dto/article-query.dto";
import { UserService } from "../user/user.service";

@Injectable()
export class ArticleService {
  private readonly articleRepository: Article[];

  constructor(
    private readonly userService: UserService,
    // private readonly categoryService: CategoryService,
  ) {
    this.articleRepository = [];

  }

  async getArticles(query?: ArticleQueryDto): Promise<Article[]> {
    const { status, categoryId, tag } = query ?? {};

    return this.articleRepository.filter((article) => {
      if (status && article.status !== status) return false;
      if (categoryId && article.categoryId !== categoryId) return false;
      if (tag && !article.tags.includes(tag)) return false;
      return true;
    });
  }

  async getArticleById(id: string): Promise<Article> {
    const article = this.articleRepository.find((a) => a.id === id);
    if (!article) {
      throw new NotFoundException("Article not found");
    }
    return article;
  }

  async createArticle(dto: CreateArticleDto): Promise<Article> {
    const now = Date.now();
    const author = await this.userService.getUserById(dto.authorId);
    if (!author) {
      throw new NotFoundException("Author not found, check if the user exists");
    }
    const newArticle: Article = {
      id: crypto.randomUUID(),
      title: dto.title,
      content: dto.content,
      status: dto.status ?? ArticleStatus.DRAFT,
      authorId: author.id,
      categoryId: dto.categoryId,
      tags: dto.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };

    this.articleRepository.push(newArticle);
    return newArticle;
  }

  async updateArticle(id: string, dto: UpdateArticleDto): Promise<Article> {
    const idx = this.articleRepository.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new NotFoundException("Article not found");
    }

    const current = this.articleRepository[idx];
    const updated: Article = {
      ...current,
      ...dto,
      updatedAt: Date.now(),
    };

    this.articleRepository[idx] = updated;
    return updated;
  }

  async deleteArticle(id: string): Promise<void> {
    const idx = this.articleRepository.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new NotFoundException("Article not found");
    }
    this.articleRepository.splice(idx, 1);
  }
}

