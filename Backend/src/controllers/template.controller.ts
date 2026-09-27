import { Request, Response, NextFunction } from 'express';
import { templateService } from '../services/template.service.js';
import { createTemplateSchema, updateTemplateSchema } from '../validators/template.validators.js';
import { sendSuccess } from '../utils/response.js';

export class TemplateController {
  async getSystemTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string;
      const templates = await templateService.getSystemTemplates(category);
      return sendSuccess(res, templates);
    } catch (err) {
      next(err);
    }
  }

  async createTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const validated = createTemplateSchema.parse(req.body);
      const template = await templateService.createTemplate(req.user!.id, { ...validated, workspaceId });
      return sendSuccess(res, template, 'Template created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      const templates = await templateService.getTemplates(req.user!.id, workspaceId);
      return sendSuccess(res, templates);
    } catch (err) {
      next(err);
    }
  }

  async getTemplateById(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateService.getTemplateById(req.user!.id, req.params.id);
      return sendSuccess(res, template);
    } catch (err) {
      next(err);
    }
  }

  async updateTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateTemplateSchema.parse(req.body);
      const template = await templateService.updateTemplate(req.user!.id, req.params.id, validated);
      return sendSuccess(res, template, 'Template updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      await templateService.deleteTemplate(req.user!.id, req.params.id);
      return sendSuccess(res, null, 'Template deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async duplicateTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const cloned = await templateService.duplicateTemplate(req.user!.id, req.params.id);
      return sendSuccess(res, cloned, 'Template duplicated successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}

export const templateController = new TemplateController();
