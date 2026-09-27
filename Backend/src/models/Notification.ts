import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId | null;
  senderName?: string;
  type: 'mention' | 'assigned' | 'comment' | 'due_date' | 'invite' | 'role_change' | 'item_shared';
  title: string;
  message: string;
  resourceType?: 'item' | 'topic' | 'workspace' | 'comment';
  resourceId?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    senderName: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      required: true,
      enum: ['mention', 'assigned', 'comment', 'due_date', 'invite', 'role_change', 'item_shared']
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    resourceType: {
      type: String,
      enum: ['item', 'topic', 'workspace', 'comment'],
      default: 'item'
    },
    resourceId: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as any;
        obj.id = obj._id?.toString();
        obj.workspaceId = obj.workspaceId?.toString();
        obj.recipientId = obj.recipientId?.toString();
        if (obj.senderId) obj.senderId = obj.senderId.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);
