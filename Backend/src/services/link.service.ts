import mongoose from 'mongoose';
import { Link, ILink } from '../models/Link.js';
import { Topic } from '../models/Topic.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';
import { parsePagination, PaginatedResult } from '../utils/pagination.js';

export class LinkService {
  async createLink(userId: string, data: {
    topicId?: string;
    title: string;
    url: string;
    description?: string;
    notes?: string;
    tags?: string[];
    isFavorite?: boolean;
    openInNewTab?: boolean;
  }) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    let targetTopicId = data.topicId;
    if (!targetTopicId) {
      // Find user's first active topic or create a default "General" topic
      let defaultTopic = await Topic.findOne({ userId: userObjectId, deletedAt: null }).sort({ position: 1 });
      if (!defaultTopic) {
        defaultTopic = await Topic.create({
          userId: userObjectId,
          name: 'General',
          description: 'Default topic collection',
          position: 0
        });
      }
      targetTopicId = defaultTopic._id.toString();
    }

    // Verify topic belongs to user
    const topic = await Topic.findOne({
      _id: targetTopicId,
      userId: userObjectId,
      deletedAt: null
    });

    if (!topic) {
      throw new NotFoundError('Target topic not found or inaccessible');
    }

    // Next position in topic
    const lastLink = await Link.findOne({
      userId: userObjectId,
      topicId: topic._id,
      deletedAt: null
    }).sort({ position: -1 });

    const position = lastLink ? lastLink.position + 1 : 0;

    const link = await Link.create({
      userId: userObjectId,
      topicId: topic._id,
      title: data.title.trim(),
      url: data.url.trim(),
      description: data.description || '',
      notes: data.notes || '',
      tags: data.tags || [],
      isFavorite: Boolean(data.isFavorite),
      openInNewTab: data.openInNewTab !== false,
      isArchived: false,
      position,
      deletedAt: null
    });

