import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'success', duration = 3500, action = null }) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const newToast = { id, title, message, type, action };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-4 ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-800/60 text-rose-100'
                : toast.type === 'info'
                ? 'bg-slate-900/90 border-slate-700/60 text-slate-100'
                : 'bg-slate-900/95 border-slate-700/80 text-white dark:bg-slate-900/95 dark:border-slate-700'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : toast.type === 'info' ? (
                <Info className="w-5 h-5 text-sky-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            <div className="flex-1 min-w-0 text-sm">
              {toast.title && <div className="font-semibold text-slate-100 leading-tight">{toast.title}</div>}
              {toast.message && <div className="text-slate-300 text-xs mt-0.5 leading-relaxed">{toast.message}</div>}
            </div>

            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action.onClick();
                  removeToast(toast.id);
                }}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
                {toast.action.label || 'Undo'}
              </button>
            )}

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
