import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";
import { CommentSortBy } from "../types/comment.types";
import { SortOrder } from "src/common/types/sort.types";

export class GetCommentsQueryDto {
  @ApiProperty({
    description: "Article id (uuid v4)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID(4)
  articleId: string;

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
  @IsEnum(CommentSortBy)
  sortBy?: CommentSortBy = CommentSortBy.CREATED_AT;

  @ApiPropertyOptional({ description: "Sort order", example: "asc" })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}

