import { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service.js';

export class SettingsController {
  async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await settingsService.getSettings(req.user!.id);
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await settingsService.updateSettings(req.user!.id, req.body);
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (err) {
      next(err);
    }
  }
}

export const settingsController = new SettingsController();
