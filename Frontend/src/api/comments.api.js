import { api } from './client';

export const commentsApi = {
  getComments: async (itemId) => {
    const res = await api.get(`/comments/items/${itemId}/comments`);
    return res.data?.data || [];
  },

  addComment: async (itemId, content) => {
    const res = await api.post(`/comments/items/${itemId}/comments`, { content });
    return res.data?.data;
  },

  deleteComment: async (commentId) => {
    const res = await api.delete(`/comments/comments/${commentId}`);
    return res.data;
  }
};
