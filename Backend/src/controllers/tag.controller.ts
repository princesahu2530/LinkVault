import { Request, Response, NextFunction } from 'express';
import { tagService } from '../services/tag.service.js';

export class TagController {
  async getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const tags = await tagService.getTags(req.user!.id, workspaceId);
      res.status(200).json({
        success: true,
        data: tags
      });
    } catch (err) {
      next(err);
    }
  }

  async createTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tag = await tagService.createTag(req.user!.id, req.body.name);
      res.status(201).json({
        success: true,
        data: tag
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await tagService.deleteTag(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

export const tagController = new TagController();
