import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserRole } from '../types/user.types';

function httpExecutionContext(
  request: Partial<Request> & { user?: unknown },
  handler: object = Object,
  controllerClass: object = Object,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request as Request,
    }),
    getHandler: () => handler,
    getClass: () => controllerClass,
  } as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  const jwtService = { verifyAsync: vi.fn() };
  const reflector = { getAllAndOverride: vi.fn() };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === IS_PUBLIC_KEY) return false;
      return undefined;
    });
    guard = new JwtAuthGuard(
      jwtService as never,
      reflector as never,
    );
  });

  it('should pass public routes (@Public) without JWT verification', async () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === IS_PUBLIC_KEY) return true;
      return undefined;
    });
    const req: Partial<Request> = {};
    const ctx = httpExecutionContext(req);

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should pass requests to /doc without token', async () => {
    const req: Partial<Request> = { path: '/doc', url: '/doc' };

    await expect(
      guard.canActivate(httpExecutionContext(req)),
    ).resolves.toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if Authorization header is missing', async () => {
    const req: Partial<Request> = { path: '/api/x', headers: {} };

    await expect(guard.canActivate(httpExecutionContext(req))).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(httpExecutionContext(req))).rejects.toMatchObject({
      response: {
        message: 'Missing or invalid authorization header',
      },
    });
  });

  it('should throw UnauthorizedException if Authorization header is not Bearer', async () => {
    const req: Partial<Request> = {
      path: '/api/x',
      headers: { authorization: 'Basic xxx' },
    };

    await expect(guard.canActivate(httpExecutionContext(req))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if after Bearer there is an empty token', async () => {
    const req: Partial<Request> = {
      path: '/api/x',
      headers: { authorization: 'Bearer   ' },
    };

    await expect(guard.canActivate(httpExecutionContext(req))).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(httpExecutionContext(req))).rejects.toMatchObject({
      response: { message: 'Access token is required' },
    });
  });

  it('should set user on request and return true if JWT is valid', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      userId: 'u1',
      login: 'user',
      role: UserRole.EDITOR,
    });
    const req: Partial<Request> & { user?: unknown } = {
      path: '/api/x',
      headers: { authorization: 'Bearer valid.jwt' },
    };

    await expect(guard.canActivate(httpExecutionContext(req))).resolves.toBe(
      true,
    );
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.jwt');
    expect(req.user).toEqual({
      userId: 'u1',
      login: 'user',
      role: UserRole.EDITOR,
    });
  });

  it('should throw UnauthorizedException if JWT is invalid', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));
    const req: Partial<Request> = {
      path: '/api/x',
      headers: { authorization: 'Bearer bad.token' },
    };

    await expect(guard.canActivate(httpExecutionContext(req))).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(httpExecutionContext(req))).rejects.toMatchObject({
      response: {
        message: 'Access token is invalid or has expired',
      },
    });
  });

  it('should throw UnauthorizedException if JWT is expired', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));
    const req: Partial<Request> = {
      path: '/api/x',
      headers: { authorization: 'Bearer expired.jwt' },
    };

    await expect(guard.canActivate(httpExecutionContext(req))).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(httpExecutionContext(req))).rejects.toMatchObject({
      response: {
        message: 'Access token is invalid or has expired',
      },
    });
  });
});
