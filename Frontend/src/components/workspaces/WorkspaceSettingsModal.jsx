import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { workspacesApi } from '../../api/workspaces.api';
import { 
  X, 
  Settings, 
  Users, 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  Mail, 
  Check, 
  Shield, 
  Activity, 
  AlertTriangle,
  History
} from 'lucide-react';

export default function WorkspaceSettingsModal({ isOpen, onClose }) {
  const { activeWorkspace, activeWorkspaceId, updateWorkspace, deleteWorkspace, myRole } = useWorkspace();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'members' | 'audit' | 'danger'
  
  // General Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  
  // Members Form
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [memberMessage, setMemberMessage] = useState({ type: '', text: '' });
  
  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name || '');
      setDescription(activeWorkspace.description || '');
      setColor(activeWorkspace.color || '#6366f1');
    }
  }, [activeWorkspace]);

  useEffect(() => {
    if (isOpen && activeWorkspaceId) {
      loadMembers();
      if (activeTab === 'audit') {
        loadAuditLogs();
      }
    }
  }, [isOpen, activeWorkspaceId, activeTab]);

  const loadMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const data = await workspacesApi.getMembers(activeWorkspaceId);
      setMembers(data);
    } catch (err) {
      console.warn('Failed to load members:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setIsLoadingAudit(true);
      const data = await workspacesApi.getAuditLogs(activeWorkspaceId);
      setAuditLogs(data || []);
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  if (!isOpen || !activeWorkspace) return null;

  const isOwner = myRole === 'owner';
  const isAdmin = isOwner || myRole === 'admin';

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    try {
      setIsSavingGeneral(true);
      await updateWorkspace(activeWorkspaceId, { name, description, color });
      setMemberMessage({ type: 'success', text: 'Workspace updated successfully.' });
    } catch (err) {
      setMemberMessage({ type: 'error', text: err.message || 'Failed to update workspace' });
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setIsInviting(true);
      setMemberMessage({ type: '', text: '' });
      await workspacesApi.inviteMember(activeWorkspaceId, {
        email: inviteEmail.trim(),
        role: inviteRole
      });
      setInviteEmail('');
      setMemberMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}` });
      await loadMembers();
    } catch (err) {
      setMemberMessage({ type: 'error', text: err?.response?.data?.message || err.message || 'Failed to invite member' });
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await workspacesApi.updateMemberRole(activeWorkspaceId, memberId, newRole);
      setMembers(prev => prev.map(m => (m.id === memberId || m._id === memberId) ? { ...m, role: newRole } : m));
    } catch (err) {
      setMemberMessage({ type: 'error', text: 'Failed to update member role' });
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the workspace?')) return;
    try {
      await workspacesApi.removeMember(activeWorkspaceId, memberId);
      setMembers(prev => prev.filter(m => (m.id !== memberId && m._id !== memberId)));
    } catch (err) {
      setMemberMessage({ type: 'error', text: 'Failed to remove member' });
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${activeWorkspace.name}"? This action cannot be undone.`)) return;
    try {
      await deleteWorkspace(activeWorkspaceId);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to delete workspace');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-inner"
              style={{ backgroundColor: activeWorkspace.color || '#6366f1' }}
            >
              {activeWorkspace.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{activeWorkspace.name}</span>
                <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {myRole}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Manage settings, team access, and view audit history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 gap-6 text-sm">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>General</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'members'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Members & Roles ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Log</span>
          </button>

          {isOwner && !activeWorkspace.isPersonal && (
            <button
              onClick={() => setActiveTab('danger')}
              className={`py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ml-auto ${
                activeTab === 'danger'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-rose-400/70 hover:text-rose-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone</span>
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {memberMessage.text && (
            <div className={`p-3 text-xs mb-4 rounded-lg border ${
              memberMessage.type === 'error'
                ? 'bg-rose-950/50 text-rose-300 border-rose-800/50'
                : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
            }`}>
              {memberMessage.text}
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isAdmin}
                  rows={3}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-60 resize-none"
                />
              </div>

              {isAdmin && (
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingGeneral}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow transition-colors"
                  >
                    {isSavingGeneral ? 'Saving...' : 'Save Workspace Changes'}
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Members & Roles Tab */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Invite Form */}
              {isAdmin && (
                <form onSubmit={handleInviteMember} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Invite Team Member</span>
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="viewer">Viewer (Read-only)</option>
                      <option value="member">Member (Create & Edit)</option>
                      <option value="manager">Manager (Manage Topics)</option>
                      {isOwner && <option value="admin">Admin (Full Access)</option>}
                    </select>
                    <button
                      type="submit"
                      disabled={isInviting || !inviteEmail.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      {isInviting ? 'Inviting...' : 'Send Invite'}
                    </button>
                  </div>
                </form>
              )}

              {/* Members List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active Workspace Members ({members.length})
                </h4>
                {isLoadingMembers ? (
                  <div className="text-xs text-slate-500 py-4 text-center">Loading team members...</div>
                ) : members.length === 0 ? (
                  <div className="text-xs text-slate-500 py-4 text-center">No additional members yet.</div>
                ) : (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    {members.map((member) => {
                      const memberId = member.id || member._id;
                      const memberUser = member.user || {};
                      const isSelf = false;
                      return (
                        <div key={memberId} className="flex items-center justify-between p-3 gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                              {(memberUser.name || memberUser.email || 'U').slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-white truncate">
                                {memberUser.name || 'Invited User'}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {memberUser.email || member.email}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isAdmin && member.role !== 'owner' ? (
                              <select
                                value={member.role}
                                onChange={(e) => handleUpdateRole(memberId, e.target.value)}
                                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                              >
                                <option value="viewer">Viewer</option>
                                <option value="member">Member</option>
                                <option value="manager">Manager</option>
                                {isOwner && <option value="admin">Admin</option>}
                              </select>
                            ) : (
                              <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {member.role}
                              </span>
                            )}

                            {isAdmin && member.role !== 'owner' && (
                              <button
                                onClick={() => handleRemoveMember(memberId)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                                title="Remove member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit Log Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Security & Workspace Audit Log</span>
              </h4>
              {isLoadingAudit ? (
                <div className="text-xs text-slate-500 py-4 text-center">Loading audit log...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-xl">
                  No security audit events recorded for this workspace.
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log, idx) => (
                    <div key={log._id || idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs flex items-start justify-between gap-3">
                      <div>
                        <span className="font-semibold text-white capitalize">{log.action?.replace('_', ' ')}</span>
                        <span className="text-slate-400 ml-2">by {log.actor?.name || log.actor?.email || 'User'}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Target: {log.targetType} {log.targetId ? `(${log.targetId})` : ''}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Danger Zone */}
          {activeTab === 'danger' && isOwner && !activeWorkspace.isPersonal && (
            <div className="p-5 border border-rose-900/60 bg-rose-950/20 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>Delete This Workspace</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deleting this workspace will remove all its topics, custom items, member associations, and saved views. This action cannot be reversed.
              </p>
              <button
                onClick={handleDeleteWorkspace}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-rose-950 transition-colors"
              >
                Permanently Delete "{activeWorkspace.name}"
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
