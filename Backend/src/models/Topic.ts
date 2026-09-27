import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITopic extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  position: number;
  visibility: 'workspace' | 'private' | 'roles' | 'users';
  allowedRoles: string[];
  allowedUsers: mongoose.Types.ObjectId[];
  defaultTemplateId?: mongoose.Types.ObjectId | null;
  defaultView?: 'cards' | 'table' | 'compact' | 'detailed' | 'calendar';
  defaultSort?: string;
  visibleColumns?: string[];
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const topicSchema = new Schema<ITopic>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    },
    icon: {
      type: String,
      default: 'Folder',
      trim: true
    },
    color: {
      type: String,
      default: '#6366f1',
      trim: true
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    position: {
      type: Number,
      default: 0,
      index: true
    },
    visibility: {
      type: String,
      enum: ['workspace', 'private', 'roles', 'users'],
      default: 'workspace',
      index: true
    },
    allowedRoles: {
      type: [String],
      default: []
    },
    allowedUsers: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },
    defaultTemplateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      default: null
    },
    defaultView: {
      type: String,
      enum: ['cards', 'table', 'compact', 'detailed', 'calendar'],
      default: 'cards'
    },
    defaultSort: {
      type: String,
      default: 'position'
    },
    visibleColumns: {
      type: [String],
      default: ['title', 'tags', 'createdAt']
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
        obj.userId = obj.userId?.toString();
        if (obj.workspaceId) obj.workspaceId = obj.workspaceId.toString();
        if (obj.defaultTemplateId) obj.defaultTemplateId = obj.defaultTemplateId.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

topicSchema.index({ workspaceId: 1, position: 1 });
topicSchema.index({ workspaceId: 1, isArchived: 1, deletedAt: 1 });
topicSchema.index({ userId: 1, position: 1 });
topicSchema.index({ userId: 1, isArchived: 1, deletedAt: 1 });
topicSchema.index({ userId: 1, name: 1 });

export const Topic: Model<ITopic> = mongoose.model<ITopic>('Topic', topicSchema);
