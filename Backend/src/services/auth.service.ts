import crypto from 'crypto';
import { User, IUser } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { UserSettings } from '../models/UserSettings.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Topic } from '../models/Topic.js';
import { workspaceService } from './workspace.service.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { UnauthorizedError, ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import { AuthUser } from '../types/auth.js';
import { DEFAULT_ROLE_PERMISSIONS, WorkspaceRole } from '../types/workspace.types.js';

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export class AuthService {
  async register(data: { name: string; email: string; password: string; workspaceSlug?: string; workspaceId?: string }, userAgent?: string, ipAddress?: string) {
    const cleanEmail = data.email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail }).select('+passwordHash');

    const passwordHash = await hashPassword(data.password);

    if (user) {
      if (user.passwordHash && user.passwordHash !== 'pending_invitation_hash') {
        throw new ConflictError('An account with this email address already exists');
      }
      // Complete registration for previously invited placeholder user
      user.name = data.name.trim();
      user.passwordHash = passwordHash;
      user.isEmailVerified = true;
      user.isActive = true;
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await User.create({
        name: data.name.trim(),
        email: cleanEmail,
        passwordHash,
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: new Date()
      });
    }

    // Ensure default Personal Workspace exists for user
    let personalWorkspace = await Workspace.findOne({ ownerId: user._id, isPersonal: true, deletedAt: null });
    if (!personalWorkspace) {
      personalWorkspace = await Workspace.create({
        name: 'Personal Vault',
        slug: 'personal-vault',
        description: 'Default personal workspace',
        icon: 'Folder',
        color: '#6366f1',
        ownerId: user._id,
        isPersonal: true,
        category: 'personal',
        settings: {
          defaultView: 'cards',
          allowMemberInvites: true,
          enableActivityTimeline: true,
          enableComments: true,
          enableTaskManagement: true,
          enableRelations: true
        }
      });

      await WorkspaceMember.create({
        workspaceId: personalWorkspace._id,
        userId: user._id,
        role: 'owner',
        status: 'active',
        joinedAt: new Date()
      });
    }

    // Default user settings
    let settings = await UserSettings.findOne({ userId: user._id });
    if (!settings) {
      settings = await UserSettings.create({
        userId: user._id,
        activeWorkspaceId: personalWorkspace._id,
        theme: 'dark',
        compactMode: false,
        defaultTopicState: 'remember',
        showDescriptions: true,
        showUrls: true,
        appName: 'LinkVault'
      });
    }

    // Get all workspaces for user
    const workspaces = await workspaceService.getWorkspacesForUser(user._id.toString());

    // Generate JWTs
    const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
    const jti = crypto.randomUUID();
    const rawRefreshToken = signRefreshToken({ sub: user._id.toString(), jti });

    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress
    });

    const safeUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    };

    const initialWorkspaceId = workspaces.find(w => !w.isPersonal)?.id || personalWorkspace._id.toString();

    return {
      user: safeUser,
      accessToken,
      refreshToken: rawRefreshToken,
      activeWorkspaceId: initialWorkspaceId,
      workspaces
    };
  }

  async login(
    data: { email: string; password: string; workspaceSlug?: string; workspaceId?: string; workspaceName?: string },
    userAgent?: string,
    ipAddress?: string
  ) {
    const cleanEmail = data.email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.passwordHash === 'pending_invitation_hash') {
      // First-time login for invited placeholder user: set their chosen password
      user.passwordHash = await hashPassword(data.password);
      user.isEmailVerified = true;
      user.isActive = true;
    } else {
      const isMatch = await verifyPassword(data.password, user.passwordHash);
      if (!isMatch) {
        throw new UnauthorizedError('Invalid email or password');
      }
    }

    user.lastLoginAt = new Date();
    await user.save();

    // Ensure personal workspace exists
    let personalWorkspace = await Workspace.findOne({ ownerId: user._id, isPersonal: true, deletedAt: null });
    if (!personalWorkspace) {
      personalWorkspace = await Workspace.create({
        name: 'Personal Vault',
        slug: 'personal-vault',
        description: 'Default personal workspace',
        icon: 'Folder',
        color: '#6366f1',
        ownerId: user._id,
        isPersonal: true,
        category: 'personal',
        settings: {
          defaultView: 'cards',
          allowMemberInvites: true,
          enableActivityTimeline: true,
          enableComments: true,
          enableTaskManagement: true,
          enableRelations: true
        }
      });
      await WorkspaceMember.create({
        workspaceId: personalWorkspace._id,
        userId: user._id,
        role: 'owner',
        status: 'active',
        joinedAt: new Date()
      });
    }

    // Make sure user settings exist
    let settings = await UserSettings.findOne({ userId: user._id });
    if (!settings) {
      settings = await UserSettings.create({
        userId: user._id,
        activeWorkspaceId: personalWorkspace._id,
        theme: 'dark',
        compactMode: false,
        defaultTopicState: 'remember',
        showDescriptions: true,
        showUrls: true,
        appName: 'LinkVault'
      });
    }

    // Fetch all workspaces the user has access to
    const workspaces = await workspaceService.getWorkspacesForUser(user._id.toString());

    // Resolve target workspace if specified
    let selectedWs = null;
    if (data.workspaceId) {
      selectedWs = workspaces.find(w => w.id === data.workspaceId || w._id?.toString() === data.workspaceId);
    } else if (data.workspaceSlug) {
      const targetSlug = data.workspaceSlug.toLowerCase().trim();
      selectedWs = workspaces.find(w => w.slug?.toLowerCase() === targetSlug || w.name?.toLowerCase().replace(/\s+/g, '-').includes(targetSlug));
    } else if (data.workspaceName) {
      const targetName = data.workspaceName.toLowerCase().trim();
      selectedWs = workspaces.find(w => w.name?.toLowerCase().includes(targetName));
    }

    if (!selectedWs) {
      // Preference: shared product workspace first, or saved active workspace, or personal
      const savedWs = workspaces.find(w => w.id === settings?.activeWorkspaceId?.toString());
      const teamWs = workspaces.find(w => !w.isPersonal);
      selectedWs = savedWs || teamWs || workspaces[0] || personalWorkspace;
    }

    const resolvedWorkspaceId = selectedWs.id || selectedWs._id?.toString() || personalWorkspace._id.toString();
    const resolvedRole: WorkspaceRole = selectedWs.myRole || (selectedWs.ownerId?.toString() === user._id.toString() ? 'owner' : 'member');
    const resolvedPermissions = DEFAULT_ROLE_PERMISSIONS[resolvedRole] || [];

    // Generate tokens
    const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
    const jti = crypto.randomUUID();
    const rawRefreshToken = signRefreshToken({ sub: user._id.toString(), jti });

    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress
    });

    const safeUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    };

    return {
      user: safeUser,
      accessToken,
      refreshToken: rawRefreshToken,
      activeWorkspaceId: resolvedWorkspaceId,
      activeWorkspace: selectedWs,
      workspaceRole: resolvedRole,
      workspacePermissions: resolvedPermissions,
      workspaces
    };
  }

  async refresh(rawRefreshToken: string, userAgent?: string, ipAddress?: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const tokenDoc = await RefreshToken.findOne({ tokenHash, userId: payload.sub });

    if (!tokenDoc) {
      await RefreshToken.deleteMany({ userId: payload.sub });
      throw new UnauthorizedError('Invalid refresh session. Please log in again.');
    }

    if (tokenDoc.revokedAt || tokenDoc.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired or revoked');
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    // Rotate refresh token
    const newJti = crypto.randomUUID();
    const newRawRefreshToken = signRefreshToken({ sub: user._id.toString(), jti: newJti });
    const newTokenHash = hashToken(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const newDoc = await RefreshToken.create({
      userId: user._id,
      tokenHash: newTokenHash,
      expiresAt: newExpiresAt,
      userAgent,
      ipAddress
    });

    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedByTokenId = newDoc._id;
    await tokenDoc.save();

    const newAccessToken = signAccessToken({ sub: user._id.toString(), email: user.email });

    const safeUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    };

    return {
      user: safeUser,
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken
    };
  }

  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) return;
    const tokenHash = hashToken(rawRefreshToken);
    await RefreshToken.deleteOne({ tokenHash });
  }

  async logoutAll(userId: string) {
    await RefreshToken.deleteMany({ userId });
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await verifyPassword(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Current password does not match');
    }

    user.passwordHash = await hashPassword(newPass);
    await user.save();

    await RefreshToken.deleteMany({ userId });
    return true;
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return { message: 'If this email is registered, password reset instructions have been generated.' };
    }

    const rawResetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordTokenHash = hashToken(rawResetToken);
    user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return {
      message: 'If this email is registered, password reset instructions have been generated.',
      ...(process.env.NODE_ENV !== 'production' ? { devResetToken: rawResetToken } : {})
    };
  }

  async resetPassword(token: string, newPass: string) {
    const tokenHash = hashToken(token);
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() }
    }).select('+resetPasswordTokenHash +resetPasswordExpiresAt');

    if (!user) {
      throw new ValidationError('Password reset token is invalid or has expired');
    }

    user.passwordHash = await hashPassword(newPass);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await RefreshToken.deleteMany({ userId: user._id });
    return { success: true };
  }
}

export const authService = new AuthService();
