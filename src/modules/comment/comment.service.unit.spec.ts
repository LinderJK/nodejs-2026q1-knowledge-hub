import { Test } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { CommentService } from './comment.service';
import { PrismaService } from 'src/integrations/prisma.service';
import { CommentSortBy } from './types/comment.types';
import { UserRole } from '../user/types/user.types';
import { SortOrder } from '@/common/types/sort.types';

const mockPrisma = {
  comment: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  article: {
    findUnique: vi.fn(),
  },
};

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = moduleRef.get(CommentService);
  });

  const viewer = {
    userId: 'user-1',
    login: 'user',
    role: UserRole.VIEWER,
  };

  it('getComments should filter by articleId and pagination', async () => {
    const findManySpy = vi.spyOn(mockPrisma.comment, 'findMany');
    mockPrisma.comment.findMany.mockResolvedValue([]);

    await service.getComments({
      articleId: 'art-1',
      sortBy: CommentSortBy.CREATED_AT,
      sortOrder: SortOrder.DESC,
      page: 2,
      limit: 3,
    });

    expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { articleId: 'art-1' },
        orderBy: { [CommentSortBy.CREATED_AT]: 'desc' },
        skip: 3,
        take: 3,
      }),
    );
  });

  it('getCommentById: NotFoundException', async () => {
    mockPrisma.comment.findUnique.mockResolvedValue(null);

    await expect(service.getCommentById('x')).rejects.toThrow(NotFoundException);
  });

  it('createComment: article not found — UnprocessableEntityException', async () => {
    mockPrisma.article.findUnique.mockResolvedValue(null);

    await expect(
      service.createComment(
        { articleId: 'missing', content: 'c' },
        viewer,
      ),
    ).rejects.toThrow(UnprocessableEntityException);
    expect(mockPrisma.comment.create).not.toHaveBeenCalled();
  });

  it('deleteComment: not author and not admin — ForbiddenException', async () => {
    mockPrisma.comment.findUnique.mockResolvedValue({
      id: 'c1',
      authorId: 'other',
    });

    await expect(service.deleteComment('c1', viewer)).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockPrisma.comment.delete).not.toHaveBeenCalled();
  });
});
