import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILink extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  title: string;
  url: string;
  description?: string;
  notes?: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  openInNewTab: boolean;
  position: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const linkSchema = new Schema<ILink>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000
    },
    notes: {
      type: String,
      default: '',
      maxlength: 20000
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
    openInNewTab: {
      type: Boolean,
      default: true
    },
    position: {
      type: Number,
      default: 0,
      index: true
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
        obj.topicId = obj.topicId?.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

linkSchema.index({ userId: 1, topicId: 1, position: 1 });
linkSchema.index({ userId: 1, isArchived: 1, deletedAt: 1 });
linkSchema.index({ userId: 1, tags: 1 });
linkSchema.index({ userId: 1, url: 1 });
linkSchema.index({ userId: 1, createdAt: -1 });
linkSchema.index({ userId: 1, updatedAt: -1 });

export const Link: Model<ILink> = mongoose.model<ILink>('Link', linkSchema);
