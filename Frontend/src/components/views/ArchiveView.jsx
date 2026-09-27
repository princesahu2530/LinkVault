import React from 'react';
import { Archive, Undo2, Trash2, FolderTree, Link2, ExternalLink } from 'lucide-react';
import { useToast } from '../ui/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { topicsApi } from '../../api/topics.api';
import { itemsApi } from '../../api/items.api';

export function ArchiveView({ topics, links, onDataChanged }) {
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  const archivedTopics = topics.filter(t => t.isArchived && !t.isDeleted);
  const archivedLinks = links.filter(l => l.isArchived && !l.isDeleted);

  const hasArchived = archivedTopics.length > 0 || archivedLinks.length > 0;

  const handleUnarchiveTopic = async (topicId) => {
    try {
      if (isAuthenticated) {
        await topicsApi.updateTopic(topicId, { isArchived: false });
      } else {
        storage.updateTopic(topicId, { isArchived: false });
      }
      addToast({ title: 'Topic Restored', message: 'Topic moved back to active collections.', type: 'success' });
      onDataChanged();
    } catch (err) {
      addToast({ title: 'Restore Failed', message: err.message, type: 'error' });
    }
  };

  const handleUnarchiveLink = async (linkId) => {
    try {
      if (isAuthenticated) {
        await itemsApi.updateItem(linkId, { isArchived: false });
      } else {
        storage.updateLink(linkId, { isArchived: false });
      }
      addToast({ title: 'Link Restored', message: 'Link unarchived.', type: 'success' });
      onDataChanged();
    } catch (err) {
      addToast({ title: 'Restore Failed', message: err.message, type: 'error' });
    }
  };

  const handleDeleteTopicPermanent = async (topicId) => {
    try {
      if (isAuthenticated) {
        await topicsApi.deleteTopic(topicId, false);
      } else {
        storage.deleteTopic(topicId, false);
      }
      addToast({ title: 'Moved to Trash', message: 'Topic moved to trash.', type: 'info' });
      onDataChanged();
    } catch (err) {
      addToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    }
  };

  const handleDeleteLinkPermanent = async (linkId) => {
    try {
      if (isAuthenticated) {
        await itemsApi.deleteItem(linkId, false);
      } else {
        storage.deleteLink(linkId, false);
      }
      addToast({ title: 'Moved to Trash', message: 'Link moved to trash.', type: 'info' });
      onDataChanged();
    } catch (err) {
      addToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    }
  };

  if (!hasArchived) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <Archive className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Archive is empty
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Topics and links you archive will be stored safely here out of sight.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <Archive className="w-6 h-6 text-slate-500" />
          Archived Items
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Safely stored items that are hidden from regular dashboard search and views.
        </p>
      </div>

      {/* Archived Topics */}
      {archivedTopics.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" /> Archived Topics ({archivedTopics.length})
          </h2>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
            {archivedTopics.map(topic => {
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
                      onClick={() => handleUnarchiveTopic(topicKey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                    >
                      <Undo2 className="w-3.5 h-3.5" /> Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTopicPermanent(topicKey)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Move to Trash"
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

      {/* Archived Links */}
      {archivedLinks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" /> Archived Links ({archivedLinks.length})
          </h2>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
            {archivedLinks.map(link => {
              const linkKey = link.id || link._id;
              const effectiveUrl = link.url || link.fields?.find(f => f.type === 'url')?.value || '';
              return (
                <div key={linkKey} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{link.title || effectiveUrl || 'Untitled Item'}</h3>
                    {effectiveUrl && (
                      <a href={effectiveUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-indigo-500 hover:underline block truncate">
                        {effectiveUrl}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUnarchiveLink(linkKey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                    >
                      <Undo2 className="w-3.5 h-3.5" /> Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLinkPermanent(linkKey)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Move to Trash"
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
    </div>
  );
}

