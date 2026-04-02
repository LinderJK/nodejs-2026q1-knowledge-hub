import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserRole } from "../types/user.types";
import { UpdatePasswordDto } from "../dto/update-password.dto";

export const ApiGetUsers = () => {
    return applyDecorators(
        ApiOperation({ summary: 'Get all users' }),
        ApiResponse({ status: 200, description: 'Successful operation' }),
    );
};

export const ApiGetUserById = () => {
    return applyDecorators(
        ApiOperation({ summary: 'Get user by id' }),
        ApiResponse({ status: 200, description: 'Successful operation' }),
        ApiResponse({ status: 400, description: 'Bad request' }),
        ApiResponse({ status: 404, description: 'Not found' }),
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

// export const ApiUpdateUser = () => {
//     return applyDecorators(
//         ApiOperation({ summary: 'Update user' }),
//         ApiResponse({ status: 200, description: 'User updated' }),
//     );
// };

export const ApiUpdateUserPassword = () => {
    return applyDecorators(
        ApiOperation({ summary: 'Update user password' }),
        ApiBody({ type: UpdatePasswordDto, description: 'User password data' }),
        ApiResponse({ status: 200, description: 'User password updated' }),
        ApiResponse({ status: 400, description: 'Bad request' }),
        ApiResponse({ status: 404, description: 'Not found' }),
        ApiResponse({ status: 403, description: 'Old password is incorrect' }),
    );
};
