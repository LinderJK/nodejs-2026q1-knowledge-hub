import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { UserSortBy } from '../types/user.types';
import { SortOrder } from 'src/common/types/sort.types';

export class GetUsersQueryDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort by', example: 'createdAt' })
  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy?: UserSortBy = UserSortBy.CREATED_AT;

  @ApiPropertyOptional({ description: 'Sort order', example: 'asc' })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
