import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireWorkspaceAccess } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticateToken);
router.use(requireWorkspaceAccess('items.view'));

router.get('/items/:itemId/comments', commentController.getComments);
router.post('/items/:itemId/comments', commentController.addComment);
router.delete('/comments/:commentId', commentController.deleteComment);

export default router;
