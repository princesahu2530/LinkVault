import { Router } from 'express';
import { savedViewController } from '../controllers/savedView.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireWorkspaceAccess } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticateToken);
router.use(requireWorkspaceAccess('workspace.view'));

router.get('/', savedViewController.getSavedViews);
router.post('/', savedViewController.createSavedView);
router.patch('/:id', savedViewController.updateSavedView);
router.delete('/:id', savedViewController.deleteSavedView);

export default router;
