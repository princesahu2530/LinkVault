import React from 'react';
import { FolderTree, Link2, Star, Clock, Sparkles } from 'lucide-react';

export function StatsHeader({
  stats,
  onCardClick,
  activeFilter = null
}) {
  const cards = [
    {
      id: 'topics',
      label: 'Topics',
      count: stats.totalTopics,
      subtitle: `${stats.pinnedTopicsCount || 0} pinned`,
      icon: FolderTree,
      color: 'indigo',
      gradient: 'from-indigo-500/10 to-indigo-500/5',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
    },
    {
      id: 'links',
      label: 'Total Links',
      count: stats.totalLinks,
      subtitle: 'across all categories',
      icon: Link2,
      color: 'emerald',
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'favorites',
      label: 'Favorites',
      count: stats.totalFavorites,
      subtitle: 'starred resources',
      icon: Star,
      color: 'amber',
      gradient: 'from-amber-500/10 to-amber-500/5',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    {
      id: 'recent',
      label: 'Recently Added',
      count: stats.recentLinksCount,
      subtitle: 'in the past 7 days',
      icon: Clock,
      color: 'cyan',
      gradient: 'from-cyan-500/10 to-cyan-500/5',
      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
    }
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Your Knowledge Base
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize, search and access your links, resources and research notes.
          </p>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = activeFilter === card.id;

          return (
            <div
              key={card.id}
              onClick={() => onCardClick && onCardClick(card.id)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer card-interactive select-none ${
                isActive
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm'
                  : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {card.count}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {card.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
