import {
  ArgumentMetadata,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { describe, expect, it } from 'vitest';

const pipe = new ParseUUIDPipe({ version: '4' });

const paramMeta: ArgumentMetadata = {
  type: 'param',
  metatype: String,
  data: 'id',
};

describe('ParseUUIDPipe (UUID v4)', () => {
  it('should pass valid UUID v4', async () => {
    const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    await expect(pipe.transform(id, paramMeta)).resolves.toBe(id);
  });

  it('should throw BadRequestException for invalid string', async () => {
    await expect(
      pipe.transform('not-a-uuid', paramMeta),
    ).rejects.toThrow(BadRequestException);
    await expect(
      pipe.transform('not-a-uuid', paramMeta),
    ).rejects.toMatchObject({
      response: { message: 'Validation failed (uuid v 4 is expected)' },
    });
  });

  it('should throw BadRequestException for empty string', async () => {
    await expect(pipe.transform('', paramMeta)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException for UUID of another version (v1)', async () => {
    const v1 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    await expect(pipe.transform(v1, paramMeta)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException if the control length/format is invalid', async () => {
    await expect(
      pipe.transform('f47ac10b-58cc-4372-a567-0e02b2c3d47', paramMeta),
    ).rejects.toThrow(BadRequestException);
  });
});
