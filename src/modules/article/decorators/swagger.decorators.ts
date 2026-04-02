import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { ArticleStatus } from "../types/article.types";

export const ApiGetArticles = () => {
  return applyDecorators(
    ApiOperation({ summary: "Get all articles" }),
    ApiQuery({ name: "status", required: false, enum: ArticleStatus }),
    ApiQuery({ name: "categoryId", required: false, type: String }),
    ApiQuery({ name: "tag", required: false, type: String }),
    ApiResponse({ status: 200, description: "Successful operation" })
  );
};



