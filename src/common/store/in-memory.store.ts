import { Injectable } from "@nestjs/common";
import { User } from "../../modules/user/types/user.types";
import { Article } from "../../modules/article/types/article.types";
import { Category } from "../../modules/category/types/category.types";
import { Comment } from "../../modules/comment/types/comment.types";

@Injectable()
export class InMemoryStore {
  users: User[] = [];
  articles: Article[] = [];
  categories: Category[] = [];
  comments: Comment[] = [];
}

