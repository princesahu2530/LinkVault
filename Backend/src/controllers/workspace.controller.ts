import { Request, Response, NextFunction } from 'express';
import { workspaceService } from '../services/workspace.service.js';
import { STARTER_PACKS } from '../constants/systemTemplates.js';

export class WorkspaceController {
  async getWorkspaces(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaces = await workspaceService.getWorkspacesForUser(req.user!.id);
      res.json({ success: true, data: workspaces });
    } catch (err) {
      next(err);
    }
  }

  async getStarterPacks(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, data: STARTER_PACKS });
    } catch (err) {
      next(err);
    }
  }

  async getWorkspaceById(req: Request, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.getWorkspaceById(req.params.id, req.user!.id);
      res.json({ success: true, data: workspace });
    } catch (err) {
      next(err);
    }
  }

  async createWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.createWorkspace(req.user!.id, req.body);
      res.status(201).json({ success: true, data: workspace });
    } catch (err) {
      next(err);
    }
  }

  async updateWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.updateWorkspace(req.params.id, req.user!.id, req.body);
      res.json({ success: true, data: workspace });
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workspaceService.deleteWorkspace(req.params.id, req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // --- MEMBERS ---

  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await workspaceService.getMembers(req.params.id);
      res.json({ success: true, data: members });
    } catch (err) {
      next(err);
    }
  }

  async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await workspaceService.inviteMember(req.params.id, req.user!.id, req.body);
      res.status(201).json({ success: true, data: member });
    } catch (err) {
      next(err);
    }
  }

  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await workspaceService.updateMemberRole(
        req.params.id,
        req.user!.id,
        req.params.memberId,
        req.body.role,
        req.body.customPermissions
      );
      res.json({ success: true, data: member });
    } catch (err) {
      next(err);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workspaceService.removeMember(req.params.id, req.user!.id, req.params.memberId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // --- AUDIT LOGS ---

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await workspaceService.getAuditLogs(req.params.id, Number(req.query.limit) || 50);
      res.json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }
}

export const workspaceController = new WorkspaceController();
