import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PublicUser } from './types/user.types';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard';
import { Public } from './decorators/public.decorator';
import { TokenPair } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthRateLimitGuard)
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() user: CreateUserDto): Promise<PublicUser> {
    return this.authService.signup(user);
  }

  @Public()
  @UseGuards(AuthRateLimitGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() user: LoginDto): Promise<TokenPair> {
    return this.authService.login(user);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: { refreshToken?: string },
  ): Promise<TokenPair> {
    if (typeof body?.refreshToken !== 'string' || !body.refreshToken.trim()) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refresh({ refreshToken: body.refreshToken });
  }
}
