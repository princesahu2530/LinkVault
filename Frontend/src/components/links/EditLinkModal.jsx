import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Star,
  Tag,
  Folder,
  Sparkles,
  FileText,
  Check
} from 'lucide-react';
import { FieldEditor } from '../fields/FieldEditor';
import { AddFieldModal } from '../fields/AddFieldModal';

export function EditLinkModal({
  isOpen,
  onClose,
  item,
  onSave,
  topics = []
}) {
  const [topicId, setTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fields, setFields] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('fields');
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setTopicId(item.topicId || (topics[0]?.id || topics[0]?._id) || '');
      setTitle(item.title || '');
      setContent(item.content || item.notes || '');

      // Ensure fields array
      let initialFields = item.fields || [];
      if (initialFields.length === 0 && item.url) {
        initialFields = [
          { fieldId: `f_url_${Date.now()}`, name: 'Website', type: 'url', value: item.url, position: 0, required: false, visible: true },
          ...(item.description ? [{ fieldId: `f_desc_${Date.now()}`, name: 'Description', type: 'longText', value: item.description, position: 1, required: false, visible: true }] : [])
        ];
      }
      setFields(initialFields);
      setTags(item.tags || []);
      setTagInput('');
      setIsFavorite(Boolean(item.isFavorite));
      setActiveTab('fields');
    }
  }, [isOpen, item, topics]);

  if (!isOpen || !item) return null;

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

    onSave(item.id || item._id, {
      topicId: topicId || undefined,
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Edit Item
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update content, custom fields, and metadata
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

        {/* Body */}
        <form id="editItemForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-indigo-500" />
              Topic
            </label>
            <select
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

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Item title..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Tabs */}
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

          {/* Fields tab */}
          {activeTab === 'fields' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Custom fields associated with this item
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
            </div>
          )}

          {/* Content tab */}
          {activeTab === 'content' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Markdown Notes / Content
              </label>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write long-form markdown notes..."
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

        {/* Footer */}
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
            form="editItemForm"
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30"
          >
            <Check className="w-4 h-4" />
            Save Changes
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
