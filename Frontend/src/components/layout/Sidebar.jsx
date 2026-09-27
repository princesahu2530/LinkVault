import React from 'react';
import { 
  LayoutDashboard, FolderTree, Star, Clock, Hash, 
  Archive, Trash2, Settings, Download, Plus, ChevronLeft, 
  ChevronRight, Sparkles, Moon, Sun, Layers, Calendar, Briefcase 
} from 'lucide-react';
import WorkspaceSwitcher from '../workspaces/WorkspaceSwitcher';

export function Sidebar({
  currentView,
  onNavigate,
  stats,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenAddTopic,
  onOpenQuickAdd,
  onOpenSettings,
  onOpenImportExport,
  theme,
  onToggleTheme,
  appName = 'LinkVault',
  user = null,
  onOpenTemplates = null,
  onOpenAuthModal = null,
  onLogout = null,
  onOpenCreateWorkspace = null,
  onOpenWorkspaceSettings = null
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      count: null
    },
    {
      id: 'all_topics',
      label: 'All Topics',
      icon: FolderTree,
      count: stats.totalTopics
    },
    {
      id: 'calendar',
      label: 'Calendar & Deadlines',
      icon: Calendar,
      count: null
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Star,
      count: stats.totalFavorites
    },
    {
      id: 'recent',
      label: 'Recently Added',
      icon: Clock,
      count: stats.recentLinksCount
    },
    {
      id: 'tags',
      label: 'Tags Cloud',
      icon: Hash,
      count: stats.totalTags
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      count: stats.archivedCount > 0 ? stats.archivedCount : null
    },
    {
      id: 'trash',
      label: 'Trash Bin',
      icon: Trash2,
      count: stats.trashCount > 0 ? stats.trashCount : null,
      dangerCount: true
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-[#0E131F] border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo & Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          {!isCollapsed ? (
            <div 
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onNavigate('dashboard')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <Layers className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block leading-tight">
                  {appName}
                </span>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium tracking-wide">
                  Knowledge Hub
                </span>
              </div>
            </div>
          ) : (
            <div 
              className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 cursor-pointer"
              onClick={() => onNavigate('dashboard')}
              title={appName}
            >
              <Layers className="w-5 h-5" />
            </div>
          )}

          {/* Collapse Toggle for Desktop */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace Switcher */}
        {!isCollapsed && (
          <WorkspaceSwitcher 
            onOpenCreate={onOpenCreateWorkspace} 
            onOpenSettings={onOpenWorkspaceSettings} 
          />
        )}

        {/* Quick Action Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={onOpenQuickAdd}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all active:scale-95 ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
            title="Quick Add Link (Ctrl+N)"
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span>Quick Add Link</span>}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.count !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        item.dangerCount
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Workspace Information & Settings */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
          {/* User Profile / Auth Status Widget */}
          {user ? (
            <div className={`p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5 ${isCollapsed ? 'justify-center p-1.5' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
              title="Sign In / Register"
            >
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              {!isCollapsed && <span>Sign In / Sync</span>}
            </button>
          )}

          {/* Custom Templates */}
          <button
            type="button"
            onClick={onOpenTemplates}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Custom Templates"
          >
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            {!isCollapsed && <span>Field Templates</span>}
          </button>

          {/* Data Transfer */}
          <button
            type="button"
            onClick={onOpenImportExport}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Import / Export Data"
          >
            <Download className="w-4 h-4 text-slate-400 shrink-0" />
            {!isCollapsed && <span>Import / Export</span>}
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Settings & Appearance"
          >
            <Settings className="w-4 h-4 text-slate-400 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
            )}
            {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* Logout if authenticated */}
          {user && (
            <button
              type="button"
              onClick={onLogout}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
              title="Log Out"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Log Out</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
