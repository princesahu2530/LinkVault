import mongoose from 'mongoose';
import { Topic, ITopic } from '../models/Topic.js';
import { Item } from '../models/Item.js';
import { Link } from '../models/Link.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Activity } from '../models/Activity.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { canAccessTopic } from '../middleware/rbac.middleware.js';
import { WorkspaceRole } from '../types/workspace.types.js';

export class TopicService {
  async createTopic(
    userId: string,
    data: {
      workspaceId?: string;
      name: string;
      description?: string;
      icon?: string;
      color?: string;
      isPinned?: boolean;
      isFavorite?: boolean;
      visibility?: 'workspace' | 'private' | 'roles' | 'users';
      allowedRoles?: string[];
      allowedUsers?: string[];
      defaultTemplateId?: string | null;
      defaultView?: 'cards' | 'table' | 'compact' | 'detailed' | 'calendar';
      defaultSort?: string;
      visibleColumns?: string[];
    }
  ) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let wsObjectId: mongoose.Types.ObjectId | undefined;

    if (data.workspaceId && mongoose.Types.ObjectId.isValid(data.workspaceId)) {
      wsObjectId = new mongoose.Types.ObjectId(data.workspaceId);
    } else {
      const personal = await Workspace.findOne({ ownerId: userObjectId, isPersonal: true, deletedAt: null });
      if (personal) wsObjectId = personal._id;
    }

    const lastTopic = await Topic.findOne({
      ...(wsObjectId ? { workspaceId: wsObjectId } : { userId: userObjectId }),
      deletedAt: null
    }).sort({ position: -1 });

    const position = lastTopic ? lastTopic.position + 1 : 0;

    const topic = await Topic.create({
      userId: userObjectId,
      workspaceId: wsObjectId,
      name: data.name.trim(),
      description: data.description || '',
      icon: data.icon || 'Folder',
      color: data.color || '#6366f1',
      isPinned: Boolean(data.isPinned),
      isFavorite: Boolean(data.isFavorite),
      isArchived: false,
      position,
      visibility: data.visibility || 'workspace',
      allowedRoles: data.allowedRoles || [],
      allowedUsers: (data.allowedUsers || []).map(u => new mongoose.Types.ObjectId(u)),
      defaultTemplateId: data.defaultTemplateId ? new mongoose.Types.ObjectId(data.defaultTemplateId) : null,
      defaultView: data.defaultView || 'cards',
      defaultSort: data.defaultSort || 'position',
      visibleColumns: data.visibleColumns || ['title', 'tags', 'createdAt'],
      deletedAt: null
    });

    if (wsObjectId) {
      await Activity.create({
        workspaceId: wsObjectId,
        actorId: userObjectId,
        actorName: 'User',
        action: 'created',
        resourceType: 'topic',
        resourceId: topic._id.toString(),
        resourceTitle: topic.name,
        description: `Created topic "${topic.name}"`
      });
    }

