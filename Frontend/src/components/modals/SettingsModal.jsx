import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { storage } from '../../services/storage';
import { useToast } from '../ui/ToastContext';
import { 
  Moon, Sun, Monitor, Shield, Database, RefreshCw, 
  Trash2, Download, Upload, Check, AlertTriangle 
} from 'lucide-react';

export function SettingsModal({ isOpen, onClose, settings, onUpdateSettings, onDataReset }) {
  const [theme, setTheme] = useState('dark');
  const [compactMode, setCompactMode] = useState(false);
  const [defaultTopicState, setDefaultTopicState] = useState('remember');
  const [appName, setAppName] = useState('LinkVault');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    if (settings && isOpen) {
      setTheme(settings.theme || 'dark');
      setCompactMode(Boolean(settings.compactMode));
      setDefaultTopicState(settings.defaultTopicState || 'remember');
      setAppName(settings.appName || 'LinkVault');
      setShowConfirmReset(false);
      setShowConfirmClear(false);
    }
  }, [settings, isOpen]);

  const handleSave = () => {
    const updated = storage.saveSettings({
      theme,
      compactMode,
      defaultTopicState,
      appName: appName.trim() || 'LinkVault'
    });

    onUpdateSettings(updated);
    addToast({
      title: 'Settings Saved',
      message: 'Your preferences have been updated.',
      type: 'success'
    });
    onClose();
  };

  const handleDownloadFullBackup = () => {
    const backupJson = storage.createFullBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linkvault-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'Backup Downloaded',
      message: 'Full knowledge base backup saved.',
      type: 'success'
    });
  };

  const handleRestoreBackupFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = storage.restoreFullBackup(content);
      if (res.success) {
        addToast({
          title: 'Backup Restored',
          message: 'All topics, links, and settings restored successfully.',
          type: 'success'
        });
        onDataReset();
        onClose();
      } else {
        addToast({
          title: 'Restore Failed',
          message: res.error || 'Invalid backup structure.',
          type: 'error'
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetSampleData = () => {
    storage.resetToSampleData();
    addToast({
      title: 'Reset to Sample Data',
      message: 'Default topics and links restored.',
      type: 'info'
    });
    onDataReset();
    onClose();
  };

  const handleClearAllData = () => {
    storage.clearAllData();
    addToast({
      title: 'All Data Cleared',
      message: 'Your knowledge base is now empty.',
      type: 'info'
    });
    onDataReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings & Preferences"
      description="Configure appearance, layout behaviors, and data management."
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Appearance & Theme */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor }
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interface Preferences */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Display & Layout
          </label>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Compact Density Mode
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Display more links with tighter padding for high-speed scanning.
              </div>
            </div>
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(e) => setCompactMode(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Default Topic Collapse State
            </label>
            <select
              value={defaultTopicState}
              onChange={(e) => setDefaultTopicState(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="remember">Remember last expanded / collapsed state</option>
              <option value="all_expanded">All topics expanded by default</option>
              <option value="all_collapsed">All topics collapsed by default</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Application Title
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="LinkVault"
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Backup & Data Actions */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Full System Backup & Restore
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDownloadFullBackup}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              Download Full Backup (.json)
            </button>

            <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>Restore Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreBackupFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Reset to Sample Topics & Links
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-600">Restore default demo data?</span>
                <button
                  type="button"
                  onClick={handleResetSampleData}
                  className="px-2 py-1 text-xs font-bold bg-amber-600 text-white rounded-md"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="text-xs text-slate-400"
                >
                  Cancel
                </button>
              </div>
            )}

            {!showConfirmClear ? (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="text-xs text-rose-500 hover:underline font-medium"
              >
                Wipe All Data
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600">Erase all items?</span>
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="px-2 py-1 text-xs font-bold bg-rose-600 text-white rounded-md"
                >
                  Confirm Wipe
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  className="text-xs text-slate-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </div>
    </Modal>
  );
}
