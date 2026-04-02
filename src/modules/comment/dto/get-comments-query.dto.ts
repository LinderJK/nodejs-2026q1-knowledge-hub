import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class GetCommentsQueryDto {
  @ApiProperty({
    description: "Article id (uuid v4)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID(4)
  articleId: string;
}

