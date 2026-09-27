import mongoose from 'mongoose';
import { Template, ITemplate } from '../models/Template.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { SYSTEM_TEMPLATES } from '../constants/systemTemplates.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { ITemplateField } from '../types/item.types.js';

export class TemplateService {
  async getSystemTemplates(category?: string) {
    if (category) {
      return SYSTEM_TEMPLATES.filter(t => t.category === category);
    }
    return SYSTEM_TEMPLATES;
  }

  async createTemplate(
    userId: string,
    data: {
      workspaceId?: string;
      name: string;
      description?: string;
      category?: string;
      icon?: string;
      color?: string;
      fields?: ITemplateField[];
    }
  ) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let wsObjectId: mongoose.Types.ObjectId | undefined;
    if (data.workspaceId && mongoose.Types.ObjectId.isValid(data.workspaceId)) {
      wsObjectId = new mongoose.Types.ObjectId(data.workspaceId);
    }

    const template = await Template.create({
      userId: userObjectId,
      workspaceId: wsObjectId,
      name: data.name.trim(),
      description: data.description || '',
      category: data.category || 'general',
      icon: data.icon || 'LayoutTemplate',
      color: data.color || '#6366f1',
      isSystem: false,
      version: 1,
      fields: data.fields || []
    });

    return template;
  }

  async getTemplates(userId: string, workspaceId?: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const filter: any = {};

    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      filter.$or = [
        { workspaceId: new mongoose.Types.ObjectId(workspaceId) },
        { isSystem: true }
      ];
    } else {
      const memberships = await WorkspaceMember.find({ userId: userObjectId, status: 'active' });
      const wsIds = memberships.map(m => m.workspaceId);

      filter.$or = [
        { workspaceId: { $in: wsIds } },
        { isSystem: true },
        { userId: userObjectId }
      ];
    }

    const templates = await Template.find(filter).sort({ name: 1 });
    return templates;
  }

  async getTemplateById(userId: string, templateId: string) {
    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      throw new NotFoundError('Invalid template ID');
    }

    const template = await Template.findOne({
      _id: templateId
    });

    if (!template) {
      throw new NotFoundError('Template not found or inaccessible');
    }

    if (template.isSystem) return template;
    if (template.userId.toString() === userId) return template;

    if (template.workspaceId) {
      const member = await WorkspaceMember.findOne({
        workspaceId: template.workspaceId,
        userId,
        status: 'active'
      });
      if (member) return template;
    }

    throw new NotFoundError('Template not found or inaccessible');
  }

  async updateTemplate(userId: string, templateId: string, updates: Partial<ITemplate>) {
    const template = await this.getTemplateById(userId, templateId);

    if (updates.name !== undefined) template.name = updates.name.trim();
    if (updates.description !== undefined) template.description = updates.description.trim();
    if (updates.icon !== undefined) template.icon = updates.icon;
    if (updates.color !== undefined) template.color = updates.color;
    if (updates.category !== undefined) template.category = updates.category;
    if (updates.fields !== undefined) template.fields = updates.fields;

    template.version = (template.version || 1) + 1;
    await template.save();
    return template;
  }

  async deleteTemplate(userId: string, templateId: string) {
    const template = await this.getTemplateById(userId, templateId);

    const result = await Template.deleteOne({
      _id: template._id
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError('Template not found or inaccessible');
    }

    return { success: true };
  }

  async duplicateTemplate(userId: string, templateId: string) {
    const original = await this.getTemplateById(userId, templateId);

    const cloned = await Template.create({
      userId: new mongoose.Types.ObjectId(userId),
      workspaceId: original.workspaceId,
      name: `${original.name} (Copy)`,
      description: original.description,
      category: original.category,
      icon: original.icon,
      color: original.color,
      isSystem: false,
      version: 1,
      fields: original.fields
    });

    return cloned;
  }
}

export const templateService = new TemplateService();
