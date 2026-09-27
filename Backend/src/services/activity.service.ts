import { Activity } from '../models/Activity.js';
import { ItemVersion } from '../models/ItemVersion.js';
import { Item } from '../models/Item.js';
import { NotFoundError } from '../utils/errors.js';

export class ActivityService {
  async getWorkspaceActivity(workspaceId: string, limit = 50) {
    return Activity.find({ workspaceId }).sort({ createdAt: -1 }).limit(limit);
  }

  async getItemActivity(workspaceId: string, itemId: string, limit = 30) {
    return Activity.find({ workspaceId, resourceId: itemId }).sort({ createdAt: -1 }).limit(limit);
  }
}

export class VersionService {
  async getItemVersions(workspaceId: string, itemId: string) {
    return ItemVersion.find({ workspaceId, itemId }).sort({ versionNumber: -1 });
  }

  async restoreVersion(workspaceId: string, itemId: string, versionId: string, userId: string, userName: string) {
    const version = await ItemVersion.findOne({ _id: versionId, workspaceId, itemId });
    if (!version) throw new NotFoundError('Version snapshot not found');

    const item = await Item.findOne({ _id: itemId, workspaceId });
    if (!item) throw new NotFoundError('Item not found');

    // Save current version before restoring
    await ItemVersion.create({
      itemId: item._id,
      workspaceId: item.workspaceId,
      versionNumber: (item.versionNumber || 1) + 1,
      title: item.title,
      content: item.content,
      fields: item.fields,
      tags: item.tags,
      changedBy: userId,
      changedByName: userName,
      changeSummary: `Before restoring snapshot v${version.versionNumber}`
    });

    item.title = version.title;
    item.content = version.content;
    item.fields = version.fields;
    item.tags = version.tags;
    item.versionNumber = (item.versionNumber || 1) + 2;
    await item.save();

    await Activity.create({
      workspaceId,
      actorId: userId,
      actorName: userName,
      action: 'restored_version',
      resourceType: 'item',
      resourceId: item._id.toString(),
      resourceTitle: item.title || 'Untitled',
      description: `Restored to version ${version.versionNumber}`
    });

    return item;
  }
}

export const activityService = new ActivityService();
export const versionService = new VersionService();
