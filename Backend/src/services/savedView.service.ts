import { SavedView, ISavedView } from '../models/SavedView.js';
import { NotFoundError } from '../utils/errors.js';

export class SavedViewService {
  async getSavedViews(workspaceId: string, topicId?: string) {
    const filter: any = { workspaceId };
    if (topicId) {
      filter.$or = [{ topicId }, { topicId: null }];
    }
    return SavedView.find(filter).sort({ createdAt: -1 });
  }

  async createSavedView(
    workspaceId: string,
    userId: string,
    data: Partial<ISavedView>
  ) {
    return SavedView.create({
      ...data,
      workspaceId,
      userId
    });
  }

  async updateSavedView(
    workspaceId: string,
    viewId: string,
    updates: Partial<ISavedView>
  ) {
    const view = await SavedView.findOneAndUpdate(
      { _id: viewId, workspaceId },
      { $set: updates },
      { new: true }
    );
    if (!view) throw new NotFoundError('Saved view not found');
    return view;
  }

  async deleteSavedView(workspaceId: string, viewId: string) {
    const res = await SavedView.deleteOne({ _id: viewId, workspaceId });
    if (res.deletedCount === 0) throw new NotFoundError('Saved view not found');
    return { success: true };
  }
}

export const savedViewService = new SavedViewService();
