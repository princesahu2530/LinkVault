import { Request, Response, NextFunction } from 'express';
import { activityService, versionService } from '../services/activity.service.js';

export class ActivityController {
  async getWorkspaceActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const activities = await activityService.getWorkspaceActivity(workspaceId, Number(req.query.limit) || 50);
      res.json({ success: true, data: activities });
    } catch (err) {
      next(err);
    }
  }

  async getItemActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const activities = await activityService.getItemActivity(workspaceId, req.params.itemId, Number(req.query.limit) || 30);
      res.json({ success: true, data: activities });
    } catch (err) {
      next(err);
    }
  }

  async getItemVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const versions = await versionService.getItemVersions(workspaceId, req.params.itemId);
      res.json({ success: true, data: versions });
    } catch (err) {
      next(err);
    }
  }

  async restoreItemVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const item = await versionService.restoreVersion(
        workspaceId,
        req.params.itemId,
        req.params.versionId,
        req.user!.id,
        req.user!.name
      );
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
}

export const activityController = new ActivityController();
