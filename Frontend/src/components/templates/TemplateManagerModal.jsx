import React, { useState } from 'react';
import {
  X,
  Plus,
  Copy,
  Trash2,
  Edit2,
  LayoutTemplate,
  Check,
  Sparkles,
  Layers
} from 'lucide-react';
import { FieldEditor } from '../fields/FieldEditor';
import { AddFieldModal } from '../fields/AddFieldModal';

export function TemplateManagerModal({
  isOpen,
  onClose,
  templates = [],
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate
}) {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([]);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingTemplate('new');
    setName('');
    setDescription('');
    setFields([
      { name: 'Website', type: 'url', required: false, position: 0 },
      { name: 'Notes', type: 'longText', required: false, position: 1 }
    ]);
  };

  const handleStartEdit = (template) => {
    setEditingTemplate(template);
    setName(template.name || '');
    setDescription(template.description || '');
    setFields(template.fields || []);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingTemplate === 'new') {
      await onCreateTemplate({
        name: name.trim(),
        description: description.trim(),
        fields
      });
    } else {
      await onUpdateTemplate(editingTemplate.id || editingTemplate._id, {
        name: name.trim(),
        description: description.trim(),
        fields
      });
    }

    setEditingTemplate(null);
  };

  const handleAddField = (newField) => {
    setFields(prev => [...prev, { ...newField, position: prev.length }]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {editingTemplate ? (editingTemplate === 'new' ? 'Create Custom Template' : 'Edit Template') : 'Custom Field Templates'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create reusable field presets for rapid item creation
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (editingTemplate) setEditingTemplate(null);
              else onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!editingTemplate ? (
            /* Templates List View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Available Templates ({templates.length})
                </span>
                <button
                  onClick={handleStartCreate}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Template
                </button>
              </div>

              {templates.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <LayoutTemplate className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Templates Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Create reusable field templates like "Client Projects", "Book Notes", or "API Research".
                  </p>
                  <button
                    onClick={handleStartCreate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Create First Template
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {templates.map((tmpl) => (
                    <div
                      key={tmpl.id || tmpl._id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {tmpl.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold">
                            {tmpl.fields?.length || 0} fields
                          </span>
                        </div>
                        {tmpl.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {tmpl.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {tmpl.fields?.map((f, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300"
                            >
                              {f.name} ({f.type})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(tmpl)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Edit Template"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDuplicateTemplate(tmpl.id || tmpl._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Duplicate Template"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTemplate(tmpl.id || tmpl._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Template Editor Form */
            <form id="templateForm" onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Template Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Website Research, Client Spec, Book Notes"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional summary of what this template is for"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              {/* Defined Fields */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Template Fields ({fields.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddFieldOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Field
                  </button>
                </div>

                <div className="space-y-2.5">
                  {fields.map((field, idx) => (
                    <FieldEditor
                      key={idx}
                      field={field}
                      isTemplate={true}
                      onChange={(updatedField) => {
                        const newFields = [...fields];
                        newFields[idx] = updatedField;
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
            </form>
          )}
        </div>

        {/* Footer */}
        {editingTemplate && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={() => setEditingTemplate(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="templateForm"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              Save Template
            </button>
          </div>
        )}
      </div>

      <AddFieldModal
        isOpen={isAddFieldOpen}
        onClose={() => setIsAddFieldOpen(false)}
        onAddField={handleAddField}
      />
    </div>
  );
}
