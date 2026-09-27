import React, { useState, useEffect } from 'react';
import { activityApi } from '../../api/activity.api';
import { itemsApi } from '../../api/items.api';
import { X, History, RotateCcw, Clock, User, Check, Eye } from 'lucide-react';

export default function VersionHistoryModal({ isOpen, onClose, itemId, onItemRestored }) {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (isOpen && itemId) {
      loadVersions();
    }
  }, [isOpen, itemId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const data = await activityApi.getItemVersions(itemId);
      setVersions(data || []);
      if (data && data.length > 0) {
        setSelectedVersion(data[0]);
      }
    } catch (err) {
      console.warn('Failed to load versions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (version) => {
    if (!window.confirm(`Restore to version ${version.versionNumber}? Current changes will be archived in history.`)) return;

    try {
      setIsRestoring(true);
      // Restore item payload
      const payload = {
        title: version.title,
        content: version.content,
        customFields: version.customFields,
        notes: version.notes
      };
      const updated = await itemsApi.updateItem(itemId, payload);
      if (onItemRestored) onItemRestored(updated);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to restore version');
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Item Version History</h2>
              <p className="text-xs text-slate-400">Inspect historical snapshots and roll back changes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Version List */}
          <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2 custom-scrollbar bg-slate-950/30">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Snapshots ({versions.length})
            </h4>
            {isLoading ? (
              <div className="text-center py-6 text-xs text-slate-500">Loading history...</div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No previous versions saved yet.</div>
            ) : (
              versions.map((v) => {
                const isSelected = selectedVersion?.id === v.id || selectedVersion?._id === v._id;
                return (
                  <button
                    key={v.id || v._id}
                    onClick={() => setSelectedVersion(v)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Version {v.versionNumber || 1}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-1">
                      {v.changeSummary || 'Content update'}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Preview Panel */}
          <div className="md:col-span-2 p-6 overflow-y-auto max-h-[60vh] space-y-4 custom-scrollbar bg-slate-900/50">
            {selectedVersion ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedVersion.title || 'Untitled Item'}</h3>
                    <p className="text-xs text-slate-400">
                      Saved on {new Date(selectedVersion.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRestore(selectedVersion)}
                    disabled={isRestoring}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Version</span>
                  </button>
                </div>

                {/* Content */}
                {selectedVersion.content && (
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Main Content
                    </label>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap">
                      {selectedVersion.content}
                    </div>
                  </div>
                )}

                {/* Custom Fields */}
                {selectedVersion.customFields && selectedVersion.customFields.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Custom Fields Snapshot ({selectedVersion.customFields.length})
                    </label>
                    <div className="space-y-2">
                      {selectedVersion.customFields.map((cf, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-400">{cf.name || cf.id}</span>
                          <span className="text-slate-200 font-mono">{String(cf.value ?? '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-xs text-slate-500">
                Select a version from the left panel to inspect snapshot.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
