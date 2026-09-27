import mongoose, { Document, Schema, Model } from 'mongoose';
import { WorkspaceRole, WorkspaceMemberStatus, Permission, DEFAULT_ROLE_PERMISSIONS } from '../types/workspace.types.js';

export interface IWorkspaceMember extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: WorkspaceRole;
  customPermissions: Permission[];
  status: WorkspaceMemberStatus;
  invitedBy?: mongoose.Types.ObjectId | null;
  invitedAt?: Date;
  joinedAt?: Date;
  department?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'manager', 'member', 'viewer'],
      default: 'member',
      required: true
    },
    customPermissions: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'active',
      index: true
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    department: {
      type: String,
      default: '',
      trim: true
    },
    title: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as any;
        obj.id = obj._id?.toString();
        obj.workspaceId = obj.workspaceId?.toString();
        obj.userId = obj.userId?.toString();
        if (obj.invitedBy) obj.invitedBy = obj.invitedBy.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });
workspaceMemberSchema.index({ userId: 1, status: 1 });

export const WorkspaceMember: Model<IWorkspaceMember> = mongoose.model<IWorkspaceMember>(
  'WorkspaceMember',
  workspaceMemberSchema
);
