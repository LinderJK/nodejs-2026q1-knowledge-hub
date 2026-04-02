import { ApiPropertyOptional } from "@nestjs/swagger";
import { ArticleSortBy, ArticleStatus } from "../types/article.types";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { SortOrder } from "src/common/types/sort.types";

export class ArticleQueryDto {
  @ApiPropertyOptional({ description: "Filter by status", enum: ArticleStatus, example: ArticleStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({
    description: "Filter by category id (uuid v4)",
    example: "f361871f-e3d2-48b3-bfba-15f3ae573c52",
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: "Filter by tag", example: "nodejs" })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: "Page number", example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;


  @ApiPropertyOptional({ description: "Sort by", example: "createdAt" })
  @IsOptional()
  @IsEnum(ArticleSortBy)
  sortBy?: ArticleSortBy = ArticleSortBy.CREATED_AT;

  @ApiPropertyOptional({ description: "Sort order", example: "asc" })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;

}

