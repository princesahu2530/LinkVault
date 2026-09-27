import { api } from './client';

export const notificationsApi = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data?.data || [];
  },

  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data?.data;
  },

  markAllAsRead: async () => {
    const res = await api.post('/notifications/mark-all-read');
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  }
};
