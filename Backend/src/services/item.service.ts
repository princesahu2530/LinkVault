import mongoose from 'mongoose';
import { Item, IItem } from '../models/Item.js';
import { Topic } from '../models/Topic.js';
import { Template } from '../models/Template.js';
import { Workspace } from '../models/Workspace.js';
import { ItemVersion } from '../models/ItemVersion.js';
import { Activity } from '../models/Activity.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';
import { parsePagination } from '../utils/pagination.js';
import { IItemField, ITaskProperties, FieldType } from '../types/item.types.js';
import { validateAndSanitizeFieldValue } from '../validators/field.validators.js';
import { canAccessItem, canAccessTopic } from '../middleware/rbac.middleware.js';
import { WorkspaceRole } from '../types/workspace.types.js';

export function generateFieldId(): string {
  return `f_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export class ItemService {
  async checkDuplicateUrl(workspaceId: string, url: string, currentItemId?: string) {
    if (!url || typeof url !== 'string' || !url.trim()) return null;
    const cleanUrl = url.trim().toLowerCase();

    const query: any = {
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      deletedAt: null,
      'fields.value': { $regex: new RegExp(`^${cleanUrl}$`, 'i') }
    };

    if (currentItemId && mongoose.Types.ObjectId.isValid(currentItemId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(currentItemId) };
    }

    const match = await Item.findOne(query).select('id title topicId createdAt');
    if (match) {
      const topic = await Topic.findById(match.topicId).select('name');
      return {
        id: match._id.toString(),
        title: match.title || 'Untitled',
        topicName: topic?.name || 'Topic',
        topicId: match.topicId?.toString()
      };
    }
    return null;
  }

  async createItem(
    userId: string,
    data: {
      workspaceId?: string;
      topicId?: string;
      templateId?: string | null;
      title?: string;
      content?: string;
      fields?: Array<Partial<IItemField>>;
      tags?: string[];
      isFavorite?: boolean;
      isArchived?: boolean;
      position?: number;
      visibility?: 'private' | 'workspace' | 'topic' | 'users' | 'roles';
      sharedWithUsers?: string[];
      sharedWithRoles?: string[];
      assigneeId?: string | null;
      assigneeName?: string;
      taskProps?: ITaskProperties;
      // Legacy support
      url?: string;
      description?: string;
      notes?: string;
      openInNewTab?: boolean;
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

    let topic: any = null;
    if (data.topicId && mongoose.Types.ObjectId.isValid(data.topicId)) {
      topic = await Topic.findOne({
        _id: new mongoose.Types.ObjectId(data.topicId),
        deletedAt: null
      });
    }

    if (!topic) {
      topic = await Topic.findOne({
        ...(wsObjectId ? { workspaceId: wsObjectId } : { userId: userObjectId }),
        deletedAt: null
      }).sort({ position: 1 });

      if (!topic) {
        topic = await Topic.create({
          userId: userObjectId,
          workspaceId: wsObjectId,
          name: 'General',
          description: 'Default topic collection',
          position: 0
        });
      }
    }

    // Build fields list
    let finalFields: IItemField[] = [];

    // 1. Template integration
    let templateIdToUse: string | null = null;
    if (data.templateId && mongoose.Types.ObjectId.isValid(data.templateId)) {
      templateIdToUse = data.templateId;
    } else if (topic.defaultTemplateId) {
      templateIdToUse = topic.defaultTemplateId.toString();
    }

    if (templateIdToUse && mongoose.Types.ObjectId.isValid(templateIdToUse)) {
      const template = await Template.findOne({
        _id: new mongoose.Types.ObjectId(templateIdToUse)
      });

      if (template) {
        finalFields = template.fields.map((tf, index) => ({
          fieldId: generateFieldId(),
          name: tf.name,
          type: tf.type,
          value: tf.defaultValue ?? '',
          options: tf.options || [],
          relationTopicId: tf.relationTopicId || '',
          relationMultiple: tf.relationMultiple || false,
          currencyCode: tf.currencyCode || 'USD',
          maxRating: tf.maxRating || 5,
          position: tf.position ?? index,
          required: tf.required || false,
          visible: true
        }));
      }
    }

    // 2. Custom fields supplied in payload
    if (data.fields && data.fields.length > 0) {
      for (const inputField of data.fields) {
        if (!inputField.name || !inputField.type) continue;
        const existingIdx = finalFields.findIndex(f => f.name.toLowerCase() === inputField.name!.toLowerCase());
        const fieldItem: IItemField = {
          fieldId: inputField.fieldId || generateFieldId(),
          name: inputField.name.trim(),
          type: inputField.type as FieldType,
          value: inputField.value ?? '',
          options: inputField.options || [],
          relationTopicId: inputField.relationTopicId || '',
          relationMultiple: inputField.relationMultiple || false,
          currencyCode: inputField.currencyCode || 'USD',
          maxRating: inputField.maxRating || 5,
          position: inputField.position ?? (existingIdx >= 0 ? existingIdx : finalFields.length),
          required: Boolean(inputField.required),
          visible: inputField.visible !== false
        };

        if (existingIdx >= 0) {
          finalFields[existingIdx] = fieldItem;
        } else {
          finalFields.push(fieldItem);
        }
      }
    }

    // 3. Legacy compatibility (url, description, notes)
    if (data.url && !finalFields.some(f => f.type === 'url')) {
      finalFields.push({
        fieldId: generateFieldId(),
        name: 'Website',
        type: 'url',
        value: data.url,
        position: finalFields.length,
        required: false,
        visible: true
      });
    }

    if (data.description && !finalFields.some(f => f.name.toLowerCase() === 'description')) {
      finalFields.push({
        fieldId: generateFieldId(),
        name: 'Description',
        type: 'longText',
        value: data.description,
        position: finalFields.length,
        required: false,
        visible: true
      });
    }

    // Validate and sanitize each field
    const validatedFields: IItemField[] = finalFields.map((field, idx) => ({
      ...field,
      position: field.position ?? idx,
      value: validateAndSanitizeFieldValue(
        field.type,
        field.value,
        field.options,
        field.required,
        { maxRating: field.maxRating, currencyCode: field.currencyCode }
      )
    }));

    // Next position in topic
    let position = data.position;
    if (position === undefined) {
      const lastItem = await Item.findOne({
        ...(wsObjectId ? { workspaceId: wsObjectId } : { userId: userObjectId }),
        topicId: topic._id,
        deletedAt: null
      }).sort({ position: -1 });
      position = lastItem ? lastItem.position + 1 : 0;
    }

    const item = await Item.create({
      userId: userObjectId,
      workspaceId: wsObjectId || topic.workspaceId,
      topicId: topic._id,
      templateId: templateIdToUse ? new mongoose.Types.ObjectId(templateIdToUse) : null,
      title: (data.title || '').trim(),
      content: data.content || data.notes || '',
      fields: validatedFields,
      tags: data.tags || [],
      isFavorite: Boolean(data.isFavorite),
      isArchived: Boolean(data.isArchived),
      position,
      visibility: data.visibility || 'workspace',
      sharedWithUsers: (data.sharedWithUsers || []).map(u => new mongoose.Types.ObjectId(u)),
      sharedWithRoles: data.sharedWithRoles || [],
      assigneeId: data.assigneeId && mongoose.Types.ObjectId.isValid(data.assigneeId) ? new mongoose.Types.ObjectId(data.assigneeId) : null,
      assigneeName: data.assigneeName || '',
      taskProps: data.taskProps || { isTask: false },
      versionNumber: 1,
      deletedAt: null
    });

    const author = await User.findById(userId);

    // Initial version snapshot
    await ItemVersion.create({
      itemId: item._id,
      workspaceId: item.workspaceId,
      versionNumber: 1,
      title: item.title,
      content: item.content,
      fields: item.fields,
      tags: item.tags,
      changedBy: userObjectId,
      changedByName: author?.name || 'User',
      changeSummary: 'Created initial item'
    });

    // Activity timeline
    if (item.workspaceId) {
      await Activity.create({
        workspaceId: item.workspaceId,
        actorId: userObjectId,
        actorName: author?.name || 'User',
        action: 'created',
        resourceType: 'item',
        resourceId: item._id.toString(),
        resourceTitle: item.title || 'Untitled',
        description: `Created item "${item.title || 'Untitled'}" in topic "${topic.name}"`
      });

      // Notify assignee if assigned
      if (item.assigneeId && item.assigneeId.toString() !== userId) {
        await Notification.create({
          workspaceId: item.workspaceId,
          recipientId: item.assigneeId,
          senderId: userObjectId,
          senderName: author?.name || 'User',
          type: 'assigned',
          title: 'Item Assigned',
          message: `${author?.name || 'User'} assigned you to "${item.title || 'Untitled Item'}"`,
          resourceType: 'item',
          resourceId: item._id.toString()
        });
      }
    }

    return item;
  }

  async getItems(
    userId: string,
    query: {
      workspaceId?: string;
      topicId?: string;
      search?: string;
      favorite?: boolean;
      tag?: string;
      includeArchived?: boolean;
      isTask?: boolean;
      assigneeId?: string;
      taskStatus?: string;
      sort?: string;
      page?: number;
      limit?: number;
      field?: string;
      operator?: string;
      value?: string;
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
      filter.userId = userObjectId;
    }

    if (query.topicId && mongoose.Types.ObjectId.isValid(query.topicId)) {
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

    if (query.isTask !== undefined) {
      filter['taskProps.isTask'] = Boolean(query.isTask);
    }

    if (query.assigneeId) {
      filter['assigneeId'] = new mongoose.Types.ObjectId(query.assigneeId);
    }

    if (query.taskStatus) {
      filter['taskProps.status'] = query.taskStatus;
    }

    // Dynamic field filtering
    if (query.field && query.operator && query.value !== undefined) {
      const fieldName = query.field.trim();
      const op = query.operator.trim();
      const val = query.value.trim();

      const buildFilterCondition = (operator: string, value: string) => {
        switch (operator) {
          case 'equals':
            return { $regex: new RegExp(`^${value}$`, 'i') };
          case 'contains':
            return { $regex: value, $options: 'i' };
          case 'startsWith':
            return { $regex: `^${value}`, $options: 'i' };
          case 'greaterThan':
          case 'greater_than':
            return { $gt: Number(value) };
          case 'lessThan':
          case 'less_than':
            return { $lt: Number(value) };
          case 'before':
            return { $lt: value };
          case 'after':
            return { $gt: value };
          default:
            return { $regex: value, $options: 'i' };
        }
      };

      if (fieldName.toLowerCase() === 'title') {
        filter.title = buildFilterCondition(op, val);
      } else if (fieldName.toLowerCase() === 'content') {
        filter.content = buildFilterCondition(op, val);
      } else {
        filter.fields = {
          $elemMatch: {
            name: { $regex: new RegExp(`^${fieldName}$`, 'i') },
            value: buildFilterCondition(op, val)
          }
        };
      }
    }

    // Global Search across title, content, field names, field values, tags
    if (query.search?.trim()) {
      const q = query.search.trim();
      const searchRegex = { $regex: q, $options: 'i' };

      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { title: searchRegex },
            { content: searchRegex },
            { tags: { $in: [new RegExp(q, 'i')] } },
            { 'fields.name': searchRegex },
            { 'fields.value': searchRegex },
            { assigneeName: searchRegex }
          ]
        }
      ];
    }

    let sortOption: any = { position: 1, createdAt: 1 };
    if (query.sort === 'created_desc') sortOption = { createdAt: -1 };
    if (query.sort === 'created_asc') sortOption = { createdAt: 1 };
    if (query.sort === 'updated_desc') sortOption = { updatedAt: -1 };
    if (query.sort === 'title_asc') sortOption = { title: 1 };
    if (query.sort === 'title_desc') sortOption = { title: -1 };
    if (query.sort === 'dueDate') sortOption = { 'taskProps.dueDate': 1 };
    if (query.sort === 'position') sortOption = { position: 1 };

    const { page, limit, skip } = parsePagination(query);

    const [rawItems, total] = await Promise.all([
      Item.find(filter).sort(sortOption).skip(skip).limit(limit),
      Item.countDocuments(filter)
    ]);

    // Apply item-level access filtering
    const data: IItem[] = [];
    for (const item of rawItems) {
      if (await canAccessItem(item, userId, userRole)) {
        data.push(item);
      }
    }

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

  async getItemById(userId: string, itemId: string, userRole: WorkspaceRole = 'owner') {
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new NotFoundError('Invalid item ID');
    }

    const item = await Item.findOne({
      _id: itemId,
      deletedAt: null
    });

    if (!item) {
      throw new NotFoundError('Item not found or inaccessible');
    }

    const hasAccess = await canAccessItem(item, userId, userRole);
    if (!hasAccess) {
      throw new NotFoundError('Item not found or inaccessible');
    }

    return item;
  }

  async updateItem(
    userId: string,
    itemId: string,
    updates: {
      topicId?: string;
      targetTopicId?: string;
      templateId?: string | null;
      title?: string;
      content?: string;
      fields?: Array<any>;
      tags?: string[];
      isFavorite?: boolean;
      isArchived?: boolean;
      position?: number;
      visibility?: 'private' | 'workspace' | 'topic' | 'users' | 'roles';
      sharedWithUsers?: string[];
      sharedWithRoles?: string[];
      assigneeId?: string | null;
      assigneeName?: string;
      taskProps?: ITaskProperties;
      url?: string;
      description?: string;
      notes?: string;
      openInNewTab?: boolean;
    },
    userRole: WorkspaceRole = 'owner'
  ) {
    const item = await Item.findOne({ _id: itemId, deletedAt: null });
    if (!item) {
      throw new NotFoundError('Item not found or inaccessible');
    }

    const hasAccess = await canAccessItem(item, userId, userRole);
    if (!hasAccess) {
      throw new NotFoundError('Item not found or inaccessible');
    }

    const actor = await User.findById(userId);
    const oldStatus = item.taskProps?.status;
    const oldAssignee = item.assigneeId?.toString();
    const oldPriority = item.taskProps?.priority;

    // Target topic check
    const newTopicId = updates.topicId || updates.targetTopicId;
    if (newTopicId && newTopicId.toString() !== item.topicId.toString()) {
      const targetTopic = await Topic.findOne({
        _id: newTopicId,
        deletedAt: null
      });
      if (!targetTopic) throw new NotFoundError('Target topic does not exist or inaccessible');
      item.topicId = targetTopic._id;
    }

    if (updates.title !== undefined) item.title = updates.title.trim();
    if (updates.content !== undefined) item.content = updates.content;
    if (updates.notes !== undefined && updates.content === undefined) item.content = updates.notes;
    if (updates.tags !== undefined) item.tags = updates.tags;
    if (updates.isFavorite !== undefined) item.isFavorite = updates.isFavorite;
    if (updates.isArchived !== undefined) item.isArchived = updates.isArchived;
    if (updates.position !== undefined) item.position = updates.position;
    if (updates.visibility !== undefined) item.visibility = updates.visibility;
    if (updates.sharedWithUsers !== undefined) {
      item.sharedWithUsers = updates.sharedWithUsers.map(u => new mongoose.Types.ObjectId(u));
    }
    if (updates.sharedWithRoles !== undefined) item.sharedWithRoles = updates.sharedWithRoles;
    if (updates.assigneeId !== undefined) {
      item.assigneeId = updates.assigneeId ? new mongoose.Types.ObjectId(updates.assigneeId) : null;
    }
    if (updates.assigneeName !== undefined) item.assigneeName = updates.assigneeName;
    if (updates.taskProps !== undefined) {
      item.taskProps = { ...item.taskProps, ...updates.taskProps };
    }

    // Fields update
    if (updates.fields !== undefined) {
      item.fields = updates.fields.map((f, idx) => ({
        fieldId: f.fieldId || generateFieldId(),
        name: f.name.trim(),
        type: f.type,
        value: validateAndSanitizeFieldValue(
          f.type,
          f.value,
          f.options,
          f.required,
          { maxRating: f.maxRating, currencyCode: f.currencyCode }
        ),
        options: f.options || [],
        relationTopicId: f.relationTopicId || '',
        relationMultiple: f.relationMultiple || false,
        currencyCode: f.currencyCode || 'USD',
        maxRating: f.maxRating || 5,
        position: f.position ?? idx,
        required: Boolean(f.required),
        visible: f.visible !== false
      }));
    }

    // Legacy updates support
    if (updates.url !== undefined) {
      const urlIdx = item.fields.findIndex(f => f.type === 'url');
      if (urlIdx >= 0) {
        item.fields[urlIdx].value = validateAndSanitizeFieldValue('url', updates.url);
      } else {
        item.fields.push({
          fieldId: generateFieldId(),
          name: 'Website',
          type: 'url',
          value: validateAndSanitizeFieldValue('url', updates.url),
          options: [],
          position: item.fields.length,
          required: false,
          visible: true
        });
      }
    }

    item.versionNumber = (item.versionNumber || 1) + 1;
    await item.save();

    // Snapshot version history
    await ItemVersion.create({
      itemId: item._id,
      workspaceId: item.workspaceId,
      versionNumber: item.versionNumber,
      title: item.title,
      content: item.content,
      fields: item.fields,
      tags: item.tags,
      changedBy: new mongoose.Types.ObjectId(userId),
      changedByName: actor?.name || 'User',
      changeSummary: 'Updated item attributes/fields'
    });

    // Activity tracking & Notifications
    if (item.workspaceId) {
      if (oldStatus && updates.taskProps?.status && oldStatus !== updates.taskProps.status) {
        await Activity.create({
          workspaceId: item.workspaceId,
          actorId: new mongoose.Types.ObjectId(userId),
          actorName: actor?.name || 'User',
          action: 'status_changed',
          resourceType: 'item',
          resourceId: item._id.toString(),
          resourceTitle: item.title || 'Untitled',
          oldValue: oldStatus,
          newValue: updates.taskProps.status,
          description: `Status changed: ${oldStatus} → ${updates.taskProps.status}`
        });
      }

      if (updates.assigneeId && updates.assigneeId !== oldAssignee && updates.assigneeId !== userId) {
        await Notification.create({
          workspaceId: item.workspaceId,
          recipientId: new mongoose.Types.ObjectId(updates.assigneeId),
          senderId: new mongoose.Types.ObjectId(userId),
          senderName: actor?.name || 'User',
          type: 'assigned',
          title: 'Item Assigned to You',
          message: `${actor?.name || 'User'} assigned you to "${item.title || 'Untitled Item'}"`,
          resourceType: 'item',
          resourceId: item._id.toString()
        });
      }
    }

    return item;
  }

  async updateField(
    userId: string,
    itemId: string,
    fieldId: string,
    updates: {
      value?: any;
      name?: string;
      visible?: boolean;
      position?: number;
    }
  ) {
    const item = await this.getItemById(userId, itemId);
    const fieldIndex = item.fields.findIndex(f => f.fieldId === fieldId);

    if (fieldIndex === -1) {
      throw new NotFoundError('Field not found in this item');
    }

    const currentField = item.fields[fieldIndex];

    if (updates.name !== undefined) currentField.name = updates.name.trim();
    if (updates.visible !== undefined) currentField.visible = updates.visible;
    if (updates.position !== undefined) currentField.position = updates.position;
    if (updates.value !== undefined) {
      currentField.value = validateAndSanitizeFieldValue(
        currentField.type,
        updates.value,
        currentField.options,
        currentField.required,
        { maxRating: currentField.maxRating, currencyCode: currentField.currencyCode }
      );
    }

    item.markModified('fields');
    item.versionNumber = (item.versionNumber || 1) + 1;
    await item.save();

    return item;
  }

  async deleteItem(userId: string, itemId: string, permanent: boolean = false, userRole: WorkspaceRole = 'owner') {
    const item = await Item.findOne({ _id: itemId });

    if (!item) {
      throw new NotFoundError('Item not found or inaccessible');
    }

    const hasAccess = await canAccessItem(item, userId, userRole);
    if (!hasAccess) {
      throw new NotFoundError('Item not found or inaccessible');
    }

    if (permanent) {
      await Item.deleteOne({ _id: itemId });
      await ItemVersion.deleteMany({ itemId });
      return { success: true, permanent: true };
    } else {
      item.deletedAt = new Date();
      await item.save();
      return { success: true, permanent: false };
    }
  }

  async restoreItem(userId: string, itemId: string) {
    const item = await Item.findOne({ _id: itemId });

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    item.deletedAt = null;
    await item.save();
    return item;
  }

  async duplicateItem(userId: string, itemId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const original = await Item.findOne({ _id: itemId, deletedAt: null });

    if (!original) {
      throw new NotFoundError('Item not found');
    }

    const newItem = await Item.create({
      userId: userObjectId,
      workspaceId: original.workspaceId,
      topicId: original.topicId,
      templateId: original.templateId,
      title: `${original.title} (Copy)`.trim(),
      content: original.content,
      fields: original.fields.map(f => ({ ...f, fieldId: generateFieldId() })),
      tags: original.tags,
      isFavorite: original.isFavorite,
      isArchived: false,
      visibility: original.visibility,
      sharedWithUsers: original.sharedWithUsers,
      sharedWithRoles: original.sharedWithRoles,
      assigneeId: original.assigneeId,
      assigneeName: original.assigneeName,
      taskProps: original.taskProps,
      position: original.position + 1,
      versionNumber: 1,
      deletedAt: null
    });

    return newItem;
  }

  async bulkOperation(
    userId: string,
    action: string,
    itemIds: string[],
    targetTopicId?: string,
    tags?: string[]
  ) {
    const ids = itemIds.map(id => new mongoose.Types.ObjectId(id));

    switch (action) {
      case 'delete':
        await Item.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: new Date() } });
        break;
      case 'permanentDelete':
        await Item.deleteMany({ _id: { $in: ids } });
        await ItemVersion.deleteMany({ itemId: { $in: ids } });
        break;
      case 'restore':
        await Item.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: null } });
        break;
      case 'archive':
        await Item.updateMany({ _id: { $in: ids } }, { $set: { isArchived: true } });
        break;
      case 'unarchive':
        await Item.updateMany({ _id: { $in: ids } }, { $set: { isArchived: false } });
        break;
      case 'favorite':
        await Item.updateMany({ _id: { $in: ids } }, { $set: { isFavorite: true } });
        break;
      case 'unfavorite':
        await Item.updateMany({ _id: { $in: ids } }, { $set: { isFavorite: false } });
        break;
      case 'addTags':
        if (tags && tags.length > 0) {
          await Item.updateMany({ _id: { $in: ids } }, { $addToSet: { tags: { $each: tags } } });
        }
        break;
      case 'removeTags':
        if (tags && tags.length > 0) {
          await Item.updateMany({ _id: { $in: ids } }, { $pull: { tags: { $in: tags } } });
        }
        break;
      case 'move':
        if (targetTopicId && mongoose.Types.ObjectId.isValid(targetTopicId)) {
          const topic = await Topic.findOne({ _id: targetTopicId, deletedAt: null });
          if (!topic) throw new NotFoundError('Target topic not found');
          await Item.updateMany({ _id: { $in: ids } }, { $set: { topicId: topic._id } });
        }
        break;
    }

    return { success: true, count: itemIds.length };
  }

  async reorderItems(userId: string, topicId: string, items: Array<{ id: string; position: number }>) {
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { position: item.position } }
      }
    }));

    if (bulkOps.length > 0) {
      await Item.bulkWrite(bulkOps);
    }

    return { success: true };
  }
}

export const itemService = new ItemService();
