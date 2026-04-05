import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Category name',
    example: 'Updated name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
