import { Response } from 'express';
import { ENV } from '../config/env.js';

export const REFRESH_COOKIE_NAME = 'linkvault_refresh_token';

export function setRefreshTokenCookie(res: Response, token: string): void {
  const isProd = ENV.NODE_ENV === 'production' || ENV.COOKIE_SECURE;
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    domain: ENV.COOKIE_DOMAIN || undefined,
    path: '/api/v1/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  const isProd = ENV.NODE_ENV === 'production' || ENV.COOKIE_SECURE;
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    domain: ENV.COOKIE_DOMAIN || undefined,
    path: '/api/v1/auth'
  });
}
