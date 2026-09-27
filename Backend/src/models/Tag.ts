import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITag extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  name: string;
  normalizedName: string;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>(
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
      maxlength: 50
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
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

tagSchema.index({ workspaceId: 1, normalizedName: 1 });
tagSchema.index({ userId: 1, normalizedName: 1 });

export const Tag: Model<ITag> = mongoose.model<ITag>('Tag', tagSchema);
