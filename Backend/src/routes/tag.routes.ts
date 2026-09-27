import { Router } from 'express';
import { tagController } from '../controllers/tag.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody, validateObjectId } from '../middleware/validation.middleware.js';
import { createTagSchema } from '../validators/settings.validators.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res, next) => tagController.getTags(req, res, next));
router.post('/', validateBody(createTagSchema), (req, res, next) => tagController.createTag(req, res, next));
router.delete('/:id', validateObjectId('id'), (req, res, next) => tagController.deleteTag(req, res, next));

export const tagRoutes = router;
