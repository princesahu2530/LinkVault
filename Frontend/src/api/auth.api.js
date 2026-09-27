import { api, setAccessToken } from './client';

export const authApi = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    const { user, accessToken, activeWorkspaceId, workspaces } = res.data.data;
    setAccessToken(accessToken);
    return { user, activeWorkspaceId, workspaces };
  },

  async login(data) {
    const res = await api.post('/auth/login', data);
    const { user, accessToken, activeWorkspaceId, activeWorkspace, workspaces, workspaceRole, workspacePermissions } = res.data.data;
    setAccessToken(accessToken);
    return { user, activeWorkspaceId, activeWorkspace, workspaces, workspaceRole, workspacePermissions };
  },

  async refresh() {
    const res = await api.post('/auth/refresh');
    const { user, accessToken } = res.data.data;
    setAccessToken(accessToken);
    return user;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  async logoutAll() {
    try {
      await api.post('/auth/logout-all');
    } finally {
      setAccessToken(null);
    }
  },

  async changePassword(data) {
    const res = await api.patch('/auth/password', data);
    setAccessToken(null);
    return res.data.data;
  },

  async forgotPassword(data) {
    const res = await api.post('/auth/forgot-password', data);
    return res.data.data;
  },

  async resetPassword(data) {
    const res = await api.post('/auth/reset-password', data);
    return res.data.data;
  },

  async updateProfile(data) {
    const res = await api.patch('/users/me', data);
    return res.data.data;
  },

  async deleteAccount() {
    const res = await api.delete('/users/me');
    setAccessToken(null);
    return res.data.data;
  }
};
