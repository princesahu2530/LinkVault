import { Router } from 'express';
import { activityController } from '../controllers/activity.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireWorkspaceAccess } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticateToken);
router.use(requireWorkspaceAccess('workspace.view'));

router.get('/workspace', activityController.getWorkspaceActivity);
router.get('/items/:itemId', activityController.getItemActivity);
router.get('/items/:itemId/versions', activityController.getItemVersions);
router.post('/items/:itemId/versions/:versionId/restore', requireWorkspaceAccess('items.edit'), activityController.restoreItemVersion);

export default router;
