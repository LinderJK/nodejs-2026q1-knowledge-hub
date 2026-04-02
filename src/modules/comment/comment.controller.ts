import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from "@nestjs/common";
import { CommentService } from "./comment.service";
import { Comment } from "./types/comment.types";
import { GetCommentsQueryDto } from "./dto/get-comments-query.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { ApiCreateComment, ApiDeleteComment, ApiGetComments } from "./decorators/swagger.decorators";
import { CommentCreatePipe } from "./pipe/comment-create.pipe";

@Controller("comment")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiGetComments()
  async getComments(@Query() query: GetCommentsQueryDto): Promise<Comment[]> {
    return this.commentService.getComments(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateComment()
  async createComment(@Body(CommentCreatePipe) dto: CreateCommentDto): Promise<Comment> {
    return this.commentService.createComment(dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteComment()
  async deleteComment(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<void> {
    return this.commentService.deleteComment(id);
  }
}

