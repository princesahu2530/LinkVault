import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validators/auth.validators.js';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', authLimiter, validateBody(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/logout-all', requireAuth, (req, res, next) => authController.logoutAll(req, res, next));
router.get('/me', requireAuth, (req, res, next) => authController.getMe(req, res, next));
router.patch('/password', requireAuth, validateBody(changePasswordSchema), (req, res, next) => authController.changePassword(req, res, next));
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next));

export const authRoutes = router;
