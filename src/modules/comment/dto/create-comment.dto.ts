import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content', example: 'Nice article!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Article id (uuid v4)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4)
  articleId: string;

  @ApiPropertyOptional({
    description: 'Author id (uuid v4)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4)
  authorId?: string | null;
}
