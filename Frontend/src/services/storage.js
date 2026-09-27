/**
 * Unified Storage & API Gateway for LinkVault
 * Interacts with MongoDB REST API when authenticated,
 * and maintains LocalStorage offline caching for extreme speed and fallback resilience.
 */
import { generateId } from '../utils/helpers';
import { topicsApi } from '../api/topics.api';
import { itemsApi } from '../api/items.api';
import { templatesApi } from '../api/templates.api';
import { settingsApi } from '../api/settings.api';
import { backupApi } from '../api/backup.api';
import { tagsApi } from '../api/tags.api';
import { getActiveWorkspaceId } from '../api/client';

const STORAGE_KEYS = {
  TOPICS: 'linkvault_topics_v2',
  ITEMS: 'linkvault_items_v2',
  TEMPLATES: 'linkvault_templates_v2',
  SETTINGS: 'linkvault_settings_v2',
  EXPANDED_TOPICS: 'linkvault_expanded_v2',
};

const DEFAULT_SETTINGS = {
  theme: 'dark',
  accentColor: '#6366f1',
  compactMode: false,
  defaultTopicState: 'remember',
  showDescriptions: true,
  showUrls: true,
  appName: 'LinkVault',
  enableFavicons: true,
  trashRetentionDays: 30,
};

export const SAMPLE_TEMPLATES = [
  {
    id: 'tmpl_research',
    name: 'Website & Tool Research',
    description: 'Structure for analyzing new products and platforms',
    icon: 'Search',
    color: '#6366f1',
    fields: [
      { name: 'Website', type: 'url', required: true, position: 0 },
      { name: 'Pricing', type: 'text', position: 1 },
      { name: 'Status', type: 'select', options: ['Evaluating', 'Adopted', 'Archived'], defaultValue: 'Evaluating', position: 2 },
      { name: 'Rating', type: 'number', defaultValue: 5, position: 3 }
    ]
  },
  {
    id: 'tmpl_project',
    name: 'Client Project Spec',
    description: 'Track milestones, repositories, and project links',
    icon: 'Briefcase',
    color: '#10b981',
    fields: [
      { name: 'Client', type: 'text', required: true, position: 0 },
      { name: 'GitHub Repo', type: 'url', position: 1 },
      { name: 'Live Website', type: 'url', position: 2 },
      { name: 'Deadline', type: 'date', position: 3 },
      { name: 'Status', type: 'select', options: ['Planning', 'In Progress', 'Completed', 'On Hold'], defaultValue: 'In Progress', position: 4 }
    ]
  }
];

