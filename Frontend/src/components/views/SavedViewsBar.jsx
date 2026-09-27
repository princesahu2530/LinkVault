import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { savedViewsApi } from '../../api/savedViews.api';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  SlidersHorizontal, 
  Grid, 
  Table, 
  Calendar, 
  LayoutList,
  Sparkles,
  Layers
} from 'lucide-react';

export default function SavedViewsBar({ currentView, onSelectSavedView, currentFilters, currentSort, currentGroupBy }) {
  const { activeWorkspaceId } = useWorkspace();
  const [savedViews, setSavedViews] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [viewName, setViewName] = useState('');
  const [activeSavedViewId, setActiveSavedViewId] = useState(null);

  useEffect(() => {
    if (activeWorkspaceId) {
      loadSavedViews();
    }
  }, [activeWorkspaceId]);

  const loadSavedViews = async () => {
    try {
      const list = await savedViewsApi.getSavedViews(activeWorkspaceId);
      setSavedViews(list || []);
    } catch {
      setSavedViews([]);
    }
  };

  const handleSaveCurrentView = async (e) => {
    e.preventDefault();
    if (!viewName.trim()) return;

    try {
      const created = await savedViewsApi.createSavedView({
        name: viewName.trim(),
        viewType: currentView || 'cards',
        filters: currentFilters || {},
        sort: currentSort || { field: 'createdAt', order: 'desc' },
        groupBy: currentGroupBy || null,
        workspaceId: activeWorkspaceId
      });
      setViewName('');
      setIsSaving(false);
      setSavedViews(prev => [...prev, created]);
      setActiveSavedViewId(created.id || created._id);
    } catch (err) {
      alert('Failed to save view');
    }
  };

  const handleDeleteSavedView = async (id, e) => {
    e.stopPropagation();
    try {
      await savedViewsApi.deleteSavedView(id);
      setSavedViews(prev => prev.filter(v => (v.id !== id && v._id !== id)));
      if (activeSavedViewId === id) setActiveSavedViewId(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!activeWorkspaceId) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs custom-scrollbar">
      <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase tracking-wider text-[10px] pl-1 pr-2 border-r border-slate-800 flex-shrink-0">
        <Bookmark className="w-3 h-3 text-indigo-400" />
        <span>Views:</span>
      </div>

      {savedViews.map((sv) => {
        const id = sv.id || sv._id;
        const isActive = activeSavedViewId === id;
        return (
          <div
            key={id}
            onClick={() => {
              setActiveSavedViewId(id);
              if (onSelectSavedView) onSelectSavedView(sv);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all cursor-pointer flex-shrink-0 ${
              isActive
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200 font-bold'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <span>{sv.name}</span>
            <button
              onClick={(e) => handleDeleteSavedView(id, e)}
              className="p-0.5 text-slate-500 hover:text-rose-400 rounded transition-colors ml-1"
              title="Delete view"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        );
      })}

      {/* Save view button / input */}
      {isSaving ? (
        <form onSubmit={handleSaveCurrentView} className="flex items-center gap-1 flex-shrink-0">
          <input
            type="text"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder="View Name..."
            autoFocus
            className="px-2.5 py-1 bg-slate-950 border border-indigo-500 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsSaving(false)}
            className="px-2 py-1 text-slate-400 hover:text-white text-xs"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsSaving(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-indigo-400 bg-slate-900/40 hover:bg-slate-800/60 border border-dashed border-slate-800 hover:border-indigo-500/40 rounded-lg transition-colors flex-shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>Save Current View</span>
        </button>
      )}
    </div>
  );
}
