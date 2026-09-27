import { api } from './client';

export const savedViewsApi = {
  getSavedViews: async (topicId) => {
    const url = topicId ? `/saved-views?topicId=${topicId}` : '/saved-views';
    const res = await api.get(url);
    return res.data?.data || [];
  },

  createSavedView: async (data) => {
    const res = await api.post('/saved-views', data);
    return res.data?.data;
  },

  updateSavedView: async (id, data) => {
    const res = await api.patch(`/saved-views/${id}`, data);
    return res.data?.data;
  },

  deleteSavedView: async (id) => {
    const res = await api.delete(`/saved-views/${id}`);
    return res.data;
  }
};
