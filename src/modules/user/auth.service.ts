import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JsonWebTokenError, TokenExpiredError, type SignOptions } from 'jsonwebtoken';
import { PrismaService } from 'src/integrations/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { PublicUser, UserRole } from './types/user.types';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  signup(dto: CreateUserDto): Promise<PublicUser> {
    return this.userService.createUser(dto);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { login: dto.login },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    return this.issueTokens({
      userId: user.id,
      login: user.login,
      role: user.role as UserRole,
    });
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user?.refreshTokenHash) {
      throw new ForbiddenException('Refresh token has been revoked');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      dto.refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Refresh token has been revoked');
    }

    return this.issueTokens({
      userId: user.id,
      login: user.login,
      role: user.role as UserRole,
    });
  }

  async logout(user: { userId: string }) {
    await this.prisma.user.update({
      where: { id: user.userId },
      data: { refreshTokenHash: null },
    });

    return { message: 'Logged out successfully' };
  }

  private async issueTokens(user: { userId: string; login: string; role: UserRole }) {
    const accessPayload = { userId: user.userId, login: user.login, role: user.role };
    const refreshPayload = { ...user, type: 'refresh' as const };

    const accessExpiresIn = (this.configService.get<string>(
      'TOKEN_EXPIRE_TIME',
    ) ?? '1h') as NonNullable<SignOptions['expiresIn']>;
    const refreshExpiresIn = (this.configService.get<string>(
      'TOKEN_REFRESH_EXPIRE_TIME',
    ) ?? '24h') as NonNullable<SignOptions['expiresIn']>;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET_KEY'),
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET_REFRESH_KEY'),
        expiresIn: refreshExpiresIn,
      }),
    ]);

    await this.prisma.user.update({
      where: { id: user.userId },
      data: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) },
    });

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string) {
    try {
      return await this.jwtService.verifyAsync<{
        userId: string;
        login: string;
        role: UserRole;
        type?: string;
      }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET_REFRESH_KEY'),
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ForbiddenException('Refresh token has expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new ForbiddenException('Refresh token is invalid');
      }
      throw new ForbiddenException('Refresh token verification failed');
    }
  }
}
