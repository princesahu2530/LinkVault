import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { UnauthorizedError } from '../utils/errors.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { UserSettings } from '../models/UserSettings.js';
import { DEFAULT_ROLE_PERMISSIONS, WorkspaceRole } from '../types/workspace.types.js';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token required');
    }

    const token = authHeader.substring(7);
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }

    const user = await User.findById(payload.sub).select('_id email name avatar isEmailVerified isActive');
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    };

    // Workspace Resolution & RBAC Context Injection
    let workspaceIdentifier = (req.headers['x-workspace-id'] as string) ||
                              (req.headers['x-workspace-slug'] as string) ||
                              (req.query.workspaceId as string) ||
                              req.params.workspaceId;

    let targetWorkspace: any = null;

    if (workspaceIdentifier && mongoose.Types.ObjectId.isValid(workspaceIdentifier)) {
      targetWorkspace = await Workspace.findOne({ _id: workspaceIdentifier, deletedAt: null });
    } else if (workspaceIdentifier) {
      targetWorkspace = await Workspace.findOne({
        $or: [
          { slug: workspaceIdentifier.toLowerCase() },
          { name: { $regex: new RegExp(`^${workspaceIdentifier.trim()}$`, 'i') } }
        ],
        deletedAt: null
      });
    }

    if (!targetWorkspace) {
      // Check user's saved active workspace setting
      const settings = await UserSettings.findOne({ userId: user._id });
      if (settings?.activeWorkspaceId) {
        targetWorkspace = await Workspace.findOne({ _id: settings.activeWorkspaceId, deletedAt: null });
      }
    }

    if (!targetWorkspace) {
      // Fallback to first available workspace or personal workspace
      const firstMember = await WorkspaceMember.findOne({ userId: user._id, status: 'active' });
      if (firstMember) {
        targetWorkspace = await Workspace.findOne({ _id: firstMember.workspaceId, deletedAt: null });
      }
      if (!targetWorkspace) {
        targetWorkspace = await Workspace.findOne({ ownerId: user._id, isPersonal: true, deletedAt: null });
      }
    }

    if (targetWorkspace) {
      let member = await WorkspaceMember.findOne({
        workspaceId: targetWorkspace._id,
        userId: user._id,
        status: 'active'
      });

      if (!member && targetWorkspace.ownerId.toString() === user._id.toString()) {
        member = await WorkspaceMember.create({
          workspaceId: targetWorkspace._id,
          userId: user._id,
          role: 'owner',
          status: 'active',
          joinedAt: new Date()
        });
      }

      if (member) {
        req.workspaceId = targetWorkspace._id.toString();
        req.workspaceRole = member.role;
        req.workspaceMember = member;
        const rolePermissions = DEFAULT_ROLE_PERMISSIONS[member.role] || [];
        req.workspacePermissions = Array.from(new Set([...rolePermissions, ...(member.customPermissions || [])]));
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

export const authenticate = requireAuth;
export const authenticateToken = requireAuth;


