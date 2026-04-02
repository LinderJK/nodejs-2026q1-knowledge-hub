import { Injectable, NotFoundException } from "@nestjs/common";
import { Category } from "./types/category.types";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InMemoryStore } from "src/common/store/in-memory.store";

@Injectable()
export class CategoryService {
  
  constructor(private readonly store: InMemoryStore) {
  }

  async getCategories(): Promise<Category[]> {
    return this.store.categories;
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = this.store.categories.find((c) => c.id === id);
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
    this.store.categories.push(newCategory);
    return newCategory;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const idx = this.store.categories.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new NotFoundException("Category not found");
    }

    const current = this.store.categories[idx];
    const updated: Category = { ...current, ...dto };
    this.store.categories[idx] = updated;
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    const idx = this.store.categories.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new NotFoundException("Category not found");
    }
    this.store.categories.splice(idx, 1);
  }
}

