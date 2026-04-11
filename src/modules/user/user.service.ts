import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { PrismaService } from 'src/integrations/prisma.service';
import { PublicUser, UserRole } from './types/user.types';
import { UserRole as PrismaUserRole } from 'generated/prisma/enums';

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
    return this.prisma.user
      .create({
        data: {
          login: user.login,
          password: user.password,
          role: user.role
            ? (user.role.toUpperCase() as PrismaUserRole)
            : PrismaUserRole.VIEWER,
        },
      select: this.publicUserSelect,
      })
      .then((created) => this.toPublicUser(created));
  }

  async getUserById(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.publicUserSelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toPublicUser(user);
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
    return this.prisma.user
      .update({
      where: { id },
      data: { password: newPassword },
      select: this.publicUserSelect,
      })
      .then((updated) => this.toPublicUser(updated));
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

  async getUsers(query: GetUsersQueryDto): Promise<PublicUser[]> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const users = await this.prisma.user.findMany({
      select: this.publicUserSelect,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });
    return users.map((user) => this.toPublicUser(user));
  }

  private toPublicUser(user: {
    id: string;
    login: string;
    role: PrismaUserRole;
    createdAt: Date;
    updatedAt: Date;
  }): PublicUser {
    return {
      id: user.id,
      login: user.login,
      role: user.role.toLowerCase() as UserRole,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };
  }
}
