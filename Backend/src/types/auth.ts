export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isEmailVerified?: boolean;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}
