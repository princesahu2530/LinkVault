import { z } from 'zod';
import { ITEM_LIMITS } from '../types/item.types.js';

export const itemFieldInputSchema = z.object({
  fieldId: z.string().optional(),
  name: z.string().min(1, 'Field name is required').max(ITEM_LIMITS.MAX_FIELD_NAME_LENGTH).trim(),
  type: z.enum([
    'text',
    'longText',
    'url',
    'email',
    'phone',
    'currency',
    'rating',
    'number',
    'date',
    'boolean',
    'select',
    'multiSelect',
    'code',
    'markdown',
    'json',
    'relation',
    'user'
  ]),
  value: z.any().optional(),
  options: z.array(z.string().max(100)).max(ITEM_LIMITS.MAX_SELECT_OPTIONS).optional().default([]),
  relationTopicId: z.string().optional().default(''),
  relationMultiple: z.boolean().optional().default(false),
  currencyCode: z.string().max(10).optional().default('USD'),
  maxRating: z.number().int().min(1).max(10).optional().default(5),
  position: z.number().int().min(0).optional().default(0),
  required: z.boolean().optional().default(false),
  visible: z.boolean().optional().default(true)
});

export const taskPropsSchema = z.object({
  isTask: z.boolean().optional().default(false),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'cancelled']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  assigneeId: z.string().optional().default(''),
  assigneeName: z.string().optional().default(''),
  startDate: z.any().optional().nullable(),
  dueDate: z.any().optional().nullable(),
  reminderDate: z.any().optional().nullable(),
  completed: z.boolean().optional().default(false),
  progress: z.number().min(0).max(100).optional().default(0),
  dependencies: z.array(z.string()).optional().default([])
});

export const createItemSchema = z.object({
  workspaceId: z.string().optional(),
  topicId: z.string().optional(),
  templateId: z.string().nullable().optional(),
  title: z.string().max(ITEM_LIMITS.MAX_TITLE_LENGTH).optional().default(''),
  content: z.string().max(ITEM_LIMITS.MAX_CONTENT_LENGTH).optional().default(''),
  fields: z.array(itemFieldInputSchema).max(ITEM_LIMITS.MAX_FIELDS_PER_ITEM).optional().default([]),
  tags: z.array(z.string().max(50).trim()).max(ITEM_LIMITS.MAX_TAGS_PER_ITEM).optional().default([]),
  isFavorite: z.boolean().optional().default(false),
  isArchived: z.boolean().optional().default(false),
  position: z.number().int().min(0).optional(),
  visibility: z.enum(['private', 'workspace', 'topic', 'users', 'roles']).optional().default('workspace'),
  sharedWithUsers: z.array(z.string()).optional().default([]),
  sharedWithRoles: z.array(z.string()).optional().default([]),
  assigneeId: z.string().nullable().optional(),
  assigneeName: z.string().optional(),
  taskProps: taskPropsSchema.optional(),

  // Legacy / Quick Compatibility
  url: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  openInNewTab: z.boolean().optional()
});

export const updateItemSchema = z.object({
  topicId: z.string().optional(),
  templateId: z.string().nullable().optional(),
  title: z.string().max(ITEM_LIMITS.MAX_TITLE_LENGTH).optional(),
  content: z.string().max(ITEM_LIMITS.MAX_CONTENT_LENGTH).optional(),
  fields: z.array(itemFieldInputSchema).max(ITEM_LIMITS.MAX_FIELDS_PER_ITEM).optional(),
  tags: z.array(z.string().max(50).trim()).max(ITEM_LIMITS.MAX_TAGS_PER_ITEM).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
  visibility: z.enum(['private', 'workspace', 'topic', 'users', 'roles']).optional(),
  sharedWithUsers: z.array(z.string()).optional(),
  sharedWithRoles: z.array(z.string()).optional(),
  assigneeId: z.string().nullable().optional(),
  assigneeName: z.string().optional(),
  taskProps: taskPropsSchema.optional(),

  // Legacy / Quick Compatibility
  url: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  openInNewTab: z.boolean().optional()
});

export const updateFieldSchema = z.object({
  value: z.any().optional(),
  name: z.string().max(ITEM_LIMITS.MAX_FIELD_NAME_LENGTH).optional(),
  visible: z.boolean().optional(),
  position: z.number().int().min(0).optional()
});

export const bulkItemsSchema = z.object({
  itemIds: z.array(z.string().min(1)).min(1, 'At least one item ID is required').max(ITEM_LIMITS.MAX_BULK_ITEMS),
  action: z.enum([
    'delete',
    'permanentDelete',
    'restore',
    'archive',
    'unarchive',
    'favorite',
    'unfavorite',
    'addTags',
    'removeTags',
    'move'
  ]),
  targetTopicId: z.string().optional(),
  tags: z.array(z.string().max(50)).optional()
});

export const reorderItemsSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
  items: z.array(
    z.object({
      id: z.string().min(1),
      position: z.number().int().min(0)
    })
  ).min(1, 'At least one item position is required')
});
