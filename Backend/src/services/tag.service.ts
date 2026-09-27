import mongoose from 'mongoose';
import { Tag } from '../models/Tag.js';
import { Link } from '../models/Link.js';
import { Item } from '../models/Item.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';

export class TagService {
  async getTags(userId: string, workspaceId?: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const filter: any = { deletedAt: null, isArchived: false };
    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      filter.workspaceId = new mongoose.Types.ObjectId(workspaceId);
    } else {
      filter.userId = userObjectId;
    }

    const [activeLinks, activeItems] = await Promise.all([
      Link.find(filter).select('tags'),
      Item.find(filter).select('tags')
    ]);

    const tagCounts: Record<string, number> = {};
    const processTags = (docs: any[]) => {
      docs.forEach(doc => {
        doc.tags?.forEach((tag: string) => {
          const clean = tag?.trim();
          if (clean) {
            tagCounts[clean] = (tagCounts[clean] || 0) + 1;
          }
        });
      });
    };

    processTags(activeLinks);
    processTags(activeItems);

    const explicitTags = await Tag.find({ userId: userObjectId }).sort({ name: 1 });

    // Ensure all stored tags are present in count object even if 0
    explicitTags.forEach(t => {
      if (tagCounts[t.name] === undefined) {
        tagCounts[t.name] = 0;
      }
    });

    const result = Object.entries(tagCounts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return result;
  }

  async createTag(userId: string, name: string) {
    const clean = name.trim();
    const normalized = clean.toLowerCase();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const existing = await Tag.findOne({ userId: userObjectId, normalizedName: normalized });
    if (existing) {
      throw new ConflictError(`Tag "#${clean}" already exists`);
    }

    const tag = await Tag.create({
      userId: userObjectId,
      name: clean,
      normalizedName: normalized
    });

    return tag;
  }

  async deleteTag(userId: string, tagId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const tag = await Tag.findOne({ _id: tagId, userId: userObjectId });
    if (!tag) throw new NotFoundError('Tag not found');

    // Remove this tag from all user's links
    await Link.updateMany(
      { userId: userObjectId, tags: tag.name },
      { $pull: { tags: tag.name } }
    );

    await Tag.deleteOne({ _id: tagId, userId: userObjectId });
    return { success: true };
  }
}

export const tagService = new TagService();
