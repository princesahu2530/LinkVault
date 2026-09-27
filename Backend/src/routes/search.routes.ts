import { Router } from 'express';
import { searchController } from '../controllers/search.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res, next) => searchController.search(req, res, next));

export const searchRoutes = router;
