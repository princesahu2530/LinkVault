import mongoose from 'mongoose';
import { Workspace, IWorkspace } from '../models/Workspace.js';
import { WorkspaceMember, IWorkspaceMember } from '../models/WorkspaceMember.js';
import { Topic } from '../models/Topic.js';
import { Item } from '../models/Item.js';
import { Template } from '../models/Template.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { STARTER_PACKS, SYSTEM_TEMPLATES } from '../constants/systemTemplates.js';
import { WorkspaceRole, Permission } from '../types/workspace.types.js';
import { NotFoundError, ForbiddenError, ValidationError, ConflictError } from '../utils/errors.js';

export class WorkspaceService {
  async getWorkspacesForUser(userId: string): Promise<any[]> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const memberships = await WorkspaceMember.find({ userId: userObjId, status: 'active' });
    const memberWsIds = memberships.map(m => m.workspaceId.toString());
    const ownedWorkspaces = await Workspace.find({ ownerId: userObjId, deletedAt: null });
    const allWsIds = Array.from(new Set([...memberWsIds, ...ownedWorkspaces.map(w => w._id.toString())]));

    const workspaces = await Workspace.find({
      _id: { $in: allWsIds.map(id => new mongoose.Types.ObjectId(id)) },
      deletedAt: null
    }).sort({ isPersonal: -1, createdAt: 1 });

    const results = await Promise.all(
      workspaces.map(async ws => {
        let mem = memberships.find(m => m.workspaceId.toString() === ws._id.toString());
        if (!mem && ws.ownerId.toString() === userId) {
          mem = await WorkspaceMember.create({
            workspaceId: ws._id,
            userId: userObjId,
            role: 'owner',
            status: 'active',
            joinedAt: new Date()
          });
        }

        const [memberCount, topicCount, itemCount] = await Promise.all([
          WorkspaceMember.countDocuments({ workspaceId: ws._id, status: 'active' }),
          Topic.countDocuments({ workspaceId: ws._id, deletedAt: null }),
          Item.countDocuments({ workspaceId: ws._id, deletedAt: null, isArchived: false })
        ]);

        const generatedSlug = ws.slug || ws.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        return {
          ...ws.toJSON(),
          slug: generatedSlug,
          memberCount: Math.max(memberCount, 1),
          topicCount,
          itemCount,
          myRole: mem ? mem.role : (ws.ownerId.toString() === userId ? 'owner' : 'viewer'),
          myCustomPermissions: mem ? mem.customPermissions : []
        };
      })
    );

