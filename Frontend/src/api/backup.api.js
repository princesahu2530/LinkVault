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

export const backupApi = {
  async getFavorites() {
    const res = await api.get('/favorites');
    return res.data.data;
  },

  async getRecent(limit = 20) {
    const res = await api.get('/recent', { params: { limit } });
    return res.data.data;
  },

  async getArchive() {
    const res = await api.get('/archive');
    return res.data.data;
  },

  async getTrash() {
    const res = await api.get('/trash');
    return res.data.data;
  },

  async emptyTrash() {
    const res = await api.delete('/trash/empty');
    return res.data.data;
  },

  async exportJson(topicId = null) {
    const res = await api.get('/export/json', {
      params: topicId ? { topicId } : {},
      responseType: 'text'
    });
    return res.data;
  },

  async exportCsv(topicId = null) {
    const res = await api.get('/export/csv', {
      params: topicId ? { topicId } : {},
      responseType: 'text'
    });
    return res.data;
  },

  async importData(content) {
    const res = await api.post('/import', { content });
    return res.data.data;
  },

  async getBackup() {
    const res = await api.get('/backup');
    return res.data.data;
  },

  async restoreBackup(backup) {
    const res = await api.post('/backup/restore', { backup });
    return res.data.data;
  }
};
