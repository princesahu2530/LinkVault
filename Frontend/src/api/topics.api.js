import { api } from './client';

export const topicsApi = {
  async getAll(params = {}) {
    const res = await api.get('/topics', { params });
    return res.data?.data || res.data || [];
  },

  async getTopics(params = {}) {
    return this.getAll(params);
  },

  async getById(id, includeLinks = false) {
    const res = await api.get(`/topics/${id}`, { params: { includeLinks } });
    return res.data?.data || res.data;
  },

  async create(data) {
    const res = await api.post('/topics', data);
    return res.data?.data || res.data;
  },

  async createTopic(data) {
    return this.create(data);
  },

  async update(id, data) {
    const res = await api.patch(`/topics/${id}`, data);
    return res.data?.data || res.data;
  },

  async updateTopic(id, data) {
    return this.update(id, data);
  },

  async delete(id, permanent = false) {
    const res = await api.delete(`/topics/${id}`, { params: { permanent } });
    return res.data?.data || res.data;
  },

  async deleteTopic(id, permanent = false) {
    return this.delete(id, permanent);
  },

  async restore(id) {
    const res = await api.post(`/topics/${id}/restore`);
    return res.data?.data || res.data;
  },

  async restoreTopic(id) {
    return this.restore(id);
  },

  async duplicate(id) {
    const res = await api.post(`/topics/${id}/duplicate`);
    return res.data?.data || res.data;
  },

  async duplicateTopic(id) {
    return this.duplicate(id);
  },

  async toggleFavorite(id) {
    const res = await api.patch(`/topics/${id}/favorite`);
    return res.data?.data || res.data;
  },

  async togglePin(id) {
    const res = await api.patch(`/topics/${id}/pin`);
    return res.data?.data || res.data;
  },

  async toggleArchive(id) {
    const res = await api.patch(`/topics/${id}/archive`);
    return res.data?.data || res.data;
  },

  async reorder(items) {
    const res = await api.patch('/topics/reorder', { items });
    return res.data?.data || res.data;
  }
};
