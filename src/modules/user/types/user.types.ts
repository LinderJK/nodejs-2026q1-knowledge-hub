export interface User {
  id: string; // uuid v4
  login: string;
  password: string;
  role?: UserRole;
  createdAt: number; // timestamp of creation
  updatedAt: number; // timestamp of last update
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export type PublicUser = Omit<User, 'password'>;

export enum UserSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ROLE = 'role',
}
