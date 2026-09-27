import React, { useState } from 'react';
import { TopicHeader } from './TopicHeader';
import { LinkCard } from '../links/LinkCard';
import { LinkTable } from '../links/LinkTable';
import { LinkCompactRow } from '../links/LinkCompactRow';
import { Plus, Sparkles } from 'lucide-react';

export function TopicSection({
  topic,
  links = [],
  isExpanded = false,
  onToggleExpand,
  onAddNewLink,
  onEditTopic,
  onDeleteTopic,
  onDuplicateTopic,
  onToggleFavoriteTopic,
  onTogglePinTopic,
  onExportTopic,
  onArchiveTopic,
  searchQuery = '',
  selectedLinkIds = [],
  onToggleSelectLink,
  onSelectAllLinksInTopic,
  onEditLink,
  onDeleteLink,
  onMoveLink,
  onDuplicateLink,
  onToggleFavoriteLink,
  onToggleArchiveLink,
  onViewNotes
}) {
  const [topicViewMode, setTopicViewMode] = useState(topic.defaultView || 'cards');

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-200">
      <TopicHeader
        topic={topic}
        linksCount={links.length}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onAddNewLink={onAddNewLink}
        onEditTopic={onEditTopic}
        onDeleteTopic={onDeleteTopic}
        onDuplicateTopic={onDuplicateTopic}
        onToggleFavorite={onToggleFavoriteTopic}
        onTogglePin={onTogglePinTopic}
        onExportTopic={onExportTopic}
        onArchiveTopic={onArchiveTopic}
        viewMode={topicViewMode}
        onChangeViewMode={setTopicViewMode}
        searchQuery={searchQuery}
        topicLinks={links}
      />

      {/* Collapsible Content Area */}
      {isExpanded && (
        <div className="animate-in fade-in duration-150 p-4 bg-slate-50/40 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800/80">
          {links.length === 0 ? (
            /* Empty State inside Topic */
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-3">No items in this topic yet.</p>
              <button
                type="button"
                onClick={() => onAddNewLink(topic.id || topic._id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>
          ) : topicViewMode === 'table' ? (
            /* Table View */
            <LinkTable
              links={links}
              columns={topic.visibleColumns || ['title', 'tags', 'createdAt']}
              selectedLinkIds={selectedLinkIds}
              onToggleSelect={onToggleSelectLink}
              onSelectAll={onSelectAllLinksInTopic}
              onEdit={onEditLink}
              onDelete={onDeleteLink}
              onToggleFavorite={onToggleFavoriteLink}
              onViewNotes={onViewNotes}
            />
          ) : topicViewMode === 'compact' ? (
            /* Compact List View */
            <div className="space-y-2">
              {links.map((item) => (
                <LinkCompactRow
                  key={item.id || item._id}
                  link={item}
                  onEdit={onEditLink}
                  onDelete={onDeleteLink}
                  onToggleFavorite={onToggleFavoriteLink}
                  onViewNotes={onViewNotes}
                  isSelected={selectedLinkIds.includes(item.id || item._id)}
                  onToggleSelect={onToggleSelectLink}
                />
              ))}
            </div>
          ) : (
            /* Cards View (Default) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {links.map((item) => (
                <LinkCard
                  key={item.id || item._id}
                  link={item}
                  onEdit={onEditLink}
                  onDelete={onDeleteLink}
                  onToggleFavorite={onToggleFavoriteLink}
                  onToggleArchive={onToggleArchiveLink}
                  onDuplicate={onDuplicateLink}
                  onMove={onMoveLink}
                  onViewNotes={onViewNotes}
                  isSelected={selectedLinkIds.includes(item.id || item._id)}
                  onToggleSelect={onToggleSelectLink}
                  isSelectionMode={selectedLinkIds.length > 0}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
