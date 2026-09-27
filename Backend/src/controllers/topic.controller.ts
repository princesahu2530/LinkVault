import { Request, Response, NextFunction } from 'express';
import { topicService } from '../services/topic.service.js';

export class TopicController {
  async createTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const topic = await topicService.createTopic(req.user!.id, { ...req.body, workspaceId });
      res.status(201).json({
        success: true,
        data: topic
      });
    } catch (err) {
      next(err);
    }
  }

  async getTopics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const includeArchived = req.query.includeArchived === 'true';
      const favorites = req.query.favorites === 'true';
      const search = req.query.search as string;
      const sort = req.query.sort as string;

      const topics = await topicService.getTopics(
        req.user!.id,
        {
          workspaceId,
          includeArchived,
          favorites,
          search,
          sort
        },
        req.workspaceRole || 'owner'
      );

      res.status(200).json({
        success: true,
        data: topics
      });
    } catch (err) {
      next(err);
    }
  }

  async getTopicById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeLinks = req.query.includeLinks === 'true';
      const topic = await topicService.getTopicById(
        req.user!.id,
        req.params.id,
        includeLinks,
        req.workspaceRole || 'owner'
      );

      res.status(200).json({
        success: true,
        data: topic
      });
    } catch (err) {
      next(err);
    }
  }

  async updateTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topic = await topicService.updateTopic(
        req.user!.id,
        req.params.id,
        req.body,
        req.workspaceRole || 'owner'
      );
      res.status(200).json({
        success: true,
        data: topic
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permanent = req.query.permanent === 'true';
      const result = await topicService.deleteTopic(
        req.user!.id,
        req.params.id,
        permanent,
        req.workspaceRole || 'owner'
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async restoreTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topic = await topicService.restoreTopic(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        data: topic
      });
    } catch (err) {
      next(err);
    }
  }

  async duplicateTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topic = await topicService.duplicateTopic(req.user!.id, req.params.id);
      res.status(201).json({
        success: true,
        data: topic
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const current = await topicService.getTopicById(req.user!.id, req.params.id, false, req.workspaceRole || 'owner');
      const updated = await topicService.updateTopic(req.user!.id, req.params.id, { isFavorite: !current.isFavorite }, req.workspaceRole || 'owner');

      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async togglePin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const current = await topicService.getTopicById(req.user!.id, req.params.id, false, req.workspaceRole || 'owner');
      const updated = await topicService.updateTopic(req.user!.id, req.params.id, { isPinned: !current.isPinned }, req.workspaceRole || 'owner');

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
      const current = await topicService.getTopicById(req.user!.id, req.params.id, false, req.workspaceRole || 'owner');
      const updated = await topicService.updateTopic(req.user!.id, req.params.id, { isArchived: !current.isArchived }, req.workspaceRole || 'owner');

      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async reorderTopics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await topicService.reorderTopics(req.user!.id, req.body.items);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

export const topicController = new TopicController();
