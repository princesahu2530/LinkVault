import { Router } from 'express';
import { templateController } from '../controllers/template.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireWorkspaceAccess } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// System Presets Library
router.get('/system', templateController.getSystemTemplates);

// Workspace templates
router.use(requireWorkspaceAccess('templates.view'));

router.post('/', requireWorkspaceAccess('templates.create'), templateController.createTemplate);
router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplateById);
router.patch('/:id', requireWorkspaceAccess('templates.edit'), templateController.updateTemplate);
router.delete('/:id', requireWorkspaceAccess('templates.delete'), templateController.deleteTemplate);
router.post('/:id/duplicate', requireWorkspaceAccess('templates.create'), templateController.duplicateTemplate);

export const templateRoutes = router;
