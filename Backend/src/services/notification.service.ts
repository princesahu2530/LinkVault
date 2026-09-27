import { Notification } from '../models/Notification.js';

export class NotificationService {
  async getNotifications(userId: string, workspaceId?: string, limit = 40) {
    const filter: any = { recipientId: userId };
    if (workspaceId) {
      filter.workspaceId = workspaceId;
    }
    return Notification.find(filter).sort({ createdAt: -1 }).limit(limit);
  }

  async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string, workspaceId?: string) {
    const filter: any = { recipientId: userId, isRead: false };
    if (workspaceId) filter.workspaceId = workspaceId;
    await Notification.updateMany(filter, { isRead: true });
    return { success: true };
  }

  async deleteNotification(notificationId: string, userId: string) {
    await Notification.deleteOne({ _id: notificationId, recipientId: userId });
    return { success: true };
  }
}

export const notificationService = new NotificationService();
