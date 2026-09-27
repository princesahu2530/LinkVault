import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie, REFRESH_COOKIE_NAME } from '../utils/cookies.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.register(req.body, userAgent, ipAddress);
      setRefreshTokenCookie(res, result.refreshToken);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          activeWorkspaceId: result.activeWorkspaceId,
          workspaces: result.workspaces
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.login(req.body, userAgent, ipAddress);
      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          activeWorkspaceId: result.activeWorkspaceId,
          activeWorkspace: result.activeWorkspace,
          workspaceRole: result.workspaceRole,
          workspacePermissions: result.workspacePermissions,
          workspaces: result.workspaces
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.refresh(rawRefreshToken, userAgent, ipAddress);
      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
      if (rawRefreshToken) {
        await authService.logout(rawRefreshToken);
      }
      clearRefreshTokenCookie(res);

      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' }
      });
    } catch (err) {
      next(err);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await authService.logoutAll(req.user.id);
      }
      clearRefreshTokenCookie(res);

      res.status(200).json({
        success: true,
        data: { message: 'All active sessions terminated' }
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: { user: req.user }
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
      clearRefreshTokenCookie(res);

      res.status(200).json({
        success: true,
        data: { message: 'Password updated successfully. Please log in again.' }
      });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.status(200).json({
        success: true,
        data: { message: 'Password reset successful. Please log in with your new password.' }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
