import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

type AttemptStore = Map<string, number[]>;

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private static readonly attempts: AttemptStore = new Map();
  private readonly limit = 5;
  private readonly windowMs = 60_000;

  canActivate(context: ExecutionContext): boolean {
    if (
      process.env.AUTH_RATE_LIMIT_DISABLED === 'true' ||
      process.env.NODE_ENV !== 'production'
    ) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = `${request.route?.path ?? request.path}:${this.getClientIp(request)}`;
    const now = Date.now();
    const attempts = AuthRateLimitGuard.attempts.get(key) ?? [];
    const recentAttempts = attempts.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    if (recentAttempts.length >= this.limit) {
      throw new HttpException(
        'Too many authentication attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    recentAttempts.push(now);
    AuthRateLimitGuard.attempts.set(key, recentAttempts);

    return true;
  }

  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
      return forwardedFor.split(',')[0].trim();
    }

    return request.ip ?? request.socket.remoteAddress ?? 'unknown';
  }
}
