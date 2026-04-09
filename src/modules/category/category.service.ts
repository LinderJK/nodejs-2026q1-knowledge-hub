import { Injectable, NotFoundException } from '@nestjs/common';
import { Category, CategorySortBy } from './types/category.types';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { PrismaService } from 'src/integrations/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories(query: CategoryQueryDto): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: {
        [query.sortBy ?? CategorySortBy.NAME]: query.sortOrder ?? 'asc',
      },
      skip: ((query.page ?? 1) - 1) * (query.limit ?? 10),
      take: query.limit ?? 10,
    });
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const found = await this.prisma.category.findUnique({ where: { id } });
    if (!found) {
      throw new NotFoundException('Category not found');
    }
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCategory(id: string): Promise<void> {
    const found = await this.prisma.category.findUnique({ where: { id } });
    if (!found) {
      throw new NotFoundException('Category not found');
    }
    await this.prisma.category.delete({ where: { id } });
  }
}
