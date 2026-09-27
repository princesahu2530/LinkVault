import React, { useState } from 'react';
import {
  Star,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
  Check
} from 'lucide-react';
import { FieldRenderer } from '../fields/FieldRenderer';

export function LinkRow({
  link: item,
  columns = ['title', 'tags', 'createdAt'],
  onEdit,
  onDelete,
  onToggleFavorite,
  onViewNotes,
  isSelected = false,
  onToggleSelect
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const fieldsMap = new Map();
  (item.fields || []).forEach(f => {
    fieldsMap.set(f.name.toLowerCase(), f);
    fieldsMap.set(f.name, f);
  });

  const urlField = item.fields?.find(f => f.type === 'url');

  return (
    <tr
      onClick={() => onViewNotes(item)}
      className={`border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-xs ${
        isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : ''
      }`}
    >
      {/* Checkbox */}
      <td
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(item.id || item._id);
        }}
        className="py-3 px-3 w-10 text-center"
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 cursor-pointer"
        />
      </td>

      {/* Favorite Star */}
      <td
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(item.id || item._id);
        }}
        className="py-3 px-2 w-8 text-center"
      >
        <button
          type="button"
          className={`p-1 rounded transition-colors ${
            item.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      </td>

      {/* Dynamic Columns */}
      {columns.map((colName) => {
        const lowerCol = colName.toLowerCase();

        if (lowerCol === 'title') {
          return (
            <td key={colName} className="py-3 px-3 max-w-[220px]">
              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {item.title || urlField?.value || 'Untitled'}
              </div>
            </td>
          );
        }

        if (lowerCol === 'content' || lowerCol === 'notes') {
          return (
            <td key={colName} className="py-3 px-3 max-w-[200px] text-slate-500 dark:text-slate-400 truncate">
              {item.content || item.notes || '-'}
            </td>
          );
        }

        if (lowerCol === 'tags') {
          return (
            <td key={colName} className="py-3 px-3">
              <div className="flex flex-wrap gap-1 max-w-[180px]">
                {item.tags?.slice(0, 3).map((t, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium"
                  >
                    #{t}
                  </span>
                ))}
                {item.tags && item.tags.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{item.tags.length - 3}</span>
                )}
              </div>
            </td>
          );
        }

        if (lowerCol === 'createdat' || lowerCol === 'date') {
          return (
            <td key={colName} className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
            </td>
          );
        }

        // Custom field lookup
        const customField = fieldsMap.get(colName) || fieldsMap.get(lowerCol);
        if (customField) {
          return (
            <td key={colName} className="py-3 px-3 max-w-[180px]">
              <FieldRenderer field={customField} isCompact={true} />
            </td>
          );
        }

        return (
          <td key={colName} className="py-3 px-3 text-slate-400">
            -
          </td>
        );
      })}

      {/* Row Actions */}
      <td onClick={(e) => e.stopPropagation()} className="py-3 px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onViewNotes(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item.id || item._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
