import { Router } from 'express';
import { linkController } from '../controllers/link.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody, validateObjectId } from '../middleware/validation.middleware.js';
import { createLinkSchema, updateLinkSchema, moveLinkSchema, reorderLinksSchema } from '../validators/link.validators.js';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(createLinkSchema), (req, res, next) => linkController.createLink(req, res, next));
router.get('/', (req, res, next) => linkController.getLinks(req, res, next));
router.get('/check-duplicate', (req, res, next) => linkController.checkDuplicate(req, res, next));
router.patch('/reorder', validateBody(reorderLinksSchema), (req, res, next) => linkController.reorderLinks(req, res, next));

router.get('/:id', validateObjectId('id'), (req, res, next) => linkController.getLinkById(req, res, next));
router.patch('/:id', validateObjectId('id'), validateBody(updateLinkSchema), (req, res, next) => linkController.updateLink(req, res, next));
router.delete('/:id', validateObjectId('id'), (req, res, next) => linkController.deleteLink(req, res, next));
router.post('/:id/restore', validateObjectId('id'), (req, res, next) => linkController.restoreLink(req, res, next));
router.post('/:id/duplicate', validateObjectId('id'), (req, res, next) => linkController.duplicateLink(req, res, next));
router.patch('/:id/move', validateObjectId('id'), validateBody(moveLinkSchema), (req, res, next) => linkController.moveLink(req, res, next));
router.patch('/:id/favorite', validateObjectId('id'), (req, res, next) => linkController.toggleFavorite(req, res, next));
router.patch('/:id/archive', validateObjectId('id'), (req, res, next) => linkController.toggleArchive(req, res, next));

export const linkRoutes = router;
