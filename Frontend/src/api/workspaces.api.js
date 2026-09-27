import { api } from './client';

export const workspacesApi = {
  getWorkspaces: async () => {
    const res = await api.get('/workspaces');
    return res.data?.data || [];
  },

  getStarterPacks: async () => {
    const res = await api.get('/workspaces/starter-packs');
    return res.data?.data || [];
  },

  getWorkspaceById: async (id) => {
    const res = await api.get(`/workspaces/${id}`);
    return res.data?.data;
  },

  createWorkspace: async (data) => {
    const res = await api.post('/workspaces', data);
    return res.data?.data;
  },

  updateWorkspace: async (id, data) => {
    const res = await api.patch(`/workspaces/${id}`, data);
    return res.data?.data;
  },

  deleteWorkspace: async (id) => {
    const res = await api.delete(`/workspaces/${id}`);
    return res.data;
  },

  // Members
  getMembers: async (workspaceId) => {
    const res = await api.get(`/workspaces/${workspaceId}/members`);
    return res.data?.data || [];
  },

  inviteMember: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/members`, data);
    return res.data?.data;
  },

  updateMemberRole: async (workspaceId, memberId, role, customPermissions) => {
    const res = await api.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role, customPermissions });
    return res.data?.data;
  },

  removeMember: async (workspaceId, memberId) => {
    const res = await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (workspaceId, limit = 50) => {
    const res = await api.get(`/workspaces/${workspaceId}/audit-logs?limit=${limit}`);
    return res.data?.data || [];
  }
};
