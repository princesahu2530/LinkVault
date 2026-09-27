import mongoose from 'mongoose';
import { Topic, ITopic } from '../models/Topic.js';
import { Item, IItem } from '../models/Item.js';
import { Link } from '../models/Link.js';
import { Tag } from '../models/Tag.js';
import { Template } from '../models/Template.js';
import { UserSettings } from '../models/UserSettings.js';
import { Workspace } from '../models/Workspace.js';
import { AuditLog } from '../models/AuditLog.js';
import { ValidationError, ForbiddenError } from '../utils/errors.js';
import { generateFieldId } from './item.service.js';
import { canAccessItem, canAccessTopic } from '../middleware/rbac.middleware.js';
import { WorkspaceRole } from '../types/workspace.types.js';

export class BackupService {
  async getTrash(userId: string, workspaceId?: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const filter: any = { deletedAt: { $ne: null } };

    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      filter.$or = [
        { workspaceId: new mongoose.Types.ObjectId(workspaceId) },
        { workspaceId: null, userId: userObjectId }
      ];
    } else {
      filter.userId = userObjectId;
    }

    const [topics, items, links] = await Promise.all([
      Topic.find(filter).sort({ deletedAt: -1 }),
      Item.find(filter).sort({ deletedAt: -1 }),
      Link.find(filter).sort({ deletedAt: -1 })
    ]);

