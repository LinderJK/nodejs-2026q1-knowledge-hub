import { Module } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { ArticleController } from "./article.controller";
import { UserModule } from "../user/user.module";

@Module({
  imports: [UserModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}

