export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export interface PublicUser {
  id: string;
  login: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
}

export enum UserSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ROLE = 'role',
}
