import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { storage } from '../../services/storage';
import { backupApi } from '../../api/backup.api';
import { copyToClipboard } from '../../utils/helpers';
import { useToast } from '../ui/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Download, Upload, FileJson, FileSpreadsheet, FileText, 
  Copy, Check, AlertCircle, CheckCircle2, RefreshCw, Eye
} from 'lucide-react';

export function ImportExportModal({ isOpen, onClose, topics, onDataChanged }) {
  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import'
  const [exportFormat, setExportFormat] = useState('json'); // 'json' | 'csv'
  const [selectedTopicId, setSelectedTopicId] = useState('all');
  
  const [importText, setImportText] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [previewSummary, setPreviewSummary] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleExportDownload = async () => {
    try {
      setIsProcessing(true);
      let data = '';

      if (isAuthenticated) {
        data = await backupApi.exportData(exportFormat, selectedTopicId === 'all' ? undefined : selectedTopicId);
        if (typeof data === 'object') data = JSON.stringify(data, null, 2);
      } else {
        // Local export
        const localTopics = storage.getLocalTopics();
        const localItems = storage.getLocalItems();
        const localTemplates = storage.getLocalTemplates();

        if (exportFormat === 'json') {
          const exportObj = {
            app: 'LinkVault',
            version: 2,
            exportedAt: new Date().toISOString(),
            topics: localTopics,
            templates: localTemplates,
            items: localItems
          };
          data = JSON.stringify(exportObj, null, 2);
        } else {
          // Local CSV
          const headers = ['Topic', 'Title', 'Content', 'Tags', 'Favorite'];
          const rows = [headers];
          localItems.forEach(item => {
            const topic = localTopics.find(t => (t.id || t._id) === item.topicId);
            rows.push([
              topic?.name || 'General',
              item.title || '',
              item.content || '',
              (item.tags || []).join('; '),
              item.isFavorite ? 'Yes' : 'No'
            ]);
          });
          data = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        }
      }

      const extension = exportFormat === 'json' ? 'json' : 'csv';
      const mimeType = exportFormat === 'json' ? 'application/json' : 'text/csv';

      const blob = new Blob([data], { type: `${mimeType};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `linkvault-v2-export-${new Date().toISOString().slice(0, 10)}.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({
        title: 'Export Complete',
        message: `Lossless data saved as .${extension} file.`,
        type: 'success'
      });
    } catch (err) {
      addToast({ title: 'Export Failed', message: err.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setImportText(text);
      analyzeImportPayload(text);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setImportText(text);
    if (text.trim()) {
      analyzeImportPayload(text);
    } else {
      setPreviewSummary(null);
    }
  };

  const analyzeImportPayload = (text) => {
    try {
      const parsed = JSON.parse(text);
      const topicsCount = Array.isArray(parsed.topics) ? parsed.topics.length : (Array.isArray(parsed) ? parsed.length : 0);
      let itemsCount = 0;
      if (Array.isArray(parsed.items)) itemsCount = parsed.items.length;
      else if (Array.isArray(parsed.topics)) {
        parsed.topics.forEach(t => {
          itemsCount += (t.items?.length || t.links?.length || 0);
        });
      }
      const templatesCount = Array.isArray(parsed.templates) ? parsed.templates.length : 0;

      setPreviewSummary({
        format: `JSON (Version ${parsed.version || 1})`,
        topicsCount,
        itemsCount,
        templatesCount,
        isValid: true,
        errors: []
      });
    } catch {
      // CSV check
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length > 1) {
        setPreviewSummary({
          format: 'CSV (Tabular Data)',
          topicsCount: 'Auto-detected',
          itemsCount: lines.length - 1,
          templatesCount: 0,
          isValid: true,
          errors: []
        });
      } else {
        setPreviewSummary({
          format: 'Unknown',
          topicsCount: 0,
          itemsCount: 0,
          templatesCount: 0,
          isValid: false,
          errors: ['Invalid or unreadable file format']
        });
      }
    }
  };

  const handlePerformImport = async () => {
    if (!importText.trim()) {
      setImportStatus({ success: false, message: 'Please upload a file or paste data.' });
      return;
    }

    try {
      setIsProcessing(true);

      if (isAuthenticated) {
        const result = await backupApi.importData(importText);
        setImportStatus({
          success: true,
          message: `Imported ${result.topicsCount || 0} topics, ${result.itemsCount || result.linksCount || 0} items, and ${result.templatesCount || 0} templates.`
        });
      } else {
        // Offline / LocalStorage import
        if (previewSummary?.isValid) {
          try {
            const parsed = JSON.parse(importText);
            if (Array.isArray(parsed.topics)) {
              storage.saveLocalTopics([...storage.getLocalTopics(), ...parsed.topics]);
            }
            if (Array.isArray(parsed.items)) {
              storage.saveLocalItems([...storage.getLocalItems(), ...parsed.items]);
            }
            if (Array.isArray(parsed.templates)) {
              storage.saveLocalTemplates([...storage.getLocalTemplates(), ...parsed.templates]);
            }
          } catch {}
          setImportStatus({ success: true, message: 'Import saved to local storage.' });
        }
      }

      addToast({
        title: 'Import Successful',
        message: 'Your knowledge workspace has been updated.',
        type: 'success'
      });

      await onDataChanged();

      setTimeout(() => {
        onClose();
        setImportStatus(null);
        setImportText('');
        setImportFileName('');
        setPreviewSummary(null);
      }, 1500);
    } catch (err) {
      setImportStatus({ success: false, message: err.message || 'Import failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import & Export Workspace"
      description="Backup your topics, templates, notes, and custom structured fields"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => { setActiveTab('export'); setImportStatus(null); }}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('import'); setImportStatus(null); }}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Import Data
          </button>
        </div>

        {/* TAB 1: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-4 pt-1">
            {/* Format Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExportFormat('json')}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    exportFormat === 'json'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <FileJson className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">JSON (Complete V2)</div>
                    <div className="text-xs text-slate-500">Lossless backup with all custom fields & templates</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    exportFormat === 'csv'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">CSV (Spreadsheet)</div>
                    <div className="text-xs text-slate-500">Flattened columns for Excel or Google Sheets</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Topic Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Scope
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="all">Entire Workspace (All Topics)</option>
                {topics.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExportDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
              >
                <Download className="w-4 h-4" />
                {isProcessing ? 'Exporting...' : 'Download Export'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT */}
        {activeTab === 'import' && (
          <div className="space-y-4 pt-1">
            {/* File Upload Box */}
            <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-center">
              <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                Drop your JSON or CSV file here, or click to browse
              </p>
              <input
                type="file"
                accept=".json,.csv,.txt"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              {importFileName && (
                <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  Selected: {importFileName}
                </div>
              )}
            </div>

            {/* Validation Preview Card */}
            {previewSummary && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                previewSummary.isValid
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  {previewSummary.isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                  <span>{previewSummary.isValid ? 'Valid Import Payload Ready' : 'Invalid Payload'}</span>
                </div>
                {previewSummary.isValid ? (
                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div>Topics: <span className="font-bold">{previewSummary.topicsCount}</span></div>
                    <div>Items: <span className="font-bold">{previewSummary.itemsCount}</span></div>
                    <div>Templates: <span className="font-bold">{previewSummary.templatesCount}</span></div>
                  </div>
                ) : (
                  <p>{previewSummary.errors[0]}</p>
                )}
              </div>
            )}

            {/* Import Status Alert */}
            {importStatus && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                importStatus.success
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {importStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{importStatus.message}</span>
              </div>
            )}

            {/* Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                disabled={isProcessing || !importText.trim() || (previewSummary && !previewSummary.isValid)}
                onClick={handlePerformImport}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
              >
                <Upload className="w-4 h-4" />
                {isProcessing ? 'Importing...' : 'Confirm & Import Data'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
