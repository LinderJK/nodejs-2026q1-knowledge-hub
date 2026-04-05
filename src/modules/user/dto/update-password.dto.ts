import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Old password', example: 'old_password' })
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'New password', example: 'new_password' })
  newPassword: string;
}
