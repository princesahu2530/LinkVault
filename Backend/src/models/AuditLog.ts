import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorEmail: string;
  actorName: string;
  action: string; // 'member.invited' | 'member.removed' | 'member.role_changed' | 'workspace.exported' | 'workspace.imported' | 'item.deleted' | 'topic.deleted'
  targetId?: string;
  targetType?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    actorEmail: {
      type: String,
      required: true
    },
    actorName: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    targetId: {
      type: String,
      default: ''
    },
    targetType: {
      type: String,
      default: ''
    },
    details: {
      type: Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as any;
        obj.id = obj._id?.toString();
        obj.workspaceId = obj.workspaceId?.toString();
        obj.actorId = obj.actorId?.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

auditLogSchema.index({ workspaceId: 1, createdAt: -1 });

export const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
