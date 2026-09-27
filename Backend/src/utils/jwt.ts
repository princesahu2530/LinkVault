import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { AccessTokenPayload, RefreshTokenPayload } from '../types/auth.js';

export function signAccessToken(payload: { sub: string; email: string }): string {
  const options: SignOptions = {
    expiresIn: ENV.ACCESS_TOKEN_EXPIRES_IN as any,
  };
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(payload: { sub: string; jti: string }): string {
  const options: SignOptions = {
    expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN as any,
  };
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
