import mongoose, { Document, Schema, Model } from 'mongoose';
import { ITemplateField } from '../types/item.types.js';

export interface ITemplate extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category?: string; // 'hr' | 'pm' | 'founder' | 'ceo' | 'lead' | 'dev' | 'general'
  icon?: string;
  color?: string;
  isSystem: boolean;
  version: number;
  fields: ITemplateField[];
  createdAt: Date;
  updatedAt: Date;
}

const templateFieldSchema = new Schema<ITemplateField>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
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
    options: { type: [String], default: [] },
    relationTopicId: { type: String, default: '' },
    relationMultiple: { type: Boolean, default: false },
    currencyCode: { type: String, default: 'USD' },
    maxRating: { type: Number, default: 5 },
    required: { type: Boolean, default: false },
    position: { type: Number, default: 0 },
    defaultValue: { type: Schema.Types.Mixed, default: null }
  },
  { _id: false }
);

const templateSchema = new Schema<ITemplate>(
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
    category: {
      type: String,
      default: 'general',
      trim: true
    },
    icon: {
      type: String,
      default: 'LayoutTemplate',
      trim: true
    },
    color: {
      type: String,
      default: '#6366f1',
      trim: true
    },
    isSystem: {
      type: Boolean,
      default: false,
      index: true
    },
    version: {
      type: Number,
      default: 1
    },
    fields: {
      type: [templateFieldSchema],
      default: []
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
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

templateSchema.index({ workspaceId: 1, name: 1 });
templateSchema.index({ userId: 1, name: 1 });

export const Template: Model<ITemplate> = mongoose.model<ITemplate>('Template', templateSchema);
