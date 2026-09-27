import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Mail,
  Calendar,
  Code2,
  FileText,
  CheckCircle2,
  XCircle,
  Hash,
  Layers,
  ChevronDown,
  ChevronUp,
  Braces,
  Phone,
  DollarSign,
  Star,
  User,
  Link2
} from 'lucide-react';

export function FieldRenderer({ field, isCompact = false, onRelationClick }) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!field || field.visible === false) return null;

  const { name, type, value, options, currencyCode, maxRating = 5 } = field;

  // Don't render empty values in compact mode unless boolean
  if (value === undefined || value === null || value === '') {
    if (type !== 'boolean') return null;
  }

  const handleCopy = (textToCopy, e) => {
    e?.stopPropagation();
    if (typeof textToCopy === 'object') {
      textToCopy = JSON.stringify(textToCopy, null, 2);
    }
    navigator.clipboard.writeText(String(textToCopy));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  switch (type) {
    case 'url': {
      const urlStr = String(value || '').trim();
      const displayUrl = urlStr.replace(/^https?:\/\//i, '').replace(/\/$/, '');
      const isSafe = /^https?:\/\//i.test(urlStr);

      return (
        <div className="flex items-center justify-between gap-2 py-1 px-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40 text-xs transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/50">
          <div className="flex items-center gap-1.5 min-w-0">
            <ExternalLink className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
            <a
              href={isSafe ? urlStr : '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-[220px]"
              title={urlStr}
            >
              {displayUrl || urlStr}
            </a>
          </div>
          <button
            onClick={(e) => handleCopy(urlStr, e)}
            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      );
    }

    case 'email': {
      const emailStr = String(value || '').trim();
      return (
        <div className="flex items-center justify-between gap-2 py-1 px-2.5 rounded-lg bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100/80 dark:border-sky-900/40 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <Mail className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
            <a
              href={`mailto:${emailStr}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sky-600 dark:text-sky-400 hover:underline truncate"
            >
              {emailStr}
            </a>
          </div>
          <button
            onClick={(e) => handleCopy(emailStr, e)}
            className="p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 shrink-0"
            title="Copy Email"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      );
    }

    case 'phone': {
      const phoneStr = String(value || '').trim();
      return (
        <div className="flex items-center justify-between gap-2 py-1 px-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
            <a
              href={`tel:${phoneStr}`}
              onClick={(e) => e.stopPropagation()}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
            >
              {phoneStr}
            </a>
          </div>
          <button
            onClick={(e) => handleCopy(phoneStr, e)}
            className="p-1 text-slate-400 hover:text-emerald-600 shrink-0"
            title="Copy Phone"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      );
    }

    case 'currency': {
      const amount = typeof value === 'object' ? value?.amount : value;
      const curr = typeof value === 'object' ? (value?.currency || currencyCode || 'USD') : (currencyCode || 'USD');
      const formatted = Number(amount || 0).toLocaleString(undefined, {
        style: 'currency',
        currency: curr,
        maximumFractionDigits: 2
      });

      return (
        <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100/80 dark:border-amber-900/40 text-xs">
          <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
          <span className="font-semibold text-amber-700 dark:text-amber-300">{formatted}</span>
        </div>
      );
    }

    case 'rating': {
      const ratingVal = Number(value) || 0;
      const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

      return (
        <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-yellow-50/60 dark:bg-yellow-950/30 border border-yellow-100/80 dark:border-yellow-900/40 text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
          <div className="flex items-center gap-0.5">
            {stars.map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= ratingVal
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            ))}
            <span className="ml-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {ratingVal}/{maxRating}
            </span>
          </div>
        </div>
      );
    }

    case 'relation': {
      const relItems = Array.isArray(value) ? value : (value ? [value] : []);
      if (!relItems.length) return null;

      return (
        <div className="flex items-center flex-wrap gap-1.5 py-1 px-2.5 rounded-lg bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100/80 dark:border-purple-900/40 text-xs">
          <Link2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
          <div className="flex items-center flex-wrap gap-1">
            {relItems.map((r, i) => {
              const label = typeof r === 'object' ? (r.title || r.name || 'Linked Item') : `Item: ${r.slice(-6)}`;
              return (
                <span
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRelationClick) onRelationClick(typeof r === 'object' ? r.id || r._id : r);
                  }}
                  className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-200 cursor-pointer transition-colors"
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    case 'user': {
      const uName = typeof value === 'object' ? (value.name || value.email || 'User') : String(value);
      return (
        <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100/80 dark:border-teal-900/40 text-xs">
          <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
          <span className="font-semibold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-2 py-0.5 rounded-md">
            {uName}
          </span>
        </div>
      );
    }

    case 'select': {
      return (
        <div className="flex items-center gap-1.5 text-xs py-0.5">
          <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            {String(value)}
          </span>
        </div>
      );
    }

    case 'multiSelect': {
      const items = Array.isArray(value) ? value : String(value).split(',').filter(Boolean);
      return (
        <div className="flex items-center flex-wrap gap-1 text-xs py-0.5">
          <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
          {items.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
            >
              {String(item).trim()}
            </span>
          ))}
        </div>
      );
    }

    case 'boolean': {
      const isTrue = Boolean(value);
      return (
        <div className="flex items-center gap-1.5 text-xs py-0.5">
          <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
          {isTrue ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500">
              <XCircle className="w-3.5 h-3.5" /> No
            </span>
          )}
        </div>
      );
    }

    case 'date': {
      const d = new Date(value);
      const formatted = isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      return (
        <div className="flex items-center gap-1.5 text-xs py-0.5 text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
          <span>{formatted}</span>
        </div>
      );
    }

    case 'number': {
      return (
        <div className="flex items-center gap-1.5 text-xs py-0.5">
          <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
          <span className="font-mono text-slate-700 dark:text-slate-200">{String(value)}</span>
        </div>
      );
    }

    case 'code': {
      const codeStr = typeof value === 'object' ? value.code : String(value || '');
      const lang = typeof value === 'object' ? value.language : 'code';

      if (isCompact) {
        return (
          <div className="flex items-center gap-1.5 text-xs py-1 px-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
            <Code2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium">{name} ({lang})</span>
          </div>
        );
      }

      return (
        <div className="my-1.5 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/60 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
            <span>{name} ({lang})</span>
            <button
              onClick={(e) => handleCopy(codeStr, e)}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-3 overflow-x-auto font-mono text-xs leading-relaxed max-h-48 scrollbar-thin">
            <code>{codeStr}</code>
          </pre>
        </div>
      );
    }

    case 'markdown':
    case 'longText': {
      const str = String(value || '');
      if (isCompact || !isExpanded) {
        return (
          <div className="text-xs text-slate-600 dark:text-slate-300 py-1">
            <span className="font-medium text-slate-500 dark:text-slate-400">{name}: </span>
            <span className="line-clamp-2">{str}</span>
            {str.length > 100 && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1 font-medium text-[11px]"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        );
      }

      return (
        <div className="text-xs text-slate-600 dark:text-slate-300 py-1 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>{name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              className="text-slate-400 hover:text-slate-600"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="whitespace-pre-wrap leading-relaxed">{str}</div>
        </div>
      );
    }

    case 'json': {
      let formattedJson = '';
      try {
        const obj = typeof value === 'string' ? JSON.parse(value) : value;
        formattedJson = JSON.stringify(obj, null, 2);
      } catch {
        formattedJson = String(value);
      }

      return (
        <div className="my-1.5 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/60 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Braces className="w-3.5 h-3.5 text-amber-400" />
              {name} (JSON)
            </span>
            <button
              onClick={(e) => handleCopy(formattedJson, e)}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-3 overflow-x-auto font-mono text-xs leading-relaxed max-h-48 scrollbar-thin">
            <code>{formattedJson}</code>
          </pre>
        </div>
      );
    }

    default:
      return (
        <div className="flex items-center gap-1.5 text-xs py-0.5">
          <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">{name}:</span>
          <span className="text-slate-700 dark:text-slate-200">{String(value)}</span>
        </div>
      );
  }
}
