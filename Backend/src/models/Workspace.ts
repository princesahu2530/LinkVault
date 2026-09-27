import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IWorkspaceSettings {
  defaultView?: string;
  allowMemberInvites?: boolean;
  enableActivityTimeline?: boolean;
  enableComments?: boolean;
  enableTaskManagement?: boolean;
  enableRelations?: boolean;
}

export interface IWorkspace extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  ownerId: mongoose.Types.ObjectId;
  isPersonal: boolean;
  category?: string;
  settings: IWorkspaceSettings;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    },
    icon: {
      type: String,
      default: 'Briefcase',
      trim: true
    },
    color: {
      type: String,
      default: '#6366f1',
      trim: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    isPersonal: {
      type: Boolean,
      default: false,
      index: true
    },
    category: {
      type: String,
      default: 'general',
      trim: true
    },
    settings: {
      defaultView: { type: String, default: 'cards' },
      allowMemberInvites: { type: Boolean, default: true },
      enableActivityTimeline: { type: Boolean, default: true },
      enableComments: { type: Boolean, default: true },
      enableTaskManagement: { type: Boolean, default: true },
      enableRelations: { type: Boolean, default: true }
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as any;
        obj.id = obj._id?.toString();
        obj.ownerId = obj.ownerId?.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

workspaceSchema.index({ ownerId: 1, isPersonal: 1 });
workspaceSchema.index({ ownerId: 1, deletedAt: 1 });

export const Workspace: Model<IWorkspace> = mongoose.model<IWorkspace>('Workspace', workspaceSchema);
