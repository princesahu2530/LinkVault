import { Request, Response, NextFunction } from 'express';
import { savedViewService } from '../services/savedView.service.js';

export class SavedViewController {
  async getSavedViews(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const views = await savedViewService.getSavedViews(workspaceId, req.query.topicId as string);
      res.json({ success: true, data: views });
    } catch (err) {
      next(err);
    }
  }

  async createSavedView(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const view = await savedViewService.createSavedView(workspaceId, req.user!.id, req.body);
      res.status(201).json({ success: true, data: view });
    } catch (err) {
      next(err);
    }
  }

  async updateSavedView(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const view = await savedViewService.updateSavedView(workspaceId, req.params.id, req.body);
      res.json({ success: true, data: view });
    } catch (err) {
      next(err);
    }
  }

  async deleteSavedView(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const result = await savedViewService.deleteSavedView(workspaceId, req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const savedViewController = new SavedViewController();
