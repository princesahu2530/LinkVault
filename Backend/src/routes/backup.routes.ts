import { Router } from 'express';
import { backupController } from '../controllers/backup.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/favorites', (req, res, next) => backupController.getFavorites(req, res, next));
router.get('/recent', (req, res, next) => backupController.getRecent(req, res, next));
router.get('/archive', (req, res, next) => backupController.getArchive(req, res, next));
router.get('/trash', (req, res, next) => backupController.getTrash(req, res, next));
router.delete('/trash/empty', (req, res, next) => backupController.emptyTrash(req, res, next));

router.get('/export/json', (req, res, next) => backupController.exportJson(req, res, next));
router.get('/export/csv', (req, res, next) => backupController.exportCsv(req, res, next));
router.post('/import', (req, res, next) => backupController.importData(req, res, next));

router.get('/backup', (req, res, next) => backupController.getBackup(req, res, next));
router.post('/backup/restore', (req, res, next) => backupController.restoreBackup(req, res, next));

export const backupRoutes = router;
