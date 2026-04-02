import { Injectable, Logger } from "@nestjs/common";
import { SortOrder, User, UserSortBy } from "../../modules/user/types/user.types";
import { Article } from "../../modules/article/types/article.types";
import { Category } from "../../modules/category/types/category.types";
import { Comment } from "../../modules/comment/types/comment.types";
import { usersSeedData } from "./seed/users.seed";
import { categoriesSeedData } from "./seed/category.seed";
import { GetListQueryDto, PaginatedListDto } from "./get-list.dto";

@Injectable()
export class InMemoryStore {
  users: User[] = [];
  articles: Article[] = [];
  categories: Category[] = [];
  comments: Comment[] = [];
 
  private readonly logger = new Logger(InMemoryStore.name);

  onModuleInit() {
    this.seedUsers();
    this.seedCategories();
    this.logger.debug('Seeded data');
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
    const sortBy = query.sortBy ?? UserSortBy.CREATED_AT;
    const sortOrder = query.sortOrder ?? SortOrder.ASC;
    list.sort((a, b) => this.compareByField<T>(a, b, sortBy as keyof T, sortOrder));
    return this.paginate<T>(list, page, limit);
   }

   private paginate<T>(list: T[], page: number, limit: number): PaginatedListDto<T> {
    const start = (page - 1) * limit;
    const data = list.slice(start, start + limit);
    return { total: list.length, page, limit, data };
   }

}

