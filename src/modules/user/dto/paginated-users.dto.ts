import { ApiProperty } from '@nestjs/swagger';
import { PublicUser } from '../types/user.types';

export class PaginatedUsersDto {
  @ApiProperty({ description: 'Total number of users', example: 42 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Page size', example: 10 })
  limit: number;

  @ApiProperty({
    description: 'Users for this page',
    type: 'array',
    items: { type: 'object' },
  })
  data: PublicUser[];
}
