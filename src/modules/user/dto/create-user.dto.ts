import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../types/user.types';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'User login', example: 'test_login' })
  login: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'User password', example: 'test_password' })
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'User role',
    example: UserRole.VIEWER,
    enum: UserRole,
  })
  role?: UserRole = UserRole.VIEWER;
}
