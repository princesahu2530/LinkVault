import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Calendar,
  Tag,
  Sparkles,
  Layers,
  Star,
  ExternalLink,
  MessageSquare,
  Activity,
  History
} from 'lucide-react';
import { FieldRenderer } from '../fields/FieldRenderer';
import CommentsPanel from '../collaboration/CommentsPanel';
import ActivityTimeline from '../collaboration/ActivityTimeline';
import VersionHistoryModal from '../collaboration/VersionHistoryModal';

export function NotesPreviewModal({ isOpen, onClose, link: item, topicName, onItemUpdated }) {
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'comments' | 'activity'
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const itemId = item.id || item._id;

  const handleCopyAll = () => {
    let payload = `Title: ${item.title || 'Untitled'}\n\n`;
    if (item.content || item.notes) {
      payload += `Notes:\n${item.content || item.notes}\n\n`;
    }
    if (item.fields && item.fields.length > 0) {
      payload += `Fields:\n`;
      item.fields.forEach(f => {
        payload += `${f.name}: ${typeof f.value === 'object' ? JSON.stringify(f.value) : f.value}\n`;
      });
    }
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fields = item.fields || item.customFields || [];
  const content = item.content || item.notes || '';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 truncate">
                  {item.title || 'Item Details'}
                </h2>
                {topicName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                    <span>Topic:</span>
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{topicName}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsVersionHistoryOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Version History"
              >
                <History className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Revisions</span>
              </button>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-6 text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Details & Fields</span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'comments'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comments & Mentions</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'activity'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Activity History</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Custom Fields Section */}
                {fields.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      Structured Fields ({fields.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {fields.map((f, i) => (
                        <div key={f.fieldId || f.id || i} className={['code', 'json', 'longText', 'markdown'].includes(f.type) ? 'sm:col-span-2' : ''}>
                          <FieldRenderer field={f} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Content / Markdown */}
                {content && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      Notes & Extended Content
                    </h4>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                      {content}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-500" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center gap-3">
                    {item.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Created: {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {item.isFavorite && (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> Favorited
                    </span>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <CommentsPanel itemId={itemId} />
            )}

            {activeTab === 'activity' && (
              <ActivityTimeline itemId={itemId} />
            )}
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        itemId={itemId}
        onItemRestored={(updated) => {
          if (onItemUpdated) onItemUpdated(updated);
        }}
      />
    </>
  );
}

