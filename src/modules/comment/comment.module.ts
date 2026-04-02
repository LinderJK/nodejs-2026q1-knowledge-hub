import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { ArticleModule } from '../article/article.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ArticleModule, UserModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
