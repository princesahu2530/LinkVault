import { z } from 'zod';

export const createTopicSchema = z.object({
  name: z.string().min(1, 'Topic name is required').max(120, 'Topic name must be under 120 characters').trim(),
  description: z.string().max(500, 'Description must be under 500 characters').optional().default(''),
  icon: z.string().optional().default('Folder'),
  color: z.string().optional().default('#6366f1'),
  isPinned: z.boolean().optional().default(false),
  isFavorite: z.boolean().optional().default(false),
  defaultTemplateId: z.string().nullable().optional(),
  defaultView: z.enum(['cards', 'table', 'compact', 'detailed']).optional().default('cards'),
  defaultSort: z.string().optional().default('position'),
  visibleColumns: z.array(z.string()).optional()
});

export const updateTopicSchema = z.object({
  name: z.string().min(1, 'Topic name is required').max(120, 'Topic name must be under 120 characters').trim().optional(),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isPinned: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  defaultTemplateId: z.string().nullable().optional(),
  defaultView: z.enum(['cards', 'table', 'compact', 'detailed']).optional(),
  defaultSort: z.string().optional(),
  visibleColumns: z.array(z.string()).optional()
});

export const reorderTopicsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      position: z.number().int().min(0)
    })
  ).min(1, 'At least one topic position item is required')
});
