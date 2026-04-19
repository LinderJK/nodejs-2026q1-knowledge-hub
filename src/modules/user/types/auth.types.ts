import { UserRole } from './user.types';

export interface AuthUser {
  userId: string;
  login: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
