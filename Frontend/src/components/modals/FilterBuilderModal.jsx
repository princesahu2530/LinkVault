import React, { useState } from 'react';
import { X, Filter, Plus, Trash2, Check, Sparkles } from 'lucide-react';

const FIELD_OPTIONS = [
  { id: 'title', label: 'Title / Name', type: 'text' },
  { id: 'topic', label: 'Topic / Collection', type: 'text' },
  { id: 'status', label: 'Status', type: 'select', options: ['Planning', 'In Progress', 'Completed', 'Hired', 'Interview', 'Active'] },
  { id: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
  { id: 'isFavorite', label: 'Starred / Favorite', type: 'boolean' },
  { id: 'isArchived', label: 'Archived', type: 'boolean' },
  { id: 'dueDate', label: 'Due Date', type: 'date' }
];

const OPERATORS = [
  { id: 'equals', label: 'equals' },
  { id: 'not_equals', label: 'does not equal' },
  { id: 'contains', label: 'contains' },
  { id: 'starts_with', label: 'starts with' },
  { id: 'is_empty', label: 'is empty' },
  { id: 'is_not_empty', label: 'is not empty' }
];

export default function FilterBuilderModal({ isOpen, onClose, onApplyFilters, initialFilters = [] }) {
  const [rules, setRules] = useState(initialFilters.length > 0 ? initialFilters : [
    { field: 'title', operator: 'contains', value: '' }
  ]);
  const [conjunction, setConjunction] = useState('AND'); // 'AND' | 'OR'

  if (!isOpen) return null;

  const handleAddRule = () => {
    setRules(prev => [...prev, { field: 'status', operator: 'equals', value: 'In Progress' }]);
  };

  const handleRemoveRule = (index) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index, key, val) => {
    setRules(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: val };
      return next;
    });
  };

  const handleApply = (e) => {
    e.preventDefault();
    onApplyFilters({ conjunction, rules });
    onClose();
  };

  const handleReset = () => {
    setRules([]);
    onApplyFilters({ conjunction: 'AND', rules: [] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Visual Filter Builder</h2>
              <p className="text-xs text-slate-400">Build advanced compound criteria with AND / OR logic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleApply} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Conjunction Switcher */}
          <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Match items matching:</span>
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setConjunction('AND')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  conjunction === 'AND' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ALL Rules (AND)
              </button>
              <button
                type="button"
                onClick={() => setConjunction('OR')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  conjunction === 'OR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ANY Rule (OR)
              </button>
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                <select
                  value={rule.field}
                  onChange={(e) => handleRuleChange(idx, 'field', e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {FIELD_OPTIONS.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>

                <select
                  value={rule.operator}
                  onChange={(e) => handleRuleChange(idx, 'operator', e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  {OPERATORS.map(op => (
                    <option key={op.id} value={op.id}>{op.label}</option>
                  ))}
                </select>

                {!['is_empty', 'is_not_empty'].includes(rule.operator) && (
                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => handleRuleChange(idx, 'value', e.target.value)}
                    placeholder="Value to filter..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors flex-shrink-0"
                  title="Remove rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddRule}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-500/30 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Filter Condition</span>
          </button>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              Clear All Filters
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
