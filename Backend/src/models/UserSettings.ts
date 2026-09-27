import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUserSettings extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  activeWorkspaceId?: mongoose.Types.ObjectId | null;
  theme: 'light' | 'dark' | 'system';
  accentColor?: string;
  compactMode: boolean;
  defaultTopicState: 'remember' | 'all_expanded' | 'all_collapsed';
  showDescriptions: boolean;
  showUrls: boolean;
  appName: string;
  keyboardShortcutsEnabled: boolean;
  enableFavicons: boolean;
  dashboardWidgets?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    activeWorkspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'dark'
    },
    accentColor: {
      type: String,
      default: '#6366f1'
    },
    compactMode: {
      type: Boolean,
      default: false
    },
    defaultTopicState: {
      type: String,
      enum: ['remember', 'all_expanded', 'all_collapsed'],
      default: 'remember'
    },
    showDescriptions: {
      type: Boolean,
      default: true
    },
    showUrls: {
      type: Boolean,
      default: true
    },
    appName: {
      type: String,
      default: 'LinkVault'
    },
    keyboardShortcutsEnabled: {
      type: Boolean,
      default: true
    },
    enableFavicons: {
      type: Boolean,
      default: true
    },
    dashboardWidgets: {
      type: [String],
      default: [
        'stats',
        'recent_items',
        'tasks_summary',
        'upcoming_deadlines',
        'status_distribution',
        'topic_breakdown',
        'recent_activity'
      ]
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as any;
        obj.id = obj._id?.toString();
        obj.userId = obj.userId?.toString();
        if (obj.activeWorkspaceId) obj.activeWorkspaceId = obj.activeWorkspaceId.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

export const UserSettings: Model<IUserSettings> = mongoose.model<IUserSettings>('UserSettings', userSettingsSchema);
