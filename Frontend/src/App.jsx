import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { storage } from './services/storage';
import { itemsApi } from './api/items.api';
import { templatesApi } from './api/templates.api';
import { topicsApi } from './api/topics.api';
import { settingsApi } from './api/settings.api';
import { ToastProvider, useToast } from './components/ui/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { AuthModal } from './components/auth/AuthModal';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardView } from './components/views/DashboardView';
import { FavoritesView } from './components/views/FavoritesView';
import { RecentView } from './components/views/RecentView';
import { TagsView } from './components/views/TagsView';
import { ArchiveView } from './components/views/ArchiveView';
import { TrashView } from './components/views/TrashView';
import ConfigurableDashboard from './components/views/ConfigurableDashboard';
import CalendarView from './components/views/CalendarView';
import SavedViewsBar from './components/views/SavedViewsBar';

import { AddTopicModal } from './components/topics/AddTopicModal';
import { EditTopicModal } from './components/topics/EditTopicModal';
import { AddLinkModal } from './components/links/AddLinkModal';
import { EditLinkModal } from './components/links/EditLinkModal';
import { MoveLinkModal } from './components/links/MoveLinkModal';
import { NotesPreviewModal } from './components/links/NotesPreviewModal';
import { BulkActionBar } from './components/links/BulkActionBar';
import { TemplateManagerModal } from './components/templates/TemplateManagerModal';
import CreateWorkspaceModal from './components/workspaces/CreateWorkspaceModal';
import WorkspaceSettingsModal from './components/workspaces/WorkspaceSettingsModal';
import WorkspaceSelectorModal from './components/workspaces/WorkspaceSelectorModal';
import CommandPalette from './components/modals/CommandPalette';
import QuickCaptureModal from './components/modals/QuickCaptureModal';
import FilterBuilderModal from './components/modals/FilterBuilderModal';

import { QuickAddModal } from './components/modals/QuickAddModal';
import { ImportExportModal } from './components/modals/ImportExportModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { ConfirmDialog } from './components/ui/ConfirmDialog';

