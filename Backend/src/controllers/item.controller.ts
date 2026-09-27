import { Request, Response, NextFunction } from 'express';
import { itemService } from '../services/item.service.js';
import {
  createItemSchema,
  updateItemSchema,
  updateFieldSchema,
  reorderItemsSchema,
  bulkItemsSchema
} from '../validators/item.validators.js';
import { sendSuccess } from '../utils/response.js';

export class ItemController {
  async checkDuplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const url = req.query.url as string;
      const itemId = req.query.itemId as string;
      const match = await itemService.checkDuplicateUrl(workspaceId, url, itemId);
      return sendSuccess(res, { duplicate: Boolean(match), match });
    } catch (err) {
      next(err);
    }
  }

  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const topicId = req.params.topicId || req.body.topicId;
      const validated = createItemSchema.parse({ ...req.body, topicId, workspaceId });
      const item = await itemService.createItem(req.user!.id, validated);
      return sendSuccess(res, item, 'Item created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const topicId = req.params.topicId || (req.query.topicId as string);
      const query = {
        workspaceId,
        topicId,
        search: req.query.search as string,
        favorite: req.query.favorite === 'true',
        tag: req.query.tag as string,
        includeArchived: req.query.includeArchived === 'true',
        isTask: req.query.isTask ? req.query.isTask === 'true' : undefined,
        assigneeId: req.query.assigneeId as string,
        taskStatus: req.query.taskStatus as string,
        sort: req.query.sort as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        field: req.query.field as string,
        operator: req.query.operator as string,
        value: req.query.value as string
      };

      const result = await itemService.getItems(req.user!.id, query, req.workspaceRole || 'owner');
      return sendSuccess(res, result.data, undefined, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async getItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await itemService.getItemById(req.user!.id, req.params.id, req.workspaceRole || 'owner');
      return sendSuccess(res, item);
    } catch (err) {
      next(err);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateItemSchema.parse(req.body);
      const item = await itemService.updateItem(req.user!.id, req.params.id, validated, req.workspaceRole || 'owner');
      return sendSuccess(res, item, 'Item updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async updateField(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateFieldSchema.parse(req.body);
      const item = await itemService.updateField(
        req.user!.id,
        req.params.itemId || req.params.id,
        req.params.fieldId,
        validated
      );
      return sendSuccess(res, item, 'Field updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const permanent = req.query.permanent === 'true';
      const result = await itemService.deleteItem(req.user!.id, req.params.id, permanent, req.workspaceRole || 'owner');
      return sendSuccess(
        res,
        result,
        permanent ? 'Item permanently deleted' : 'Item moved to trash'
      );
    } catch (err) {
      next(err);
    }
  }

  async restoreItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await itemService.restoreItem(req.user!.id, req.params.id);
      return sendSuccess(res, item, 'Item restored successfully');
    } catch (err) {
      next(err);
    }
  }

  async duplicateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const cloned = await itemService.duplicateItem(req.user!.id, req.params.id);
      return sendSuccess(res, cloned, 'Item duplicated successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async favoriteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const isFavorite = req.body.isFavorite !== undefined ? req.body.isFavorite : true;
      const item = await itemService.updateItem(req.user!.id, req.params.id, { isFavorite }, req.workspaceRole || 'owner');
      return sendSuccess(res, item, isFavorite ? 'Item added to favorites' : 'Item removed from favorites');
    } catch (err) {
      next(err);
    }
  }

  async archiveItem(req: Request, res: Response, next: NextFunction) {
    try {
      const isArchived = req.body.isArchived !== undefined ? req.body.isArchived : true;
      const item = await itemService.updateItem(req.user!.id, req.params.id, { isArchived }, req.workspaceRole || 'owner');
      return sendSuccess(res, item, isArchived ? 'Item archived' : 'Item unarchived');
    } catch (err) {
      next(err);
    }
  }

  async reorderItems(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = reorderItemsSchema.parse(req.body);
      const result = await itemService.reorderItems(req.user!.id, validated.topicId, validated.items);
      return sendSuccess(res, result, 'Items reordered successfully');
    } catch (err) {
      next(err);
    }
  }

  async bulkOperation(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = bulkItemsSchema.parse(req.body);
      const result = await itemService.bulkOperation(
        req.user!.id,
        validated.action,
        validated.itemIds,
        validated.targetTopicId,
        validated.tags
      );
      return sendSuccess(res, result, `Bulk ${validated.action} completed successfully`);
    } catch (err) {
      next(err);
    }
  }
}

export const itemController = new ItemController();
