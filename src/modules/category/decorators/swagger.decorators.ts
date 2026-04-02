import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { UpdateCategoryDto } from "../dto/update-category.dto";

export const ApiGetCategories = () => {
  return applyDecorators(
    ApiOperation({ summary: "Get all categories" }),
    ApiResponse({ status: 200, description: "Successful operation" })
  );
};

export const ApiGetCategoryById = () => {
  return applyDecorators(
    ApiOperation({ summary: "Get category by id" }),
    ApiParam({
      name: "id",
      type: String,
      description: "Category id",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    ApiResponse({ status: 200, description: "Successful operation" }),
    ApiResponse({ status: 400, description: "Bad request" }),
    ApiResponse({ status: 404, description: "Not found" })
  );
};

export const ApiCreateCategory = () => {
  return applyDecorators(
    ApiOperation({ summary: "Create category" }),
    ApiBody({ type: CreateCategoryDto, description: "Category data" }),
    ApiResponse({ status: 201, description: "Category created" }),
    ApiResponse({ status: 400, description: "Bad request" })
  );
};

export const ApiUpdateCategory = () => {
  return applyDecorators(
    ApiOperation({ summary: "Update category" }),
    ApiBody({ type: UpdateCategoryDto, description: "Category update data" }),
    ApiResponse({ status: 200, description: "Category updated" }),
    ApiResponse({ status: 400, description: "Bad request" }),
    ApiResponse({ status: 404, description: "Not found" })
  );
};

export const ApiDeleteCategory = () => {
  return applyDecorators(
    ApiOperation({ summary: "Delete category" }),
    ApiResponse({ status: 204, description: "Category deleted" }),
    ApiResponse({ status: 400, description: "Bad request" }),
    ApiResponse({ status: 404, description: "Not found" })
  );
};