    return results;
  }

  async getWorkspaceById(workspaceId: string, userId: string): Promise<any> {
    const workspace = await Workspace.findOne({ _id: workspaceId, deletedAt: null });
    if (!workspace) throw new NotFoundError('Workspace not found');

    const member = await WorkspaceMember.findOne({ workspaceId, userId, status: 'active' });
    if (!member && workspace.ownerId.toString() !== userId) {
      throw new ForbiddenError('Access to this workspace is denied');
    }

    const memberCount = await WorkspaceMember.countDocuments({ workspaceId, status: 'active' });
    const topicCount = await Topic.countDocuments({ workspaceId, deletedAt: null });
    const itemCount = await Item.countDocuments({ workspaceId, deletedAt: null, isArchived: false });

    return {
      ...workspace.toJSON(),
      slug: workspace.slug || workspace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      memberCount: Math.max(memberCount, 1),
      topicCount,
      itemCount,
      myRole: member ? member.role : 'owner'
    };
  }

  async createWorkspace(
    userId: string,
    data: {
      name: string;
      slug?: string;
      description?: string;
      icon?: string;
      color?: string;
      category?: string;
      starterPackId?: string;
    }
  ) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const cleanName = data.name.trim();
    const slug = data.slug?.toLowerCase().trim() || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const workspace = await Workspace.create({
      name: cleanName,
      slug,
      description: data.description || '',
      icon: data.icon || 'Briefcase',
      color: data.color || '#6366f1',
      category: data.category || 'general',
      ownerId: user._id,
      isPersonal: false,
      settings: {
        defaultView: 'cards',
        allowMemberInvites: true,
        enableActivityTimeline: true,
        enableComments: true,
        enableTaskManagement: true,
        enableRelations: true
      }
    });

    // Create owner membership
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: user._id,
      role: 'owner',
      status: 'active',
      joinedAt: new Date()
    });

    // Log audit
    await AuditLog.create({
      workspaceId: workspace._id,
      actorId: user._id,
      actorEmail: user.email,
      actorName: user.name,
      action: 'workspace.created',
      targetId: workspace._id.toString(),
      targetType: 'workspace',
      details: { name: workspace.name }
    });

    // If starter pack specified, populate suggested topics and templates
    if (data.starterPackId) {
      await this.applyStarterPack(workspace._id.toString(), userId, data.starterPackId);
    }

    return workspace;
  }

  async applyStarterPack(workspaceId: string, userId: string, starterPackId: string) {
    const pack = STARTER_PACKS.find(p => p.id === starterPackId);
    if (!pack) return;

    // Create relevant system templates in workspace
    const categoryTemplates = SYSTEM_TEMPLATES.filter(
      t => t.category === pack.category || t.category === 'general'
    );

    const createdTemplates: Record<string, any> = {};

    for (const tpl of categoryTemplates) {
      const doc = await Template.create({
        workspaceId,
        userId,
        name: tpl.name,
        description: tpl.description,
        icon: tpl.icon,
        color: tpl.color,
        category: tpl.category,
        isSystem: true,
        fields: tpl.fields
      });
      createdTemplates[tpl.name] = doc._id;
    }

    // Create suggested topics
    let pos = 0;
    for (const top of pack.suggestedTopics) {
      let defaultTemplateId = null;
      if (top.defaultTemplateName && createdTemplates[top.defaultTemplateName]) {
        defaultTemplateId = createdTemplates[top.defaultTemplateName];
      }

      await Topic.create({
        workspaceId,
        userId,
        name: top.name,
        description: top.description,
        icon: top.icon,
        color: top.color,
        defaultView: top.defaultView,
        defaultTemplateId,
        position: pos++
      });
    }
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    updates: {
      name?: string;
      slug?: string;
      description?: string;
      icon?: string;
      color?: string;
      settings?: any;
    }
  ) {
    const workspace = await Workspace.findOne({ _id: workspaceId, deletedAt: null });
    if (!workspace) throw new NotFoundError('Workspace not found');

    if (updates.name) workspace.name = updates.name.trim();
    if (updates.slug) workspace.slug = updates.slug.toLowerCase().trim();
    if (updates.description !== undefined) workspace.description = updates.description.trim();
    if (updates.icon) workspace.icon = updates.icon;
    if (updates.color) workspace.color = updates.color;
    if (updates.settings) {
      workspace.settings = { ...workspace.settings, ...updates.settings };
    }

    await workspace.save();
    return workspace;
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    const workspace = await Workspace.findOne({ _id: workspaceId, deletedAt: null });
    if (!workspace) throw new NotFoundError('Workspace not found');

    if (workspace.isPersonal) {
      throw new ValidationError('The default Personal workspace cannot be deleted');
    }

    if (workspace.ownerId.toString() !== userId) {
      throw new ForbiddenError('Only the workspace owner can delete the workspace');
    }

    workspace.deletedAt = new Date();
    await workspace.save();

    // Soft delete associated topics and items
    await Topic.updateMany({ workspaceId: workspace._id }, { deletedAt: new Date() });
    await Item.updateMany({ workspaceId: workspace._id }, { deletedAt: new Date() });

    return { success: true, message: 'Workspace deleted' };
  }

  // --- MEMBERS MANAGEMENT ---

  async getMembers(workspaceId: string) {
    const members = await WorkspaceMember.find({ workspaceId }).populate(
      'userId',
      'name email avatar isEmailVerified'
    );

    return members.map(m => {
      const u = m.userId as any;
      return {
        id: m._id.toString(),
        userId: u?._id?.toString() || m.userId.toString(),
        name: u?.name || 'Unknown User',
        email: u?.email || '',
        avatar: u?.avatar || '',
        role: m.role,
        customPermissions: m.customPermissions,
        status: m.status,
        department: m.department,
        title: m.title,
        joinedAt: m.joinedAt,
        invitedAt: m.invitedAt
      };
    });
  }

  async inviteMember(
    workspaceId: string,
    actorId: string,
    data: {
      email: string;
      role: WorkspaceRole;
      department?: string;
      title?: string;
      customPermissions?: Permission[];
    }
  ) {
    const email = data.email.toLowerCase().trim();
    let targetUser = await User.findOne({ email });

    if (!targetUser) {
      // Create user placeholder account for invite that completes on login
      targetUser = await User.create({
        name: email.split('@')[0],
        email,
        passwordHash: 'pending_invitation_hash',
        isEmailVerified: false,
        isActive: true
      });
    }

    let member = await WorkspaceMember.findOne({
      workspaceId,
      userId: targetUser._id
    });

    if (member) {
      member.status = 'active';
      member.role = data.role;
      if (data.department !== undefined) member.department = data.department;
      if (data.title !== undefined) member.title = data.title;
      if (data.customPermissions) member.customPermissions = data.customPermissions;
      await member.save();
    } else {
      member = await WorkspaceMember.create({
        workspaceId,
        userId: targetUser._id,
        role: data.role,
        customPermissions: data.customPermissions || [],
        status: 'active',
        invitedBy: actorId,
        invitedAt: new Date(),
        joinedAt: new Date(),
        department: data.department || '',
        title: data.title || ''
      });
    }

    // Send in-app notification
    const actor = await User.findById(actorId);
    const workspace = await Workspace.findById(workspaceId);

    await Notification.create({
      workspaceId,
      recipientId: targetUser._id,
      senderId: actor?._id,
      senderName: actor?.name || 'Workspace Admin',
      type: 'invite',
      title: 'Workspace Invitation',
      message: `You have been added to ${workspace?.name || 'a workspace'} with role ${data.role}`,
      resourceType: 'workspace',
      resourceId: workspaceId
    });

    // Log audit
    await AuditLog.create({
      workspaceId,
      actorId,
      actorEmail: actor?.email || '',
      actorName: actor?.name || '',
      action: 'member.invited',
      targetId: targetUser._id.toString(),
      targetType: 'user',
      details: { email, role: data.role }
    });

    return member;
  }

  async updateMemberRole(
    workspaceId: string,
    actorId: string,
    memberId: string,
    role: WorkspaceRole,
    customPermissions?: Permission[]
  ) {
    const member = await WorkspaceMember.findOne({ _id: memberId, workspaceId });
    if (!member) throw new NotFoundError('Member not found in workspace');

    const workspace = await Workspace.findById(workspaceId);
    if (workspace?.ownerId.toString() === member.userId.toString() && role !== 'owner') {
      throw new ValidationError('Cannot demote workspace owner');
    }

    const oldRole = member.role;
    member.role = role;
    if (customPermissions) {
      member.customPermissions = customPermissions;
    }
    await member.save();

    const actor = await User.findById(actorId);

    // Audit log
    await AuditLog.create({
      workspaceId,
      actorId,
      actorEmail: actor?.email || '',
      actorName: actor?.name || '',
      action: 'member.role_changed',
      targetId: member.userId.toString(),
      targetType: 'user',
      details: { oldRole, newRole: role }
    });

    return member;
  }

  async removeMember(workspaceId: string, actorId: string, memberId: string) {
    const member = await WorkspaceMember.findOne({ _id: memberId, workspaceId });
    if (!member) throw new NotFoundError('Member not found in workspace');

    const workspace = await Workspace.findById(workspaceId);
    if (workspace?.ownerId.toString() === member.userId.toString()) {
      throw new ValidationError('Cannot remove workspace owner');
    }

    await WorkspaceMember.deleteOne({ _id: memberId });

    const actor = await User.findById(actorId);
    await AuditLog.create({
      workspaceId,
      actorId,
      actorEmail: actor?.email || '',
      actorName: actor?.name || '',
      action: 'member.removed',
      targetId: member.userId.toString(),
      targetType: 'user',
      details: { removedUserId: member.userId.toString() }
    });

    return { success: true };
  }

  // --- AUDIT LOGS ---
  async getAuditLogs(workspaceId: string, limit = 50) {
    return AuditLog.find({ workspaceId }).sort({ createdAt: -1 }).limit(limit);
  }
}

export const workspaceService = new WorkspaceService();
