import { Request, Response, NextFunction } from 'express';
import { backupService } from '../services/backup.service.js';

export class BackupController {
  async getTrash(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await backupService.getTrash(req.user!.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async emptyTrash(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await backupService.emptyTrash(req.user!.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getArchive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await backupService.getArchive(req.user!.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await backupService.getFavorites(req.user!.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getRecent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await backupService.getRecent(req.user!.id, limit);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async exportJson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topicId = req.query.topicId as string;
      const jsonString = await backupService.exportData(req.user!.id, 'json', topicId);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=linkvault-export-${new Date().toISOString().slice(0, 10)}.json`);
      res.status(200).send(jsonString);
    } catch (err) {
      next(err);
    }
  }

  async exportCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topicId = req.query.topicId as string;
      const csvString = await backupService.exportData(req.user!.id, 'csv', topicId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=linkvault-export-${new Date().toISOString().slice(0, 10)}.csv`);
      res.status(200).send(csvString);
    } catch (err) {
      next(err);
    }
  }

  async importData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content } = req.body;
      const result = await backupService.importData(req.user!.id, content);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getBackup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const backup = await backupService.createBackup(req.user!.id);
      res.status(200).json({
        success: true,
        data: backup
      });
    } catch (err) {
      next(err);
    }
  }

  async restoreBackup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await backupService.restoreBackup(req.user!.id, req.body.backup);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

export const backupController = new BackupController();
