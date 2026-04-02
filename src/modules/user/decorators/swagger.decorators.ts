import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserRole } from "../types/user.types";

export const ApiGetUsers = () => {
    return applyDecorators(
        ApiOperation({ summary: 'Get all users' }),
        ApiResponse({ status: 200, description: 'Successful operation' }),
    );
};

export const ApiCreateUser = () => {
    return applyDecorators(
        ApiOperation({ summary: 'Create user' }),
        ApiBody({ type: CreateUserDto, description: 'User data' }),
        ApiResponse({ status: 201, description: 'User created' }),
        ApiResponse({ status: 400, description: 'Bad request' }),
    );
};

export const ApiUpdateUser = () => {
    return applyDecorators(
        ApiOperation({ summary: 'Update user' }),
        ApiResponse({ status: 200, description: 'User updated' }),
    );
};