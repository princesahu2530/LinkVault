import { z } from 'zod';
import { ITEM_LIMITS } from '../types/item.types.js';

const templateFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required').max(ITEM_LIMITS.MAX_FIELD_NAME_LENGTH).trim(),
  type: z.enum([
    'text',
    'longText',
    'url',
    'email',
    'number',
    'date',
    'boolean',
    'select',
    'multiSelect',
    'code',
    'markdown',
    'json'
  ]),
  options: z.array(z.string().max(100)).max(ITEM_LIMITS.MAX_SELECT_OPTIONS).optional().default([]),
  required: z.boolean().optional().default(false),
  position: z.number().int().min(0).optional().default(0),
  defaultValue: z.any().optional().default(null)
});

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(120, 'Template name must be under 120 characters').trim(),
  description: z.string().max(500, 'Description must be under 500 characters').optional().default(''),
  icon: z.string().optional().default('LayoutTemplate'),
  color: z.string().optional().default('#6366f1'),
  fields: z.array(templateFieldSchema).max(ITEM_LIMITS.MAX_FIELDS_PER_ITEM).optional().default([])
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(120, 'Template name must be under 120 characters').trim().optional(),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  fields: z.array(templateFieldSchema).max(ITEM_LIMITS.MAX_FIELDS_PER_ITEM).optional()
});
