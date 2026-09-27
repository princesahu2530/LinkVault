import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { COLOR_PALETTES, ICON_PRESETS } from '../../utils/helpers';
import { IconRenderer } from '../ui/IconRenderer';
import { useToast } from '../ui/ToastContext';

export function AddTopicModal({ isOpen, onClose, onTopicCreated, templates = [] }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_PALETTES[0].value);
  const [icon, setIcon] = useState('Folder');
  const [defaultTemplateId, setDefaultTemplateId] = useState('');
  const [defaultView, setDefaultView] = useState('cards');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setColor(COLOR_PALETTES[0].value);
      setIcon('Folder');
      setDefaultTemplateId('');
      setDefaultView('cards');
      setIsPinned(false);
      setIsFavorite(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Topic name is required');
      return;
    }

    onTopicCreated({
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      defaultTemplateId: defaultTemplateId || null,
      defaultView,
      isPinned,
      isFavorite
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Topic"
      description="Organize your knowledge, notes, URLs, and projects."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Topic Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. AI Research, Client Specs, Book Notes"
            autoFocus
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800/80 border ${
              error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
            } text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
          />
          {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Briefly describe what belongs in this workspace..."
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Default Template & Default View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Default Template
            </label>
            <select
              value={defaultTemplateId}
              onChange={(e) => setDefaultTemplateId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="">-- None (Custom Fields) --</option>
              {templates.map((tmpl) => (
                <option key={tmpl.id || tmpl._id} value={tmpl.id || tmpl._id}>
                  {tmpl.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Default View
            </label>
            <select
              value={defaultView}
              onChange={(e) => setDefaultView(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="cards">Cards Grid</option>
              <option value="table">Table (Columns)</option>
              <option value="compact">Compact List</option>
            </select>
          </div>
        </div>

        {/* Icon & Color Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Icon
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 max-h-32 overflow-y-auto">
              {ICON_PRESETS.map((iconName) => {
                const isSelected = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm scale-105'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <IconRenderer name={iconName} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Color Accent
            </label>
            <div className="grid grid-cols-4 gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              {COLOR_PALETTES.map((palette) => {
                const isSelected = color === palette.value;
                return (
                  <button
                    key={palette.name}
                    type="button"
                    title={palette.name}
                    onClick={() => setColor(palette.value)}
                    className={`h-8 rounded-lg transition-all flex items-center justify-center ${
                      isSelected ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105 shadow-sm' : 'hover:opacity-80'
                    }`}
                    style={{ backgroundColor: palette.value }}
                  >
                    {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
            />
            <span>📌 Pin to top</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
            />
            <span>⭐ Add to Favorites</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            Create Topic
          </button>
        </div>
      </form>
    </Modal>
  );
}
