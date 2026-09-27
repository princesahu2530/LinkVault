import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { normalizeUrl } from '../../utils/helpers';
import { storage } from '../../services/storage';
import { useToast } from '../ui/ToastContext';
import { Zap, Globe } from 'lucide-react';

export function QuickAddModal({ isOpen, onClose, topics, onLinkAdded }) {
  const [topicId, setTopicId] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTopicId(topics[0]?.id || topics[0]?._id || '');
      setUrl('');
      setTitle('');
      setDescription('');
      setError('');
    }
  }, [isOpen, topics]);

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    if (error) setError('');

    if (val.trim() && !title) {
      const { isValid, url: validUrl } = normalizeUrl(val);
      if (isValid) {
        try {
          const parsed = new URL(validUrl);
          const domain = parsed.hostname.replace(/^www\./, '').split('.')[0];
          if (domain) {
            setTitle(domain.charAt(0).toUpperCase() + domain.slice(1));
          }
        } catch {
          // ignore
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('URL cannot be empty.');
      return;
    }

    const { isValid, url: formattedUrl } = normalizeUrl(url);
    if (!isValid) {
      setError('Please provide a valid URL.');
      return;
    }

    const finalTitle = title.trim() || formattedUrl;
    const selectedTopic = topics.find(t => (t.id || t._id) === topicId) || topics[0];
    const finalTopicId = selectedTopic ? (selectedTopic.id || selectedTopic._id) : topicId;

    onLinkAdded({
      topicId: finalTopicId || undefined,
      title: finalTitle,
      url: formattedUrl,
      fields: [
        { fieldId: `f_${Date.now()}_url`, name: 'Website', type: 'url', value: formattedUrl, position: 0, visible: true },
        ...(description.trim() ? [{ fieldId: `f_${Date.now()}_desc`, name: 'Description', type: 'longText', value: description.trim(), position: 1, visible: true }] : [])
      ],
      tags: [],
      isFavorite: false
    });

    onClose();
  };

  const activeTopics = topics.filter(t => !t.isDeleted);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚡ Quick Add Link"
      description="Save a link in 3 seconds. Press Enter to submit."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Destination URL <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Paste or type URL (e.g. github.com)"
              autoFocus
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Topic {activeTopics.length > 0 && <span className="text-rose-500">*</span>}
          </label>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {activeTopics.length === 0 && (
              <option value="">Default Collection (Auto-created)</option>
            )}
            {activeTopics.map(t => (
              <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Title <span className="text-slate-400 font-normal lowercase">(auto-detected)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            Quick Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
