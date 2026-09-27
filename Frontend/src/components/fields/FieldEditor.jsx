import React, { useState } from 'react';
import {
  Type,
  FileText,
  Link,
  Mail,
  Calendar,
  ToggleLeft,
  List,
  CheckSquare,
  Code2,
  FileCode,
  Braces,
  Hash,
  Trash2,
  Eye,
  EyeOff,
  Phone,
  DollarSign,
  Star,
  User,
  Link2,
  ChevronUp,
  ChevronDown,
  Edit3,
  Check
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const FIELD_TYPES = [
  { value: 'url', label: 'URL / Link', icon: Link, desc: 'LinkedIn, GitHub, Resume, Portfolio, Docs' },
  { value: 'text', label: 'Short Text', icon: Type, desc: 'Names, titles, single lines' },
  { value: 'longText', label: 'Long Text', icon: FileText, desc: 'Notes, multi-line details' },
  { value: 'email', label: 'Email', icon: Mail, desc: 'Direct contact addresses' },
  { value: 'phone', label: 'Phone Number', icon: Phone, desc: 'Contact numbers' },
  { value: 'currency', label: 'Currency', icon: DollarSign, desc: 'Salaries, budgets, pricing' },
  { value: 'rating', label: 'Rating (1-5)', icon: Star, desc: 'Candidate & product scores' },
  { value: 'relation', label: 'Relation to Item', icon: Link2, desc: 'Link to another item' },
  { value: 'user', label: 'Workspace User', icon: User, desc: 'Assignees, managers, reviewers' },
  { value: 'number', label: 'Number', icon: Hash, desc: 'Counts, ages, quantities' },
  { value: 'date', label: 'Date', icon: Calendar, desc: 'Deadlines, joined date' },
  { value: 'boolean', label: 'Checkbox (Yes/No)', icon: ToggleLeft, desc: 'Status checks, flags' },
  { value: 'select', label: 'Select (Single)', icon: List, desc: 'Dropdown options' },
  { value: 'multiSelect', label: 'Multi-Select', icon: CheckSquare, desc: 'Tags, skills, multiple options' },
  { value: 'code', label: 'Code Snippet', icon: Code2, desc: 'Syntax-highlighted code' },
  { value: 'markdown', label: 'Markdown', icon: FileCode, desc: 'Rich documentation' },
  { value: 'json', label: 'JSON Data', icon: Braces, desc: 'API payloads, objects' },
];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'SGD'];

export function FieldValueInput({ field, value, onChange, allItems = [] }) {
  const { members = [] } = useWorkspace();
  const { type, options = [], currencyCode = 'USD', maxRating = 5 } = field || {};

  switch (type) {
    case 'text':
      return (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field?.name || 'text'}...`}
          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
        />
      );

    case 'longText':
    case 'markdown':
      return (
        <textarea
          rows={3}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field?.name || 'details'}...`}
          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 leading-relaxed resize-y transition-all"
        />
      );

    case 'url':
      return (
        <div className="relative">
          <Link className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://linkedin.com/in/..., https://github.com/..., or URL"
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
        </div>
      );

    case 'email':
      return (
        <div className="relative">
          <Mail className="w-4 h-4 text-sky-500 absolute left-3.5 top-3" />
          <input
            type="email"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="name@example.com"
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
        </div>
      );

    case 'phone':
      return (
        <div className="relative">
          <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
          <input
            type="tel"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
        </div>
      );

    case 'currency': {
      const amount = typeof value === 'object' ? value?.amount : value;
      const curr = typeof value === 'object' ? (value?.currency || currencyCode) : currencyCode;

      return (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <DollarSign className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
            <input
              type="number"
              value={amount ?? ''}
              onChange={(e) => onChange({ amount: parseFloat(e.target.value) || 0, currency: curr })}
              placeholder="0.00"
              step="any"
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
            />
          </div>
          <select
            value={curr}
            onChange={(e) => onChange({ amount: parseFloat(amount) || 0, currency: e.target.value })}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {CURRENCIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      );
    }

    case 'rating': {
      const ratingVal = Number(value) || 0;
      const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

      return (
        <div className="flex items-center gap-1.5 py-1">
          {stars.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s === ratingVal ? 0 : s)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Star
                className={`w-5 h-5 transition-transform hover:scale-110 ${
                  s <= ratingVal
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {ratingVal} of {maxRating} Stars
          </span>
        </div>
      );
    }

    case 'user': {
      const currentUserId = typeof value === 'object' ? value?.userId : String(value || '');

      return (
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <select
            value={currentUserId}
            onChange={(e) => {
              const selectedUser = members.find(m => (m.userId === e.target.value || m.id === e.target.value || m._id === e.target.value));
              onChange({
                userId: e.target.value,
                name: selectedUser?.name || selectedUser?.user?.name || e.target.value,
                email: selectedUser?.email || selectedUser?.user?.email || ''
              });
            }}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="">Select a workspace member...</option>
            {members.map(m => (
              <option key={m.userId || m.id || m._id} value={m.userId || m.id || m._id}>
                {m.name || m.user?.name || 'Member'} ({m.email || m.user?.email || ''}) - {m.role || 'member'}
              </option>
            ))}
          </select>
        </div>
      );
    }

    case 'relation': {
      const currentRel = typeof value === 'object' ? (value?.id || value?._id || '') : String(value || '');

      return (
        <div className="relative">
          <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <select
            value={currentRel}
            onChange={(e) => {
              const selected = allItems.find(i => (i.id === e.target.value || i._id === e.target.value));
              onChange(selected ? { id: selected.id || selected._id, title: selected.title } : e.target.value);
            }}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="">Link to another item...</option>
            {allItems.map(i => (
              <option key={i.id || i._id} value={i.id || i._id}>
                {i.title || 'Untitled Item'}
              </option>
            ))}
          </select>
        </div>
      );
    }

    case 'number':
      return (
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="0"
          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={value ? String(value).split('T')[0] : ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      );

    case 'boolean':
      return (
        <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {Boolean(value) ? 'Enabled / Yes' : 'Disabled / No'}
          </span>
        </label>
      );

    case 'select':
      return (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="">Select an option...</option>
          {options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      );

    case 'multiSelect': {
      const selected = Array.isArray(value) ? value : String(value || '').split(',').map(s => s.trim()).filter(Boolean);
      return (
        <div className="space-y-2">
          {options.length === 0 ? (
            <p className="text-xs text-slate-400">No predefined options configured.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {options.map((opt, i) => {
                const isSelected = selected.includes(opt);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onChange(selected.filter(s => s !== opt));
                      } else {
                        onChange([...selected, opt]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    case 'code': {
      const codeStr = typeof value === 'object' ? value?.code : String(value || '');
      const lang = typeof value === 'object' ? (value?.language || 'javascript') : 'javascript';

      return (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Language</span>
            <select
              value={lang}
              onChange={(e) => onChange({ code: codeStr, language: e.target.value })}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              {['javascript', 'typescript', 'python', 'go', 'rust', 'sql', 'bash', 'json', 'html', 'css'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <textarea
            rows={4}
            value={codeStr}
            onChange={(e) => onChange({ code: e.target.value, language: lang })}
            placeholder="// Paste code snippet here..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 leading-relaxed"
          />
        </div>
      );
    }

    case 'json': {
      let jsonStr = '';
      if (typeof value === 'object' && value !== null) {
        jsonStr = JSON.stringify(value, null, 2);
      } else {
        jsonStr = String(value || '');
      }

      return (
        <textarea
          rows={4}
          value={jsonStr}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`{\n  "key": "value"\n}`}
          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 leading-relaxed"
        />
      );
    }

    default:
      return (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field?.name || 'value'}...`}
          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      );
  }
}

