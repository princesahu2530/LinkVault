import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Star,
  Tag,
  Folder,
  Sparkles,
  LayoutTemplate,
  FileText,
  Eye,
  Check
} from 'lucide-react';
import { FieldEditor } from '../fields/FieldEditor';
import { AddFieldModal } from '../fields/AddFieldModal';

export function AddLinkModal({
  isOpen,
  onClose,
  onAdd,
  topics = [],
  templates = [],
  defaultTopicId = null
}) {
  const [topicId, setTopicId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fields, setFields] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('fields'); // 'fields' | 'content'
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialTopicId = defaultTopicId || (topics[0]?.id || topics[0]?._id) || '';
      setTopicId(initialTopicId);

      // Check if topic has default template
      const targetTopic = topics.find(t => (t.id || t._id) === initialTopicId);
      if (targetTopic?.defaultTemplateId) {
        const tmpl = templates.find(t => (t.id || t._id) === targetTopic.defaultTemplateId);
        if (tmpl) {
          setSelectedTemplateId(tmpl.id || tmpl._id);
          setFields(tmpl.fields?.map(f => ({ ...f, fieldId: `f_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`, value: f.defaultValue ?? '' })) || []);
        }
      } else {
        setSelectedTemplateId('');
        // Default initial URL & Description field for quick start
        setFields([
          { fieldId: `f_url_${Date.now()}`, name: 'Website', type: 'url', value: '', position: 0, required: false, visible: true }
        ]);
      }

      setTitle('');
      setContent('');
      setTags([]);
      setTagInput('');
      setIsFavorite(false);
      setActiveTab('fields');
    }
  }, [isOpen, defaultTopicId, topics, templates]);

  if (!isOpen) return null;

  const handleTemplateChange = (tmplId) => {
    setSelectedTemplateId(tmplId);
    if (!tmplId) return;

    const tmpl = templates.find(t => (t.id || t._id) === tmplId);
    if (tmpl && Array.isArray(tmpl.fields)) {
      const tmplFields = tmpl.fields.map((f, idx) => ({
        fieldId: `f_${Date.now().toString(36)}_${idx}`,
        name: f.name,
        type: f.type,
        value: f.defaultValue ?? '',
        options: f.options || [],
        position: idx,
        required: f.required || false,
        visible: true
      }));
      setFields(tmplFields);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddField = (newField) => {
    setFields(prev => [...prev, { ...newField, position: prev.length }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onAdd({
      topicId: topicId || undefined,
      templateId: selectedTemplateId || undefined,
      title: title.trim(),
      content: content.trim(),
      fields,
      tags,
      isFavorite
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Create New Item
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add URLs, structured data, markdown notes, or custom fields
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form id="addItemForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Topic & Template Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-indigo-500" />
                Target Topic <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {topics.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <LayoutTemplate className="w-3.5 h-3.5 text-indigo-500" />
                Apply Template (Optional)
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="">-- Custom (No Template) --</option>
                {templates.map((tmpl) => (
                  <option key={tmpl.id || tmpl._id} value={tmpl.id || tmpl._id}>
                    {tmpl.name} ({tmpl.fields?.length || 0} fields)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Item Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React Documentation, Client Project Specs, Quick Notes..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Tabs: Custom Fields vs Main Notes */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('fields')}
              className={`pb-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'fields'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Custom Fields ({fields.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`pb-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'content'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Main Notes & Content
            </button>
          </div>

          {/* Tab 1: Custom Fields */}
          {activeTab === 'fields' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Define any fields: Website URLs, Dates, Numbers, Status, Code, or JSON
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddFieldOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Field
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="py-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 mb-2">No custom fields added yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsAddFieldOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Add First Field
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {fields.map((field, idx) => (
                    <FieldEditor
                      key={field.fieldId || idx}
                      field={field}
                      onChange={(updated) => {
                        const newFields = [...fields];
                        newFields[idx] = updated;
                        setFields(newFields);
                      }}
                      onRemove={() => {
                        setFields(fields.filter((_, i) => i !== idx));
                      }}
                      onMoveUp={() => {
                        if (idx === 0) return;
                        const newFields = [...fields];
                        const temp = newFields[idx - 1];
                        newFields[idx - 1] = newFields[idx];
                        newFields[idx] = temp;
                        setFields(newFields);
                      }}
                      onMoveDown={() => {
                        if (idx === fields.length - 1) return;
                        const newFields = [...fields];
                        const temp = newFields[idx + 1];
                        newFields[idx + 1] = newFields[idx];
                        newFields[idx] = temp;
                        setFields(newFields);
                      }}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < fields.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Main Notes & Content */}
          {activeTab === 'content' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Markdown Notes / Extended Content
              </label>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write long-form markdown notes, research summaries, or documentation..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-indigo-900 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? 'Type tag and press Enter...' : '+ Tag...'}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none py-1"
              />
            </div>
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Pin to Favorites
              </span>
            </div>
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="addItemForm"
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30"
          >
            <Check className="w-4 h-4" />
            Save Item
          </button>
        </div>
      </div>

      <AddFieldModal
        isOpen={isAddFieldOpen}
        onClose={() => setIsAddFieldOpen(false)}
        onAddField={handleAddField}
      />
    </div>
  );
}
