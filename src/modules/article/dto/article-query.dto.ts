import { ApiPropertyOptional } from "@nestjs/swagger";
import { ArticleStatus } from "../types/article.types";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class ArticleQueryDto {
  @ApiPropertyOptional({ description: "Filter by status", enum: ArticleStatus, example: ArticleStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({
    description: "Filter by category id (uuid v4)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: "Filter by tag", example: "nodejs" })
  @IsOptional()
  @IsString()
  tag?: string;
}

