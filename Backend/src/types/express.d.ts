import { AuthUser } from './auth.js';
import { IWorkspaceMember } from '../models/WorkspaceMember.js';
import { WorkspaceRole, Permission } from './workspace.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      workspaceId?: string;
      workspaceRole?: WorkspaceRole;
      workspacePermissions?: Permission[];
      workspaceMember?: IWorkspaceMember;
    }
  }
}

export {};

