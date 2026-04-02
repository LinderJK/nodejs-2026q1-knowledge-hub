import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Comment } from "./types/comment.types";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { ArticleService } from "../article/article.service";
import { GetCommentsQueryDto } from "./dto/get-comments-query.dto";
import { UserService } from "../user/user.service";
import { InMemoryStore } from "src/common/store/in-memory.store";

@Injectable()
export class CommentService {
    

  constructor(private readonly store: InMemoryStore, private readonly articleService: ArticleService, private readonly userService: UserService) {
  }

  async getComments(query: GetCommentsQueryDto): Promise<Comment[]> {
    return this.store.comments.filter((c) => c.articleId === query.articleId);
  }

  async createComment(dto: CreateCommentDto): Promise<Comment> {
    const article = await this.articleService.getArticleById(dto.articleId);
      if (!article) {
        throw new UnprocessableEntityException("Article not found, check if the article exists");
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
      throw new NotFoundException("Comment not found");
    }
    this.store.comments.splice(idx, 1);
  }
}

