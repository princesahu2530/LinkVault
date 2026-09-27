import { api } from './client';

export const itemsApi = {
  checkDuplicate: async (url, itemId) => {
    const res = await api.get('/items/check-duplicate', { params: { url, itemId } });
    return res.data?.data;
  },

  createItem: async (data) => {
    const res = await api.post('/items', data);
    return res.data?.data;
  },

  createItemInTopic: async (topicId, data) => {
    const res = await api.post(`/topics/${topicId}/items`, data);
    return res.data?.data;
  },

  getItems: async (params = {}) => {
    const res = await api.get('/items', { params });
    return res.data;
  },

  getItemById: async (id) => {
    const res = await api.get(`/items/${id}`);
    return res.data?.data;
  },

  updateItem: async (id, data) => {
    const res = await api.patch(`/items/${id}`, data);
    return res.data?.data;
  },

  updateField: async (itemId, fieldId, data) => {
    const res = await api.patch(`/items/${itemId}/fields/${fieldId}`, data);
    return res.data?.data;
  },

  deleteItem: async (id, permanent = false) => {
    const res = await api.delete(`/items/${id}`, { params: { permanent } });
    return res.data?.data;
  },

  restoreItem: async (id) => {
    const res = await api.post(`/items/${id}/restore`);
    return res.data?.data;
  },

  duplicateItem: async (id) => {
    const res = await api.post(`/items/${id}/duplicate`);
    return res.data?.data;
  },

  moveItem: async (id, targetTopicId) => {
    const res = await api.patch(`/items/${id}/move`, { targetTopicId });
    return res.data?.data;
  },

  toggleFavorite: async (id, isFavorite) => {
    const res = await api.patch(`/items/${id}/favorite`, { isFavorite });
    return res.data?.data;
  },

  toggleArchive: async (id, isArchived) => {
    const res = await api.patch(`/items/${id}/archive`, { isArchived });
    return res.data?.data;
  },

  reorderItems: async (topicId, items) => {
    const res = await api.patch('/items/reorder', { topicId, items });
    return res.data?.data;
  },

  bulkOperation: async (itemIds, action, extra = {}) => {
    const res = await api.post('/items/bulk', { itemIds, action, ...extra });
    return res.data?.data;
  }
};
