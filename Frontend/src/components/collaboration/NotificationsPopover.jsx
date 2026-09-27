import React, { useState, useEffect, useRef } from 'react';
import { notificationsApi } from '../../api/notifications.api';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  AtSign, 
  UserPlus, 
  AlertCircle, 
  MessageSquare, 
  Clock,
  Sparkles
} from 'lucide-react';

export default function NotificationsPopover({ onOpenItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationsApi.getNotifications();
      const list = data.notifications || data || [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read).length);
    } catch {
      // Ignore background notification load errors
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mention':
        return <AtSign className="w-3.5 h-3.5 text-indigo-400" />;
      case 'item_assigned':
        return <UserPlus className="w-3.5 h-3.5 text-blue-400" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'due_soon':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full border-2 border-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-indigo-600/30 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/40">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 text-slate-600" />
                <span>You're all caught up! No notifications.</span>
              </div>
            ) : (
              notifications.map((notif) => {
                const id = notif.id || notif._id;
                return (
                  <div
                    key={id}
                    onClick={() => {
                      if (!notif.read) handleMarkAsRead(id, { stopPropagation: () => {} });
                      if (notif.resourceId && onOpenItem) {
                        onOpenItem(notif.resourceId);
                        setIsOpen(false);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      !notif.read
                        ? 'bg-slate-800/80 border-indigo-500/40 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs leading-snug">
                        {notif.message || notif.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(id, e)}
                        className="p-1 hover:text-white text-indigo-400 hover:bg-indigo-600/30 rounded transition-colors flex-shrink-0"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