    return link;
  }

  async getLinks(userId: string, query: {
    topicId?: string;
    search?: string;
    favorite?: boolean;
    tag?: string;
    includeArchived?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const filter: any = {
      userId: userObjectId,
      deletedAt: null
    };

    if (query.topicId) {
      filter.topicId = new mongoose.Types.ObjectId(query.topicId);
    }

    if (!query.includeArchived) {
      filter.isArchived = false;
    }

    if (query.favorite) {
      filter.isFavorite = true;
    }

    if (query.tag) {
      filter.tags = query.tag.trim();
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { url: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    let sortOption: any = { position: 1, createdAt: 1 };
    if (query.sort === 'created_desc') sortOption = { createdAt: -1 };
    if (query.sort === 'updated_desc') sortOption = { updatedAt: -1 };
    if (query.sort === 'title_asc') sortOption = { title: 1 };
    if (query.sort === 'title_desc') sortOption = { title: -1 };

    const { page, limit, skip } = parsePagination(query);

    const [data, total] = await Promise.all([
      Link.find(filter).sort(sortOption).skip(skip).limit(limit),
      Link.countDocuments(filter)
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  async getLinkById(userId: string, linkId: string) {
    const link = await Link.findOne({
      _id: linkId,
      userId: new mongoose.Types.ObjectId(userId),
      deletedAt: null
    });

    if (!link) {
      throw new NotFoundError('Link not found or inaccessible');
    }

    return link;
  }

  async updateLink(userId: string, linkId: string, updates: Partial<ILink> & { targetTopicId?: string }) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const link = await Link.findOne({
      _id: linkId,
      userId: userObjectId,
      deletedAt: null
    });

    if (!link) {
      throw new NotFoundError('Link not found or inaccessible');
    }

    if (updates.topicId && updates.topicId.toString() !== link.topicId.toString()) {
      const targetTopic = await Topic.findOne({
        _id: updates.topicId,
        userId: userObjectId,
        deletedAt: null
      });
      if (!targetTopic) throw new NotFoundError('Target topic does not exist');
      link.topicId = targetTopic._id;
    }

    if (updates.title !== undefined) link.title = updates.title.trim();
    if (updates.url !== undefined) link.url = updates.url.trim();
    if (updates.description !== undefined) link.description = updates.description.trim();
    if (updates.notes !== undefined) link.notes = updates.notes.trim();
    if (updates.tags !== undefined) link.tags = updates.tags;
    if (updates.isFavorite !== undefined) link.isFavorite = updates.isFavorite;
    if (updates.isArchived !== undefined) link.isArchived = updates.isArchived;
    if (updates.openInNewTab !== undefined) link.openInNewTab = updates.openInNewTab;

    await link.save();
    return link;
  }

  async deleteLink(userId: string, linkId: string, permanent: boolean = false) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const link = await Link.findOne({
      _id: linkId,
      userId: userObjectId
    });

    if (!link) {
      throw new NotFoundError('Link not found or inaccessible');
    }

    if (permanent) {
      await Link.deleteOne({ _id: linkId, userId: userObjectId });
      return { success: true, permanent: true };
    } else {
      link.deletedAt = new Date();
      await link.save();
      return { success: true, permanent: false };
    }
  }

  async restoreLink(userId: string, linkId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const link = await Link.findOne({
      _id: linkId,
      userId: userObjectId
    });

    if (!link) {
      throw new NotFoundError('Link not found');
    }

    // Also check if parent topic is soft-deleted; if so, restore topic
    const topic = await Topic.findOne({ _id: link.topicId, userId: userObjectId });
    if (topic && topic.deletedAt) {
      topic.deletedAt = null;
      await topic.save();
    }

    link.deletedAt = null;
    await link.save();
    return link;
  }

  async duplicateLink(userId: string, linkId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const original = await Link.findOne({
      _id: linkId,
      userId: userObjectId,
      deletedAt: null
    });

    if (!original) {
      throw new NotFoundError('Link not found');
    }

    const cloned = await Link.create({
      userId: userObjectId,
      topicId: original.topicId,
      title: `${original.title} (Copy)`,
      url: original.url,
      description: original.description,
      notes: original.notes,
      tags: original.tags,
      isFavorite: original.isFavorite,
      isArchived: false,
      openInNewTab: original.openInNewTab,
      position: original.position + 1,
      deletedAt: null
    });

    return cloned;
  }

  async moveLink(userId: string, linkId: string, targetTopicId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const link = await Link.findOne({
      _id: linkId,
      userId: userObjectId,
      deletedAt: null
    });
    if (!link) throw new NotFoundError('Link not found');

    const targetTopic = await Topic.findOne({
      _id: targetTopicId,
      userId: userObjectId,
      deletedAt: null
    });
    if (!targetTopic) throw new NotFoundError('Target topic not found');

    const lastLink = await Link.findOne({
      userId: userObjectId,
      topicId: targetTopic._id,
      deletedAt: null
    }).sort({ position: -1 });

    link.topicId = targetTopic._id;
    link.position = lastLink ? lastLink.position + 1 : 0;
    await link.save();

    return link;
  }

  async reorderLinks(userId: string, topicId: string, items: Array<{ id: string; position: number }>) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const topicObjectId = new mongoose.Types.ObjectId(topicId);

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.id, topicId: topicObjectId, userId: userObjectId },
        update: { $set: { position: item.position } }
      }
    }));

    if (bulkOps.length > 0) {
      await Link.bulkWrite(bulkOps);
    }

    return { success: true };
  }

  async findDuplicateUrls(userId: string, url: string, currentLinkId?: string) {
    if (!url) return [];
    const cleanUrl = url.trim().toLowerCase().replace(/\/$/, '');
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const filter: any = {
      userId: userObjectId,
      deletedAt: null,
      url: { $regex: new RegExp(`^${cleanUrl}/?$`, 'i') }
    };

    if (currentLinkId) {
      filter._id = { $ne: currentLinkId };
    }

    const duplicates = await Link.find(filter).populate('topicId', 'name color icon');
    return duplicates;
  }
}

export const linkService = new LinkService();
