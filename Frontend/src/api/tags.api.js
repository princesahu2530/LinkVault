import { api } from './client';

export const tagsApi = {
  async getAll() {
    const res = await api.get('/tags');
    return res.data.data;
  },

  async create(name) {
    const res = await api.post('/tags', { name });
    return res.data.data;
  },

  async delete(id) {
    const res = await api.delete(`/tags/${id}`);
    return res.data.data;
  }
};

export const searchApi = {
  async search(query, type = 'all') {
    const res = await api.get('/search', {
      params: { q: query, type }
    });
    return res.data.data;
  }
};
