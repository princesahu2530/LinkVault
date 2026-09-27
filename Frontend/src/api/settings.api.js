import { api } from './client';

export const settingsApi = {
  async get() {
    const res = await api.get('/settings');
    return res.data.data;
  },

  async update(data) {
    const res = await api.patch('/settings', data);
    return res.data.data;
  }
};
