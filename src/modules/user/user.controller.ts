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
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PublicUser } from './types/user.types';
import {
  ApiCreateUser,
  ApiDeleteUser,
  ApiGetUsers,
  ApiUpdateUserPassword,
  GetUserByIdParams,
} from './decorators/swagger.decorators';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UserRole } from './types/user.types';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthUser } from './types/auth.types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiGetUsers()
  async getUsers(@Query() query: GetUsersQueryDto): Promise<PublicUser[]> {
    return this.userService.getUsers(query);
  }

  @Get(':id')
  @GetUserByIdParams()
  async getUserById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<PublicUser> {
    return this.userService.getUserById(id, actor);
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
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
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<PublicUser> {
    return this.userService.updateUserPassword(
      id,
      updatePasswordDto.oldPassword,
      updatePasswordDto.newPassword,
      actor,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteUser()
  async deleteUser(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
