import React from 'react';
import { TopicSection } from '../topics/TopicSection';
import { StatsHeader } from '../layout/StatsHeader';
import { Plus, Search, FolderPlus, Sparkles, Filter, X } from 'lucide-react';

export function DashboardView({
  topics,
  links,
  stats,
  expandedTopicIds,
  onToggleTopicExpand,
  onAddNewTopic,
  onAddNewLink,
  onEditTopic,
  onDeleteTopic,
  onDuplicateTopic,
  onToggleFavoriteTopic,
  onTogglePinTopic,
  onExportTopic,
  onArchiveTopic,
  searchQuery,
  activeTagFilter,
  onClearTagFilter,
  selectedLinkIds,
  onToggleSelectLink,
  onSelectAllLinksInTopic,
  onEditLink,
  onDeleteLink,
  onMoveLink,
  onDuplicateLink,
  onToggleFavoriteLink,
  onViewNotes,
  onTagClick,
  compactMode,
  onStatsCardClick
}) {
  // Empty state when there are 0 active topics in database
  if (topics.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10">
          <FolderPlus className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Build your personal knowledge base
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
          Save useful links and organize them into topics so you can find and copy everything quickly in one place.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onAddNewTopic}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Create First Topic
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <StatsHeader 
        stats={stats} 
        onCardClick={onStatsCardClick}
      />

      {/* Active Filter Pill Bar */}
      {(activeTagFilter || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-500" /> Active Filters:
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium">
              Search: "{searchQuery}"
            </span>
          )}

          {activeTagFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold">
              Tag: #{activeTagFilter}
              <button type="button" onClick={onClearTagFilter} className="hover:text-indigo-800">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Topic List */}
      <div className="space-y-3.5">
        {topics.map((topic) => {
          const topicKey = String(topic.id || topic._id);
          const topicLinks = links.filter(l => {
            const linkTopicId = String(l.topicId?._id || l.topicId || '');
            return linkTopicId === topicKey || linkTopicId === topic.id || linkTopicId === topic._id;
          });
          const isExpanded = expandedTopicIds.includes(topicKey) || 
                             expandedTopicIds.includes(topic.id) || 
                             expandedTopicIds.includes(topic._id);

          return (
            <TopicSection
              key={topicKey}
              topic={topic}
              links={topicLinks}
              isExpanded={isExpanded}
              onToggleExpand={() => onToggleTopicExpand(topicKey)}
              onAddNewLink={onAddNewLink}
              onEditTopic={() => onEditTopic(topic)}
              onDeleteTopic={() => onDeleteTopic(topic)}
              onDuplicateTopic={() => onDuplicateTopic(topic)}
              onToggleFavoriteTopic={() => onToggleFavoriteTopic(topic)}
              onTogglePinTopic={() => onTogglePinTopic(topic)}
              onExportTopic={() => onExportTopic(topic)}
              onArchiveTopic={() => onArchiveTopic(topic)}
              searchQuery={searchQuery}
              selectedLinkIds={selectedLinkIds}
              onToggleSelectLink={onToggleSelectLink}
              onSelectAllLinksInTopic={onSelectAllLinksInTopic}
              onEditLink={onEditLink}
              onDeleteLink={onDeleteLink}
              onMoveLink={onMoveLink}
              onDuplicateLink={onDuplicateLink}
              onToggleFavoriteLink={onToggleFavoriteLink}
              onViewNotes={onViewNotes}
              onTagClick={onTagClick}
              compactMode={compactMode}
            />
          );
        })}
      </div>
    </div>
  );
}
