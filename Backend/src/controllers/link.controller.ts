import { Request, Response, NextFunction } from 'express';
import { linkService } from '../services/link.service.js';

export class LinkController {
  async createLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topicId = req.params.topicId || req.body.topicId;
      const link = await linkService.createLink(req.user!.id, {
        ...req.body,
        topicId
      });

      res.status(201).json({
        success: true,
        data: link
      });
    } catch (err) {
      next(err);
    }
  }

  async getLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topicId = req.params.topicId || (req.query.topicId as string);
      const search = req.query.search as string;
      const favorite = req.query.favorite === 'true';
      const tag = req.query.tag as string;
      const includeArchived = req.query.includeArchived === 'true';
      const sort = req.query.sort as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const result = await linkService.getLinks(req.user!.id, {
        topicId,
        search,
        favorite,
        tag,
        includeArchived,
        sort,
        page,
        limit
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  async getLinkById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const link = await linkService.getLinkById(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        data: link
      });
    } catch (err) {
      next(err);
    }
  }

  async updateLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const link = await linkService.updateLink(req.user!.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: link
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permanent = req.query.permanent === 'true';
      const result = await linkService.deleteLink(req.user!.id, req.params.id, permanent);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async restoreLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const link = await linkService.restoreLink(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        data: link
      });
    } catch (err) {
      next(err);
    }
  }

  async duplicateLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const link = await linkService.duplicateLink(req.user!.id, req.params.id);
      res.status(201).json({
        success: true,
        data: link
      });
    } catch (err) {
      next(err);
    }
  }

  async moveLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const link = await linkService.moveLink(req.user!.id, req.params.id, req.body.targetTopicId);
      res.status(200).json({
        success: true,
        data: link
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const current = await linkService.getLinkById(req.user!.id, req.params.id);
      const updated = await linkService.updateLink(req.user!.id, req.params.id, { isFavorite: !current.isFavorite });

      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleArchive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const current = await linkService.getLinkById(req.user!.id, req.params.id);
      const updated = await linkService.updateLink(req.user!.id, req.params.id, { isArchived: !current.isArchived });

      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async reorderLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await linkService.reorderLinks(req.user!.id, req.body.topicId, req.body.items);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async checkDuplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const url = req.query.url as string;
      const currentLinkId = req.query.currentLinkId as string;
      const duplicates = await linkService.findDuplicateUrls(req.user!.id, url, currentLinkId);

      res.status(200).json({
        success: true,
        data: {
          isDuplicate: duplicates.length > 0,
          duplicates
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const linkController = new LinkController();
