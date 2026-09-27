import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { WorkspaceMember, IWorkspaceMember } from '../models/WorkspaceMember.js';
import { Workspace } from '../models/Workspace.js';
import { Topic, ITopic } from '../models/Topic.js';
import { Item, IItem } from '../models/Item.js';
import { Permission, WorkspaceRole, DEFAULT_ROLE_PERMISSIONS } from '../types/workspace.types.js';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/errors.js';

export function checkMemberPermission(
  role: WorkspaceRole,
  customPermissions: Permission[] = [],
  requiredPermission?: Permission
): boolean {
  if (!requiredPermission) return true;
  if (role === 'owner') return true;

  const defaultPerms = DEFAULT_ROLE_PERMISSIONS[role] || [];
  if (defaultPerms.includes(requiredPermission)) return true;
  if (customPermissions.includes(requiredPermission)) return true;

  return false;
}

export function hasPermission(requiredPermission: Permission) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (req.workspaceRole) {
        const hasAccess = checkMemberPermission(
          req.workspaceRole,
          req.workspaceMember?.customPermissions || [],
          requiredPermission
        );
        if (!hasAccess) {
          throw new ForbiddenError(`Permission denied: Missing '${requiredPermission}'`);
        }
        return next();
      }

      // If workspace role not yet determined on request, run full workspace access check
      return requireWorkspaceAccess(requiredPermission)(req, _res, next);
    } catch (err) {
      next(err);
    }
  };
}

export function requireWorkspaceAccess(requiredPermission?: Permission) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const userId = req.user.id;
      let workspaceId = (req.headers['x-workspace-id'] as string) ||
                        (req.query.workspaceId as string) ||
                        req.params.workspaceId;

      if (!workspaceId && req.params.id && req.baseUrl.includes('/workspaces')) {
        workspaceId = req.params.id;
      }

      if (!workspaceId) {
        const personal = await Workspace.findOne({ ownerId: userId, isPersonal: true, deletedAt: null });
        if (personal) {
          workspaceId = personal._id.toString();
        } else {
          const firstMember = await WorkspaceMember.findOne({ userId, status: 'active' });
          if (firstMember) {
            workspaceId = firstMember.workspaceId.toString();
          }
        }
      }

      if (!workspaceId) {
        throw new NotFoundError('No active workspace found');
      }

      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        throw new NotFoundError('Invalid workspace ID format');
      }

      const workspace = await Workspace.findOne({ _id: workspaceId, deletedAt: null });
      if (!workspace) {
        throw new NotFoundError('Workspace not found or has been deleted');
      }

      let member = await WorkspaceMember.findOne({
        workspaceId: workspace._id,
        userId,
        status: 'active'
      });

      if (!member && workspace.ownerId.toString() === userId) {
        member = await WorkspaceMember.create({
          workspaceId: workspace._id,
          userId,
          role: 'owner',
          status: 'active',
          joinedAt: new Date()
        });
      }

      if (!member) {
        throw new ForbiddenError('You do not have access to this workspace');
      }

      if (requiredPermission && !checkMemberPermission(member.role, member.customPermissions, requiredPermission)) {
        throw new ForbiddenError(`Permission denied: Missing '${requiredPermission}'`);
      }

      req.workspaceId = workspace._id.toString();
      req.workspaceRole = member.role;
      req.workspaceMember = member;

      next();
    } catch (err) {
      next(err);
    }
  };
}

export async function canAccessTopic(topic: ITopic, userId: string, activeRole?: WorkspaceRole): Promise<boolean> {
  if (topic.userId.toString() === userId) return true;

  if (topic.workspaceId) {
    const member = await WorkspaceMember.findOne({
      workspaceId: topic.workspaceId,
      userId,
      status: 'active'
    });

    if (!member) return false;

    const role = member.role;
    if (role === 'owner' || role === 'admin') return true;
    if (topic.visibility === 'workspace') return true;
    if (topic.visibility === 'private') {
      return topic.userId.toString() === userId;
    }
    if (topic.visibility === 'roles' && topic.allowedRoles?.includes(role)) {
      return true;
    }
    if (topic.visibility === 'users' && topic.allowedUsers?.some(u => u.toString() === userId)) {
      return true;
    }
    return false;
  }

  return topic.userId.toString() === userId;
}

export async function canAccessItem(item: IItem, userId: string, activeRole?: WorkspaceRole): Promise<boolean> {
  if (item.userId.toString() === userId) return true;

  if (item.workspaceId) {
    const member = await WorkspaceMember.findOne({
      workspaceId: item.workspaceId,
      userId,
      status: 'active'
    });

    if (!member) return false;

    const role = member.role;
    if (role === 'owner' || role === 'admin') return true;
    if (item.visibility === 'workspace') return true;
    if (item.visibility === 'private') {
      return item.userId.toString() === userId;
    }
    if (item.visibility === 'roles' && item.sharedWithRoles?.includes(role)) {
      return true;
    }
    if (item.visibility === 'users' && item.sharedWithUsers?.some(u => u.toString() === userId)) {
      return true;
    }
    return false;
  }

  return item.userId.toString() === userId;
}
