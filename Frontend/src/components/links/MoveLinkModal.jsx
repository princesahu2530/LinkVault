import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { storage } from '../../services/storage';
import { useToast } from '../ui/ToastContext';
import { FolderSymlink } from 'lucide-react';

export function MoveLinkModal({ isOpen, onClose, link, topics, onLinkMoved }) {
  const [targetTopicId, setTargetTopicId] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    if (link && isOpen) {
      // Pick first different topic as default
      const diffTopic = topics.find(t => t.id !== link.topicId && !t.isDeleted);
      setTargetTopicId(diffTopic ? diffTopic.id : (topics[0]?.id || ''));
    }
  }, [link, isOpen, topics]);

  const handleMove = (e) => {
    e.preventDefault();
    if (!link || !targetTopicId) return;

    const success = storage.moveLink(link.id, targetTopicId);
    if (success) {
      const destTopic = topics.find(t => t.id === targetTopicId);
      addToast({
        title: 'Link Moved',
        message: `"${link.title}" moved to "${destTopic?.name}".`,
        type: 'success'
      });
      onLinkMoved();
      onClose();
    }
  };

  if (!link) return null;

  const activeTopics = topics.filter(t => !t.isDeleted);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Move Link to Another Topic"
      description={`Choose where you'd like to relocate "${link.title}".`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleMove} className="space-y-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300">
          Current Topic: <strong className="text-slate-900 dark:text-slate-100">{topics.find(t => t.id === link.topicId)?.name || 'Unknown'}</strong>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Destination Topic
          </label>
          <select
            value={targetTopicId}
            onChange={(e) => setTargetTopicId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {activeTopics.map(topic => (
              <option key={topic.id} value={topic.id} disabled={topic.id === link.topicId}>
                {topic.name} {topic.id === link.topicId ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

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
            disabled={targetTopicId === link.topicId}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md transition-all"
          >
            <FolderSymlink className="w-4 h-4" />
            Move Link
          </button>
        </div>
      </form>
    </Modal>
  );
}
