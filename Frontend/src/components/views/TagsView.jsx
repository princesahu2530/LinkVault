import React, { useState } from 'react';
import { Hash, Tag, Globe, ExternalLink, Copy, Star } from 'lucide-react';
import { getFaviconUrl, copyToClipboard } from '../../utils/helpers';
import { useToast } from '../ui/ToastContext';

export function TagsView({ links, topics, onNavigateToTopic }) {
  const [selectedTag, setSelectedTag] = useState(null);
  const { addToast } = useToast();

  const activeLinks = links.filter(l => !l.isDeleted);

  // Compute tag counts
  const tagMap = new Map();
  activeLinks.forEach(link => {
    if (link.tags && Array.isArray(link.tags)) {
      link.tags.forEach(tag => {
        const clean = tag.trim();
        if (clean) {
          tagMap.set(clean, (tagMap.get(clean) || 0) + 1);
        }
      });
    }
  });

  const sortedTags = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);

  const displayedLinks = selectedTag 
    ? activeLinks.filter(l => l.tags && l.tags.includes(selectedTag))
    : activeLinks;

  if (sortedTags.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-500/10">
          <Hash className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          No tags found
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Add tags like #AI, #Frontend, #Design to your links when editing to browse by keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <Hash className="w-6 h-6 text-indigo-500" />
          Tags & Topics Cloud
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore resources connected across different topics using common keywords.
        </p>
      </div>

      {/* Tag Cloud Pills */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTag === null
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Tags ({activeLinks.length} links)
          </button>

          {sortedTags.map(([tag, count]) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                    : 'bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 hover:border-indigo-400'
                }`}
              >
                <span>#{tag}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-indigo-700 text-white' : 'bg-white/80 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          {selectedTag ? `Links tagged with #${selectedTag} (${displayedLinks.length})` : `All Tagged Links (${displayedLinks.length})`}
        </h2>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
          {displayedLinks.map(link => {
            const topic = topics.find(t => t.id === link.topicId);
            const faviconUrl = getFaviconUrl(link.url);

            return (
              <div
                key={link.id}
                className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {faviconUrl ? (
                    <img
                      src={faviconUrl}
                      alt=""
                      className="w-4 h-4 rounded-xs shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                      >
                        {link.title}
                      </a>
                      {link.isFavorite && (
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {topic && (
                        <span 
                          onClick={() => onNavigateToTopic(topic.id)}
                          className="hover:underline text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer"
                        >
                          {topic.name}
                        </span>
                      )}
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-400 truncate">{link.url}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      await copyToClipboard(link.url);
                      addToast({ title: 'Copied!', message: 'URL copied.', type: 'success', duration: 1500 });
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                    title="Open link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
