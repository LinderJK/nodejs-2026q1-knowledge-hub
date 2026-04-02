import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({ description: "Category name", example: "Category name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Category description", example: "Category description" })
  @IsString()
  description: string;
}

