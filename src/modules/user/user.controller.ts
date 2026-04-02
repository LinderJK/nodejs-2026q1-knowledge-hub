import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { UserService } from "./user.service";
import { PublicUser, User } from "./types/user.types";
import { ApiCreateUser, ApiGetUsers } from "./decorators/swagger.decorators";
import { CreateUserDto } from "./dto/create-user.dto";




@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @ApiGetUsers()
    async getUsers(): Promise<PublicUser[]> {
        return this.userService.getUsers();
    }

    @Get(':id')
    async getUserById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<PublicUser> {
        return this.userService.getUserById(id);
    }

    @Post()
    @ApiCreateUser()
    async createUser(@Body() user: CreateUserDto): Promise<PublicUser> {
        return this.userService.createUser(user);
    }

    @Put(':id')
    async updateUser(
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
        @Body() user: PublicUser
    ): Promise<PublicUser> {
        return this.userService.updateUser(id, user);
    }

    @Delete(':id')
    async deleteUser(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
        return this.userService.deleteUser(id);
    }

}