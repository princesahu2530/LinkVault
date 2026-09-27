import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/comment.service.js';

export class CommentController {
  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const comments = await commentService.getCommentsForItem(workspaceId, req.params.itemId);
      res.json({ success: true, data: comments });
    } catch (err) {
      next(err);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const comment = await commentService.addComment(
        workspaceId,
        req.params.itemId,
        req.user!.id,
        req.body.content
      );
      res.status(201).json({ success: true, data: comment });
    } catch (err) {
      next(err);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const result = await commentService.deleteComment(
        workspaceId,
        req.params.commentId,
        req.user!.id,
        req.workspaceRole || 'member'
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const commentController = new CommentController();
