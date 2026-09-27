import { api } from './client';

export const activityApi = {
  getWorkspaceActivity: async (limit = 50) => {
    const res = await api.get(`/activity/workspace?limit=${limit}`);
    return res.data?.data || [];
  },

  getItemActivity: async (itemId, limit = 30) => {
    const res = await api.get(`/activity/items/${itemId}?limit=${limit}`);
    return res.data?.data || [];
  },

  getItemVersions: async (itemId) => {
    const res = await api.get(`/activity/items/${itemId}/versions`);
    return res.data?.data || [];
  },

  restoreItemVersion: async (itemId, versionId) => {
    const res = await api.post(`/activity/items/${itemId}/versions/${versionId}/restore`);
    return res.data?.data;
  }
};
