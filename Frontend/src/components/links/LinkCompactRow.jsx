import React, { useState } from 'react';
import {
  Star,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Copy,
  Check
} from 'lucide-react';
import { FieldRenderer } from '../fields/FieldRenderer';

export function LinkCompactRow({
  link: item,
  onEdit,
  onDelete,
  onToggleFavorite,
  onViewNotes,
  isSelected = false,
  onToggleSelect
}) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const fields = item.fields || [];
  const urlField = fields.find(f => f.type === 'url');
  const primaryCustomField = fields.find(f => f.type !== 'url' && f.type !== 'code' && f.visible !== false);

  return (
    <div
      onClick={() => onViewNotes(item)}
      className={`group flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
      }`}
    >
      {/* Left: Checkbox + Star + Title */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(item.id || item._id);
          }}
          className="shrink-0"
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 dark:border-slate-700 cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id || item._id);
          }}
          className={`shrink-0 p-0.5 transition-colors ${
            item.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
        </button>

        <span className="font-medium text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
          {item.title || urlField?.value || 'Untitled'}
        </span>

        {/* Primary custom field badge if present */}
        {primaryCustomField && (
          <div className="hidden sm:block shrink-0 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
            <FieldRenderer field={primaryCustomField} isCompact={true} />
          </div>
        )}
      </div>

      {/* Right: Tags + Quick Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Tags */}
        <div className="hidden md:flex items-center gap-1">
          {item.tags?.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewNotes(item)}
            className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item.id || item._id)}
            className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