    return topic;
  }

  async getTopics(
    userId: string,
    query: {
      workspaceId?: string;
      includeArchived?: boolean;
      favorites?: boolean;
      search?: string;
      sort?: string;
    },
    userRole: WorkspaceRole = 'owner'
  ) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let wsObjectId: mongoose.Types.ObjectId | null = null;

    if (query.workspaceId && mongoose.Types.ObjectId.isValid(query.workspaceId)) {
      wsObjectId = new mongoose.Types.ObjectId(query.workspaceId);
    }

    const filter: any = {
      deletedAt: null
    };

    if (wsObjectId) {
      filter.workspaceId = wsObjectId;
    } else {
      // Find all workspaces where user is active member
      const memberships = await WorkspaceMember.find({ userId: userObjectId, status: 'active' });
      const wsIds = memberships.map(m => m.workspaceId);
      filter.workspaceId = { $in: wsIds };
    }

    if (!query.includeArchived) {
      filter.isArchived = false;
    }

    if (query.favorites) {
      filter.isFavorite = true;
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ]
        }
      ];
    }

    let sortOption: any = { isPinned: -1, position: 1, createdAt: 1 };
    if (query.sort === 'name_asc') sortOption = { isPinned: -1, name: 1 };
    if (query.sort === 'name_desc') sortOption = { isPinned: -1, name: -1 };
    if (query.sort === 'updated') sortOption = { isPinned: -1, updatedAt: -1 };

    const rawTopics = await Topic.find(filter).sort(sortOption);

    const accessibleTopics: ITopic[] = [];
    for (const t of rawTopics) {
      if (await canAccessTopic(t, userId, userRole)) {
        accessibleTopics.push(t);
      }
    }
    return accessibleTopics;
  }

  async getTopicById(
    userId: string,
    topicId: string,
    includeItems: boolean = false,
    userRole: WorkspaceRole = 'owner'
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      throw new NotFoundError('Invalid topic ID');
    }

    const topic = await Topic.findOne({
      _id: topicId,
      deletedAt: null
    });

    if (!topic) {
      throw new NotFoundError('Topic not found or inaccessible');
    }

    const hasAccess = await canAccessTopic(topic, userId, userRole);
    if (!hasAccess) {
      throw new NotFoundError('Topic not found or inaccessible');
    }

    if (includeItems) {
      const items = await Item.find({
        topicId: topic._id,
        deletedAt: null,
        isArchived: false
      }).sort({ position: 1, createdAt: 1 });

      return {
        ...topic.toJSON(),
        items,
        links: items
      };
    }

    return topic;
  }

  async updateTopic(
    userId: string,
    topicId: string,
    updates: Partial<ITopic> & { defaultTemplateId?: string | null; allowedUsers?: string[] },
    userRole: WorkspaceRole = 'owner'
  ) {
    const topic = await Topic.findOne({
      _id: topicId,
      deletedAt: null
    });

    if (!topic) {
      throw new NotFoundError('Topic not found or inaccessible');
    }

    const hasAccess = await canAccessTopic(topic, userId, userRole);
    if (!hasAccess) {
      throw new NotFoundError('Topic not found or inaccessible');
    }

    if (updates.name !== undefined) topic.name = updates.name.trim();
    if (updates.description !== undefined) topic.description = updates.description.trim();
    if (updates.icon !== undefined) topic.icon = updates.icon;
    if (updates.color !== undefined) topic.color = updates.color;
    if (updates.isPinned !== undefined) topic.isPinned = updates.isPinned;
    if (updates.isFavorite !== undefined) topic.isFavorite = updates.isFavorite;
    if (updates.isArchived !== undefined) topic.isArchived = updates.isArchived;
    if (updates.visibility !== undefined) topic.visibility = updates.visibility;
    if (updates.allowedRoles !== undefined) topic.allowedRoles = updates.allowedRoles;
    if (updates.allowedUsers !== undefined) {
      topic.allowedUsers = updates.allowedUsers.map(u => new mongoose.Types.ObjectId(u));
    }
    if (updates.defaultView !== undefined) topic.defaultView = updates.defaultView;
    if (updates.defaultSort !== undefined) topic.defaultSort = updates.defaultSort;
    if (updates.visibleColumns !== undefined) topic.visibleColumns = updates.visibleColumns;
    if (updates.defaultTemplateId !== undefined) {
      topic.defaultTemplateId = updates.defaultTemplateId ? new mongoose.Types.ObjectId(updates.defaultTemplateId) : null;
    }

    await topic.save();
    return topic;
  }

  async deleteTopic(userId: string, topicId: string, permanent: boolean = false, userRole: WorkspaceRole = 'owner') {
    const topic = await Topic.findOne({ _id: topicId });

    if (!topic) {
      throw new NotFoundError('Topic not found or inaccessible');
    }

    const hasAccess = await canAccessTopic(topic, userId, userRole);
    if (!hasAccess) {
      throw new NotFoundError('Topic not found or inaccessible');
    }

    if (permanent) {
      await Topic.deleteOne({ _id: topicId });
      await Item.deleteMany({ topicId });
      await Link.deleteMany({ topicId });
      return { success: true, permanent: true };
    } else {
      const now = new Date();
      topic.deletedAt = now;
      await topic.save();

      await Item.updateMany({ topicId, deletedAt: null }, { $set: { deletedAt: now } });
      await Link.updateMany({ topicId, deletedAt: null }, { $set: { deletedAt: now } });

      return { success: true, permanent: false };
    }
  }

  async restoreTopic(userId: string, topicId: string) {
    const topic = await Topic.findOne({ _id: topicId });

    if (!topic) {
      throw new NotFoundError('Topic not found');
    }

    topic.deletedAt = null;
    await topic.save();

    await Item.updateMany({ topicId }, { $set: { deletedAt: null } });
    await Link.updateMany({ topicId }, { $set: { deletedAt: null } });

    return topic;
  }

  async duplicateTopic(userId: string, topicId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const originalTopic = await Topic.findOne({
      _id: topicId,
      deletedAt: null
    });

    if (!originalTopic) {
      throw new NotFoundError('Topic not found');
    }

    const newTopic = await Topic.create({
      userId: userObjectId,
      workspaceId: originalTopic.workspaceId,
      name: `${originalTopic.name} (Copy)`,
      description: originalTopic.description,
      icon: originalTopic.icon,
      color: originalTopic.color,
      isPinned: false,
      isFavorite: originalTopic.isFavorite,
      isArchived: false,
      visibility: originalTopic.visibility,
      allowedRoles: originalTopic.allowedRoles,
      allowedUsers: originalTopic.allowedUsers,
      defaultTemplateId: originalTopic.defaultTemplateId,
      defaultView: originalTopic.defaultView,
      defaultSort: originalTopic.defaultSort,
      visibleColumns: originalTopic.visibleColumns,
      position: originalTopic.position + 1,
      deletedAt: null
    });

    const items = await Item.find({
      topicId: originalTopic._id,
      deletedAt: null
    });

    if (items.length > 0) {
      const clonedItems = items.map(item => ({
        userId: userObjectId,
        workspaceId: originalTopic.workspaceId,
        topicId: newTopic._id,
        templateId: item.templateId,
        title: item.title,
        content: item.content,
        fields: item.fields,
        tags: item.tags,
        isFavorite: item.isFavorite,
        isArchived: false,
        position: item.position,
        deletedAt: null
      }));

      await Item.insertMany(clonedItems);
    }

    return newTopic;
  }

  async reorderTopics(userId: string, items: Array<{ id: string; position: number }>) {
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { position: item.position } }
      }
    }));

    if (bulkOps.length > 0) {
      await Topic.bulkWrite(bulkOps);
    }

    return { success: true };
  }
}

export const topicService = new TopicService();
