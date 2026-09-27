import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireWorkspaceAccess } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticateToken);

// Global Workspace routes
router.get('/', workspaceController.getWorkspaces);
router.get('/starter-packs', workspaceController.getStarterPacks);
router.post('/', workspaceController.createWorkspace);

// Specific Workspace routes with RBAC
router.get('/:id', requireWorkspaceAccess('workspace.view'), workspaceController.getWorkspaceById);
router.patch('/:id', requireWorkspaceAccess('workspace.edit'), workspaceController.updateWorkspace);
router.delete('/:id', requireWorkspaceAccess('workspace.delete'), workspaceController.deleteWorkspace);

// Members
router.get('/:id/members', requireWorkspaceAccess('members.view'), workspaceController.getMembers);
router.post('/:id/members', requireWorkspaceAccess('members.invite'), workspaceController.inviteMember);
router.patch('/:id/members/:memberId', requireWorkspaceAccess('members.edit'), workspaceController.updateMemberRole);
router.delete('/:id/members/:memberId', requireWorkspaceAccess('members.remove'), workspaceController.removeMember);

// Audit logs
router.get('/:id/audit-logs', requireWorkspaceAccess('settings.view'), workspaceController.getAuditLogs);

export default router;
