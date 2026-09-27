import React, { useState } from 'react';
import { Columns3, Check } from 'lucide-react';
import { LinkRow } from './LinkRow';

export function LinkTable({
  links = [],
  columns: initialColumns = ['title', 'tags', 'createdAt'],
  onUpdateColumns,
  onEdit,
  onDelete,
  onToggleFavorite,
  onViewNotes,
  selectedLinkIds = [],
  onToggleSelect,
  onSelectAll
}) {
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const [columns, setColumns] = useState(initialColumns);

  // Collect all unique custom field names across items in this table
  const allAvailableColumnsSet = new Set(['title', 'content', 'tags', 'createdAt']);
  links.forEach(item => {
    item.fields?.forEach(f => {
      if (f.name) allAvailableColumnsSet.add(f.name);
    });
  });
  const allAvailableColumns = Array.from(allAvailableColumnsSet);

  const toggleColumn = (colName) => {
    let updated;
    if (columns.includes(colName)) {
      if (columns.length === 1) return; // Keep at least one column
      updated = columns.filter(c => c !== colName);
    } else {
      updated = [...columns, colName];
    }
    setColumns(updated);
    if (onUpdateColumns) onUpdateColumns(updated);
  };

  const isAllSelected = links.length > 0 && links.every(l => selectedLinkIds.includes(l.id || l._id));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <span className="font-medium">
          Showing {links.length} {links.length === 1 ? 'item' : 'items'}
        </span>

        {/* Customize Columns Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            <Columns3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Columns ({columns.length})</span>
          </button>

          {isColumnPickerOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsColumnPickerOpen(false)} />
              <div className="absolute right-0 top-8 z-30 w-52 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-2 animate-scale-up space-y-1 max-h-60 overflow-y-auto">
                <div className="px-2 py-1 font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                  Select Columns
                </div>
                {allAvailableColumns.map((col) => {
                  const isChecked = columns.includes(col);
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => toggleColumn(col)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-slate-700 dark:text-slate-200"
                    >
                      <span className="capitalize">{col}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
              </th>
              <th className="py-3 px-2 w-8 text-center"></th>
              {columns.map((col) => (
                <th key={col} className="py-3 px-3 font-semibold">
                  {col}
                </th>
              ))}
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((item) => (
              <LinkRow
                key={item.id || item._id}
                link={item}
                columns={columns}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                onViewNotes={onViewNotes}
                isSelected={selectedLinkIds.includes(item.id || item._id)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
