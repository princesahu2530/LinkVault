import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Tag, 
  User,
  Plus
} from 'lucide-react';

export default function CalendarView({ items = [], onOpenItem, onOpenCreate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate days in month
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      cells.push({
        day: d,
        isCurrentMonth: true,
        date: new Date(year, month, d)
      });
    }

    // Next month filler days to complete grid (multiples of 7)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        isCurrentMonth: false,
        date: new Date(year, month + 1, d)
      });
    }

    return cells;
  }, [year, month]);

  // Map items to date strings (YYYY-MM-DD)
  const itemsByDate = useMemo(() => {
    const map = {};
    items.forEach(item => {
      // Find any date field or dueDate
      const dateVal = item.dueDate || item.customFields?.find(f => f.type === 'date' || f.name?.toLowerCase().includes('date') || f.name?.toLowerCase().includes('deadline'))?.value;
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d)) {
          const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
          if (!map[key]) map[key] = [];
          map[key].push(item);
        }
      }
    });
    return map;
  }, [items]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const today = new Date();
  const isToday = (d) => 
    d.getDate() === today.getDate() && 
    d.getMonth() === today.getMonth() && 
    d.getFullYear() === today.getFullYear();

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-400">
              Interactive timeline view for scheduled deadlines, interviews, and sprints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors border border-slate-700"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/90 text-center py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/60 min-h-[500px]">
          {calendarGrid.map((cell, idx) => {
            const dateKey = `${cell.date.getFullYear()}-${cell.date.getMonth() + 1}-${cell.date.getDate()}`;
            const cellItems = itemsByDate[dateKey] || [];
            const isCurrentToday = isToday(cell.date);

            return (
              <div
                key={idx}
                className={`min-h-[100px] p-2 transition-colors flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-950/40 opacity-40'
                    : isCurrentToday
                    ? 'bg-indigo-950/20 ring-1 ring-inset ring-indigo-500/40'
                    : 'bg-slate-900/40 hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                      isCurrentToday
                        ? 'bg-indigo-600 text-white font-bold'
                        : cell.isCurrentMonth
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {cell.day}
                  </span>
                  {cellItems.length > 0 && (
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-800/40">
                      {cellItems.length}
                    </span>
                  )}
                </div>

                {/* Items in this date */}
                <div className="space-y-1 overflow-y-auto max-h-20 custom-scrollbar flex-1">
                  {cellItems.map((item) => (
                    <div
                      key={item.id || item._id}
                      onClick={() => onOpenItem && onOpenItem(item)}
                      className="px-2 py-1 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700/80 hover:border-indigo-500/50 rounded-lg text-[11px] font-medium text-slate-200 hover:text-white cursor-pointer truncate transition-all shadow-sm"
                      title={item.title || 'Untitled Item'}
                    >
                      {item.title || 'Untitled'}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
