import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, 
  User, 
  Users, 
  Check, 
  Plus, 
  Folder, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Search,
  Building2,
  Lock,
  Layers
} from 'lucide-react';

export default function WorkspaceSelectorModal({ isOpen, onClose, onOpenCreateWorkspace }) {
  const { workspaces, activeWorkspaceId, switchWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWorkspaces = workspaces.filter(ws => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      ws.name?.toLowerCase().includes(q) ||
      ws.description?.toLowerCase().includes(q) ||
      ws.category?.toLowerCase().includes(q) ||
      ws.myRole?.toLowerCase().includes(q)
    );
  });

  const getRoleBadge = (role, title) => {
    const displayRole = title || role;
    switch (role?.toLowerCase()) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <ShieldCheck className="w-3 h-3" />
            {displayRole}
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <ShieldCheck className="w-3 h-3" />
            {displayRole}
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Building2 className="w-3 h-3" />
            {displayRole}
          </span>
        );
      case 'viewer':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
            <User className="w-3 h-3" />
            {displayRole}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Users className="w-3 h-3" />
            {displayRole}
          </span>
        );
    }
  };

  const handleSelect = async (wsId) => {
    await switchWorkspace(wsId);
    if (onClose) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Workspace"
      description="Choose an isolated product team project or personal workspace to work in."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Search Bar */}
        {workspaces.length > 3 && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by workspace name, category, or role..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>
        )}

        {/* Workspaces Grid / List */}
        <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
          {filteredWorkspaces.map((ws) => {
            const id = ws.id || ws._id;
            const isSelected = id === activeWorkspaceId;

            return (
              <div
                key={id}
                onClick={() => handleSelect(id)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-indigo-950/50 border-indigo-500/60 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700/80'
                }`}
              >
                {/* Left: Icon & Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-white shadow-md flex-shrink-0"
                    style={{ backgroundColor: ws.color || '#6366f1' }}
                  >
                    {ws.isPersonal ? (
                      <Lock className="w-5 h-5 text-white" />
                    ) : (
                      <Briefcase className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-white truncate">
                        {ws.name}
                      </h4>
                      {ws.isPersonal ? (
                        <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700">
                          Personal
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-800/50">
                          Team Project
                        </span>
                      )}
                    </div>

                    {ws.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {ws.description}
                      </p>
                    )}

                    {/* Meta stats & role */}
                    <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
                      {ws.isPersonal ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Personal Vault</span>
                      ) : (
                        getRoleBadge(ws.myRole || 'owner')
                      )}

                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Folder className="w-3.5 h-3.5 text-slate-500" />
                        {ws.topicCount !== undefined ? ws.topicCount : '—'} Topics
                      </span>

                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        {ws.itemCount !== undefined ? ws.itemCount : '—'} Items
                      </span>

                      {!ws.isPersonal && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          {ws.memberCount || 1} Members
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Enter Button / Indicator */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                  {isSelected ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-500 text-xs font-semibold transition-all group-hover:bg-indigo-600 group-hover:text-white"
                    >
                      <span>Enter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-xs text-slate-400">
            {user?.email && (
              <span>
                Signed in as <strong className="text-slate-200">{user.name || user.email}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenCreateWorkspace && (
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  onOpenCreateWorkspace();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Workspace</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
