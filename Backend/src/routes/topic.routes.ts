import { Router } from 'express';
import { topicController } from '../controllers/topic.controller.js';
import { linkController } from '../controllers/link.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { hasPermission } from '../middleware/rbac.middleware.js';
import { validateBody, validateObjectId } from '../middleware/validation.middleware.js';
import { createTopicSchema, updateTopicSchema, reorderTopicsSchema } from '../validators/topic.validators.js';
import { createLinkSchema } from '../validators/link.validators.js';

const router = Router();

router.use(requireAuth);

router.post('/', hasPermission('topics.create'), validateBody(createTopicSchema), (req, res, next) => topicController.createTopic(req, res, next));
router.get('/', hasPermission('topics.view'), (req, res, next) => topicController.getTopics(req, res, next));
router.patch('/reorder', hasPermission('topics.edit'), validateBody(reorderTopicsSchema), (req, res, next) => topicController.reorderTopics(req, res, next));

router.get('/:id', validateObjectId('id'), hasPermission('topics.view'), (req, res, next) => topicController.getTopicById(req, res, next));
router.patch('/:id', validateObjectId('id'), hasPermission('topics.edit'), validateBody(updateTopicSchema), (req, res, next) => topicController.updateTopic(req, res, next));
router.delete('/:id', validateObjectId('id'), hasPermission('topics.delete'), (req, res, next) => topicController.deleteTopic(req, res, next));
router.post('/:id/restore', validateObjectId('id'), hasPermission('topics.edit'), (req, res, next) => topicController.restoreTopic(req, res, next));
router.post('/:id/duplicate', validateObjectId('id'), hasPermission('topics.create'), (req, res, next) => topicController.duplicateTopic(req, res, next));
router.patch('/:id/favorite', validateObjectId('id'), hasPermission('topics.edit'), (req, res, next) => topicController.toggleFavorite(req, res, next));
router.patch('/:id/pin', validateObjectId('id'), hasPermission('topics.edit'), (req, res, next) => topicController.togglePin(req, res, next));
router.patch('/:id/archive', validateObjectId('id'), hasPermission('topics.edit'), (req, res, next) => topicController.toggleArchive(req, res, next));

import { itemController } from '../controllers/item.controller.js';

// Nested items and links under topic
router.post('/:topicId/items', validateObjectId('topicId'), (req, res, next) => itemController.createItem(req, res, next));
router.get('/:topicId/items', validateObjectId('topicId'), (req, res, next) => itemController.getItems(req, res, next));
router.post('/:topicId/links', validateObjectId('topicId'), validateBody(createLinkSchema), (req, res, next) => linkController.createLink(req, res, next));
router.get('/:topicId/links', validateObjectId('topicId'), (req, res, next) => linkController.getLinks(req, res, next));

export const topicRoutes = router;