function MainApp() {
  const { user, logout, openAuthModal, isAuthenticated } = useAuth();
  const { 
    activeWorkspace, 
    activeWorkspaceId, 
    workspaces, 
    isWorkspaceSelectorOpen, 
    openWorkspaceSelector, 
    closeWorkspaceSelector 
  } = useWorkspace();
  const { addToast } = useToast();

  // --- STATE ---
  const [topics, setTopics] = useState([]);
  const [links, setLinks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [settings, setSettings] = useState(storage.getLocalSettings());
  const [expandedTopicIds, setExpandedTopicIds] = useState([]);
  
  // Navigation & View
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState(null);
  const [sortBy, setSortBy] = useState('custom');

  // Selection for bulk actions
  const [selectedLinkIds, setSelectedLinkIds] = useState([]);

  // Modals state
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [addLinkTopicId, setAddLinkTopicId] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [movingLink, setMovingLink] = useState(null);
  const [viewingNotesLink, setViewingNotesLink] = useState(null);
  
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Workspace & Collaboration Modals
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isWorkspaceSettingsOpen, setIsWorkspaceSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isFilterBuilderOpen, setIsFilterBuilderOpen] = useState(false);
  const [customFilterRules, setCustomFilterRules] = useState([]);
  
  // Confirm Delete state
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  // Listen for custom open-command-palette event
  useEffect(() => {
    const handleOpenCmd = () => setIsCommandPaletteOpen(true);
    window.addEventListener('open-command-palette', handleOpenCmd);
    return () => window.removeEventListener('open-command-palette', handleOpenCmd);
  }, []);

  // --- INITIAL DATA LOAD ---
  const loadData = useCallback(async () => {
    let loadedTopics;
    let loadedLinks;
    let loadedTemplates;
    let loadedSettings;

    if (isAuthenticated) {
      loadedTopics = await storage.fetchTopicsFromApi();
      loadedLinks = await storage.fetchItemsFromApi();
      loadedTemplates = await storage.fetchTemplatesFromApi();
      loadedSettings = await storage.fetchSettingsFromApi();
    } else {
      loadedTopics = storage.getLocalTopics();
      loadedLinks = storage.getLocalItems();
      loadedTemplates = storage.getLocalTemplates();
      loadedSettings = storage.getLocalSettings();
    }

    const loadedExpanded = storage.getExpandedTopicIds();

    setTopics(loadedTopics);
    setLinks(loadedLinks);
    setTemplates(loadedTemplates);
    setSettings(loadedSettings);

    if (loadedSettings.defaultTopicState === 'all_expanded') {
      setExpandedTopicIds(loadedTopics.map(t => t.id || t._id));
    } else if (loadedSettings.defaultTopicState === 'all_collapsed') {
      setExpandedTopicIds([]);
    } else {
      setExpandedTopicIds(loadedExpanded);
    }
  }, [isAuthenticated, activeWorkspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData, isAuthenticated, activeWorkspaceId]);

  // --- THEME SYNC ---
  const handleToggleTheme = async () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: next };
    setSettings(updated);
    storage.saveLocalSettings(updated);
    if (isAuthenticated) {
      try {
        await settingsApi.updateSettings({ theme: next });
      } catch {}
    }
  };

  useEffect(() => {
    const applyTheme = (themeName) => {
      const root = document.documentElement;
      const body = document.body;
      let isDark = false;
      if (themeName === 'dark') {
        isDark = true;
      } else if (themeName === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }
    };

    applyTheme(settings.theme);
  }, [settings.theme]);

  // --- KEYBOARD SHORTCUTS LISTENER ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);

      // Submit active form with Ctrl+Enter or Cmd+Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const activeForm = document.querySelector('form:not([hidden])');
        if (activeForm) {
          e.preventDefault();
          activeForm.requestSubmit();
          return;
        }
      }

      // Close open modals or clear search on Escape
      if (e.key === 'Escape') {
        if (isAddTopicOpen) { setIsAddTopicOpen(false); return; }
        if (editingTopic) { setEditingTopic(null); return; }
        if (isAddLinkOpen) { setIsAddLinkOpen(false); return; }
        if (isQuickAddOpen) { setIsQuickAddOpen(false); return; }
        if (editingLink) { setEditingLink(null); return; }
        if (movingLink) { setMovingLink(null); return; }
        if (viewingNotesLink) { setViewingNotesLink(null); return; }
        if (isTemplatesOpen) { setIsTemplatesOpen(false); return; }
        if (isImportExportOpen) { setIsImportExportOpen(false); return; }
        if (isSettingsOpen) { setIsSettingsOpen(false); return; }
        if (isShortcutsOpen) { setIsShortcutsOpen(false); return; }
        if (deleteConfirmTarget) { setDeleteConfirmTarget(null); return; }

        if (searchQuery) setSearchQuery('');
        if (selectedLinkIds.length > 0) setSelectedLinkIds([]);
        return;
      }

      // Quick Add / Add Link: Ctrl+N, Cmd+N, Alt+N, or 'n' when not typing in input
      if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n' && !e.shiftKey) ||
        (e.altKey && e.key.toLowerCase() === 'n') ||
        (e.key.toLowerCase() === 'n' && !isInputActive && !e.ctrlKey && !e.metaKey && !e.altKey)
      ) {
        e.preventDefault();
        const firstId = topics[0]?.id || topics[0]?._id;
        setAddLinkTopicId(firstId || null);
        setIsAddLinkOpen(true);
        return;
      }

      // Create Topic: Ctrl+Shift+N, Cmd+Shift+N, Alt+T, or 't' when not typing in input
      if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n' && e.shiftKey) ||
        (e.altKey && e.key.toLowerCase() === 't') ||
        (e.key.toLowerCase() === 't' && !isInputActive && !e.ctrlKey && !e.metaKey && !e.altKey)
      ) {
        e.preventDefault();
        setIsAddTopicOpen(true);
        return;
      }

      // Toggle Theme: Ctrl+J, Cmd+J, or Alt+D
      if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') ||
        (e.altKey && e.key.toLowerCase() === 'd')
      ) {
        e.preventDefault();
        handleToggleTheme();
        return;
      }

      // Keyboard shortcuts modal: '?' or Shift+/
      if ((e.key === '?' || (e.shiftKey && e.key === '/')) && !isInputActive) {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isAddTopicOpen, editingTopic, isAddLinkOpen, isQuickAddOpen, editingLink,
    movingLink, viewingNotesLink, isTemplatesOpen, isImportExportOpen,
    isSettingsOpen, isShortcutsOpen, deleteConfirmTarget, searchQuery,
    selectedLinkIds, topics, settings
  ]);

  // --- STATS COMPUTATION ---
  const stats = useMemo(() => {
    const activeTopics = topics.filter(t => !t.isDeleted && !t.isArchived);
    const activeLinks = links.filter(l => !l.isDeleted && !l.isArchived);
    const favoriteTopics = activeTopics.filter(t => t.isFavorite);
    const favoriteLinks = activeLinks.filter(l => l.isFavorite);

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentLinks = activeLinks.filter(l => new Date(l.createdAt || 0).getTime() >= sevenDaysAgo);

    const tagSet = new Set();
    activeLinks.forEach(l => l.tags?.forEach(t => tagSet.add(t)));

    const trashTopics = topics.filter(t => t.isDeleted);
    const trashLinks = links.filter(l => l.isDeleted);
    const archivedTopics = topics.filter(t => t.isArchived && !t.isDeleted);
    const archivedLinks = links.filter(l => l.isArchived && !l.isDeleted);

    return {
      totalTopics: activeTopics.length,
      pinnedTopicsCount: activeTopics.filter(t => t.isPinned).length,
      totalLinks: activeLinks.length,
      totalFavorites: favoriteTopics.length + favoriteLinks.length,
      recentLinksCount: recentLinks.length,
      totalTags: tagSet.size,
      trashCount: trashTopics.length + trashLinks.length,
      archivedCount: archivedTopics.length + archivedLinks.length
    };
  }, [topics, links]);

  // --- FILTERED & SORTED TOPICS & LINKS ---
  const { filteredTopics, filteredLinks } = useMemo(() => {
    let activeTopics = topics.filter(t => !t.isDeleted && !t.isArchived);
    let activeLinks = links.filter(l => !l.isDeleted && !l.isArchived);

    // Apply active tag filter
    if (activeTagFilter) {
      activeLinks = activeLinks.filter(l => l.tags && l.tags.includes(activeTagFilter));
      const validTopicIds = new Set(activeLinks.map(l => l.topicId));
      activeTopics = activeTopics.filter(t => validTopicIds.has(t.id || t._id));
    }

    // Apply Global Search Query across title, content, field names, field values, tags
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();

      activeLinks = activeLinks.filter(l => {
        const inTitle = l.title?.toLowerCase().includes(q);
        const inContent = (l.content || l.notes)?.toLowerCase().includes(q);
        const inTags = l.tags?.some(tag => tag.toLowerCase().includes(q));
        const inFields = l.fields?.some(f => 
          f.name?.toLowerCase().includes(q) || 
          String(f.value || '').toLowerCase().includes(q)
        );
        return inTitle || inContent || inTags || inFields;
      });

      const matchingTopicIds = new Set(activeLinks.map(l => l.topicId));
      activeTopics = activeTopics.filter(t => {
        const inName = t.name?.toLowerCase().includes(q);
        const inDesc = t.description?.toLowerCase().includes(q);
        return inName || inDesc || matchingTopicIds.has(t.id || t._id);
      });
    }

    // Apply Sorting to Topics
    const sortedTopics = [...activeTopics].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'links_count') {
        const countA = activeLinks.filter(l => l.topicId === (a.id || a._id)).length;
        const countB = activeLinks.filter(l => l.topicId === (b.id || b._id)).length;
        return countB - countA;
      }
      if (sortBy === 'updated') {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }
      return (a.position ?? 0) - (b.position ?? 0);
    });

    return { filteredTopics: sortedTopics, filteredLinks: activeLinks };
  }, [topics, links, searchQuery, activeTagFilter, sortBy]);

  // Auto-expand matching topics on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const topicIdsToExpand = filteredTopics.map(t => t.id || t._id);
      setExpandedTopicIds(prev => Array.from(new Set([...prev, ...topicIdsToExpand])));
    }
  }, [searchQuery, filteredTopics]);

  // --- EXPAND / COLLAPSE HANDLERS ---
  const handleToggleTopicExpand = (topicId) => {
    const updated = storage.toggleTopicExpanded(topicId);
    setExpandedTopicIds(updated);
  };

  const handleToggleExpandAll = () => {
    if (expandedTopicIds.length === filteredTopics.length && filteredTopics.length > 0) {
      setExpandedTopicIds([]);
      storage.saveExpandedTopicIds([]);
    } else {
      const allIds = filteredTopics.map(t => t.id || t._id);
      setExpandedTopicIds(allIds);
      storage.saveExpandedTopicIds(allIds);
    }
  };

  // --- TOPIC ACTIONS ---
  const handleTopicCreated = async (topicData) => {
    try {
      let created;
      if (isAuthenticated) {
        created = await topicsApi.createTopic(topicData);
      } else {
        created = {
          ...topicData,
          id: `topic_${Date.now()}`,
          position: topics.length,
          createdAt: new Date().toISOString()
        };
        storage.saveLocalTopics([...topics, created]);
      }
      setTopics(prev => [...prev, created]);
      setExpandedTopicIds(prev => [...prev, created.id || created._id]);
      addToast({ title: 'Topic Created', message: `"${created.name}" is ready.`, type: 'success' });
    } catch (err) {
      addToast({ title: 'Creation Failed', message: err.message, type: 'error' });
    }
  };

  const handleTopicUpdated = async (topicOrId, updates) => {
    if (!topicOrId) return;
    const topicId = typeof topicOrId === 'object' ? (topicOrId.id || topicOrId._id) : topicOrId;
    try {
      let updated;
      if (isAuthenticated) {
        updated = await topicsApi.updateTopic(topicId, updates);
      } else {
        updated = { ...topics.find(t => String(t.id || t._id) === String(topicId)), ...updates };
        storage.saveLocalTopics(topics.map(t => String(t.id || t._id) === String(topicId) ? updated : t));
      }
      setTopics(prev => prev.map(t => String(t.id || t._id) === String(topicId) ? (updated || { ...t, ...updates }) : t));
      addToast({ title: 'Topic Updated', message: `"${(updated || updates).name || 'Topic'}" saved.`, type: 'success' });
    } catch (err) {
      addToast({ title: 'Update Failed', message: err.message, type: 'error' });
    }
  };

  const handleTogglePinTopic = async (topicOrId) => {
    if (!topicOrId) return;
    const topic = typeof topicOrId === 'object' ? topicOrId : topics.find(t => String(t.id || t._id) === String(topicOrId));
    if (!topic) return;
    const id = topic.id || topic._id;
    await handleTopicUpdated(id, { isPinned: !topic.isPinned });
  };

  const handleToggleFavoriteTopic = async (topicOrId) => {
    if (!topicOrId) return;
    const topic = typeof topicOrId === 'object' ? topicOrId : topics.find(t => String(t.id || t._id) === String(topicOrId));
    if (!topic) return;
    const id = topic.id || topic._id;
    await handleTopicUpdated(id, { isFavorite: !topic.isFavorite });
  };

  const handleDuplicateTopic = async (topicOrId) => {
    try {
      const topic = typeof topicOrId === 'object' ? topicOrId : topics.find(t => String(t.id || t._id) === String(topicOrId));
      const id = topic?.id || topic?._id || topicOrId;
      if (isAuthenticated) {
        await topicsApi.duplicateTopic(id);
      }
      await loadData();
      addToast({ title: 'Topic Duplicated', message: `Copy of "${topic?.name || 'Topic'}" created.`, type: 'success' });
    } catch (err) {
      addToast({ title: 'Duplication Failed', message: err.message, type: 'error' });
    }
  };

  const handleArchiveTopic = async (topicOrId) => {
    if (!topicOrId) return;
    const topic = typeof topicOrId === 'object' ? topicOrId : topics.find(t => String(t.id || t._id) === String(topicOrId));
    const id = topic?.id || topic?._id || topicOrId;
    await handleTopicUpdated(id, { isArchived: true });
    addToast({ title: 'Topic Archived', message: `"${topic?.name || 'Topic'}" moved to archive.`, type: 'info' });
  };

  const handleDeleteTopicTrigger = (topicOrId) => {
    const topic = typeof topicOrId === 'object' ? topicOrId : topics.find(t => String(t.id || t._id) === String(topicOrId));
    if (!topic) return;
    setDeleteConfirmTarget({
      type: 'topic',
      item: topic,
      title: `Delete Topic "${topic.name}"?`,
      description: 'This topic and its items will be moved to the Trash Bin. You can restore them anytime.'
    });
  };

  // --- ITEM ACTIONS ---
  const handleItemAdded = async (itemData) => {
    try {
      let created;
      if (isAuthenticated) {
        created = await itemsApi.createItem(itemData);
      } else {
        created = {
          ...itemData,
          id: `item_${Date.now()}`,
          position: links.length,
          createdAt: new Date().toISOString()
        };
        storage.saveLocalItems([...links, created]);
      }
      if (created) {
        setLinks(prev => [...prev, created]);
        const targetTopicId = created.topicId?._id || created.topicId || itemData.topicId;
        if (targetTopicId) {
          setExpandedTopicIds(prev => Array.from(new Set([...prev, String(targetTopicId)])));
        }
        addToast({ title: 'Item Saved', message: `"${created.title || 'New Item'}" created.`, type: 'success' });
      }
    } catch (err) {
      addToast({ title: 'Save Failed', message: err.message, type: 'error' });
    }
  };

  const handleItemUpdated = async (itemOrId, updates) => {
    if (!itemOrId) return;
    const itemId = typeof itemOrId === 'object' ? (itemOrId.id || itemOrId._id) : itemOrId;
    try {
      let updated;
      if (isAuthenticated) {
        updated = await itemsApi.updateItem(itemId, updates);
      } else {
        updated = { ...links.find(l => String(l.id || l._id) === String(itemId)), ...updates };
        storage.saveLocalItems(links.map(l => String(l.id || l._id) === String(itemId) ? updated : l));
      }
      setLinks(prev => prev.map(l => String(l.id || l._id) === String(itemId) ? (updated || { ...l, ...updates }) : l));
      addToast({ title: 'Item Updated', message: `Changes saved successfully.`, type: 'success' });
    } catch (err) {
      addToast({ title: 'Update Failed', message: err.message, type: 'error' });
    }
  };

  const handleToggleFavoriteLink = async (itemOrId) => {
    if (!itemOrId) return;
    const itemId = typeof itemOrId === 'object' ? (itemOrId.id || itemOrId._id) : itemOrId;
    const item = links.find(l => String(l.id || l._id) === String(itemId));
    if (!item) return;
    await handleItemUpdated(itemId, { isFavorite: !item.isFavorite });
  };

  const handleToggleArchiveLink = async (itemOrId) => {
    if (!itemOrId) return;
    const itemId = typeof itemOrId === 'object' ? (itemOrId.id || itemOrId._id) : itemOrId;
    const item = links.find(l => String(l.id || l._id) === String(itemId));
    if (!item) return;
    await handleItemUpdated(itemId, { isArchived: !item.isArchived });
  };

  const handleDuplicateLink = async (itemOrId) => {
    if (!itemOrId) return;
    const itemId = typeof itemOrId === 'object' ? (itemOrId.id || itemOrId._id) : itemOrId;
    try {
      if (isAuthenticated) {
        await itemsApi.duplicateItem(itemId);
      } else {
        const orig = links.find(l => String(l.id || l._id) === String(itemId));
        if (orig) {
          const cloned = { ...orig, id: `item_${Date.now()}`, title: `${orig.title || ''} (Copy)` };
          storage.saveLocalItems([...links, cloned]);
        }
      }
      await loadData();
      addToast({ title: 'Item Duplicated', message: 'Copy created.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Duplication Failed', message: err.message, type: 'error' });
    }
  };

  const handleDeleteLinkTrigger = async (itemOrId) => {
    if (!itemOrId) return;
    const itemId = typeof itemOrId === 'object' ? (itemOrId.id || itemOrId._id) : itemOrId;
    try {
      if (isAuthenticated) {
        await itemsApi.deleteItem(itemId, false);
      } else {
        const updated = links.map(l => String(l.id || l._id) === String(itemId) ? { ...l, isDeleted: true } : l);
        storage.saveLocalItems(updated);
      }
      await loadData();
      addToast({
        title: 'Item Deleted',
        message: 'Moved to trash.',
        type: 'info',
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: async () => {
            if (isAuthenticated) await itemsApi.restoreItem(itemId);
            await loadData();
          }
        }
      });
    } catch (err) {
      addToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    }
  };

  // --- TEMPLATE ACTIONS ---
  const handleCreateTemplate = async (templateData) => {
    try {
      let created;
      if (isAuthenticated) {
        created = await templatesApi.createTemplate(templateData);
      } else {
        created = { ...templateData, id: `tmpl_${Date.now()}` };
        storage.saveLocalTemplates([...templates, created]);
      }
      setTemplates(prev => [...prev, created]);
      addToast({ title: 'Template Saved', message: `"${created.name}" is now available.`, type: 'success' });
    } catch (err) {
      addToast({ title: 'Template Error', message: err.message, type: 'error' });
    }
  };

  const handleUpdateTemplate = async (templateId, updates) => {
    try {
      let updated;
      if (isAuthenticated) {
        updated = await templatesApi.updateTemplate(templateId, updates);
      } else {
        updated = { ...templates.find(t => (t.id || t._id) === templateId), ...updates };
        storage.saveLocalTemplates(templates.map(t => (t.id || t._id) === templateId ? updated : t));
      }
      setTemplates(prev => prev.map(t => (t.id || t._id) === templateId ? updated : t));
      addToast({ title: 'Template Updated', message: `"${updated.name}" updated.`, type: 'success' });
    } catch (err) {
      addToast({ title: 'Update Error', message: err.message, type: 'error' });
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      if (isAuthenticated) {
        await templatesApi.deleteTemplate(templateId);
      } else {
        storage.saveLocalTemplates(templates.filter(t => (t.id || t._id) !== templateId));
      }
      setTemplates(prev => prev.filter(t => (t.id || t._id) !== templateId));
      addToast({ title: 'Template Deleted', message: 'Template removed.', type: 'info' });
    } catch (err) {
      addToast({ title: 'Delete Error', message: err.message, type: 'error' });
    }
  };

  const handleDuplicateTemplate = async (templateId) => {
    try {
      if (isAuthenticated) {
        await templatesApi.duplicateTemplate(templateId);
      }
      await loadData();
      addToast({ title: 'Template Duplicated', message: 'Template copied.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  // --- BULK SELECTION ACTIONS ---
  const handleToggleSelectLink = (linkId) => {
    setSelectedLinkIds(prev => 
      prev.includes(linkId) ? prev.filter(id => id !== linkId) : [...prev, linkId]
    );
  };

  const handleSelectAllLinksInTopic = (topicId) => {
    const topicLinks = filteredLinks.filter(l => l.topicId === topicId);
    const allTopicLinkIds = topicLinks.map(l => l.id || l._id);
    const areAllSelected = allTopicLinkIds.every(id => selectedLinkIds.includes(id));

    if (areAllSelected) {
      setSelectedLinkIds(prev => prev.filter(id => !allTopicLinkIds.includes(id)));
    } else {
      setSelectedLinkIds(prev => Array.from(new Set([...prev, ...allTopicLinkIds])));
    }
  };

  const handleBulkDeleteTrigger = () => {
    setDeleteConfirmTarget({
      type: 'bulk_links',
      item: selectedLinkIds,
      title: `Delete ${selectedLinkIds.length} Selected Items?`,
      description: 'Selected items will be moved to the Trash Bin where you can restore them.'
    });
  };

  const handleBulkFavorite = async () => {
    try {
      if (isAuthenticated) {
        await itemsApi.bulkOperation(selectedLinkIds, 'favorite');
      }
      await loadData();
      addToast({
        title: 'Starred Favorites',
        message: `${selectedLinkIds.length} items updated.`,
        type: 'success'
      });
      setSelectedLinkIds([]);
    } catch (err) {
      addToast({ title: 'Bulk Action Failed', message: err.message, type: 'error' });
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === 'topic') {
      const topic = deleteConfirmTarget.item;
      const id = topic.id || topic._id;
      if (isAuthenticated) {
        await topicsApi.deleteTopic(id, false);
      }
      await loadData();
      addToast({
        title: 'Topic Deleted',
        message: `"${topic.name}" moved to trash.`,
        type: 'info'
      });
    } else if (deleteConfirmTarget.type === 'bulk_links') {
      if (isAuthenticated) {
        await itemsApi.bulkOperation(selectedLinkIds, 'delete');
      }
      await loadData();
      addToast({
        title: 'Items Deleted',
        message: `${selectedLinkIds.length} items moved to trash.`,
        type: 'info'
      });
      setSelectedLinkIds([]);
    }

    setDeleteConfirmTarget(null);
  };

  const selectedLinksData = useMemo(() => {
    return links.filter(l => selectedLinkIds.includes(l.id || l._id));
  }, [links, selectedLinkIds]);

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        stats={stats}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenAddTopic={() => setIsAddTopicOpen(true)}
        onOpenQuickAdd={() => setIsQuickCaptureOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        appName={settings.appName}
        user={user}
        onOpenAuthModal={() => openAuthModal('login')}
        onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
        onOpenWorkspaceSettings={() => setIsWorkspaceSettingsOpen(true)}
        onLogout={async () => {
          await logout();
          addToast({ title: 'Logged Out', message: 'You are now browsing locally.', type: 'info' });
          await loadData();
        }}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Topbar Header */}
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddTopic={() => setIsAddTopicOpen(true)}
          onOpenAddLink={() => {
            const firstId = topics[0]?.id || topics[0]?._id;
            setAddLinkTopicId(firstId || null);
            setIsAddLinkOpen(true);
          }}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenItem={(itemId) => {
            const found = links.find(l => (l.id === itemId || l._id === itemId));
            if (found) setViewingNotesLink(found);
          }}
          onToggleExpandAll={handleToggleExpandAll}
          allExpanded={expandedTopicIds.length === filteredTopics.length && filteredTopics.length > 0}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onOpenWorkspaceSelector={openWorkspaceSelector}
        />

        {/* View Switcher Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24">
          {currentView === 'dashboard' ? (
            <ConfigurableDashboard
              items={filteredLinks}
              topics={filteredTopics}
              onOpenItem={(item) => setViewingNotesLink(item)}
              onSelectTopic={(topicId) => {
                setCurrentView('all_topics');
                setExpandedTopicIds(prev => Array.from(new Set([...prev, topicId])));
              }}
              onOpenCreate={() => {
                const firstId = topics[0]?.id || topics[0]?._id;
                setAddLinkTopicId(firstId || null);
                setIsAddLinkOpen(true);
              }}
            />
          ) : currentView === 'calendar' ? (
            <CalendarView
              items={filteredLinks}
              onOpenItem={(item) => setViewingNotesLink(item)}
              onOpenCreate={() => {
                const firstId = topics[0]?.id || topics[0]?._id;
                setAddLinkTopicId(firstId || null);
                setIsAddLinkOpen(true);
              }}
            />
          ) : currentView === 'all_topics' ? (
            <div className="space-y-4">
              <SavedViewsBar
                currentView={currentView}
                onSelectSavedView={(sv) => {
                  if (sv.viewType) setCurrentView(sv.viewType === 'dashboard' ? 'all_topics' : sv.viewType);
                }}
              />
              <DashboardView
                topics={filteredTopics}
                links={filteredLinks}
                stats={stats}
                expandedTopicIds={expandedTopicIds}
                onToggleTopicExpand={handleToggleTopicExpand}
                onAddNewTopic={() => setIsAddTopicOpen(true)}
                onAddNewLink={(topicId) => {
                  setAddLinkTopicId(topicId);
                  setIsAddLinkOpen(true);
                }}
                onEditTopic={(topic) => setEditingTopic(topic)}
                onDeleteTopic={handleDeleteTopicTrigger}
                onDuplicateTopic={handleDuplicateTopic}
                onToggleFavoriteTopic={handleToggleFavoriteTopic}
                onTogglePinTopic={handleTogglePinTopic}
                onExportTopic={() => setIsImportExportOpen(true)}
                onArchiveTopic={handleArchiveTopic}
                searchQuery={searchQuery}
                activeTagFilter={activeTagFilter}
                onClearTagFilter={() => setActiveTagFilter(null)}
                selectedLinkIds={selectedLinkIds}
                onToggleSelectLink={handleToggleSelectLink}
                onSelectAllLinksInTopic={handleSelectAllLinksInTopic}
                onEditLink={(link) => setEditingLink(link)}
                onDeleteLink={(itemId) => handleDeleteLinkTrigger(itemId)}
                onMoveLink={(link) => setMovingLink(link)}
                onDuplicateLink={handleDuplicateLink}
                onToggleFavoriteLink={handleToggleFavoriteLink}
                onToggleArchiveLink={handleToggleArchiveLink}
                onViewNotes={(link) => setViewingNotesLink(link)}
                onTagClick={(tag) => setActiveTagFilter(tag)}
                compactMode={settings.compactMode}
                onStatsCardClick={(cardId) => {
                  if (cardId === 'favorites') setCurrentView('favorites');
                  if (cardId === 'recent') setCurrentView('recent');
                  if (cardId === 'topics') setCurrentView('all_topics');
                }}
              />
            </div>
          ) : currentView === 'favorites' ? (
            <FavoritesView
              topics={topics}
              links={links}
              onNavigateToTopic={(topicId) => {
                setCurrentView('all_topics');
                setExpandedTopicIds(prev => Array.from(new Set([...prev, topicId])));
              }}
              selectedLinkIds={selectedLinkIds}
              onToggleSelectLink={handleToggleSelectLink}
              onEditLink={(link) => setEditingLink(link)}
              onDeleteLink={(itemId) => handleDeleteLinkTrigger(itemId)}
              onMoveLink={(link) => setMovingLink(link)}
              onDuplicateLink={handleDuplicateLink}
              onToggleFavoriteLink={handleToggleFavoriteLink}
              onViewNotes={(link) => setViewingNotesLink(link)}
              onTagClick={(tag) => {
                setActiveTagFilter(tag);
                setCurrentView('all_topics');
              }}
              compactMode={settings.compactMode}
            />
          ) : currentView === 'recent' ? (
            <RecentView
              links={links}
              topics={topics}
              onNavigateToTopic={(topicId) => {
                setCurrentView('all_topics');
                setExpandedTopicIds(prev => Array.from(new Set([...prev, topicId])));
              }}
            />
          ) : currentView === 'tags' ? (
            <TagsView
              links={links}
              topics={topics}
              onNavigateToTopic={(topicId) => {
                setCurrentView('all_topics');
                setExpandedTopicIds(prev => Array.from(new Set([...prev, topicId])));
              }}
            />
          ) : currentView === 'archive' ? (
            <ArchiveView
              topics={topics}
              links={links}
              onDataChanged={loadData}
            />
          ) : currentView === 'trash' ? (
            <TrashView
              topics={topics}
              links={links}
              onDataChanged={loadData}
            />
          ) : null}
        </main>
      </div>

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedLinkIds={selectedLinkIds}
        selectedLinks={selectedLinksData}
        onClearSelection={() => setSelectedLinkIds([])}
        onBulkDelete={handleBulkDeleteTrigger}
        onBulkFavorite={handleBulkFavorite}
      />

      {/* Modals */}
      <WorkspaceSelectorModal
        isOpen={isWorkspaceSelectorOpen}
        onClose={closeWorkspaceSelector}
        onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />

      <WorkspaceSettingsModal
        isOpen={isWorkspaceSettingsOpen}
        onClose={() => setIsWorkspaceSettingsOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenCreateItem={() => {
          const firstId = topics[0]?.id || topics[0]?._id;
          setAddLinkTopicId(firstId || null);
          setIsAddLinkOpen(true);
        }}
        onOpenCreateTopic={() => setIsAddTopicOpen(true)}
        onOpenCreateTemplate={() => setIsTemplatesOpen(true)}
        onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onSetView={setCurrentView}
        onSelectTopic={(topicId) => {
          setCurrentView('all_topics');
          setExpandedTopicIds(prev => Array.from(new Set([...prev, topicId])));
        }}
        topics={topics}
        workspaces={workspaces}
      />

      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        topics={topics}
        onCreated={() => {
          loadData();
          addToast({ title: 'Captured Successfully', message: 'Record saved.', type: 'success' });
        }}
        onOpenExisting={(item) => {
          setViewingNotesLink(item);
        }}
      />

      <FilterBuilderModal
        isOpen={isFilterBuilderOpen}
        onClose={() => setIsFilterBuilderOpen(false)}
        initialFilters={customFilterRules}
        onApplyFilters={(data) => {
          setCustomFilterRules(data.rules);
        }}
      />

      <AddTopicModal
        isOpen={isAddTopicOpen}
        onClose={() => setIsAddTopicOpen(false)}
        onTopicCreated={handleTopicCreated}
        templates={templates}
      />

      <EditTopicModal
        isOpen={Boolean(editingTopic)}
        topic={editingTopic}
        onClose={() => setEditingTopic(null)}
        onTopicUpdated={handleTopicUpdated}
        templates={templates}
      />

      <AddLinkModal
        isOpen={isAddLinkOpen}
        defaultTopicId={addLinkTopicId}
        topics={topics}
        templates={templates}
        onClose={() => setIsAddLinkOpen(false)}
        onAdd={handleItemAdded}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        topics={topics}
        onClose={() => setIsQuickAddOpen(false)}
        onLinkAdded={handleItemAdded}
      />

      <EditLinkModal
        isOpen={Boolean(editingLink)}
        item={editingLink}
        topics={topics}
        onClose={() => setEditingLink(null)}
        onSave={handleItemUpdated}
      />

      <MoveLinkModal
        isOpen={Boolean(movingLink)}
        link={movingLink}
        topics={topics}
        onClose={() => setMovingLink(null)}
        onLinkMoved={loadData}
      />

      <NotesPreviewModal
        isOpen={Boolean(viewingNotesLink)}
        link={viewingNotesLink}
        topicName={topics.find(t => (t.id || t._id) === viewingNotesLink?.topicId)?.name}
        onClose={() => setViewingNotesLink(null)}
        onItemUpdated={loadData}
      />

      <TemplateManagerModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        templates={templates}
        onCreateTemplate={handleCreateTemplate}
        onUpdateTemplate={handleUpdateTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onDuplicateTemplate={handleDuplicateTemplate}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        topics={topics}
        onClose={() => setIsImportExportOpen(false)}
        onDataChanged={loadData}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={(updated) => setSettings(updated)}
        onDataReset={loadData}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <AuthModal />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmTarget)}
        onClose={() => setDeleteConfirmTarget(null)}
        onConfirm={handleExecuteDelete}
        title={deleteConfirmTarget?.title || 'Confirm Deletion'}
        description={deleteConfirmTarget?.description || 'Are you sure you want to delete this item?'}
        confirmLabel="Move to Trash"
        isDestructive={true}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <MainApp />
        </WorkspaceProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
