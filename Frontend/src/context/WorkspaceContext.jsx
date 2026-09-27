import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { workspacesApi } from '../api/workspaces.api';
import { setActiveWorkspaceId, getActiveWorkspaceId } from '../api/client';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export const DEFAULT_ROLE_PERMISSIONS = {
  owner: ['all'],
  admin: ['all_except_delete'],
  manager: ['workspace.view', 'members.view', 'topics.view', 'topics.create', 'topics.edit', 'items.view', 'items.create', 'items.edit', 'items.delete', 'items.archive', 'items.restore', 'items.move', 'items.duplicate', 'templates.view', 'templates.create', 'templates.edit', 'tags.manage', 'exports.create', 'settings.view'],
  member: ['workspace.view', 'members.view', 'topics.view', 'items.view', 'items.create', 'items.edit', 'items.archive', 'items.restore', 'items.duplicate', 'templates.view', 'tags.manage', 'exports.create', 'settings.view'],
  viewer: ['workspace.view', 'members.view', 'topics.view', 'items.view', 'templates.view', 'settings.view']
};

export function WorkspaceProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWsId] = useState(getActiveWorkspaceId());
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [starterPacks, setStarterPacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load Workspaces and Starter Packs
  const loadWorkspaces = useCallback(async () => {
    if (!isAuthenticated) {
      const defaultPersonal = {
        id: 'ws_personal_local',
        name: 'Personal Vault',
        description: 'Default personal workspace',
        icon: 'Folder',
        color: '#6366f1',
        isPersonal: true,
        category: 'personal',
        myRole: 'owner'
      };
      setWorkspaces([defaultPersonal]);
      setActiveWorkspace(defaultPersonal);
      setActiveWsId('ws_personal_local');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [wsList, packs] = await Promise.all([
        workspacesApi.getWorkspaces(),
        workspacesApi.getStarterPacks().catch(() => [])
      ]);

      setWorkspaces(wsList);
      setStarterPacks(packs);

      const savedWsId = getActiveWorkspaceId();
      let current = wsList.find(w => (w.id === savedWsId || w._id === savedWsId));
      if (!current || (current.isPersonal && wsList.some(w => !w.isPersonal))) {
        const sharedProject = wsList.find(w => w.name?.toLowerCase().includes('pg platform')) || wsList.find(w => !w.isPersonal);
        if (sharedProject) {
          current = sharedProject;
        } else if (!current && wsList.length > 0) {
          current = wsList[0];
        }
      }

      if (current) {
        const id = current.id || current._id;
        setActiveWsId(id);
        setActiveWorkspaceId(id);
        setActiveWorkspace(current);

        // Load members for active workspace
        try {
          const mems = await workspacesApi.getMembers(id);
          setMembers(mems);
        } catch {
          setMembers([]);
        }
      }
    } catch (err) {
      console.warn('Could not load workspaces from API:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const switchWorkspace = async (workspaceId) => {
    const target = workspaces.find(w => (w.id === workspaceId || w._id === workspaceId));
    if (target) {
      const id = target.id || target._id;
      setActiveWsId(id);
      setActiveWorkspaceId(id);
      setActiveWorkspace(target);

      if (isAuthenticated) {
        try {
          const mems = await workspacesApi.getMembers(id);
          setMembers(mems);
        } catch {
          setMembers([]);
        }
      }
    }
  };

  const createWorkspace = async (data) => {
    if (!isAuthenticated) {
      const localWs = {
        id: `ws_${Date.now()}`,
        name: data.name,
        description: data.description || '',
        icon: data.icon || 'Briefcase',
        color: data.color || '#6366f1',
        category: data.category || 'general',
        isPersonal: false,
        myRole: 'owner'
      };
      setWorkspaces(prev => [...prev, localWs]);
      switchWorkspace(localWs.id);
      return localWs;
    }

    const created = await workspacesApi.createWorkspace(data);
    await loadWorkspaces();
    if (created) {
      switchWorkspace(created.id || created._id);
    }
    return created;
  };

  const updateWorkspace = async (workspaceId, data) => {
    if (isAuthenticated) {
      const updated = await workspacesApi.updateWorkspace(workspaceId, data);
      await loadWorkspaces();
      return updated;
    } else {
      setWorkspaces(prev => prev.map(w => (w.id === workspaceId ? { ...w, ...data } : w)));
      if (activeWorkspaceId === workspaceId) {
        setActiveWorkspace(prev => ({ ...prev, ...data }));
      }
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    if (isAuthenticated) {
      await workspacesApi.deleteWorkspace(workspaceId);
    }
    const filtered = workspaces.filter(w => (w.id !== workspaceId && w._id !== workspaceId));
    setWorkspaces(filtered);
    const personal = filtered.find(w => w.isPersonal) || filtered[0];
    if (personal) {
      switchWorkspace(personal.id || personal._id);
    }
  };

  const hasPermission = (permission) => {
    if (!activeWorkspace) return true;
    const role = activeWorkspace.myRole || 'owner';
    if (role === 'owner') return true;
    if (role === 'admin' && permission !== 'workspace.delete') return true;

    const allowed = DEFAULT_ROLE_PERMISSIONS[role] || [];
    if (allowed.includes(permission)) return true;

    const custom = activeWorkspace.myCustomPermissions || [];
    return custom.includes(permission);
  };

  const myRole = activeWorkspace?.myRole || (activeWorkspace?.isPersonal ? 'owner' : (user ? 'member' : 'owner'));
  const [isWorkspaceSelectorOpen, setIsWorkspaceSelectorOpen] = useState(false);

  const openWorkspaceSelector = () => setIsWorkspaceSelectorOpen(true);
  const closeWorkspaceSelector = () => setIsWorkspaceSelectorOpen(false);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        activeWorkspaceId,
        members,
        starterPacks,
        isLoading,
        myRole,
        isWorkspaceSelectorOpen,
        openWorkspaceSelector,
        closeWorkspaceSelector,
        hasPermission,
        switchWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        refreshWorkspaces: loadWorkspaces
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
