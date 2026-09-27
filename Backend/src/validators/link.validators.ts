import { z } from 'zod';

const urlSchema = z.string().min(1, 'URL is required').refine((val) => {
  let toTest = val.trim();
  if (!/^https?:\/\//i.test(toTest)) {
    toTest = `https://${toTest}`;
  }
  try {
    const parsed = new URL(toTest);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}, {
  message: 'Please enter a valid HTTP or HTTPS web URL'
});

export const createLinkSchema = z.object({
  topicId: z.string().optional(),
  title: z.string().min(1, 'Link title is required').max(200, 'Title must be under 200 characters').trim(),
  url: urlSchema,
  description: z.string().max(1000, 'Description must be under 1000 characters').optional().default(''),
  notes: z.string().max(20000, 'Notes must be under 20000 characters').optional().default(''),
  tags: z.array(z.string().trim().max(50)).optional().default([]),
  isFavorite: z.boolean().optional().default(false),
  openInNewTab: z.boolean().optional().default(true)
});

export const updateLinkSchema = z.object({
  topicId: z.string().optional(),
  title: z.string().min(1, 'Link title is required').max(200, 'Title must be under 200 characters').trim().optional(),
  url: urlSchema.optional(),
  description: z.string().max(1000, 'Description must be under 1000 characters').optional(),
  notes: z.string().max(20000, 'Notes must be under 20000 characters').optional(),
  tags: z.array(z.string().trim().max(50)).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  openInNewTab: z.boolean().optional()
});

export const moveLinkSchema = z.object({
  targetTopicId: z.string().min(1, 'Target topic ID is required')
});

export const reorderLinksSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
  items: z.array(
    z.object({
      id: z.string().min(1),
      position: z.number().int().min(0)
    })
  ).min(1, 'At least one link position item is required')
});
