import { Injectable, NotFoundException } from "@nestjs/common";
import { Category } from "./types/category.types";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
  private readonly categoryRepository: Category[];

  constructor() {
    this.categoryRepository = [];
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository;
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = this.categoryRepository.find((c) => c.id === id);
    if (!category) {
      throw new NotFoundException("Category not found");
    }
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: dto.name,
      description: dto.description,
    };
    this.categoryRepository.push(newCategory);
    return newCategory;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const idx = this.categoryRepository.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new NotFoundException("Category not found");
    }

    const current = this.categoryRepository[idx];
    const updated: Category = { ...current, ...dto };
    this.categoryRepository[idx] = updated;
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    const idx = this.categoryRepository.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new NotFoundException("Category not found");
    }
    this.categoryRepository.splice(idx, 1);
  }
}

