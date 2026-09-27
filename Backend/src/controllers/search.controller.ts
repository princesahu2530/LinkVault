import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service.js';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = req.query.q as string;
      const type = (req.query.type as 'all' | 'topics' | 'items' | 'links' | 'templates') || 'all';
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);

      const results = await searchService.search(req.user!.id, q, type, workspaceId, req.workspaceRole || 'owner');
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (err) {
      next(err);
    }
  }
}

export const searchController = new SearchController();
