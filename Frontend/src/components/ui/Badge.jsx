import React from 'react';

export function Badge({ children, variant = 'default', size = 'sm', className = '', onClick = null }) {
  const baseClasses = 'inline-flex items-center gap-1 font-medium rounded-md transition-colors';

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[11px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold'
  }[size] || 'px-2 py-0.5 text-xs';

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60',
    primary: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60',
    outline: 'bg-transparent text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-slate-400'
  }[variant] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  const cursorClass = onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : '';

  return (
    <span onClick={onClick} className={`${baseClasses} ${sizeClasses} ${variantClasses} ${cursorClass} ${className}`}>
      {children}
    </span>
  );
}
