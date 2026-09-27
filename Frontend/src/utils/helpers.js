/**
 * Helper utilities for LinkVault
 */

/**
 * Normalizes and validates URL format
 * Automatically prepends https:// if omitted
 */
export function normalizeUrl(rawUrl) {
  if (!rawUrl) return { isValid: false, url: '' };
  
  let trimmed = rawUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    // If user enters example.com, prepend https://
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    // Basic validation: must have a hostname with at least a period or localhost
    if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) {
      return { isValid: false, url: trimmed };
    }
    return { isValid: true, url: parsed.href };
  } catch {
    return { isValid: false, url: trimmed };
  }
}

/**
 * Gets clean display domain from URL
 * e.g. "https://github.com/facebook/react" -> "github.com/facebook/react"
 */
export function formatDisplayUrl(url, maxChars = 40) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    let display = parsed.hostname.replace(/^www\./, '') + (parsed.pathname !== '/' ? parsed.pathname : '') + parsed.search;
    if (display.length > maxChars) {
      display = display.substring(0, maxChars - 3) + '...';
    }
    return display;
  } catch {
    return url.length > maxChars ? url.substring(0, maxChars - 3) + '...' : url;
  }
}

/**
 * Gets Google Favicon service URL with graceful fallback
 */
export function getFaviconUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
  } catch {
    return null;
  }
}

/**
 * Copy text to clipboard with modern navigator.clipboard and fallback
 */
export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

/**
 * Formats date relative or readable string
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return dateString;
  }
}

/**
 * Highlights matches in string for search preview
 */
export function highlightMatch(text, query) {
  if (!text) return '';
  if (!query || !query.trim()) return text;

  const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => 
    regex.test(part) ? `<mark class="search-highlight">${part}</mark>` : part
  ).join('');
}

/**
 * Generates unique ID
 */
export function generateId() {
  return 'id_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

/**
 * Color palette presets with tailwind hex & border classes
 */
export const COLOR_PALETTES = [
  { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30' },
  { name: 'Emerald', value: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
  { name: 'Violet', value: '#8b5cf6', bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/30' },
  { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
  { name: 'Rose', value: '#f43f5e', bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30' },
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30' },
  { name: 'Slate', value: '#64748b', bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/30' },
  { name: 'Fuchsia', value: '#d946ef', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-500/30' }
];

export const ICON_PRESETS = [
  'Folder', 'Bookmark', 'Bot', 'Code', 'Sparkles', 'Palette', 'GraduationCap', 
  'Globe', 'Database', 'Wrench', 'Briefcase', 'Layers', 'Rocket', 'Cpu', 'BookOpen', 'ShieldCheck'
];