/**
 * Universal FieldEditor Component
 * Supports both single field usage (`field={...}`) and list usage (`fields={[...]}`).
 */
export function FieldEditor({
  field,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  isTemplate = false,
  fields,
  onOpenAddField,
  allItems = []
}) {
  // If `fields` array is passed without `field`, render list mode
  if (Array.isArray(fields) && !field) {
    const handleUpdateField = (index, updates) => {
      const updated = [...fields];
      updated[index] = { ...updated[index], ...updates };
      onChange?.(updated);
    };

    const handleRemoveField = (index) => {
      onChange?.(fields.filter((_, i) => i !== index));
    };

    const handleMove = (index, direction) => {
      const newFields = [...fields];
      const targetIdx = index + direction;
      if (targetIdx < 0 || targetIdx >= newFields.length) return;
      const temp = newFields[targetIdx];
      newFields[targetIdx] = newFields[index];
      newFields[index] = temp;
      onChange?.(newFields);
    };

    return (
      <div className="space-y-3">
        {fields.map((f, idx) => (
          <FieldEditor
            key={f.fieldId || idx}
            field={f}
            isTemplate={isTemplate}
            allItems={allItems}
            onChange={(updated) => handleUpdateField(idx, updated)}
            onRemove={() => handleRemoveField(idx)}
            onMoveUp={() => handleMove(idx, -1)}
            onMoveDown={() => handleMove(idx, 1)}
            canMoveUp={idx > 0}
            canMoveDown={idx < fields.length - 1}
          />
        ))}
      </div>
    );
  }

  // Single field mode
  if (!field) return null;

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(field.name || '');

  const typeObj = FIELD_TYPES.find(t => t.value === field.type) || FIELD_TYPES[0];
  const Icon = typeObj.icon;

  const handleFieldChange = (updates) => {
    onChange?.({ ...field, ...updates });
  };

  const handleSaveName = () => {
    if (nameVal.trim()) {
      handleFieldChange({ name: nameVal.trim() });
    }
    setIsEditingName(false);
  };

  return (
    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 transition-all hover:border-indigo-300 dark:hover:border-indigo-800/80">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
            <Icon className="w-4 h-4" />
          </div>

          {isEditingName ? (
            <div className="flex items-center gap-1.5 flex-1 max-w-xs">
              <input
                type="text"
                value={nameVal}
                autoFocus
                onChange={(e) => setNameVal(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="p-1 text-emerald-600 dark:text-emerald-400"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0 group/title">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                {field.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setNameVal(field.name || '');
                  setIsEditingName(true);
                }}
                className="opacity-0 group-hover/title:opacity-100 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-opacity"
                title="Rename Field"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}

          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono shrink-0">
            {typeObj.label}
          </span>
          {field.required && (
            <span className="text-[10px] text-rose-500 font-semibold shrink-0">*Required</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {onMoveUp && canMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Move Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
          {onMoveDown && canMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Move Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleFieldChange({ visible: field.visible === false ? true : false })}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title={field.visible !== false ? 'Field visible on summary cards' : 'Field hidden on summary cards'}
          >
            {field.visible !== false ? <Eye className="w-3.5 h-3.5 text-indigo-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title="Delete Field"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Field Value Input */}
      {isTemplate ? (
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Default Value (Optional):
          </label>
          <FieldValueInput
            field={field}
            value={field.defaultValue ?? field.value}
            allItems={allItems}
            onChange={(newVal) => handleFieldChange({ defaultValue: newVal, value: newVal })}
          />
        </div>
      ) : (
        <FieldValueInput
          field={field}
          value={field.value}
          allItems={allItems}
          onChange={(newVal) => handleFieldChange({ value: newVal })}
        />
      )}
    </div>
  );
}