    return { topics, items, links: items.length > 0 ? items : links };
  }

  async emptyTrash(userId: string, workspaceId?: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const filter: any = { deletedAt: { $ne: null } };

    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      filter.workspaceId = new mongoose.Types.ObjectId(workspaceId);
    } else {
      filter.userId = userObjectId;
    }

    await Promise.all([
      Topic.deleteMany(filter),
      Item.deleteMany(filter),
      Link.deleteMany(filter)
    ]);

    return { success: true };
  }

  async getArchive(userId: string, workspaceId?: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const filter: any = { isArchived: true, deletedAt: null };

    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      filter.$or = [
        { workspaceId: new mongoose.Types.ObjectId(workspaceId) },
        { workspaceId: null, userId: userObjectId }
      ];
    } else {
      filter.userId = userObjectId;
    }

    const [topics, items, links] = await Promise.all([
      Topic.find(filter).sort({ updatedAt: -1 }),
      Item.find(filter).sort({ updatedAt: -1 }),
      Link.find(filter).sort({ updatedAt: -1 })
    ]);

    return { topics, items, links: items.length > 0 ? items : links };
  }

  async getFavorites(userId: string, workspaceId?: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const filter: any = { isFavorite: true, deletedAt: null };

    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      filter.$or = [
        { workspaceId: new mongoose.Types.ObjectId(workspaceId) },
        { workspaceId: null, userId: userObjectId }
      ];
    } else {
      filter.userId = userObjectId;
    }

    const [topics, items, links] = await Promise.all([
      Topic.find(filter).sort({ isPinned: -1, position: 1 }),
      Item.find(filter).sort({ position: 1, createdAt: -1 }),
      Link.find(filter).sort({ position: 1, createdAt: -1 })
    ]);

    return { topics, items, links: items.length > 0 ? items : links };
  }

  async getRecent(userId: string, limit: number = 20, workspaceId?: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const filter: any = { deletedAt: null };

    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      filter.$or = [
        { workspaceId: new mongoose.Types.ObjectId(workspaceId) },
        { workspaceId: null, userId: userObjectId }
      ];
    } else {
      filter.userId = userObjectId;
    }

    const items = await Item.find(filter).sort({ createdAt: -1 }).limit(limit);

    if (items.length === 0) {
      const links = await Link.find(filter).sort({ createdAt: -1 }).limit(limit);
      return links;
    }

    return items;
  }

  async exportData(
    userId: string,
    format: 'json' | 'csv',
    topicId?: string,
    workspaceId?: string,
    userRole: WorkspaceRole = 'owner'
  ) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let wsObjectId: mongoose.Types.ObjectId | null = null;
    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      wsObjectId = new mongoose.Types.ObjectId(workspaceId);
    }

    const topicFilter: any = { deletedAt: null };
    if (topicId) {
      topicFilter._id = new mongoose.Types.ObjectId(topicId);
    } else if (wsObjectId) {
      topicFilter.workspaceId = wsObjectId;
    } else {
      topicFilter.userId = userObjectId;
    }

    const rawTopics = await Topic.find(topicFilter).sort({ position: 1 });
    const topics: ITopic[] = [];
    for (const t of rawTopics) {
      if (await canAccessTopic(t, userId, userRole)) {
        topics.push(t);
      }
    }

    const tplFilter: any = {};
    if (wsObjectId) tplFilter.workspaceId = wsObjectId;
    else tplFilter.userId = userObjectId;

    const [templates, tags, settings] = await Promise.all([
      Template.find(tplFilter).sort({ name: 1 }),
      Tag.find(tplFilter).sort({ name: 1 }),
      UserSettings.findOne({ userId: userObjectId })
    ]);

    const topicIds = topics.map(t => t._id);

    let rawItems = await Item.find({
      topicId: { $in: topicIds },
      deletedAt: null
    }).sort({ position: 1 });

    const items: IItem[] = [];
    for (const item of rawItems) {
      if (await canAccessItem(item, userId, userRole)) {
        items.push(item);
      }
    }

    if (wsObjectId) {
      await AuditLog.create({
        workspaceId: wsObjectId,
        actorId: userObjectId,
        actorEmail: '',
        actorName: 'User',
        action: 'workspace.exported',
        details: { format, itemsCount: items.length, topicsCount: topics.length }
      });
    }

    if (format === 'json') {
      const data = {
        app: 'LinkVault',
        version: 2,
        exportedAt: new Date().toISOString(),
        topics: topics.map(topic => ({
          id: topic._id.toString(),
          name: topic.name,
          description: topic.description,
          icon: topic.icon,
          color: topic.color,
          isFavorite: topic.isFavorite,
          isPinned: topic.isPinned,
          defaultView: topic.defaultView,
          defaultSort: topic.defaultSort,
          visibleColumns: topic.visibleColumns,
          items: items
            .filter(item => item.topicId.toString() === topic._id.toString())
            .map(item => ({
              id: item._id?.toString(),
              title: item.title,
              content: item.content,
              fields: item.fields,
              tags: item.tags,
              isFavorite: item.isFavorite,
              isArchived: item.isArchived,
              taskProps: item.taskProps,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            }))
        })),
        templates: templates.map(tmpl => ({
          id: tmpl._id.toString(),
          name: tmpl.name,
          description: tmpl.description,
          category: tmpl.category,
          icon: tmpl.icon,
          color: tmpl.color,
          fields: tmpl.fields
        })),
        tags: tags.map(t => t.name),
        settings: settings ? {
          theme: settings.theme,
          accentColor: settings.accentColor,
          compactMode: settings.compactMode,
          defaultTopicState: settings.defaultTopicState
        } : {}
      };

      return JSON.stringify(data, null, 2);
    } else {
      const customFieldNamesSet = new Set<string>();
      items.forEach(item => {
        item.fields?.forEach((f: any) => {
          if (f.name) customFieldNamesSet.add(f.name);
        });
      });
      const customFieldNames = Array.from(customFieldNamesSet);

      const header = ['Topic', 'Title', 'Content', ...customFieldNames, 'Tags', 'Favorite', 'Created At'];
      const rows: string[][] = [header];

      topics.forEach(topic => {
        const topicItems = items.filter(i => i.topicId.toString() === topic._id.toString());
        if (topicItems.length === 0) {
          rows.push([topic.name, '', '', ...customFieldNames.map(() => ''), '', '', '']);
        } else {
          topicItems.forEach(item => {
            const fieldValuesMap = new Map<string, any>();
            item.fields?.forEach((f: any) => {
              fieldValuesMap.set(f.name, typeof f.value === 'object' ? JSON.stringify(f.value) : f.value);
            });

            const customVals = customFieldNames.map(name => fieldValuesMap.get(name) ?? '');

            rows.push([
              topic.name,
              item.title || '',
              item.content || '',
              ...customVals,
              (item.tags || []).join('; '),
              item.isFavorite ? 'Yes' : 'No',
              item.createdAt ? new Date(item.createdAt).toISOString() : ''
            ]);
          });
        }
      });

      return rows.map(r => r.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    }
  }

  async importData(userId: string, rawData: string, workspaceId?: string) {
    if (!rawData || !rawData.trim()) {
      throw new ValidationError('Import data is empty');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    let wsObjectId: mongoose.Types.ObjectId | undefined;
    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      wsObjectId = new mongoose.Types.ObjectId(workspaceId);
    }

    let isJson = false;
    let parsed: any = null;

    try {
      parsed = JSON.parse(rawData);
      isJson = true;
    } catch {
      isJson = false;
    }

    let createdTopicsCount = 0;
    let createdItemsCount = 0;
    let createdTemplatesCount = 0;

    if (isJson) {
      if (Array.isArray(parsed.templates)) {
        for (const tmpl of parsed.templates) {
          if (!tmpl.name) continue;
          const exists = await Template.findOne({
            ...(wsObjectId ? { workspaceId: wsObjectId } : { userId: userObjectId }),
            name: tmpl.name.trim()
          });
          if (!exists) {
            await Template.create({
              userId: userObjectId,
              workspaceId: wsObjectId,
              name: tmpl.name.trim(),
              description: tmpl.description || '',
              category: tmpl.category || 'general',
              icon: tmpl.icon || 'LayoutTemplate',
              color: tmpl.color || '#6366f1',
              fields: Array.isArray(tmpl.fields) ? tmpl.fields : []
            });
            createdTemplatesCount++;
          }
        }
      }

      const topicsList = parsed.topics || (Array.isArray(parsed) ? parsed : []);
      if (!Array.isArray(topicsList)) {
        throw new ValidationError('Invalid JSON structure. Expected "topics" array.');
      }

      for (const topicItem of topicsList) {
        if (!topicItem.name) continue;

        let targetTopic = await Topic.findOne({
          ...(wsObjectId ? { workspaceId: wsObjectId } : { userId: userObjectId }),
          name: topicItem.name.trim(),
          deletedAt: null
        });

        if (!targetTopic) {
          const lastTopic = await Topic.findOne({
            ...(wsObjectId ? { workspaceId: wsObjectId } : { userId: userObjectId }),
            deletedAt: null
          }).sort({ position: -1 });

          const position = lastTopic ? lastTopic.position + 1 : 0;

          targetTopic = await Topic.create({
            userId: userObjectId,
            workspaceId: wsObjectId,
            name: topicItem.name.trim(),
            description: topicItem.description || '',
            icon: topicItem.icon || 'Folder',
            color: topicItem.color || '#6366f1',
            isFavorite: Boolean(topicItem.isFavorite),
            isPinned: Boolean(topicItem.isPinned),
            defaultView: topicItem.defaultView || 'cards',
            defaultSort: topicItem.defaultSort || 'position',
            visibleColumns: topicItem.visibleColumns || ['title', 'tags', 'createdAt'],
            position
          });
          createdTopicsCount++;
        }

        const itemsToProcess = topicItem.items || topicItem.links || [];

        if (Array.isArray(itemsToProcess)) {
          for (const itemEntry of itemsToProcess) {
            const lastItem = await Item.findOne({
              ...(wsObjectId ? { workspaceId: wsObjectId } : { userId: userObjectId }),
              topicId: targetTopic._id,
              deletedAt: null
            }).sort({ position: -1 });

            const itemPos = lastItem ? lastItem.position + 1 : 0;

            let finalFields: any[] = [];
            if (Array.isArray(itemEntry.fields)) {
              finalFields = itemEntry.fields.map((f: any, idx: number) => ({
                fieldId: f.fieldId || generateFieldId(),
                name: f.name || 'Field',
                type: f.type || 'text',
                value: f.value ?? '',
                options: f.options || [],
                position: f.position ?? idx,
                required: Boolean(f.required),
                visible: f.visible !== false
              }));
            } else {
              if (itemEntry.url) {
                finalFields.push({
                  fieldId: generateFieldId(),
                  name: 'URL',
                  type: 'url',
                  value: itemEntry.url,
                  position: 0,
                  required: false,
                  visible: true
                });
              }
              if (itemEntry.description) {
                finalFields.push({
                  fieldId: generateFieldId(),
                  name: 'Description',
                  type: 'longText',
                  value: itemEntry.description,
                  position: 1,
                  required: false,
                  visible: true
                });
              }
            }

            await Item.create({
              userId: userObjectId,
              workspaceId: wsObjectId || targetTopic.workspaceId,
              topicId: targetTopic._id,
              title: (itemEntry.title || '').trim(),
              content: itemEntry.content || itemEntry.notes || '',
              fields: finalFields,
              tags: Array.isArray(itemEntry.tags) ? itemEntry.tags : [],
              isFavorite: Boolean(itemEntry.isFavorite),
              isArchived: Boolean(itemEntry.isArchived),
              taskProps: itemEntry.taskProps || { isTask: false },
              position: itemPos
            });
            createdItemsCount++;
          }
        }
      }
    }

    return {
      topicsCount: createdTopicsCount,
      itemsCount: createdItemsCount,
      templatesCount: createdTemplatesCount,
      linksCount: createdItemsCount
    };
  }

  async createBackup(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const [workspaces, topics, items, templates, tags, settings] = await Promise.all([
      Workspace.find({ ownerId: userObjectId }),
      Topic.find({ userId: userObjectId }),
      Item.find({ userId: userObjectId }),
      Template.find({ userId: userObjectId }),
      Tag.find({ userId: userObjectId }),
      UserSettings.findOne({ userId: userObjectId })
    ]);

    return {
      app: 'LinkVault',
      version: 2,
      timestamp: new Date().toISOString(),
      workspaces,
      topics,
      items,
      templates,
      tags,
      settings
    };
  }

  async restoreBackup(userId: string, backupData: any, workspaceId?: string) {
    const rawData = typeof backupData === 'string' ? backupData : JSON.stringify(backupData);
    return this.importData(userId, rawData, workspaceId);
  }
}

export const backupService = new BackupService();
