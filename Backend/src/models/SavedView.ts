import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IFilterClause {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | 'in';
  value: any;
}

export interface IFilterGroup {
  conjunction: 'AND' | 'OR';
  clauses: IFilterClause[];
}

export interface ISavedView extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId | null;
  userId: mongoose.Types.ObjectId;
  name: string;
  icon?: string;
  isShared: boolean;
  viewType: 'cards' | 'table' | 'compact' | 'detailed' | 'calendar';
  columns: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  groupBy?: string;
  filterGroups: IFilterGroup[];
  createdAt: Date;
  updatedAt: Date;
}

const filterClauseSchema = new Schema<IFilterClause>(
  {
    field: { type: String, required: true },
    operator: {
      type: String,
      required: true,
      enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty', 'in']
    },
    value: { type: Schema.Types.Mixed, default: null }
  },
  { _id: false }
);

const filterGroupSchema = new Schema<IFilterGroup>(
  {
    conjunction: { type: String, enum: ['AND', 'OR'], default: 'AND' },
    clauses: { type: [filterClauseSchema], default: [] }
  },
  { _id: false }
);

const savedViewSchema = new Schema<ISavedView>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      default: null,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    icon: {
      type: String,
      default: 'SlidersHorizontal'
    },
    isShared: {
      type: Boolean,
      default: true
    },
    viewType: {
      type: String,
      enum: ['cards', 'table', 'compact', 'detailed', 'calendar'],
      default: 'table'
    },
    columns: {
      type: [String],
      default: ['title', 'tags', 'createdAt']
    },
    sortBy: {
      type: String,
      default: 'position'
    },
    sortOrder: {
      type: String,
      enum: ['asc', 'desc'],
      default: 'asc'
    },
    groupBy: {
      type: String,
      default: ''
    },
    filterGroups: {
      type: [filterGroupSchema],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as any;
        obj.id = obj._id?.toString();
        obj.workspaceId = obj.workspaceId?.toString();
        if (obj.topicId) obj.topicId = obj.topicId.toString();
        obj.userId = obj.userId?.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

savedViewSchema.index({ workspaceId: 1, topicId: 1 });

export const SavedView: Model<ISavedView> = mongoose.model<ISavedView>('SavedView', savedViewSchema);
