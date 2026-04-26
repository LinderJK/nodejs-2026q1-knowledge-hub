import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ArticleService } from './article.service';
import { PrismaService } from 'src/integrations/prisma.service';
import { ArticleStatus as PrismaArticleStatus } from 'generated/prisma/enums';
import { ArticleStatus } from './types/article.types';
import { UserRole } from '../user/types/user.types';

function draftRow(
  id: string,
  status?: ArticleStatus,
  tagNames?: string[],
  categoryId?: string,
) {
  const tags: { tag: { name: string } }[] =
    tagNames?.map((name) => ({ tag: { name } })) ?? [];

  return {
    id,
    title: 'T',
    content: 'C',
    status: status ?? PrismaArticleStatus.DRAFT,
    authorId: 'viewer-1',
    categoryId: categoryId ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags,
  };
}

const mockPrisma = {
  article: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('ArticleService', () => {
  let service: ArticleService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = moduleRef.get(ArticleService);
  });

  const actorViewer = {
    userId: 'viewer-1',
    login: 'v',
    role: UserRole.VIEWER,
  };

  const actorAdmin = {
    userId: 'admin-1',
    login: 'a',
    role: UserRole.ADMIN,
  };

  it('getArticleById: NotFoundException', async () => {
    mockPrisma.article.findUnique.mockResolvedValue(null);

    await expect(service.getArticleById('x')).rejects.toThrow(NotFoundException);
  });

  it('createArticle: default author is the current user', async () => {
    mockPrisma.article.create.mockResolvedValue({
      id: 'a1',
      title: 'T',
      content: 'C',
      status: 'DRAFT',
      authorId: 'viewer-1',
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    });

    await service.createArticle(
      {
        title: 'T',
        content: 'C',
        status: ArticleStatus.DRAFT,
      },
      actorViewer,
    );

    expect(mockPrisma.article.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          authorId: 'viewer-1',
        }),
      }),
    );
  });

  it('createArticle: admin can set authorId', async () => {
    mockPrisma.article.create.mockResolvedValue({
      id: 'a1',
      title: 'T',
      content: 'C',
      status: 'DRAFT',
      authorId: 'other',
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    });

    await service.createArticle(
      {
        title: 'T',
        content: 'C',
        authorId: 'other',
      },
      actorAdmin,
    );

    expect(mockPrisma.article.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          authorId: 'other',
        }),
      }),
    );
  });

  it('updateArticle: NotFoundException', async () => {
    mockPrisma.article.findUnique.mockResolvedValue(null);

    await expect(
      service.updateArticle('id', { title: 'x' }, actorViewer),
    ).rejects.toThrow(NotFoundException);
  });

  it('updateArticle: non-admin cannot update someone elses article', async () => {
    mockPrisma.article.findUnique.mockResolvedValue({
      id: 'art',
      authorId: 'someone-else',
    });

    await expect(
      service.updateArticle('art', { title: 'x' }, actorViewer),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deleteArticle: non-admin cannot delete someone elses article', async () => {
    mockPrisma.article.findUnique.mockResolvedValue({
      id: 'art',
      authorId: 'other',
    });

    await expect(service.deleteArticle('art', actorViewer)).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockPrisma.article.delete).not.toHaveBeenCalled();
  });

  it('getArticles: passes status filter', async () => {
    const rowsFromDb = [draftRow('a1'), draftRow('a2'), draftRow('a3')];
    mockPrisma.article.findMany.mockResolvedValue(rowsFromDb);

    const articles = await service.getArticles({ status: ArticleStatus.DRAFT });

    expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: PrismaArticleStatus.DRAFT,
        }),
      }),
    );
    expect(articles).toHaveLength(rowsFromDb.length);
    expect(articles.every((a) => a.status === ArticleStatus.DRAFT)).toBe(true);
  });

  it('getArticles: passes categoryId filter', async () => {
    const rowsFromDb = [draftRow('a1', undefined, undefined, 'cat-1')];
    mockPrisma.article.findMany.mockResolvedValue(rowsFromDb);
    const articles = await service.getArticles({ categoryId: 'cat-1' });
    expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoryId: 'cat-1',
        }),
      }),
    );
    expect(articles).toHaveLength(rowsFromDb.length);
    expect(articles.every((a) => a.categoryId === 'cat-1' && a.status === ArticleStatus.DRAFT)).toBe(true);
  });

  it('getArticles: passes tag filter', async () => {
    const rowsFromDb = [draftRow('a1', undefined, ['tag-1'])];
    mockPrisma.article.findMany.mockResolvedValue(rowsFromDb);
    const articles = await service.getArticles({ tag: 'tag-1' });
    expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tags: { some: { tag: { name: 'tag-1' } } },
        }),
      }),
    );
    expect(articles.every((a) => a.tags.includes('tag-1'))).toBe(true);
  });
});
