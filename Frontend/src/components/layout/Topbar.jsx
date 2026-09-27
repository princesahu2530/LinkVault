import React, { useRef, useEffect } from 'react';
import { 
  Search, Plus, X, Menu, ChevronsUpDown, 
  ArrowUpDown, Keyboard, Sparkles, FolderPlus, Command,
  Briefcase, Lock, ShieldCheck, Building2, Users
} from 'lucide-react';
import { Dropdown } from '../ui/Dropdown';
import NotificationsPopover from '../collaboration/NotificationsPopover';
import { useWorkspace } from '../../context/WorkspaceContext';

export function Topbar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onOpenMobileMenu,
  onOpenAddTopic,
  onOpenAddLink,
  onOpenShortcuts,
  onToggleExpandAll,
  allExpanded,
  sortBy,
  onSortChange,
  onOpenCommandPalette,
  onOpenItem,
  onOpenWorkspaceSelector
}) {
  const { activeWorkspace, openWorkspaceSelector } = useWorkspace();
  const searchInputRef = useRef(null);
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  // Listen for Ctrl/Cmd+K to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sortItems = [
    { type: 'header', label: 'Sort Topics By' },
    { label: 'Custom / Pinned Order', onClick: () => onSortChange('custom'), badge: sortBy === 'custom' ? '✓' : '' },
    { label: 'Topic Name (A-Z)', onClick: () => onSortChange('name_asc'), badge: sortBy === 'name_asc' ? '✓' : '' },
    { label: 'Topic Name (Z-A)', onClick: () => onSortChange('name_desc'), badge: sortBy === 'name_desc' ? '✓' : '' },
    { label: 'Most Links First', onClick: () => onSortChange('links_count'), badge: sortBy === 'links_count' ? '✓' : '' },
    { label: 'Recently Updated', onClick: () => onSortChange('updated'), badge: sortBy === 'updated' ? '✓' : '' }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-[#0B0F17]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile Menu Trigger + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search topics, titles, URLs, descriptions, tags, notes..."
            className="w-full pl-9 pr-16 sm:pr-20 py-2 rounded-xl text-xs sm:text-sm bg-slate-100/70 dark:bg-slate-800/60 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear search (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="absolute inset-y-0 right-0 pr-2.5 hidden sm:flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 border border-slate-300/80 dark:border-slate-600/80 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {isMac ? '⌘K' : 'Ctrl+K'}
              </kbd>
            </div>
          )}
        </div>
      </div>

      {/* Right: Controls, Sort, Expand/Collapse & Add Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Active Workspace Indicator Pill */}
        {activeWorkspace && (
          <button
            type="button"
            onClick={onOpenWorkspaceSelector || openWorkspaceSelector}
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all shadow-2xs group"
            title="Click to switch workspace"
          >
            <div 
              className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-xs flex-shrink-0"
              style={{ backgroundColor: activeWorkspace.color || '#6366f1' }}
            >
              {activeWorkspace.isPersonal ? (
                <Lock className="w-3 h-3" />
              ) : (
                <Briefcase className="w-3 h-3" />
              )}
            </div>
            <div className="min-w-0 max-w-[120px] lg:max-w-[170px]">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                {activeWorkspace.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize truncate font-medium">
                {activeWorkspace.isPersonal ? 'Personal' : (activeWorkspace.category || activeWorkspace.myRole || 'Workspace')}
              </div>
            </div>
          </button>
        )}

        {/* Expand / Collapse All Toggle */}
        <button
          type="button"
          onClick={onToggleExpandAll}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          title={allExpanded ? "Collapse all topics" : "Expand all topics"}
        >
          <ChevronsUpDown className="w-4 h-4 text-indigo-500" />
          <span>{allExpanded ? 'Collapse All' : 'Expand All'}</span>
        </button>

        {/* Sort dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              title="Sort topics"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          }
          items={sortItems}
        />

        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors hidden sm:block"
          title="Command Palette (Ctrl+K)"
        >
          <Command className="w-4 h-4 text-indigo-500" />
        </button>

        {/* Notifications Popover */}
        <NotificationsPopover onOpenItem={onOpenItem} />

        {/* Keyboard Shortcuts Trigger */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors hidden sm:block"
          title="Keyboard shortcuts (?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Add Topic Button */}
        <button
          type="button"
          onClick={onOpenAddTopic}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
          title="Add New Topic (Ctrl+Shift+N)"
        >
          <FolderPlus className="w-4 h-4 text-indigo-500" />
          <span>+ Topic</span>
        </button>

        {/* Add Item Button */}
        <button
          type="button"
          onClick={onOpenAddLink}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          title="Add New Item"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">+ Item</span>
        </button>
      </div>
    </header>
  );
}
