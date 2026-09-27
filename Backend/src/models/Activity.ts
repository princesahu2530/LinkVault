import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  action: string; // 'created' | 'updated' | 'status_changed' | 'assigned' | 'priority_changed' | 'archived' | 'restored' | 'deleted' | 'commented'
  resourceType: 'item' | 'topic' | 'workspace' | 'member' | 'template';
  resourceId: string;
  resourceTitle?: string;
  oldValue?: any;
  newValue?: any;
  description?: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
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
    actorName: {
      type: String,
      required: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    resourceType: {
      type: String,
      required: true,
      enum: ['item', 'topic', 'workspace', 'member', 'template']
    },
    resourceId: {
      type: String,
      required: true,
      index: true
    },
    resourceTitle: {
      type: String,
      default: ''
    },
    oldValue: {
      type: Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null
    },
    description: {
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

activitySchema.index({ workspaceId: 1, createdAt: -1 });
activitySchema.index({ resourceId: 1, createdAt: -1 });

export const Activity: Model<IActivity> = mongoose.model<IActivity>('Activity', activitySchema);