export const SAMPLE_TOPICS = [
  {
    id: 'topic_ai_tools',
    name: 'AI & Machine Learning',
    description: 'Generative AI models, research assistants, prompt engineering & developer APIs',
    icon: 'Bot',
    color: '#6366f1',
    isFavorite: true,
    isPinned: true,
    isArchived: false,
    isDeleted: false,
    defaultView: 'cards',
    defaultSort: 'position',
    visibleColumns: ['title', 'Category', 'Website', 'Pricing', 'tags', 'createdAt'],
    position: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'topic_dev_resources',
    name: 'Developer Knowledge Base',
    description: 'Frontend frameworks, code snippets, notes & architectures',
    icon: 'Code',
    color: '#10b981',
    isFavorite: true,
    isPinned: true,
    isArchived: false,
    isDeleted: false,
    defaultView: 'cards',
    defaultSort: 'position',
    visibleColumns: ['title', 'Language', 'Website', 'tags', 'createdAt'],
    position: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'topic_client_projects',
    name: 'Client Projects',
    description: 'Active client deliverables, deadlines, and requirements',
    icon: 'Briefcase',
    color: '#f59e0b',
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    defaultTemplateId: 'tmpl_project',
    defaultView: 'table',
    defaultSort: 'position',
    visibleColumns: ['title', 'Client', 'Deadline', 'Status', 'Live Website', 'tags'],
    position: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const SAMPLE_ITEMS = [
  {
    id: 'item_chatgpt',
    topicId: 'topic_ai_tools',
    title: 'ChatGPT & OpenAI Ecosystem',
    content: 'Leading conversational AI model by OpenAI with GPT-4o capabilities and custom GPTs.',
    fields: [
      { fieldId: 'f_cg_1', name: 'Website', type: 'url', value: 'https://chatgpt.com', position: 0, visible: true },
      { fieldId: 'f_cg_2', name: 'API Docs', type: 'url', value: 'https://platform.openai.com/docs', position: 1, visible: true },
      { fieldId: 'f_cg_3', name: 'Category', type: 'select', value: 'LLM Chatbot', options: ['LLM Chatbot', 'Code Assistant', 'Image Gen', 'Search'], position: 2, visible: true },
      { fieldId: 'f_cg_4', name: 'Pricing', type: 'text', value: 'Free / $20 Plus', position: 3, visible: true }
    ],
    tags: ['AI', 'LLM', 'OpenAI', 'Productivity'],
    isFavorite: true,
    isArchived: false,
    isDeleted: false,
    position: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item_react_hooks_notes',
    topicId: 'topic_dev_resources',
    title: 'React 19 useEffect & Lifecycle Notes',
    content: `### useEffect Important Concepts
1. **Dependency array**: Empty array runs once after initial mount.
2. **Cleanup function**: Essential for WebSockets, event listeners, and timers.
3. **Effects run after render**: Avoid placing calculations that can be computed during render.
4. **Custom Hooks**: Extract stateful logic cleanly.`,
    fields: [
      { fieldId: 'f_rn_1', name: 'Documentation', type: 'url', value: 'https://react.dev/reference/react/useEffect', position: 0, visible: true },
      {
        fieldId: 'f_rn_2',
        name: 'Custom Hook Example',
        type: 'code',
        value: {
          language: 'javascript',
          code: `function useWindowSize() {
  const [size, setSize] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  React.useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}`
        },
        position: 1,
        visible: true
      }
    ],
    tags: ['Frontend', 'React', 'JavaScript', 'Notes'],
    isFavorite: true,
    isArchived: false,
    isDeleted: false,
    position: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item_client_acme',
    topicId: 'topic_client_projects',
    title: 'Acme SaaS Portal Redesign',
    content: 'Full redesign of client administrative dashboard and billing system.',
    fields: [
      { fieldId: 'f_ac_1', name: 'Client', type: 'text', value: 'Acme Corporation', position: 0, visible: true },
      { fieldId: 'f_ac_2', name: 'Live Website', type: 'url', value: 'https://acme-demo.example.com', position: 1, visible: true },
      { fieldId: 'f_ac_3', name: 'GitHub Repo', type: 'url', value: 'https://github.com/acme/portal', position: 2, visible: true },
      { fieldId: 'f_ac_4', name: 'Deadline', type: 'date', value: '2026-11-15', position: 3, visible: true },
      { fieldId: 'f_ac_5', name: 'Status', type: 'select', value: 'In Progress', options: ['Planning', 'In Progress', 'Completed', 'On Hold'], position: 4, visible: true },
      { fieldId: 'f_ac_6', name: 'Budget', type: 'number', value: 15000, position: 5, visible: true }
    ],
    tags: ['Client', 'SaaS', 'High Priority'],
    isFavorite: false,
    isArchived: false,
    isDeleted: false,
    position: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class StorageGateway {
  constructor() {
    this._initStorage();
  }

  _initStorage() {
    if (typeof window === 'undefined') return;
    try {
      if (!localStorage.getItem(STORAGE_KEYS.TOPICS)) {
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(SAMPLE_TOPICS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(SAMPLE_ITEMS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(SAMPLE_TEMPLATES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.EXPANDED_TOPICS)) {
        localStorage.setItem(STORAGE_KEYS.EXPANDED_TOPICS, JSON.stringify(['topic_ai_tools', 'topic_dev_resources', 'topic_client_projects']));
      }
    } catch (err) {
      console.error('Storage initialization failed:', err);
    }
  }

  getWorkspaceKey(baseKey) {
    const wsId = getActiveWorkspaceId() || 'default';
    return `${baseKey}_${wsId}`;
  }

  // --- TOPICS ---

  async fetchTopicsFromApi() {
    try {
      const apiTopics = await topicsApi.getTopics({ includeArchived: true });
      const list = Array.isArray(apiTopics) ? apiTopics : (Array.isArray(apiTopics?.data) ? apiTopics.data : []);
      this.saveLocalTopics(list);
      return list;
    } catch (err) {
      console.warn('Could not fetch topics from API, using cached topics:', err);
      return this.getLocalTopics();
    }
  }

  getLocalTopics() {
    try {
      const key = this.getWorkspaceKey(STORAGE_KEYS.TOPICS);
      const data = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEYS.TOPICS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveLocalTopics(topics) {
    try {
      const key = this.getWorkspaceKey(STORAGE_KEYS.TOPICS);
      localStorage.setItem(key, JSON.stringify(topics));
    } catch (err) {
      console.error('Error saving topics locally:', err);
    }
  }

  // --- ITEMS ---

  async fetchItemsFromApi() {
    try {
      const res = await itemsApi.getItems({ includeArchived: true, limit: 1000 });
      const apiItems = res.data?.data || res.data || (Array.isArray(res) ? res : []);
      const list = Array.isArray(apiItems) ? apiItems : [];
      this.saveLocalItems(list);
      return list;
    } catch (err) {
      console.warn('Could not fetch items from API, using cached items:', err);
      return this.getLocalItems();
    }
  }

  // Backward compatibility alias for links
  async fetchLinksFromApi() {
    return this.fetchItemsFromApi();
  }

  getLocalItems() {
    try {
      const key = this.getWorkspaceKey(STORAGE_KEYS.ITEMS);
      const data = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEYS.ITEMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Backward compatibility alias
  getLocalLinks() {
    return this.getLocalItems();
  }

  saveLocalItems(items) {
    try {
      const key = this.getWorkspaceKey(STORAGE_KEYS.ITEMS);
      localStorage.setItem(key, JSON.stringify(items));
    } catch (err) {
      console.error('Error saving items locally:', err);
    }
  }

  // Backward compatibility alias
  saveLocalLinks(links) {
    this.saveLocalItems(links);
  }

  // --- TEMPLATES ---

  async fetchTemplatesFromApi() {
    try {
      const apiTemplates = await templatesApi.getTemplates();
      if (Array.isArray(apiTemplates)) {
        this.saveLocalTemplates(apiTemplates);
        return apiTemplates;
      }
    } catch (err) {
      console.warn('Could not fetch templates from API, using local cache:', err);
    }
    return this.getLocalTemplates();
  }

  getLocalTemplates() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      return data ? JSON.parse(data) : SAMPLE_TEMPLATES;
    } catch {
      return SAMPLE_TEMPLATES;
    }
  }

  saveLocalTemplates(templates) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    } catch (err) {
      console.error('Error saving templates locally:', err);
    }
  }

  // --- SETTINGS ---

  async fetchSettingsFromApi() {
    try {
      const apiSettings = await settingsApi.getSettings();
      if (apiSettings) {
        const merged = { ...DEFAULT_SETTINGS, ...apiSettings };
        this.saveLocalSettings(merged);
        return merged;
      }
    } catch (err) {
      console.warn('Could not fetch settings from API, using local cache:', err);
    }
    return this.getLocalSettings();
  }

  getLocalSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveLocalSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.error('Error saving settings locally:', err);
    }
  }

  // --- EXPANDED TOPIC IDS ---

  getExpandedTopicIds() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPANDED_TOPICS);
      return data ? JSON.parse(data) : ['topic_ai_tools', 'topic_dev_resources', 'topic_client_projects'];
    } catch {
      return ['topic_ai_tools', 'topic_dev_resources', 'topic_client_projects'];
    }
  }

  saveExpandedTopicIds(ids) {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPANDED_TOPICS, JSON.stringify(ids));
    } catch (err) {
      console.error('Error saving expanded topics:', err);
    }
  }

  saveSettings(settings) {
    this.saveLocalSettings(settings);
    return this.getLocalSettings();
  }

  toggleTopicExpanded(topicId) {
    const current = this.getExpandedTopicIds();
    const index = current.indexOf(topicId);
    let updated;
    if (index > -1) {
      updated = current.filter(id => id !== topicId);
    } else {
      updated = [...current, topicId];
    }
    this.saveExpandedTopicIds(updated);
    return updated;
  }


  // --- CRUD HELPERS FOR LOCAL/OFFLINE USE ---

  createLink(linkData) {
    const items = this.getLocalItems();
    const newItem = {
      ...linkData,
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      fields: linkData.fields || (linkData.url ? [{ fieldId: `f_${Date.now()}`, name: 'Website', type: 'url', value: linkData.url, position: 0, visible: true }] : []),
      tags: linkData.tags || [],
      isFavorite: Boolean(linkData.isFavorite),
      isArchived: false,
      isDeleted: false,
      position: items.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveLocalItems([...items, newItem]);
    return newItem;
  }

  updateLink(linkId, updates) {
    const items = this.getLocalItems();
    const updatedItems = items.map(l => (l.id === linkId || l._id === linkId) ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l);
    this.saveLocalItems(updatedItems);
    return updatedItems.find(l => l.id === linkId || l._id === linkId);
  }

  deleteLink(linkId, permanent = false) {
    const items = this.getLocalItems();
    let updated;
    if (permanent) {
      updated = items.filter(l => l.id !== linkId && l._id !== linkId);
    } else {
      updated = items.map(l => (l.id === linkId || l._id === linkId) ? { ...l, isDeleted: true, updatedAt: new Date().toISOString() } : l);
    }
    this.saveLocalItems(updated);
  }

  restoreLink(linkId) {
    const items = this.getLocalItems();
    const updated = items.map(l => (l.id === linkId || l._id === linkId) ? { ...l, isDeleted: false, updatedAt: new Date().toISOString() } : l);
    this.saveLocalItems(updated);
  }

  createTopic(topicData) {
    const topics = this.getLocalTopics();
    const newTopic = {
      ...topicData,
      id: `topic_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      isFavorite: Boolean(topicData.isFavorite),
      isPinned: Boolean(topicData.isPinned),
      isArchived: false,
      isDeleted: false,
      position: topics.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveLocalTopics([...topics, newTopic]);
    return newTopic;
  }

  updateTopic(topicId, updates) {
    const topics = this.getLocalTopics();
    const updatedTopics = topics.map(t => (t.id === topicId || t._id === topicId) ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t);
    this.saveLocalTopics(updatedTopics);
    return updatedTopics.find(t => t.id === topicId || t._id === topicId);
  }

  deleteTopic(topicId, permanent = false) {
    const topics = this.getLocalTopics();
    let updatedTopics;
    if (permanent) {
      updatedTopics = topics.filter(t => t.id !== topicId && t._id !== topicId);
      const items = this.getLocalItems().filter(l => l.topicId !== topicId);
      this.saveLocalItems(items);
    } else {
      updatedTopics = topics.map(t => (t.id === topicId || t._id === topicId) ? { ...t, isDeleted: true, updatedAt: new Date().toISOString() } : t);
      const items = this.getLocalItems().map(l => l.topicId === topicId ? { ...l, isDeleted: true } : l);
      this.saveLocalItems(items);
    }
    this.saveLocalTopics(updatedTopics);
  }

  restoreTopic(topicId) {
    const topics = this.getLocalTopics();
    const updatedTopics = topics.map(t => (t.id === topicId || t._id === topicId) ? { ...t, isDeleted: false, updatedAt: new Date().toISOString() } : t);
    this.saveLocalTopics(updatedTopics);
    const items = this.getLocalItems().map(l => l.topicId === topicId ? { ...l, isDeleted: false } : l);
    this.saveLocalItems(items);
  }

  emptyTrash() {
    const topics = this.getLocalTopics().filter(t => !t.isDeleted);
    const items = this.getLocalItems().filter(l => !l.isDeleted);
    this.saveLocalTopics(topics);
    this.saveLocalItems(items);
  }

  createFullBackup() {
    const backupObj = {
      app: 'LinkVault',
      version: 2,
      exportedAt: new Date().toISOString(),
      topics: this.getLocalTopics(),
      templates: this.getLocalTemplates(),
      items: this.getLocalItems(),
      settings: this.getLocalSettings()
    };
    return JSON.stringify(backupObj, null, 2);
  }

  restoreFullBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.topics)) {
        this.saveLocalTopics(data.topics);
      }
      if (Array.isArray(data.items)) {
        this.saveLocalItems(data.items);
      }
      if (Array.isArray(data.templates)) {
        this.saveLocalTemplates(data.templates);
      }
      if (data.settings && typeof data.settings === 'object') {
        this.saveLocalSettings(data.settings);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  resetToSampleData() {
    this.saveLocalTopics(SAMPLE_TOPICS);
    this.saveLocalItems(SAMPLE_ITEMS);
    this.saveLocalTemplates(SAMPLE_TEMPLATES);
    this.saveLocalSettings(DEFAULT_SETTINGS);
    this.saveExpandedTopicIds(['topic_ai_tools', 'topic_dev_resources', 'topic_client_projects']);
  }

  clearAllData() {
    this.saveLocalTopics([]);
    this.saveLocalItems([]);
    this.saveLocalTemplates([]);
    this.saveExpandedTopicIds([]);
  }
}

export const storage = new StorageGateway();

