import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.headers['x-workspace-id'] as string;
      const notifications = await notificationService.getNotifications(req.user!.id, workspaceId);
      res.json({ success: true, data: notifications });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user!.id);
      res.json({ success: true, data: notification });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.headers['x-workspace-id'] as string;
      const result = await notificationService.markAllAsRead(req.user!.id, workspaceId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.deleteNotification(req.params.id, req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
