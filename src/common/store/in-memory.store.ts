import { Injectable, Logger } from "@nestjs/common";
import { User } from "../../modules/user/types/user.types";
import { Article } from "../../modules/article/types/article.types";
import { Category } from "../../modules/category/types/category.types";
import { Comment } from "../../modules/comment/types/comment.types";
import { seedData } from "./seed/users.seed";

@Injectable()
export class InMemoryStore {
  users: User[] = [];
  articles: Article[] = [];
  categories: Category[] = [];
  comments: Comment[] = [];
 
  private readonly logger = new Logger(InMemoryStore.name);

  onModuleInit() {
    this.users = seedData.map((user, index) => (
      {
      ...user,
      id: crypto.randomUUID(),
      createdAt: Date.now() + index * 1000,
      updatedAt: Date.now() + index * 1000,
    }));
    this.logger.debug('Seeded users');
  }
}

