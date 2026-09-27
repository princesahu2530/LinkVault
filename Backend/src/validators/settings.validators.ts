import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be under 50 characters').trim()
});

export const updateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be under 50 characters').trim()
});

export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  compactMode: z.boolean().optional(),
  defaultTopicState: z.enum(['remember', 'all_expanded', 'all_collapsed']).optional(),
  showDescriptions: z.boolean().optional(),
  showUrls: z.boolean().optional(),
  appName: z.string().max(100).optional(),
  keyboardShortcutsEnabled: z.boolean().optional(),
  enableFavicons: z.boolean().optional()
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters').trim().optional(),
  avatar: z.string().max(2048).optional()
});
