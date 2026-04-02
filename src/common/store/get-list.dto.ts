import { SortOrder } from "src/common/types/sort.types";

export class GetListQueryDto<T> {
    page?: number;
    limit?: number;
    sortBy?: keyof T;
    sortOrder?: SortOrder;
  }

  export class PaginatedListDto<T> {
    total: number;
    page: number;
    limit: number;
    data: T[];
  }