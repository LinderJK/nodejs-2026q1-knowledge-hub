import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { Category } from "./types/category.types";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { ApiCreateCategory, ApiDeleteCategory, ApiGetCategories, ApiGetCategoryById, ApiUpdateCategory } from "./decorators/swagger.decorators";
import { CreateCategoryPipe } from "./pipes/create-category.pipe";


@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiGetCategories()
  async getCategories(): Promise<Category[]> {
    return this.categoryService.getCategories();
  }

  @Get(":id")
  @ApiGetCategoryById()
  async getCategoryById(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<Category> {
    return this.categoryService.getCategoryById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateCategory()
  async createCategory(@Body(CreateCategoryPipe) dto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.createCategory(dto);
  }

  @Put(":id")
  @ApiUpdateCategory()
  async updateCategory(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateCategoryDto
  ): Promise<Category> {
    return this.categoryService.updateCategory(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteCategory()
  async deleteCategory(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<void> {
    return this.categoryService.deleteCategory(id);
  }
}

