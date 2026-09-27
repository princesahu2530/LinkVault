import { api } from './client';

export const templatesApi = {
  getSystemTemplates: async (category) => {
    const params = category ? { category } : {};
    const res = await api.get('/templates/system', { params });
    return res.data?.data || [];
  },

  getTemplates: async () => {
    const res = await api.get('/templates');
    return res.data?.data || [];
  },

  getTemplateById: async (id) => {
    const res = await api.get(`/templates/${id}`);
    return res.data?.data;
  },

  createTemplate: async (data) => {
    const res = await api.post('/templates', data);
    return res.data?.data;
  },

  updateTemplate: async (id, data) => {
    const res = await api.patch(`/templates/${id}`, data);
    return res.data?.data;
  },

  deleteTemplate: async (id) => {
    const res = await api.delete(`/templates/${id}`);
    return res.data?.data;
  },

  duplicateTemplate: async (id) => {
    const res = await api.post(`/templates/${id}/duplicate`);
    return res.data?.data;
  }
};
