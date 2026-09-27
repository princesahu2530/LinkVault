import React, { useState, useEffect } from 'react';
import { activityApi } from '../../api/activity.api';
import { Activity, Clock, User, ArrowRight, Tag, FileText, CheckCircle } from 'lucide-react';

export default function ActivityTimeline({ itemId, workspaceId }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (itemId) {
      loadItemActivity();
    } else if (workspaceId) {
      loadWorkspaceActivity();
    }
  }, [itemId, workspaceId]);

  const loadItemActivity = async () => {
    try {
      setIsLoading(true);
      const data = await activityApi.getItemActivities(itemId);
      setActivities(data || []);
    } catch (err) {
      console.warn('Failed to load item activities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkspaceActivity = async () => {
    try {
      setIsLoading(true);
      const data = await activityApi.getWorkspaceActivities(workspaceId);
      setActivities(data || []);
    } catch (err) {
      console.warn('Failed to load workspace activities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatActionDescription = (act) => {
    const actorName = act.actor?.name || act.actor?.email || 'User';
    const action = act.action || 'updated';

    switch (action) {
      case 'created':
        return <span><strong className="text-white">{actorName}</strong> created this item</span>;
      case 'updated':
        return <span><strong className="text-white">{actorName}</strong> updated details</span>;
      case 'status_changed':
        return (
          <span>
            <strong className="text-white">{actorName}</strong> changed status from{' '}
            <span className="text-amber-400 font-medium">{String(act.oldValue)}</span> to{' '}
            <span className="text-emerald-400 font-medium">{String(act.newValue)}</span>
          </span>
        );
      case 'assigned':
        return <span><strong className="text-white">{actorName}</strong> assigned this item</span>;
      case 'comment_added':
        return <span><strong className="text-white">{actorName}</strong> commented</span>;
      case 'archived':
        return <span><strong className="text-white">{actorName}</strong> archived this item</span>;
      case 'restored':
        return <span><strong className="text-white">{actorName}</strong> restored this item</span>;
      default:
        return <span><strong className="text-white">{actorName}</strong> {action.replace('_', ' ')}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 rounded-xl border border-slate-800/80 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Activity Timeline ({activities.length})</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar max-h-80">
        {isLoading ? (
          <div className="text-center py-6 text-xs text-slate-500">Loading activity timeline...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">No activity recorded yet.</div>
        ) : (
          <div className="relative border-l border-slate-800 ml-3 space-y-4">
            {activities.map((act, index) => (
              <div key={act.id || act._id || index} className="relative pl-5 group">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-950 group-hover:scale-125 transition-transform" />
                <div className="text-xs text-slate-300 leading-snug">
                  {formatActionDescription(act)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(act.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
