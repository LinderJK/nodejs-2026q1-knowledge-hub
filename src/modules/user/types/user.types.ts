import { User } from 'generated/prisma/client';
export { UserRole } from 'generated/prisma/enums';

export type PublicUser = Omit<User, 'password'>;

export enum UserSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ROLE = 'role',
}
