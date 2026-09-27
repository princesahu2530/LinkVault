import { Router } from 'express';
import { itemController } from '../controllers/item.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireWorkspaceAccess } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireWorkspaceAccess('items.view'));

// Duplicate check
router.get('/check-duplicate', itemController.checkDuplicate);

// Bulk operations & Reordering
router.post('/bulk', requireWorkspaceAccess('items.edit'), itemController.bulkOperation);
router.patch('/reorder', requireWorkspaceAccess('items.edit'), itemController.reorderItems);

// Item collection routes
router.post('/', requireWorkspaceAccess('items.create'), itemController.createItem);
router.get('/', itemController.getItems);

// Single Item actions
router.get('/:id', itemController.getItemById);
router.patch('/:id', requireWorkspaceAccess('items.edit'), itemController.updateItem);
router.delete('/:id', requireWorkspaceAccess('items.delete'), itemController.deleteItem);

router.post('/:id/restore', requireWorkspaceAccess('items.restore'), itemController.restoreItem);
router.post('/:id/duplicate', requireWorkspaceAccess('items.duplicate'), itemController.duplicateItem);
router.patch('/:id/favorite', requireWorkspaceAccess('items.edit'), itemController.favoriteItem);
router.patch('/:id/archive', requireWorkspaceAccess('items.archive'), itemController.archiveItem);

// Individual field update
router.patch('/:id/fields/:fieldId', requireWorkspaceAccess('items.edit'), itemController.updateField);

export const itemRoutes = router;
