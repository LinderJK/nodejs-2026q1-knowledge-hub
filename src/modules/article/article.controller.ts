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
  Put,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { Article } from './types/article.types';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import {
  ApiCreateArticle,
  ApiDeleteArticle,
  ApiGetArticleById,
  ApiGetArticles,
  ApiUpdateArticle,
} from './decorators/swagger.decorators';
import { CreateArticlePipe } from './pipes/create-article.pipe';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../user/types/user.types';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { AuthUser } from '../user/types/auth.types';
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @ApiGetArticles()
  async getArticles(@Query() query: ArticleQueryDto): Promise<Article[]> {
    return this.articleService.getArticles(query);
  }

  @Get(':id')
  @ApiGetArticleById()
  async getArticleById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Article> {
    return this.articleService.getArticleById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateArticle()
  async createArticle(
    @CurrentUser() actor: AuthUser,
    @Body(CreateArticlePipe) dto: CreateArticleDto,
  ): Promise<Article> {
    return this.articleService.createArticle(dto, actor);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiUpdateArticle()
  async updateArticle(
    @CurrentUser() actor: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<Article> {
    return this.articleService.updateArticle(id, dto, actor);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteArticle()
  async deleteArticle(
    @CurrentUser() actor: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.articleService.deleteArticle(id, actor);
  }
}
