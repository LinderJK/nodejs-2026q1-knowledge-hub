import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { PrismaService } from 'src/integrations/prisma.service';
import { PublicUser } from './types/user.types';

@Injectable()
export class UserService {
  private readonly publicUserSelect = {
    id: true,
    login: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  constructor(
    private prisma: PrismaService
  ) {}

  createUser(user: CreateUserDto): Promise<PublicUser> {
    return this.prisma.user.create({
      data: user,
      select: this.publicUserSelect,
    });
  }

  async getUserById(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.publicUserSelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUserPassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.password !== oldPassword) {
      throw new ForbiddenException('Old password is incorrect');
    }
    return this.prisma.user.update({
      where: { id },
      data: { password: newPassword },
      select: this.publicUserSelect,
    });
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.delete({
      where: { id },
    });
  }

  getUsers(query: GetUsersQueryDto): Promise<PublicUser[]> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return this.prisma.user.findMany({
      select: this.publicUserSelect,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });
  }
}
