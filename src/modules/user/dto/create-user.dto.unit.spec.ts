import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../types/user.types';

// class-validator
describe('CreateUserDto', () => {
  it('should accept valid login and password', async () => {
    const dto = plainToInstance(CreateUserDto, {
      login: 'user',
      password: 'password',
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('should reject empty login', async () => {
    const dto = plainToInstance(CreateUserDto, {
      login: '',
      password: 'password',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'login')).toBe(true);
  });

  it('should reject empty password', async () => {
    const dto = plainToInstance(CreateUserDto, {
      login: 'user',
      password: '',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should reject non-existent role', async () => {
    const dto = plainToInstance(CreateUserDto, {
      login: 'user',
      password: 'password',
      role: 'superuser',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('should accept optional role from enum', async () => {
    const dto = plainToInstance(CreateUserDto, {
      login: 'user',
      password: 'password',
      role: UserRole.ADMIN,
    });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.role).toBe(UserRole.ADMIN);
  });
});
