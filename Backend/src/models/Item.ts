import mongoose, { Document, Schema, Model } from 'mongoose';
import { IItemField, ITaskProperties, ITEM_LIMITS } from '../types/item.types.js';

export interface IItem extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  templateId?: mongoose.Types.ObjectId | null;
  title: string;
  content: string;
  fields: IItemField[];
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  position: number;
  visibility: 'private' | 'workspace' | 'topic' | 'users' | 'roles';
  sharedWithUsers: mongoose.Types.ObjectId[];
  sharedWithRoles: string[];
  assigneeId?: mongoose.Types.ObjectId | null;
  assigneeName?: string;
  taskProps?: ITaskProperties;
  versionNumber: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const itemFieldSchema = new Schema<IItemField>(
  {
    fieldId: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: ITEM_LIMITS.MAX_FIELD_NAME_LENGTH
    },
    type: {
      type: String,
      required: true,
      enum: [
        'text',
        'longText',
        'url',
        'email',
        'phone',
        'currency',
        'rating',
        'number',
        'date',
        'boolean',
        'select',
        'multiSelect',
        'code',
        'markdown',
        'json',
        'relation',
        'user'
      ]
    },
    value: {
      type: Schema.Types.Mixed,
      default: ''
    },
    options: {
      type: [String],
      default: []
    },
    relationTopicId: {
      type: String,
      default: ''
    },
    relationMultiple: {
      type: Boolean,
      default: false
    },
    currencyCode: {
      type: String,
      default: 'USD'
    },
    maxRating: {
      type: Number,
      default: 5
    },
    position: {
      type: Number,
      default: 0
    },
    required: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const itemSchema = new Schema<IItem>(
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
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      default: null,
      index: true
    },
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: ITEM_LIMITS.MAX_TITLE_LENGTH
    },
    content: {
      type: String,
      default: '',
      maxlength: ITEM_LIMITS.MAX_CONTENT_LENGTH
    },
    fields: {
      type: [itemFieldSchema],
      default: []
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    isFavorite: {
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
      enum: ['private', 'workspace', 'topic', 'users', 'roles'],
      default: 'workspace',
      index: true
    },
    sharedWithUsers: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },
    sharedWithRoles: {
      type: [String],
      default: []
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    assigneeName: {
      type: String,
      default: ''
    },
    taskProps: {
      isTask: { type: Boolean, default: false },
      status: { type: String, enum: ['todo', 'in_progress', 'in_review', 'done', 'cancelled'], default: 'todo' },
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
      assigneeId: { type: String, default: '' },
      assigneeName: { type: String, default: '' },
      startDate: { type: Date, default: null },
      dueDate: { type: Date, default: null },
      reminderDate: { type: Date, default: null },
      completed: { type: Boolean, default: false },
      progress: { type: Number, default: 0, min: 0, max: 100 },
      dependencies: { type: [String], default: [] }
    },
    versionNumber: {
      type: Number,
      default: 1
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
        obj.topicId = obj.topicId?.toString();
        if (obj.templateId) obj.templateId = obj.templateId.toString();
        if (obj.assigneeId) obj.assigneeId = obj.assigneeId.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

itemSchema.index({ workspaceId: 1, topicId: 1, position: 1 });
itemSchema.index({ workspaceId: 1, isArchived: 1, deletedAt: 1 });
itemSchema.index({ workspaceId: 1, isFavorite: 1, deletedAt: 1 });
itemSchema.index({ workspaceId: 1, tags: 1 });
itemSchema.index({ workspaceId: 1, createdAt: -1 });
itemSchema.index({ workspaceId: 1, updatedAt: -1 });
itemSchema.index({ workspaceId: 1, 'taskProps.dueDate': 1 });
itemSchema.index({ workspaceId: 1, 'taskProps.status': 1 });
itemSchema.index({ userId: 1, topicId: 1, position: 1 });
itemSchema.index({ userId: 1, isArchived: 1, deletedAt: 1 });
itemSchema.index({ userId: 1, isFavorite: 1, deletedAt: 1 });

export const Item: Model<IItem> = mongoose.model<IItem>('Item', itemSchema);
