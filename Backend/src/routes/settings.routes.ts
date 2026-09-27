import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { updateSettingsSchema } from '../validators/settings.validators.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res, next) => settingsController.getSettings(req, res, next));
router.patch('/', validateBody(updateSettingsSchema), (req, res, next) => settingsController.updateSettings(req, res, next));

export const settingsRoutes = router;
