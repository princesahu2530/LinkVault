import React, { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Sparkles, 
  AlertCircle, 
  Link, 
  Mail, 
  FileText, 
  Phone, 
  Calendar, 
  Star, 
  Search,
  Code2,
  DollarSign,
  ToggleLeft,
  List,
  CheckSquare,
  Braces,
  Hash,
  User,
  Link2,
  FileCode,
  Tag
} from 'lucide-react';
import { FIELD_TYPES } from './FieldEditor';

const PRESET_CATEGORIES = [
  { id: 'all', label: 'All Presets' },
  { id: 'profiles', label: 'Profiles & URLs' },
  { id: 'contact', label: 'Contact & Personal' },
  { id: 'work', label: 'Work & Status' },
  { id: 'dates_finance', label: 'Dates & Finance' },
  { id: 'dev_tech', label: 'Dev & Data' }
];

const COMPREHENSIVE_PRESETS = [
  // 1. Profiles & URLs
  { category: 'profiles', name: 'LinkedIn URL', type: 'url', desc: 'Professional profile' },
  { category: 'profiles', name: 'GitHub URL', type: 'url', desc: 'Code repository or profile' },
  { category: 'profiles', name: 'Resume Link', type: 'url', desc: 'Google Drive / PDF link' },
  { category: 'profiles', name: 'Portfolio Website', type: 'url', desc: 'Personal site or showcase' },
  { category: 'profiles', name: 'Documentation Link', type: 'url', desc: 'Notion, Confluence, docs' },
  { category: 'profiles', name: 'Figma / Design URL', type: 'url', desc: 'Design file or prototype' },
  { category: 'profiles', name: 'LeetCode / Profile', type: 'url', desc: 'Coding profile link' },
  { category: 'profiles', name: 'Social / Twitter URL', type: 'url', desc: 'Social media profile' },

  // 2. Contact & Personal
  { category: 'contact', name: 'Contact Email', type: 'email', desc: 'Primary email address' },
  { category: 'contact', name: 'Alternate Email', type: 'email', desc: 'Secondary / work email' },
  { category: 'contact', name: 'Phone Number', type: 'phone', desc: 'Mobile / direct number' },
  { category: 'contact', name: 'WhatsApp Number', type: 'phone', desc: 'WhatsApp contact' },
  { category: 'contact', name: 'Full Name / Owner', type: 'text', desc: 'Person or entity name' },
  { category: 'contact', name: 'Location / Address', type: 'text', desc: 'City, country, or address' },

  // 3. Work & Status
  { category: 'work', name: 'Status', type: 'select', options: ['Active', 'In Progress', 'Completed', 'On Hold', 'Archived'], desc: 'Current execution status' },
  { category: 'work', name: 'Priority Level', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'], desc: 'Importance level' },
  { category: 'work', name: 'Skills & Tech Stack', type: 'multiSelect', options: ['React', 'Node.js', 'Python', 'TypeScript', 'Docker', 'AWS', 'SQL', 'Git'], desc: 'Multiple skill tags' },
  { category: 'work', name: 'Job / Contract Type', type: 'select', options: ['Full-Time', 'Part-Time', 'Contract', 'Freelance', 'Remote'], desc: 'Employment model' },
  { category: 'work', name: 'Detailed Notes', type: 'longText', desc: 'Multi-line notes and summary' },
  { category: 'work', name: 'Company / Organization', type: 'text', desc: 'Company or team name' },
  { category: 'work', name: 'Department', type: 'select', options: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance'], desc: 'Organizational unit' },

  // 4. Dates & Finance
  { category: 'dates_finance', name: 'Target Deadline', type: 'date', desc: 'Due date or completion date' },
  { category: 'dates_finance', name: 'Start Date', type: 'date', desc: 'Kickoff or joined date' },
  { category: 'dates_finance', name: 'Expiration / Renewal', type: 'date', desc: 'Contract or validity date' },
  { category: 'dates_finance', name: 'Budget / Salary', type: 'currency', desc: 'Financial amount' },
  { category: 'dates_finance', name: 'Hourly Rate', type: 'currency', desc: 'Rate per hour' },
  { category: 'dates_finance', name: 'Score / Rating', type: 'rating', desc: 'Rating from 1 to 5 stars' },
  { category: 'dates_finance', name: 'Experience (Years)', type: 'number', desc: 'Numeric quantity / years' },

  // 5. Dev & Tech Data
  { category: 'dev_tech', name: 'Code Snippet', type: 'code', desc: 'Syntax-highlighted code' },
  { category: 'dev_tech', name: 'Documentation Guide', type: 'markdown', desc: 'Rich markdown documentation' },
  { category: 'dev_tech', name: 'API Payload / Config', type: 'json', desc: 'JSON object / configuration' },
  { category: 'dev_tech', name: 'Is Verified / Active', type: 'boolean', desc: 'Yes/No boolean toggle' },
  { category: 'dev_tech', name: 'Assigned Member', type: 'user', desc: 'Workspace user assignment' },
  { category: 'dev_tech', name: 'Related Item', type: 'relation', desc: 'Link to another vault item' }
];

export function AddFieldModal({ isOpen, onClose, onAddField }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('url');
  const [optionsText, setOptionsText] = useState('');
  const [required, setRequired] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [presetSearch, setPresetSearch] = useState('');

  // Filtered presets based on category and search query
  const filteredPresets = useMemo(() => {
    return COMPREHENSIVE_PRESETS.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      if (!matchCat) return false;
      if (!presetSearch.trim()) return true;
      const q = presetSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q);
    });
  }, [selectedCategory, presetSearch]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!name.trim()) {
      setError('Field name is required');
      return;
    }

    const options = ['select', 'multiSelect'].includes(type)
      ? optionsText.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
      : [];

    onAddField({
      fieldId: `f_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      type,
      options,
      required,
      visible: true,
      value: type === 'boolean' ? false : type === 'multiSelect' ? [] : ''
    });

    setName('');
    setType('url');
    setOptionsText('');
    setRequired(false);
    setError('');
    onClose();
  };

  const handleApplyPreset = (preset) => {
    setName(preset.name);
    setType(preset.type);
    if (preset.options && preset.options.length > 0) {
      setOptionsText(preset.options.join(', '));
    } else {
      setOptionsText('');
    }
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Add Custom Field
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a ready preset or configure any structured field
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Section */}
        <div className="px-6 pt-3.5 pb-3 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 space-y-2.5 shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Ready Field Presets ({COMPREHENSIVE_PRESETS.length}):</span>
            </div>

            {/* Search presets */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                placeholder="Search presets..."
                className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {PRESET_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Preset Pills */}
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar p-0.5">
            {filteredPresets.map((p) => {
              const isSelected = name === p.name && type === p.type;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold ring-1 ring-indigo-500/40 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                  title={`${p.name} (${p.type}) - ${p.desc}`}
                >
                  <span>+ {p.name}</span>
                  <span className="text-[10px] opacity-60 font-mono">({p.type})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Field Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Field Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. LinkedIn URL, GitHub URL, Resume Link, Status, Budget"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Field Type Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Field Type ({FIELD_TYPES.length} Types Available)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
              {FIELD_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-xs ring-1 ring-indigo-500'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <div className="min-w-0">
                      <div className="font-bold text-xs">{t.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options for Select and MultiSelect */}
          {['select', 'multiSelect'].includes(type) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Predefined Options (comma or line separated)
              </label>
              <textarea
                rows={2}
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder="Active, In Progress, Completed, Archived"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          )}

          {/* Required Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="field_required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="field_required" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Mark this field as mandatory / required
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
