import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import { TokenExpiredError } from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/integrations/prisma.service';
import { UserService } from './user.service';
import { UserRole } from './types/user.types';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

const mockJwt = {
  signAsync: vi.fn(),
  verifyAsync: vi.fn(),
};

const mockConfig = {
  get: vi.fn((key: string) => {
    if (key === 'TOKEN_EXPIRE_TIME') return '1h';
    if (key === 'TOKEN_REFRESH_EXPIRE_TIME') return '24h';
    return undefined;
  }),
  getOrThrow: vi.fn((key: string) => {
    if (key === 'JWT_SECRET_KEY') return 'access-secret';
    if (key === 'JWT_SECRET_REFRESH_KEY') return 'refresh-secret';
    throw new Error(`unexpected key ${key}`);
  }),
};

const mockUserService = {
  createUser: vi.fn(),
};

describe('AuthService', () => {
  let auth: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(bcrypt.hash).mockImplementation((t: string) =>
      Promise.resolve(`rt_hash_${t}`),
    );
    vi.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(true));
    mockJwt.signAsync.mockReset();
    mockJwt.verifyAsync.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    auth = moduleRef.get(AuthService);
  });

  describe('signup', () => {
    it('should delegate user creation to UserService', async () => {
      const publicUser = {
        id: '1',
        login: 'u',
        role: UserRole.VIEWER,
        createdAt: 1,
        updatedAt: 2,
      };
      mockUserService.createUser.mockResolvedValue(publicUser);

      const dto = { login: 'u', password: 'p', role: UserRole.VIEWER };
      await expect(auth.signup(dto)).resolves.toEqual(publicUser);
      expect(mockUserService.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should throw a ForbiddenException if the user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        auth.login({ login: 'ghost', password: 'x' }),
      ).rejects.toThrow(ForbiddenException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw a ForbiddenException if the password is incorrect', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        login: 'u',
        password: 'hash',
        role: 'viewer',
      });
      vi.mocked(bcrypt.compare).mockImplementationOnce(()=> Promise.resolve(false));


      await expect(
        auth.login({ login: 'u', password: 'wrong' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should issue tokens and save the refresh token hash on successful login', async () => {
      mockJwt.signAsync
        .mockResolvedValueOnce('access.token')
        .mockResolvedValueOnce('refresh.raw');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        login: 'user',
        password: 'pw_hash',
        role: 'editor',
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await auth.login({
        login: 'user',
        password: 'correct',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('correct', 'pw_hash');
      expect(mockJwt.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'access.token',
        refreshToken: 'refresh.raw',
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { refreshTokenHash: 'rt_hash_refresh.raw' },
      });
    });
  });

  describe('refresh', () => {
    it('should issue new tokens and save the refresh token hash', async () => {
      mockJwt.verifyAsync.mockResolvedValue({
        userId: 'user-1',
        login: 'user',
        role: UserRole.EDITOR,
        type: 'refresh',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        login: 'user',
        role: 'editor',
        refreshTokenHash: 'stored',
      });
      mockJwt.signAsync
        .mockResolvedValueOnce('new.access')
        .mockResolvedValueOnce('new.refresh');
      mockPrisma.user.update.mockResolvedValue({});

      const result = await auth.refresh({ refreshToken: 'old.refresh' });

      expect(bcrypt.compare).toHaveBeenCalledWith('old.refresh', 'stored');
      expect(result).toEqual({
        accessToken: 'new.access',
        refreshToken: 'new.refresh',
      });
    });

    it('should throw a ForbiddenException if the refresh token has been revoked', async () => {
      mockJwt.verifyAsync.mockResolvedValue({
        userId: 'user-1',
        login: 'user',
        role: UserRole.VIEWER,
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        refreshTokenHash: null,
      });

      await expect(
        auth.refresh({ refreshToken: 't' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw a ForbiddenException if the refresh token has expired', async () => {
      mockJwt.verifyAsync.mockRejectedValue(new TokenExpiredError('exp', new Date()));

      await expect(
        auth.refresh({ refreshToken: 'expired' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('logout', () => {
    it('should clear the refreshTokenHash', async () => {
      mockPrisma.user.update.mockResolvedValue({});

      await expect(
        auth.logout({ userId: 'user-1' }),
      ).resolves.toEqual({ message: 'Logged out successfully' });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { refreshTokenHash: null },
      });
    });
  });
});
