import React, { useState } from 'react';
import {
  Star,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  Archive,
  ArrowRightLeft,
  FileText,
  ExternalLink,
  Check,
  Eye
} from 'lucide-react';
import { FieldRenderer } from '../fields/FieldRenderer';

export function LinkCard({
  link: item,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleArchive,
  onDuplicate,
  onMove,
  onViewNotes,
  isSelected = false,
  onToggleSelect,
  isSelectionMode = false,
  compact = false
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const fields = item.fields || [];
  const urlField = fields.find(f => f.type === 'url' && f.value);
  const codeField = fields.find(f => f.type === 'code' && f.value);
  const otherFields = fields.filter(f => f.visible !== false && f.type !== 'code');
  const content = item.content || item.notes || '';

  const handleCopyTitle = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.title || urlField?.value || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => {
        if (isSelectionMode) {
          onToggleSelect(item.id || item._id);
        } else {
          onViewNotes(item);
        }
      }}
      className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer ${
        isMenuOpen ? 'z-30 overflow-visible' : 'overflow-hidden'
      } ${
        isSelected
          ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
          : 'bg-white dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900/60 hover:shadow-lg shadow-sm'
      }`}
    >
      <div className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Selection Checkbox */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(item.id || item._id);
              }}
              className="pt-0.5 shrink-0"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className={`w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 cursor-pointer transition-opacity ${
                  isSelectionMode || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              />
            </div>

            {/* Title & Topic info */}
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {item.title || urlField?.value || 'Untitled Item'}
              </h3>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.id || item._id);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                item.isFavorite
                  ? 'text-amber-500 hover:text-amber-600 dark:hover:text-amber-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-60 group-hover:opacity-100'
              }`}
              title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>

            {/* Context Menu Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Item Menu"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Context Dropdown */}
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                    }}
                  />
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-8 z-30 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 text-xs text-slate-700 dark:text-slate-200 animate-scale-up"
                  >
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onViewNotes(item);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-500" /> View Details
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onEdit(item);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-sky-500" /> Edit Item
                    </button>
                    <button
                      onClick={(e) => {
                        setIsMenuOpen(false);
                        handleCopyTitle(e);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Info
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDuplicate(item.id || item._id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      <Copy className="w-3.5 h-3.5 text-violet-500" /> Duplicate
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onMove(item);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" /> Move to Topic
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onToggleArchive(item.id || item._id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      <Archive className="w-3.5 h-3.5 text-slate-400" />
                      {item.isArchived ? 'Unarchive' : 'Archive'}
                    </button>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDelete(item.id || item._id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Snippet */}
        {content && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {content}
          </p>
        )}

        {/* Structured Custom Fields Preview */}
        {otherFields.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {otherFields.slice(0, 4).map((f, i) => (
              <FieldRenderer key={f.fieldId || i} field={f} isCompact={true} />
            ))}
            {otherFields.length > 4 && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                +{otherFields.length - 4} more fields
              </span>
            )}
          </div>
        )}

        {/* Code Field Preview */}
        {codeField && (
          <div className="pt-1">
            <FieldRenderer field={codeField} />
          </div>
        )}

        {/* Card Footer: Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            {item.tags.slice(0, 5).map((t, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium"
              >
                #{t}
              </span>
            ))}
            {item.tags.length > 5 && (
              <span className="text-[10px] text-slate-400">+{item.tags.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
