import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { PrismaService } from 'src/integrations/prisma.service';
import { UserRole } from './types/user.types';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(bcrypt.hash).mockImplementation((plain: string) =>
      Promise.resolve(`hashed_${plain}`),
    );
    vi.mocked(bcrypt.compare).mockResolvedValue(void 0);

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = moduleRef.get(UserService);
  });

  describe('should create a user', () => {
    it('should hash the password and create a user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const createdAt = new Date('2026-01-01');
      const updatedAt = new Date('2026-01-02');
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        login: 'new_user',
        role: 'viewer',
        createdAt,
        updatedAt,
      });

      const result = await service.createUser({
        login: 'new_user',
        password: 'secret',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            login: 'new_user',
            password: 'hashed_secret',
          }),
        }),
      );
      expect(result).toEqual({
        id: 'u1',
        login: 'new_user',
        role: UserRole.VIEWER,
        createdAt: createdAt.getTime(),
        updatedAt: updatedAt.getTime(),
      });
    });

    it('should throw a BadRequestException if the login is already taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing',
        login: 'taken',
        password: 'x',
        role: 'viewer',
      });

      await expect(
        service.createUser({ login: 'taken', password: 'p' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createUser({ login: 'taken', password: 'p' }),
      ).rejects.toMatchObject({ response: { message: 'User already exists' } });
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should assign the viewer role by default', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        login: 'u',
        role: 'viewer',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.createUser({ login: 'u', password: 'p' });

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: 'viewer' }),
        }),
      );
    });

    it('should save the passed role (e.g. editor)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        login: 'ed',
        role: 'editor',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.createUser({
        login: 'ed',
        password: 'p',
        role: UserRole.EDITOR,
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: 'editor' }),
        }),
      );
    });
  });

  describe('getUserById', () => {
    it('should throw a NotFoundException if the user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.getUserById('missing', {
          userId: 'admin',
          login: 'a',
          role: UserRole.ADMIN,
        }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getUserById('missing', {
          userId: 'admin',
          login: 'a',
          role: UserRole.ADMIN,
        }),
      ).rejects.toMatchObject({ response: { message: 'User not found' } });
    });

    it('should throw a ForbiddenException if the user is not an admin and tries to access another user\'s profile', async () => {
      await expect(
        service.getUserById('other', {
          userId: 'self',
          login: 'u',
          role: UserRole.VIEWER,
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('updateUserPassword', () => {
    it('should throw a NotFoundException if the user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserPassword('id', 'old', 'new', {
          userId: 'id',
          login: 'u',
          role: UserRole.VIEWER,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a ForbiddenException if the old password is incorrect', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'id',
        login: 'u',
        password: 'stored_hash',
        role: 'viewer',
      });
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(void 0);

      await expect(
        service.updateUserPassword('id', 'wrong', 'new', {
          userId: 'id',
          login: 'u',
          role: UserRole.VIEWER,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteUser', () => {
    it('should throw a NotFoundException if the user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteUser('nope')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    it('should return public users with pagination', async () => {
      const d = new Date();
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: '1',
          login: 'a',
          role: 'viewer',
          createdAt: d,
          updatedAt: d,
        },
      ]);

      const list = await service.getUsers({ page: 2, limit: 5 });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
      expect(list).toHaveLength(1);
      expect(list[0].login).toBe('a');
    });
  });
});
