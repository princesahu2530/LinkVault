import mongoose from 'mongoose';
import { Topic } from '../models/Topic.js';
import { Item } from '../models/Item.js';
import { Link } from '../models/Link.js';
import { Template } from '../models/Template.js';
import { canAccessTopic, canAccessItem } from '../middleware/rbac.middleware.js';
import { WorkspaceRole } from '../types/workspace.types.js';

export class SearchService {
  async search(
    userId: string,
    query: string,
    type: 'all' | 'topics' | 'items' | 'links' | 'templates' = 'all',
    workspaceId?: string,
    userRole: WorkspaceRole = 'owner'
  ) {
    if (!query || !query.trim()) {
      return { topics: [], items: [], links: [], templates: [], total: 0 };
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    let wsObjectId: mongoose.Types.ObjectId | null = null;
    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      wsObjectId = new mongoose.Types.ObjectId(workspaceId);
    }

    const q = query.trim();
    const regex = new RegExp(q, 'i');

    let matchingTopics: any[] = [];
    let matchingItems: any[] = [];
    let matchingLinks: any[] = [];
    let matchingTemplates: any[] = [];

    const promises: Promise<any>[] = [];

    if (type === 'all' || type === 'topics') {
      const topicFilter: any = {
        deletedAt: null,
        isArchived: false,
        $or: [{ name: regex }, { description: regex }]
      };
      if (wsObjectId) {
        topicFilter.workspaceId = wsObjectId;
      } else {
        topicFilter.userId = userObjectId;
      }

      promises.push(
        Topic.find(topicFilter)
          .sort({ isPinned: -1, position: 1 })
          .then(res => {
            matchingTopics = res.filter(t => canAccessTopic(t, userId, userRole));
          })
      );
    }

    if (type === 'all' || type === 'items') {
      const itemFilter: any = {
        deletedAt: null,
        isArchived: false,
        $or: [
          { title: regex },
          { content: regex },
          { tags: { $in: [regex] } },
          { 'fields.name': regex },
          { 'fields.value': regex },
          { assigneeName: regex }
        ]
      };
      if (wsObjectId) {
        itemFilter.workspaceId = wsObjectId;
      } else {
        itemFilter.userId = userObjectId;
      }

      promises.push(
        Item.find(itemFilter)
          .sort({ position: 1, createdAt: -1 })
          .then(res => {
            matchingItems = res.filter(item => canAccessItem(item, userId, userRole));
          })
      );
    }

    if (type === 'all' || type === 'templates') {
      const tplFilter: any = {
        $or: [{ name: regex }, { description: regex }, { 'fields.name': regex }]
      };
      if (wsObjectId) {
        tplFilter.$and = [
          { $or: [{ workspaceId: wsObjectId }, { isSystem: true }] },
          { $or: [{ name: regex }, { description: regex }, { 'fields.name': regex }] }
        ];
        delete tplFilter.$or;
      } else {
        tplFilter.userId = userObjectId;
      }

      promises.push(
        Template.find(tplFilter)
          .sort({ name: 1 })
          .then(res => {
            matchingTemplates = res;
          })
      );
    }

    await Promise.all(promises);

    const total = matchingTopics.length + matchingItems.length + matchingTemplates.length;

    return {
      topics: matchingTopics,
      items: matchingItems,
      links: matchingItems,
      templates: matchingTemplates,
      total
    };
  }
}

export const searchService = new SearchService();
