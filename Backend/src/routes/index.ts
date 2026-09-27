import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { userRoutes } from './user.routes.js';
import workspaceRoutes from './workspace.routes.js';
import { topicRoutes } from './topic.routes.js';
import { itemRoutes } from './item.routes.js';
import { templateRoutes } from './template.routes.js';
import savedViewRoutes from './savedView.routes.js';
import notificationRoutes from './notification.routes.js';
import commentRoutes from './comment.routes.js';
import activityRoutes from './activity.routes.js';
import { linkRoutes } from './link.routes.js';
import { tagRoutes } from './tag.routes.js';
import { searchRoutes } from './search.routes.js';
import { settingsRoutes } from './settings.routes.js';
import { backupRoutes } from './backup.routes.js';
import { healthCheck } from '../controllers/user.controller.js';

const router = Router();

router.get('/health', healthCheck);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/topics', topicRoutes);
router.use('/items', itemRoutes);
router.use('/templates', templateRoutes);
router.use('/saved-views', savedViewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/comments', commentRoutes);
router.use('/activity', activityRoutes);
router.use('/links', linkRoutes);
router.use('/tags', tagRoutes);
router.use('/search', searchRoutes);
router.use('/settings', settingsRoutes);
router.use('/', backupRoutes);

export const apiRouter = router;
