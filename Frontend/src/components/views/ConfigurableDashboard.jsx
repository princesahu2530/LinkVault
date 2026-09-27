import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Star, 
  TrendingUp, 
  Folder, 
  Sparkles, 
  AlertCircle,
  Activity,
  Layers,
  ArrowRight,
  Users,
  Briefcase,
  Code2,
  FileText,
  ExternalLink,
  ChevronRight,
  Filter,
  Plus,
  Link as LinkIcon,
  Copy,
  Check,
  Tag,
  Search,
  Globe,
  FileCheck,
  UserCheck,
  Eye,
  Share2
} from 'lucide-react';
import { FieldRenderer } from '../fields/FieldRenderer';

export default function ConfigurableDashboard({ 
  items = [], 
  topics = [], 
  onOpenItem, 
  onSelectTopic, 
  onOpenCreate 
}) {
  const { activeWorkspace, members = [] } = useWorkspace();
  const { user } = useAuth();
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('all');
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to extract field value by possible field names
  const getFieldValue = (item, ...names) => {
    if (!item || !item.fields) return null;
    const lowerNames = names.map(n => n.toLowerCase());
    const field = item.fields.find(f => {
      const fName = (f.name || '').toLowerCase();
      const fId = (f.fieldId || f.id || '').toLowerCase();
      return lowerNames.includes(fName) || lowerNames.includes(fId);
    });
    return field?.value ?? null;
  };

  // Helper to get all URL fields from an item
  const getItemUrls = (item) => {
    if (!item) return [];
    const urlFields = (item.fields || []).filter(f => f.type === 'url' && f.value);
    const legacyUrl = item.url ? [{ fieldId: 'legacy_url', name: 'Website', type: 'url', value: item.url }] : [];
    return [...urlFields, ...legacyUrl];
  };

  // Dynamic Workspace Analytics derived 100% from actual data
  const stats = useMemo(() => {
    const total = items.length;
    const favorites = items.filter(i => i.isFavorite).length;
    const archived = items.filter(i => i.isArchived).length;
    const active = items.filter(i => !i.isArchived);
    const now = new Date();

    // Collect all custom fields defined across items
    const fieldNameCounts = {};
    let totalUrlsCount = 0;
    const allStoredUrls = [];

    active.forEach(item => {
      (item.fields || []).forEach(f => {
        const name = f.name?.trim();
        if (name) {
          fieldNameCounts[name] = (fieldNameCounts[name] || 0) + 1;
        }
        if (f.type === 'url' && f.value) {
          totalUrlsCount++;
          allStoredUrls.push({
            itemId: item.id || item._id,
            itemTitle: item.title || 'Untitled Item',
            topicId: item.topicId?._id || item.topicId,
            topicName: item.topic?.name || topics.find(t => (t.id || t._id) === (item.topicId?._id || item.topicId))?.name || 'General',
            fieldName: f.name || 'URL',
            url: f.value,
            createdAt: item.createdAt
          });
        }
      });
      if (item.url) {
        totalUrlsCount++;
        allStoredUrls.push({
          itemId: item.id || item._id,
          itemTitle: item.title || 'Untitled Item',
          topicId: item.topicId?._id || item.topicId,
          topicName: item.topic?.name || 'General',
          fieldName: 'Website',
          url: item.url,
          createdAt: item.createdAt
        });
      }
    });

    // Unique tags
    const allTags = Array.from(new Set(active.flatMap(i => i.tags || []).filter(Boolean)));

    // Real Topic Distribution
    const topicBreakdown = topics.map(topic => {
      const topicId = (topic.id || topic._id)?.toString();
      const topicItems = active.filter(i => {
        const iTopicId = (i.topicId?._id || i.topicId)?.toString();
        return iTopicId === topicId;
      });
      return {
        id: topicId,
        name: topic.name,
        color: topic.color || '#6366f1',
        icon: topic.icon || 'Folder',
        itemCount: topicItems.length,
        items: topicItems
      };
    });

    // Deadlines (if any item has a valid date)
    const itemsWithDates = active.map(i => {
      const dateVal = i.taskProps?.dueDate || getFieldValue(i, 'due date', 'deadline', 'date', 'target date');
      return { item: i, date: dateVal ? new Date(dateVal) : null };
    }).filter(x => x.date && !isNaN(x.date.getTime()));

    const upcomingDeadlines = itemsWithDates
      .filter(x => x.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5)
      .map(x => x.item);

    // Recent items sorted by newest
    const recentItems = [...active]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
      .slice(0, 8);

    return {
      total,
      activeCount: active.length,
      favorites,
      archived,
      totalUrlsCount,
      allStoredUrls,
      allTags,
      topicBreakdown,
      upcomingDeadlines,
      recentItems,
      customFieldsUsed: Object.entries(fieldNameCounts).map(([name, count]) => ({ name, count }))
    };
  }, [items, topics]);

  // Filtered items list based on selected topic and search query
  const displayedItems = useMemo(() => {
    return items.filter(item => {
      if (item.isArchived) return false;
      const matchesTopic = selectedTopicFilter === 'all' || (item.topicId?._id || item.topicId)?.toString() === selectedTopicFilter;
      if (!matchesTopic) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const contentMatch = (item.content || item.notes || '').toLowerCase().includes(q);
      const tagMatch = (item.tags || []).some(t => t.toLowerCase().includes(q));
      const fieldMatch = (item.fields || []).some(f => 
        (f.name || '').toLowerCase().includes(q) || 
        String(f.value || '').toLowerCase().includes(q)
      );
      return titleMatch || contentMatch || tagMatch || fieldMatch;
    });
  }, [items, selectedTopicFilter, searchQuery]);

  const handleCopyLink = (url, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getUrlIcon = (url, fieldName = '') => {
    const u = (url || '').toLowerCase();
    const fn = (fieldName || '').toLowerCase();
    if (u.includes('linkedin') || fn.includes('linkedin')) {
      return (
        <svg className="w-4 h-4 text-[#0A66C2] fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      );
    }
    if (u.includes('github') || fn.includes('github')) {
      return <Code2 className="w-4 h-4 text-slate-900 dark:text-slate-100" />;
    }
    if (u.includes('resume') || fn.includes('resume') || fn.includes('cv')) {
      return <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    return <Globe className="w-4 h-4 text-indigo-500" />;
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Workspace Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                {activeWorkspace?.category || 'Vault'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {stats.activeCount} Stored Items
              </span>
              {stats.totalUrlsCount > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  {stats.totalUrlsCount} Links & URLs
                </span>
              )}
              {members.length > 1 && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {members.length} Members
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeWorkspace?.name || 'Workspace Hub'}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeWorkspace?.description || 'Your organized digital repository for custom structured data, profile URLs, document links, and notes.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* Dynamic Key Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200/70 dark:border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Items</span>
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{stats.activeCount} active • {stats.archived} archived</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">URLs & Profiles</span>
              <Globe className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{stats.totalUrlsCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">LinkedIn, GitHub, Portfolios</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Topics</span>
              <Folder className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{topics.length}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{stats.allTags.length} unique tags</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Starred / Favs</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-500 mt-1">{stats.favorites}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Quick access items</p>
          </div>
        </div>
      </div>

      {/* Profile & URL Quick Vault (If user has stored URLs like LinkedIn, GitHub, Resume, etc.) */}
      {stats.allStoredUrls.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Quick URL & Profile Hub
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instant launch and copy for all stored links (LinkedIn, GitHub, Resume, Portfolios)
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {stats.allStoredUrls.length} Links Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.allStoredUrls.slice(0, 9).map((linkObj, idx) => {
              const displayUrl = linkObj.url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
              const isCopied = copiedUrl === linkObj.url;

              return (
                <div
                  key={`${linkObj.itemId}_${idx}`}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-900/60 transition-all flex flex-col justify-between gap-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-2xs border border-slate-200/60 dark:border-slate-700">
                        {getUrlIcon(linkObj.url, linkObj.fieldName)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                          {linkObj.itemTitle}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {linkObj.fieldName} • {linkObj.topicName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(linkObj.url, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                        title="Copy URL"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={linkObj.url.startsWith('http') ? linkObj.url : `https://${linkObj.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <a
                    href={linkObj.url.startsWith('http') ? linkObj.url : `https://${linkObj.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline truncate block"
                  >
                    {displayUrl}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Topics & Collections Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Workspace Topics & Collections ({topics.length})
            </h2>
          </div>
        </div>

        {topics.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <Folder className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No topics created yet</p>
            <p className="text-xs text-slate-500">Create a topic to organize your profile IDs, links, and documents.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {stats.topicBreakdown.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTopic(t.id)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: `${t.color}20`, color: t.color }}
                    >
                      <Folder className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {t.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.itemCount} {t.itemCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>

                {t.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                    {t.items.slice(0, 2).map((itm) => (
                      <div 
                        key={itm.id || itm._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenItem(itm);
                        }}
                        className="text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 truncate flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                        <span className="truncate">{itm.title || 'Untitled'}</span>
                      </div>
                    ))}
                    {t.items.length > 2 && (
                      <span className="text-[10px] text-slate-400 font-medium block">
                        +{t.items.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filterable Items Explorer & Stream */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Stored Items & Custom Fields
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quickly browse and inspect items, tags, and custom fields
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items or fields..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* Topic Filter Dropdown */}
            <select
              value={selectedTopicFilter}
              onChange={(e) => setSelectedTopicFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="all">All Topics ({stats.activeCount})</option>
              {topics.map(t => (
                <option key={t.id || t._id} value={t.id || t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items List */}
        {displayedItems.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {searchQuery ? 'No items match your search' : 'No items stored yet'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first item with custom fields like LinkedIn, GitHub, Resume link, or notes.
            </p>
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayedItems.slice(0, 10).map((item) => {
              const fields = item.fields || [];
              const urlFields = fields.filter(f => f.type === 'url' && f.value);
              const otherFields = fields.filter(f => f.type !== 'url' && f.visible !== false);

              return (
                <div
                  key={item.id || item._id}
                  onClick={() => onOpenItem(item)}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {item.title || 'Untitled Item'}
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.topic?.name || topics.find(t => (t.id || t._id) === (item.topicId?._id || item.topicId))?.name || 'Topic'}
                        {item.createdAt && ` • ${new Date(item.createdAt).toLocaleDateString()}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.isFavorite && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      )}
                      <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                    </div>
                  </div>

                  {/* Render Custom URL Badges */}
                  {urlFields.length > 0 && (
                    <div className="space-y-1.5">
                      {urlFields.map((f, i) => (
                        <FieldRenderer key={f.fieldId || i} field={f} isCompact={true} />
                      ))}
                    </div>
                  )}

                  {/* Other Custom Fields */}
                  {otherFields.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {otherFields.slice(0, 3).map((f, i) => (
                        <FieldRenderer key={f.fieldId || i} field={f} isCompact={true} />
                      ))}
                      {otherFields.length > 3 && (
                        <span className="text-[10px] text-slate-400">
                          +{otherFields.length - 3} more fields
                        </span>
                      )}
                    </div>
                  )}

                  {/* Content snippet if present */}
                  {(item.content || item.notes) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.content || item.notes}
                    </p>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                      {item.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium border border-slate-200/60 dark:border-slate-700"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deadlines Widget (Shown only if actual deadlines exist in items) */}
      {stats.upcomingDeadlines.length > 0 && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Upcoming Deadlines & Target Dates
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stats.upcomingDeadlines.map((itm) => {
              const d = itm.taskProps?.dueDate || getFieldValue(itm, 'due date', 'deadline', 'date');
              return (
                <div
                  key={itm.id || itm._id}
                  onClick={() => onOpenItem(itm)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 cursor-pointer hover:border-indigo-400 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{itm.title}</p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{new Date(d).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
