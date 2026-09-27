import { api } from './client';

export const linksApi = {
  async getAll(params = {}) {
    const res = await api.get('/links', { params });
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/links/${id}`);
    return res.data.data;
  },

  async create(data) {
    const res = await api.post('/links', data);
    return res.data.data;
  },

  async update(id, data) {
    const res = await api.patch(`/links/${id}`, data);
    return res.data.data;
  },

  async delete(id, permanent = false) {
    const res = await api.delete(`/links/${id}`, { params: { permanent } });
    return res.data.data;
  },

  async restore(id) {
    const res = await api.post(`/links/${id}/restore`);
    return res.data.data;
  },

  async duplicate(id) {
    const res = await api.post(`/links/${id}/duplicate`);
    return res.data.data;
  },

  async move(id, targetTopicId) {
    const res = await api.patch(`/links/${id}/move`, { targetTopicId });
    return res.data.data;
  },

  async toggleFavorite(id) {
    const res = await api.patch(`/links/${id}/favorite`);
    return res.data.data;
  },

  async toggleArchive(id) {
    const res = await api.patch(`/links/${id}/archive`);
    return res.data.data;
  },

  async reorder(topicId, items) {
    const res = await api.patch('/links/reorder', { topicId, items });
    return res.data.data;
  },

  async checkDuplicate(url, currentLinkId = null) {
    const res = await api.get('/links/check-duplicate', {
      params: { url, currentLinkId }
    });
    return res.data.data;
  }
};
