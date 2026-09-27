import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  Briefcase, 
  ChevronDown, 
  Plus, 
  Settings, 
  Check, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Folder,
  Layers
} from 'lucide-react';

export default function WorkspaceSwitcher({ onOpenCreate, onOpenSettings }) {
  const { workspaces, activeWorkspace, activeWorkspaceId, switchWorkspace, openWorkspaceSelector } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Owner</span>;
      case 'admin':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Admin</span>;
      case 'manager':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Manager</span>;
      case 'viewer':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">Viewer</span>;
      default:
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Member</span>;
    }
  };

  return (
    <div className="relative w-full px-3 py-2" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-600 transition-all text-left group shadow-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-inner flex-shrink-0"
            style={{ backgroundColor: activeWorkspace?.color || '#6366f1' }}
          >
            {activeWorkspace?.icon ? (
              <span className="text-sm">{activeWorkspace.icon.slice(0, 2).toUpperCase()}</span>
            ) : (
              <Briefcase className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-slate-100 truncate block">
                {activeWorkspace?.name || 'Workspace'}
              </span>
              {activeWorkspace?.isPersonal && (
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1 py-0.5 rounded border border-slate-700">Personal</span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {activeWorkspace?.isPersonal ? (
                <span className="text-[10px] text-slate-400 font-medium">Personal Vault</span>
              ) : (
                getRoleBadge(activeWorkspace?.myRole || 'owner')
              )}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 group-hover:text-slate-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-3 right-3 top-full mt-1.5 z-50 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Workspaces ({workspaces.length})</span>
            <Sparkles className="w-3 h-3 text-indigo-400" />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
            {workspaces.map((ws) => {
              const id = ws.id || ws._id;
              const isSelected = id === activeWorkspaceId;
              return (
                <button
                  key={id}
                  onClick={() => {
                    switchWorkspace(id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                    isSelected 
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-200' 
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: ws.color || '#6366f1' }}
                    >
                      {ws.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate flex items-center gap-1.5">
                        {ws.name}
                        {ws.isPersonal && <span className="text-[9px] text-slate-400">👤</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {ws.myRole || 'owner'} • {ws.category || 'General'}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-1.5 mt-1 border-t border-slate-800 flex flex-col gap-1">
            <button
              onClick={() => {
                setIsOpen(false);
                if (openWorkspaceSelector) openWorkspaceSelector();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded-lg transition-colors font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Browse All Workspaces...</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenCreate) onOpenCreate();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Workspace...</span>
            </button>

            {activeWorkspace && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenSettings) onOpenSettings();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Workspace Settings & Members</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
