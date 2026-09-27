import React from 'react';
import { Star, Link2, FolderTree, ExternalLink, Globe } from 'lucide-react';
import { LinkRow } from '../links/LinkRow';
import { LinkCard } from '../links/LinkCard';
import { IconRenderer } from '../ui/IconRenderer';

export function FavoritesView({
  topics,
  links,
  onNavigateToTopic,
  selectedLinkIds,
  onToggleSelectLink,
  onEditLink,
  onDeleteLink,
  onMoveLink,
  onDuplicateLink,
  onToggleFavoriteLink,
  onViewNotes,
  onTagClick,
  compactMode
}) {
  const favoriteTopics = topics.filter(t => t.isFavorite && !t.isDeleted);
  const favoriteLinks = links.filter(l => l.isFavorite && !l.isDeleted);

  const hasFavorites = favoriteTopics.length > 0 || favoriteLinks.length > 0;

  if (!hasFavorites) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10">
          <Star className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          No favorites saved yet
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Click the star icon ⭐ on any topic or link to pin it to your favorites for instant access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
          Starred Favorites
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quick access to your most important topics and resources.
        </p>
      </div>

      {/* Favorite Topics Carousel / Grid */}
      {favoriteTopics.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" /> Favorite Topics ({favoriteTopics.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteTopics.map((topic) => {
              const topicKey = String(topic.id || topic._id);
              const topicLinkCount = links.filter(l => {
                const linkTopicId = String(l.topicId?._id || l.topicId || '');
                return (linkTopicId === topicKey || linkTopicId === topic.id || linkTopicId === topic._id) && !l.isDeleted;
              }).length;
              return (
                <div
                  key={topicKey}
                  onClick={() => onNavigateToTopic(topicKey)}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer shadow-xs hover:shadow-md card-interactive"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${topic.color || '#6366f1'}18`,
                        color: topic.color || '#6366f1',
                        border: `1px solid ${topic.color || '#6366f1'}33`
                      }}
                    >
                      <IconRenderer name={topic.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {topic.name}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {topicLinkCount} {topicLinkCount === 1 ? 'Link' : 'Links'}
                      </span>
                    </div>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
                  </div>
                  {topic.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {topic.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Favorite Links List */}
      {favoriteLinks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" /> Favorite Links ({favoriteLinks.length})
          </h2>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                    <th className="pl-4 pr-2 py-2.5 w-12 text-center">#</th>
                    <th className="px-3 py-2.5">Title & Resource</th>
                    <th className="px-3 py-2.5">Destination URL</th>
                    {!compactMode && <th className="px-3 py-2.5">Description</th>}
                    <th className="px-3 py-2.5">Tags</th>
                    <th className="pr-4 pl-2 py-2.5 text-right w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {favoriteLinks.map((link, index) => (
                    <LinkRow
                      key={link.id}
                      link={link}
                      index={index}
                      isSelected={selectedLinkIds.includes(link.id)}
                      onSelectToggle={() => onToggleSelectLink(link.id)}
                      onEdit={() => onEditLink(link)}
                      onDelete={() => onDeleteLink(link)}
                      onMove={() => onMoveLink(link)}
                      onDuplicate={() => onDuplicateLink(link)}
                      onToggleFavorite={() => onToggleFavoriteLink(link)}
                      onViewNotes={() => onViewNotes(link)}
                      onTagClick={onTagClick}
                      compactMode={compactMode}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid */}
            <div className="md:hidden p-3 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/30">
              {favoriteLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  isSelected={selectedLinkIds.includes(link.id)}
                  onSelectToggle={() => onToggleSelectLink(link.id)}
                  onEdit={() => onEditLink(link)}
                  onDelete={() => onDeleteLink(link)}
                  onMove={() => onMoveLink(link)}
                  onDuplicate={() => onDuplicateLink(link)}
                  onToggleFavorite={() => onToggleFavoriteLink(link)}
                  onViewNotes={() => onViewNotes(link)}
                  onTagClick={onTagClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
