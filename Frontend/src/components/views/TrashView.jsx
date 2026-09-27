import React, { useState } from 'react';
import { Trash2, Undo2, AlertTriangle, RefreshCw, FolderTree, Link2, ShieldAlert } from 'lucide-react';
import { useToast } from '../ui/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { topicsApi } from '../../api/topics.api';
import { itemsApi } from '../../api/items.api';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function TrashView({ topics, links, onDataChanged }) {
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  const deletedTopics = topics.filter(t => t.isDeleted);
  const deletedLinks = links.filter(l => l.isDeleted);

  const hasTrash = deletedTopics.length > 0 || deletedLinks.length > 0;

  const handleRestoreTopic = async (topicId) => {
    try {
      if (isAuthenticated) {
        await topicsApi.restoreTopic(topicId);
      } else {
        storage.restoreTopic(topicId);
      }
      addToast({ title: 'Topic Restored', message: 'Topic and its links restored.', type: 'success' });
      onDataChanged();
    } catch (err) {
      addToast({ title: 'Restore Failed', message: err.message, type: 'error' });
    }
  };

  const handleRestoreLink = async (linkId) => {
    try {
      if (isAuthenticated) {
        await itemsApi.restoreItem(linkId);
      } else {
        storage.restoreLink(linkId);
      }
      addToast({ title: 'Link Restored', message: 'Link restored to its topic.', type: 'success' });
      onDataChanged();
    } catch (err) {
      addToast({ title: 'Restore Failed', message: err.message, type: 'error' });
    }
  };

  const handlePermanentDeleteTopic = async (topicId) => {
    try {
      if (isAuthenticated) {
        await topicsApi.deleteTopic(topicId, true);
      } else {
        storage.deleteTopic(topicId, true);
      }
      addToast({ title: 'Permanently Deleted', message: 'Topic deleted forever.', type: 'info' });
      onDataChanged();
    } catch (err) {
      addToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    }
  };

  const handlePermanentDeleteLink = async (linkId) => {
    try {
      if (isAuthenticated) {
        await itemsApi.deleteItem(linkId, true);
      } else {
        storage.deleteLink(linkId, true);
      }
      addToast({ title: 'Permanently Deleted', message: 'Link deleted forever.', type: 'info' });
      onDataChanged();
    } catch (err) {
      addToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    }
  };

  const handleEmptyTrash = async () => {
    try {
      if (isAuthenticated) {
        // Delete all deleted links & topics permanently
        for (const l of deletedLinks) {
          await itemsApi.deleteItem(l.id || l._id, true).catch(() => {});
        }
        for (const t of deletedTopics) {
          await topicsApi.deleteTopic(t.id || t._id, true).catch(() => {});
        }
      } else {
        storage.emptyTrash();
      }
      addToast({ title: 'Trash Emptied', message: 'All deleted items permanently wiped.', type: 'info' });
      onDataChanged();
      setShowConfirmEmpty(false);
    } catch (err) {
      addToast({ title: 'Empty Trash Failed', message: err.message, type: 'error' });
    }
  };

  if (!hasTrash) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <Trash2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Trash Bin is empty
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Deleted topics and links remain in trash for recovery before being permanently erased.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Trash2 className="w-6 h-6 text-rose-500" />
            Trash & Recycle Bin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Items in the trash can be restored or permanently removed.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowConfirmEmpty(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          Empty Trash Completely
        </button>
      </div>

      {/* Deleted Topics */}
      {deletedTopics.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" /> Deleted Topics ({deletedTopics.length})
          </h2>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
            {deletedTopics.map(topic => {
              const topicKey = topic.id || topic._id;
              return (
                <div key={topicKey} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{topic.name}</h3>
                    {topic.description && <p className="text-xs text-slate-400 mt-0.5">{topic.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRestoreTopic(topicKey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                    >
                      <Undo2 className="w-3.5 h-3.5" /> Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePermanentDeleteTopic(topicKey)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deleted Links */}
      {deletedLinks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" /> Deleted Links ({deletedLinks.length})
          </h2>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
            {deletedLinks.map(link => {
              const linkKey = link.id || link._id;
              const effectiveUrl = link.url || link.fields?.find(f => f.type === 'url')?.value || '';
              return (
                <div key={linkKey} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{link.title || effectiveUrl || 'Untitled Item'}</h3>
                    {effectiveUrl && <span className="text-xs font-mono text-slate-400 block truncate">{effectiveUrl}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRestoreLink(linkKey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                    >
                      <Undo2 className="w-3.5 h-3.5" /> Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePermanentDeleteLink(linkKey)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirmEmpty}
        onClose={() => setShowConfirmEmpty(false)}
        onConfirm={handleEmptyTrash}
        title="Empty Trash Bin?"
        description="Are you sure you want to permanently delete all items in the Trash? This action cannot be undone."
        confirmLabel="Empty Trash"
        isDestructive={true}
      />
    </div>
  );
}

