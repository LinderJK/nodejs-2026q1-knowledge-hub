import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from 'generated/prisma/enums';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ description: 'Article title', example: 'My first article' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Article content', example: 'Hello world...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Article status',
    example: ArticleStatus.DRAFT,
    enum: ArticleStatus,
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus = ArticleStatus.DRAFT;

  @ApiPropertyOptional({
    description: 'Category id (uuid v4)',
    example: 'f361871f-e3d2-48b3-bfba-15f3ae573c52',
  })
  @IsOptional()
  @ValidateIf((o: CreateArticleDto) => o.categoryId != null && o.categoryId !== '')
  @IsUUID(4)
  categoryId?: string | null;

  @ApiPropertyOptional({
    description: 'Author id (uuid v4)',
    example: 'f361871f-e3d2-48b3-bfba-15f3ae573c52',
  })
  @IsOptional()
  @ValidateIf((o: CreateArticleDto) => o.authorId != null && o.authorId !== '')
  @IsUUID(4)
  authorId?: string | null;

  @ApiPropertyOptional({
    description: 'Tags',
    example: ['nodejs', 'nestjs'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];
}
