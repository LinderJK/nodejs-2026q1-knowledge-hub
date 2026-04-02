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
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './types/comment.types';
import { GetCommentsQueryDto } from './dto/get-comments-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  ApiCreateComment,
  ApiDeleteComment,
  ApiGetCommentById,
  ApiGetComments,
} from './decorators/swagger.decorators';
import { CommentCreatePipe } from './pipe/comment-create.pipe';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiGetComments()
  getComments(@Query() query: GetCommentsQueryDto): Comment[] {
    return this.commentService.getComments(query);
  }

  @Get(':id')
  @ApiGetCommentById()
  async getCommentById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Comment> {
    return this.commentService.getCommentById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateComment()
  async createComment(
    @Body(CommentCreatePipe) dto: CreateCommentDto,
  ): Promise<Comment> {
    return this.commentService.createComment(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteComment()
  async deleteComment(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.commentService.deleteComment(id);
  }
}
