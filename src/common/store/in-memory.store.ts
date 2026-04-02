import { Injectable, Logger } from "@nestjs/common";
import { User } from "../../modules/user/types/user.types";
import { SortOrder } from "src/common/types/sort.types";
import { Article } from "../../modules/article/types/article.types";
import { Category } from "../../modules/category/types/category.types";
import { Comment } from "../../modules/comment/types/comment.types";
import { usersSeedData } from "./seed/users.seed";
import { categoriesSeedData } from "./seed/category.seed";
import { GetListQueryDto, PaginatedListDto } from "./get-list.dto";
import { articlesSeedData } from "./seed/article.seed";
import { commentsSeedData } from "./seed/comment.seed";

@Injectable()
export class InMemoryStore {
  users: User[] = [];
  articles: Article[] = [];
  categories: Category[] = [];
  comments: Comment[] = [];
 
  private readonly logger = new Logger(InMemoryStore.name);

  onModuleInit() {
    // this.seedUsers();
    // this.seedCategories();
    // this.seedArticles();
    // this.seedComments();
    // this.logger.debug('Seeded data');
  }


  private seedUsers() {
    this.users = usersSeedData.map((user, index) => (
      {
      ...user,
      id: crypto.randomUUID(),
      createdAt: Date.now() + index * 1000,
      updatedAt: Date.now() + index * 1000,
    }));
  }

  private seedCategories() {
    this.categories = categoriesSeedData.map((category) => (
      {
      ...category,
      id: crypto.randomUUID(),
    }));
  }

  private seedArticles() {
    this.articles = articlesSeedData.map((article, index) => (
      {
      ...article,
      authorId: this.users[Math.floor(Math.random() * this.users.length)].id,
      categoryId: this.categories[Math.floor(Math.random() * this.categories.length)].id,
      id: crypto.randomUUID(),
      createdAt: Date.now() + index * 1000,
      updatedAt: Date.now() + index * 1000,
    }));
  }

  private seedComments() {
    if (this.articles.length === 0 || this.users.length === 0) {
      this.comments = [];
      return;
    }

    this.comments = commentsSeedData.map((seed, index) => ({
      id: crypto.randomUUID(),
      content: seed.content,
      articleId: this.articles[index % this.articles.length].id,
      authorId: this.users[Math.floor(Math.random() * this.users.length)].id,
      createdAt: Date.now() + index * 1000,
    }));
  }


  private compareByField<T>(a: T, b: T, sortBy: keyof T, order: SortOrder): number {
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    let result = 0;

    if (typeof valueA === "number" && typeof valueB === "number") {
        result = valueA - valueB;
    } else {
        const stringValueA = String(valueA ?? "");
        const stringValueB = String(valueB ?? "");
        result = stringValueA.localeCompare(stringValueB, undefined, { sensitivity: "base" });
    }

    return order === SortOrder.DESC ? -result : result;
}
  
  getFilteredAndSortedList<T>(list: T[], query: GetListQueryDto<T>): PaginatedListDto<T> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortOrder = query.sortOrder ?? SortOrder.ASC;
    const sortBy = query.sortBy;

    const working = [...list];
    if (sortBy !== undefined && sortBy !== null) {
      working.sort((a, b) => this.compareByField<T>(a, b, sortBy as keyof T, sortOrder));
    }

    return this.paginate<T>(working, page, limit);
  }

   private paginate<T>(list: T[], page: number, limit: number): PaginatedListDto<T> {
    const start = (page - 1) * limit;
    const data = list.slice(start, start + limit);
    return { total: list.length, page, limit, data };
   }

}

