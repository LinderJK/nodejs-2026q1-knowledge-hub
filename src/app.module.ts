import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ArticleModule } from './modules/article/article.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }), UserModule, ArticleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
