import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "generated/prisma/client";



@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.get<string>('POSTGRES_URL'),
    });
    super({
      adapter,
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}