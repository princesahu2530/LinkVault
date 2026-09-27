import mongoose, { Document, Schema, Model } from 'mongoose';
import { IItemField } from '../types/item.types.js';

export interface IItemVersion extends Document {
  _id: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  versionNumber: number;
  title: string;
  content: string;
  fields: IItemField[];
  tags: string[];
  changedBy: mongoose.Types.ObjectId;
  changedByName: string;
  changeSummary?: string;
  createdAt: Date;
}

const itemVersionSchema = new Schema<IItemVersion>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    versionNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    fields: {
      type: [Schema.Types.Mixed] as any,
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedByName: {
      type: String,
      required: true
    },
    changeSummary: {
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
        obj.itemId = obj.itemId?.toString();
        obj.workspaceId = obj.workspaceId?.toString();
        obj.changedBy = obj.changedBy?.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

itemVersionSchema.index({ itemId: 1, versionNumber: -1 });

export const ItemVersion: Model<IItemVersion> = mongoose.model<IItemVersion>('ItemVersion', itemVersionSchema);
