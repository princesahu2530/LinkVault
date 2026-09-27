import React from 'react';
import { 
  ChevronRight, Plus, Star, MoreVertical, Edit, Copy, 
  FileDown, Pin, Trash2, Archive, CopyCheck, LayoutGrid, Table2, List
} from 'lucide-react';
import { IconRenderer } from '../ui/IconRenderer';
import { Dropdown } from '../ui/Dropdown';
import { copyToClipboard, highlightMatch } from '../../utils/helpers';
import { useToast } from '../ui/ToastContext';

export function TopicHeader({
  topic,
  linksCount = 0,
  isExpanded = false,
  onToggleExpand,
  onAddNewLink,
  onEditTopic,
  onDeleteTopic,
  onDuplicateTopic,
  onToggleFavorite,
  onTogglePin,
  onExportTopic,
  onArchiveTopic,
  viewMode = 'cards',
  onChangeViewMode,
  searchQuery = '',
  topicLinks = []
}) {
  const { addToast } = useToast();

  const handleCopyAll = async () => {
    if (!topicLinks.length) {
      addToast({ title: 'No items', message: 'This topic has no items to copy.', type: 'info' });
      return;
    }
    let formatted = `${topic.name}\n${topic.description || ''}\n\n`;
    topicLinks.forEach((l, idx) => {
      formatted += `${idx + 1}. ${l.title || 'Untitled'}\n`;
      if (l.content || l.notes) formatted += `   Notes: ${l.content || l.notes}\n`;
      l.fields?.forEach(f => {
        formatted += `   ${f.name}: ${typeof f.value === 'object' ? JSON.stringify(f.value) : f.value}\n`;
      });
      formatted += `\n`;
    });

    const success = await copyToClipboard(formatted);
    if (success) {
      addToast({
        title: 'Topic Details Copied',
        message: `Formatted details of ${topicLinks.length} items copied.`,
        type: 'success'
      });
    }
  };

  const menuItems = [
    {
      label: 'Add Item to Topic',
      icon: Plus,
      onClick: () => onAddNewLink(topic.id || topic._id)
    },
    { type: 'divider' },
    {
      label: 'Copy All Item Details',
      icon: CopyCheck,
      onClick: handleCopyAll
    },
    { type: 'divider' },
    {
      label: topic.isPinned ? 'Unpin Topic' : 'Pin Topic to Top',
      icon: Pin,
      onClick: () => onTogglePin?.(topic)
    },
    {
      label: topic.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
      icon: Star,
      onClick: () => onToggleFavorite?.(topic)
    },
    {
      label: 'Edit Topic Settings & Template',
      icon: Edit,
      onClick: () => onEditTopic?.(topic)
    },
    {
      label: 'Duplicate Topic',
      icon: Copy,
      onClick: () => onDuplicateTopic?.(topic)
    },
    {
      label: 'Export Topic Data...',
      icon: FileDown,
      onClick: () => onExportTopic?.(topic)
    },
    { type: 'divider' },
    {
      label: 'Archive Topic',
      icon: Archive,
      onClick: () => onArchiveTopic?.(topic)
    },
    {
      label: 'Delete Topic',
      icon: Trash2,
      danger: true,
      onClick: () => onDeleteTopic?.(topic)
    }
  ];

  return (
    <div 
      className={`px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
        isExpanded 
          ? 'bg-slate-50/80 dark:bg-slate-850/60 border-b border-slate-200/80 dark:border-slate-800' 
          : 'bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
      }`}
      onClick={onToggleExpand}
    >
      {/* Left: Expand chevron + Icon + Name + Description */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          aria-label={isExpanded ? 'Collapse topic' : 'Expand topic'}
          className={`p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-transform duration-200 ${
            isExpanded ? 'rotate-90 text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div 
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
          style={{ 
            backgroundColor: `${topic.color || '#6366f1'}18`,
            color: topic.color || '#6366f1',
            border: `1px solid ${topic.color || '#6366f1'}33`
          }}
        >
          <IconRenderer name={topic.icon} className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 
              className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate"
              dangerouslySetInnerHTML={{ __html: highlightMatch(topic.name, searchQuery) }}
            />
            {topic.isPinned && (
              <span className="text-xs shrink-0" title="Pinned to top">📌</span>
            )}
            {topic.isFavorite && (
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
            )}
          </div>

          {topic.description && (
            <p 
              className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5"
              dangerouslySetInnerHTML={{ __html: highlightMatch(topic.description, searchQuery) }}
            />
          )}
        </div>
      </div>

      {/* Right: View Mode Toggle + Count badge + Quick Add + Favorite + Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* View Mode Switcher inside topic header */}
        {isExpanded && onChangeViewMode && (
          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onChangeViewMode('cards')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('table')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <Table2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('compact')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'compact'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Compact View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
          {linksCount} {linksCount === 1 ? 'item' : 'items'}
        </span>

        {/* Quick Add Item button */}
        <button
          type="button"
          onClick={() => onAddNewLink(topic.id || topic._id)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors hidden sm:inline-flex items-center gap-1 text-xs font-medium"
          title="Add Item to this topic"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(topic);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            topic.isFavorite
              ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={topic.isFavorite ? 'Remove favorite' : 'Mark favorite'}
        >
          <Star className={`w-4 h-4 ${topic.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          }
          items={menuItems}
        />
      </div>
    </div>
  );
}
