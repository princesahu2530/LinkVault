import React from 'react';
import { Modal } from '../ui/Modal';
import { Command, Keyboard } from 'lucide-react';

export function KeyboardShortcutsModal({ isOpen, onClose }) {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { key: `${modKey} + K`, desc: 'Focus Global Search bar' },
    { key: `${modKey} + N  or  N`, desc: 'Create New Item modal' },
    { key: `${modKey} + Shift + N  or  T`, desc: 'Create New Topic modal' },
    { key: `${modKey} + J  or  Alt + D`, desc: 'Toggle Dark / Light Mode' },
    { key: `${modKey} + Enter`, desc: 'Submit and save current modal form' },
    { key: 'Esc', desc: 'Close open modal / Clear search' },
    { key: '? / Shift + /', desc: 'Open Keyboard Shortcuts cheat sheet' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      description="Accelerate your workflow with quick key combinations."
      maxWidth="max-w-md"
    >
      <div className="space-y-2.5">
        {shortcuts.map((sc, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs"
          >
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {sc.desc}
            </span>
            <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100 shadow-2xs">
              {sc.key}
            </kbd>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Got it
        </button>
      </div>
    </Modal>
  );
}
