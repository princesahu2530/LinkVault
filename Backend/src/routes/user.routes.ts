import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { updateProfileSchema } from '../validators/settings.validators.js';

const router = Router();

router.use(requireAuth);

router.get('/me', (req, res, next) => userController.getProfile(req, res, next));
router.patch('/me', validateBody(updateProfileSchema), (req, res, next) => userController.updateProfile(req, res, next));
router.delete('/me', (req, res, next) => userController.deleteAccount(req, res, next));

export const userRoutes = router;
