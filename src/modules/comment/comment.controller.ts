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
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../user/types/user.types';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { AuthUser } from '../user/types/auth.types';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiGetComments()
  getComments(@Query() query: GetCommentsQueryDto): Promise<Comment[]> {
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
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateComment()
  async createComment(
    @CurrentUser() actor: AuthUser,
    @Body(CommentCreatePipe) dto: CreateCommentDto,
  ): Promise<Comment> {
    return this.commentService.createComment(dto, actor);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteComment()
  async deleteComment(
    @CurrentUser() actor: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.commentService.deleteComment(id, actor);
  }
}
