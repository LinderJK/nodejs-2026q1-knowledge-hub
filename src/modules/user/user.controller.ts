import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { PublicUser } from "./types/user.types";
import { ApiCreateUser, ApiDeleteUser, ApiGetUsers, ApiUpdateUserPassword, GetUserByIdParams } from "./decorators/swagger.decorators";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { GetUsersQueryDto } from "./dto/get-users-query.dto";
import { PaginatedUsersDto } from "./dto/paginated-users.dto";




@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @ApiGetUsers()
    async getUsers(@Query() query: GetUsersQueryDto): Promise<PaginatedUsersDto> {
        return this.userService.getUsers(query);
    }

    @Get(':id')
    @GetUserByIdParams()
    async getUserById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<PublicUser> {
        return this.userService.getUserById(id);
    }

    @Post()
    @ApiCreateUser()
    async createUser(@Body() user: CreateUserDto): Promise<PublicUser> {
        return this.userService.createUser(user);
    }

    // @Put(':id')
    // async updateUser(
    //     @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    //     @Body() user: PublicUser
    // ): Promise<PublicUser> {
    //     return this.userService.updateUser(id, user);
    // }

    @Put(':id')
    @ApiUpdateUserPassword()
    async updateUserPassword(
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
        @Body() updatePasswordDto: UpdatePasswordDto
    ): Promise<PublicUser> {
        return this.userService.updateUserPassword(id, updatePasswordDto.oldPassword, updatePasswordDto.newPassword);
    }

    @Delete(':id')
    @ApiDeleteUser()
    async deleteUser(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
        return this.userService.deleteUser(id);
    }

}