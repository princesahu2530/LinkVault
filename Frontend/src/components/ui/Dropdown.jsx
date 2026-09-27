import React, { useState, useRef, useEffect } from 'react';

export function Dropdown({ trigger, items, align = 'right', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const alignClasses = {
    right: 'right-0 origin-top-right',
    left: 'left-0 origin-top-left',
    center: 'left-1/2 -translate-x-1/2 origin-top'
  }[align] || 'right-0 origin-top-right';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`absolute ${alignClasses} mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-150`}
          role="menu"
        >
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return <div key={index} className="my-1 border-t border-slate-100 dark:border-slate-800" />;
            }

            if (item.type === 'header') {
              return (
                <div key={index} className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon;
            const isDanger = item.danger;

            return (
              <button
                key={index}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (item.onClick) item.onClick();
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left font-medium transition-colors ${
                  item.disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : isDanger
                    ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 shrink-0 ${isDanger ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`} />}
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
