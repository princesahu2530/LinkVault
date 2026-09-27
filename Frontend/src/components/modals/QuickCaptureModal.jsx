import React, { useState, useEffect } from 'react';
import { itemsApi } from '../../api/items.api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  X, 
  Zap, 
  Link2, 
  FileText, 
  AlertTriangle, 
  Check, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function QuickCaptureModal({ isOpen, onClose, topics = [], onCreated, onOpenExisting }) {
  const { activeWorkspaceId } = useWorkspace();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState(topics[0]?.id || topics[0]?._id || '');
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateItem, setDuplicateItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (topics.length > 0 && !topicId) {
      setTopicId(topics[0].id || topics[0]._id);
    }
  }, [topics, topicId]);

  // Check URL duplicate debounced
  useEffect(() => {
    const trimmed = content.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const timer = setTimeout(async () => {
        try {
          setIsCheckingDuplicate(true);
          const res = await itemsApi.checkDuplicateUrl(trimmed);
          if (res.exists && res.item) {
            setDuplicateItem(res.item);
          } else {
            setDuplicateItem(null);
          }
        } catch {
          setDuplicateItem(null);
        } finally {
          setIsCheckingDuplicate(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDuplicateItem(null);
    }
  }, [content]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      const isUrl = content.trim().startsWith('http://') || content.trim().startsWith('https://');
      
      const payload = {
        title: title.trim() || (isUrl ? content.trim() : 'Quick Note'),
        topicId: topicId || undefined,
        workspaceId: activeWorkspaceId,
        url: isUrl ? content.trim() : undefined,
        content: !isUrl ? content.trim() : undefined
      };

      const created = await itemsApi.createItem(payload);
      if (onCreated) onCreated(created);
      setContent('');
      setTitle('');
      setDuplicateItem(null);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to quick capture item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Universal Quick Capture</h2>
              <p className="text-xs text-slate-400">Paste any URL, snippet, or note for instant saving</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Duplicate Warning */}
          {duplicateItem && (
            <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Duplicate URL Detected</span>
              </div>
              <p className="text-xs text-slate-300">
                This link was already saved as <strong className="text-white">"{duplicateItem.title}"</strong>.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenExisting) onOpenExisting(duplicateItem);
                  }}
                  className="px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/40 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Existing Item</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              URL, Note or Raw Content <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste https://... or type quick thoughts..."
              rows={3}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-mono text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Defaults to URL or quick note label..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {topics.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Topic
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {topics.map(t => (
                  <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Capturing...' : 'Capture Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
