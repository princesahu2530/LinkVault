import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorAvatar?: string;
  content: string;
  mentions: string[]; // User IDs mentioned
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    authorName: {
      type: String,
      required: true,
      trim: true
    },
    authorAvatar: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    mentions: {
      type: [String],
      default: []
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as any;
        obj.id = obj._id?.toString();
        obj.workspaceId = obj.workspaceId?.toString();
        obj.itemId = obj.itemId?.toString();
        obj.authorId = obj.authorId?.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

commentSchema.index({ itemId: 1, createdAt: 1 });

export const Comment: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);
