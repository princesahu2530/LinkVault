import React from 'react';
import { Copy, FolderSymlink, Star, Trash2, X, Tag } from 'lucide-react';
import { copyToClipboard } from '../../utils/helpers';
import { useToast } from '../ui/ToastContext';

export function BulkActionBar({
  selectedLinkIds,
  selectedLinks,
  onClearSelection,
  onBulkDelete,
  onBulkFavorite,
  onBulkMoveTrigger,
  onBulkAddTagTrigger
}) {
  const { addToast } = useToast();

  if (!selectedLinkIds || selectedLinkIds.length === 0) return null;

  const handleCopyUrls = async () => {
    const urls = selectedLinks.map(l => l.url).join('\n');
    const success = await copyToClipboard(urls);
    if (success) {
      addToast({
        title: 'URLs Copied',
        message: `${selectedLinks.length} URLs copied to clipboard.`,
        type: 'success'
      });
    }
  };

  const handleCopyAllDetails = async () => {
    const formatted = selectedLinks.map(l => {
      let item = `Title: ${l.title}\nURL: ${l.url}`;
      if (l.description) item += `\nDescription: ${l.description}`;
      if (l.tags?.length) item += `\nTags: #${l.tags.join(' #')}`;
      if (l.notes) item += `\nNotes: ${l.notes}`;
      return item;
    }).join('\n\n---\n\n');

    const success = await copyToClipboard(formatted);
    if (success) {
      addToast({
        title: 'Details Copied',
        message: `Complete details of ${selectedLinks.length} resources copied.`,
        type: 'success'
      });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[calc(100%-2rem)] animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 pl-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-xs font-bold">
            {selectedLinkIds.length}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-200">
            Selected
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          <button
            type="button"
            onClick={handleCopyUrls}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
            title="Copy URLs line by line"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Copy URLs</span>
          </button>

          <button
            type="button"
            onClick={handleCopyAllDetails}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
            title="Copy title, url and description"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Copy All</span>
          </button>

          <button
            type="button"
            onClick={onBulkFavorite}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors shrink-0"
            title="Toggle Favorites"
          >
            <Star className="w-3.5 h-3.5 fill-amber-300" />
            <span className="hidden sm:inline">Star</span>
          </button>

          <button
            type="button"
            onClick={onBulkDelete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-950/80 hover:bg-rose-900 text-rose-200 transition-colors shrink-0"
            title="Delete selected links"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClearSelection}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Deselect all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
