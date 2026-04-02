import { Module } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { ArticleController } from "./article.controller";
import { UserModule } from "../user/user.module";
import { CategoryModule } from "../category/category.module";

@Module({
  imports: [UserModule, CategoryModule],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}

