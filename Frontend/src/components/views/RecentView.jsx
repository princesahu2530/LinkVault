import React from 'react';
import { Clock, Calendar, ExternalLink, Globe, Copy, Star } from 'lucide-react';
import { formatDate, getFaviconUrl, copyToClipboard } from '../../utils/helpers';
import { useToast } from '../ui/ToastContext';

export function RecentView({ links, topics, onNavigateToTopic }) {
  const { addToast } = useToast();

  const activeLinks = links
    .filter(l => !l.isDeleted)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  if (activeLinks.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/60 dark:border-cyan-800/60 flex items-center justify-center text-cyan-500 shadow-xl shadow-cyan-500/10">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          No recent activity
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          New links and resources will automatically show up here sorted by recency.
        </p>
      </div>
    );
  }

  // Group by timeframe
  const now = new Date();
  const today = [];
  const yesterday = [];
  const thisWeek = [];
  const older = [];

  activeLinks.forEach(link => {
    const d = new Date(link.createdAt || Date.now());
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) today.push(link);
    else if (diffDays === 1) yesterday.push(link);
    else if (diffDays < 7) thisWeek.push(link);
    else older.push(link);
  });

  const renderGroup = (title, items) => {
    if (!items.length) return null;

    return (
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 px-1">
          <Calendar className="w-3.5 h-3.5" /> {title} ({items.length})
        </h2>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
          {items.map(link => {
            const linkKey = link.id || link._id;
            const linkTopicId = String(link.topicId?._id || link.topicId || '');
            const topic = topics.find(t => (t.id && String(t.id) === linkTopicId) || (t._id && String(t._id) === linkTopicId));
            const effectiveUrl = link.url || link.fields?.find(f => f.type === 'url')?.value || '';
            const faviconUrl = effectiveUrl ? getFaviconUrl(effectiveUrl) : null;

            return (
              <div
                key={linkKey}
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
                        href={effectiveUrl || '#'}
                        target={effectiveUrl ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                      >
                        {link.title || effectiveUrl || 'Untitled Item'}
                      </a>
                      {link.isFavorite && (
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {topic && (
                        <span 
                          onClick={() => onNavigateToTopic(topic.id || topic._id)}
                          className="hover:underline text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer"
                        >
                          {topic.name}
                        </span>
                      )}
                      {effectiveUrl && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-slate-400 truncate">{effectiveUrl}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    {formatDate(link.createdAt)}
                  </span>
                  {effectiveUrl && (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          await copyToClipboard(effectiveUrl);
                          addToast({ title: 'Copied!', message: 'URL copied.', type: 'success', duration: 1500 });
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={effectiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                        title="Open link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <Clock className="w-6 h-6 text-cyan-500" />
          Recently Added Resources
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Chronological timeline of your knowledge base additions.
        </p>
      </div>

      {renderGroup('Today', today)}
      {renderGroup('Yesterday', yesterday)}
      {renderGroup('Past 7 Days', thisWeek)}
      {renderGroup('Earlier', older)}
    </div>
  );
}
