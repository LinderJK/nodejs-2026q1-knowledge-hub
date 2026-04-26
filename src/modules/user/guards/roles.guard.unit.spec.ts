import { ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Request } from 'express';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../types/user.types';
import { AuthUser } from '../types/auth.types';

function httpExecutionContext(
  request: Request & { user?: AuthUser },
  handler: object = Object,
  controllerClass: object = Object,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => handler,
    getClass: () => controllerClass,
  } as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() };
  let guard: RolesGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new RolesGuard(reflector as never);
  });

  it('should pass if @Roles() is not present (metadata is empty)', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const req = { user: undefined } as Request & { user?: AuthUser };

    expect(guard.canActivate(httpExecutionContext(req))).toBe(true);
  });

  it('should pass if @Roles() is passed an empty list of roles', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const req = {} as Request & { user?: AuthUser };

    expect(guard.canActivate(httpExecutionContext(req))).toBe(true);
  });

  it('should pass if user role is in the list', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === ROLES_KEY) {
        return [UserRole.ADMIN, UserRole.EDITOR];
      }
      return undefined;
    });
    const req = {
      user: {
        userId: '1',
        login: 'e',
        role: UserRole.EDITOR,
      },
    } as Request & { user: AuthUser };

    expect(guard.canActivate(httpExecutionContext(req))).toBe(true);
  });

  it('should throw ForbiddenException if roles are required but user is not on request', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === ROLES_KEY) return [UserRole.ADMIN];
      return undefined;
    });
    const req = {} as Request & { user?: AuthUser };

    expect(() => guard.canActivate(httpExecutionContext(req))).toThrow(
      ForbiddenException,
    );
    expect(() => guard.canActivate(httpExecutionContext(req))).toThrow(
      'Insufficient permissions',
    );
  });

  it('should throw ForbiddenException if user role is not in the list', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === ROLES_KEY) return [UserRole.ADMIN];
      return undefined;
    });
    const req = {
      user: {
        userId: '1',
        login: 'v',
        role: UserRole.VIEWER,
      },
    } as Request & { user: AuthUser };

    expect(() => guard.canActivate(httpExecutionContext(req))).toThrow(
      ForbiddenException,
    );
  });
});
