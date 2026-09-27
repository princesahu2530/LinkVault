import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  Search, 
  Plus, 
  FolderPlus, 
  LayoutDashboard, 
  Calendar, 
  Star, 
  Archive, 
  Trash2, 
  Grid, 
  Table, 
  Download, 
  Upload, 
  Briefcase, 
  Settings, 
  Sparkles,
  Command
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenCreateItem,
  onOpenCreateTopic,
  onOpenCreateTemplate,
  onOpenCreateWorkspace,
  onOpenSettings,
  onOpenImportExport,
  onSetView,
  onSelectTopic,
  topics = [],
  workspaces = []
}) {
  const { switchWorkspace } = useWorkspace();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global key listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('open-command-palette'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const COMMANDS = [
    {
      id: 'create-item',
      title: 'Create New Item / Record',
      category: 'Actions',
      icon: Plus,
      action: () => onOpenCreateItem && onOpenCreateItem()
    },
    {
      id: 'create-topic',
      title: 'Create Topic / Collection',
      category: 'Actions',
      icon: FolderPlus,
      action: () => onOpenCreateTopic && onOpenCreateTopic()
    },
    {
      id: 'create-workspace',
      title: 'Create New Workspace (Role Starter Packs)',
      category: 'Actions',
      icon: Sparkles,
      action: () => onOpenCreateWorkspace && onOpenCreateWorkspace()
    },
    {
      id: 'view-dashboard',
      title: 'Go to Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => onSetView && onSetView('dashboard')
    },
    {
      id: 'view-calendar',
      title: 'Go to Calendar View',
      category: 'Navigation',
      icon: Calendar,
      action: () => onSetView && onSetView('calendar')
    },
    {
      id: 'view-cards',
      title: 'Switch to Card View',
      category: 'Views',
      icon: Grid,
      action: () => onSetView && onSetView('cards')
    },
    {
      id: 'view-table',
      title: 'Switch to Table View',
      category: 'Views',
      icon: Table,
      action: () => onSetView && onSetView('table')
    },
    {
      id: 'view-favorites',
      title: 'Open Starred Favorites',
      category: 'Navigation',
      icon: Star,
      action: () => onSetView && onSetView('favorites')
    },
    {
      id: 'view-archive',
      title: 'Open Archive',
      category: 'Navigation',
      icon: Archive,
      action: () => onSetView && onSetView('archive')
    },
    {
      id: 'view-trash',
      title: 'Open Trash',
      category: 'Navigation',
      icon: Trash2,
      action: () => onSetView && onSetView('trash')
    },
    {
      id: 'import-export',
      title: 'Import / Export Data (JSON / CSV)',
      category: 'Data',
      icon: Download,
      action: () => onOpenImportExport && onOpenImportExport()
    },
    {
      id: 'workspace-settings',
      title: 'Workspace Settings & Team Access',
      category: 'Settings',
      icon: Settings,
      action: () => onOpenSettings && onOpenSettings()
    }
  ];

  // Dynamic Workspace and Topic Switchers
  const dynamicCommands = [
    ...COMMANDS,
    ...workspaces.map(ws => ({
      id: `ws-${ws.id || ws._id}`,
      title: `Switch Workspace: ${ws.name}`,
      category: 'Workspaces',
      icon: Briefcase,
      action: () => switchWorkspace(ws.id || ws._id)
    })),
    ...topics.map(t => ({
      id: `topic-${t.id || t._id}`,
      title: `Go to Topic: ${t.name}`,
      category: 'Topics',
      icon: FolderPlus,
      action: () => onSelectTopic && onSelectTopic(t.id || t._id)
    }))
  ];

  const filteredCommands = dynamicCommands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectCommand = (cmd) => {
    onClose();
    if (cmd && cmd.action) {
      cmd.action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-900/90 gap-3">
          <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
              } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
                e.preventDefault();
                handleSelectCommand(filteredCommands[selectedIndex]);
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="Type a command, search workspace, or jump to topic..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const IconComponent = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => handleSelectCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium truncate">{cmd.title}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with <kbd className="font-mono text-slate-400">↑</kbd> <kbd className="font-mono text-slate-400">↓</kbd></span>
          <span>Select with <kbd className="font-mono text-slate-400">↵</kbd></span>
        </div>
      </div>
    </div>
  );
}
