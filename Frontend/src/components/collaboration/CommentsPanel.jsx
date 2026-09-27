import React, { useState, useEffect } from 'react';
import { commentsApi } from '../../api/comments.api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { MessageSquare, Send, Trash2, AtSign, Clock } from 'lucide-react';

export default function CommentsPanel({ itemId, onCommentAdded }) {
  const { members } = useWorkspace();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentionHelper, setShowMentionHelper] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');

  useEffect(() => {
    if (itemId) {
      loadComments();
    }
  }, [itemId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await commentsApi.getItemComments(itemId);
      setComments(data || []);
    } catch (err) {
      console.warn('Failed to load comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setNewComment(val);

    // Simple mention helper detection
    const lastWord = val.split(/\s+/).pop();
    if (lastWord && lastWord.startsWith('@')) {
      setShowMentionHelper(true);
      setMentionFilter(lastWord.slice(1).toLowerCase());
    } else {
      setShowMentionHelper(false);
    }
  };

  const handleSelectMention = (memberName) => {
    const words = newComment.split(/\s+/);
    words.pop();
    words.push(`@${memberName} `);
    setNewComment(words.join(' '));
    setShowMentionHelper(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const created = await commentsApi.createComment(itemId, {
        content: newComment.trim()
      });
      setNewComment('');
      setComments(prev => [...prev, created]);
      if (onCommentAdded) onCommentAdded(created);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await commentsApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => (c.id !== commentId && c._id !== commentId)));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 rounded-xl border border-slate-800/80 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>Comments & Discussions ({comments.length})</span>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-80">
        {isLoading ? (
          <div className="text-center py-6 text-xs text-slate-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No comments yet. Start a discussion or mention a team member with <span className="text-indigo-400">@name</span>!
          </div>
        ) : (
          comments.map((c) => {
            const id = c.id || c._id;
            const author = c.author || {};
            const authorName = author.name || author.email || 'Team Member';
            return (
              <div key={id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl group relative">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                      {authorName.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{authorName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => handleDelete(id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity ml-1"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {c.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Mention Helper Dropdown */}
      {showMentionHelper && (
        <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 text-[11px] flex items-center gap-1">
            <AtSign className="w-3 h-3 text-indigo-400" /> Mention:
          </span>
          {members
            .filter(m => (m.user?.name || m.user?.email || '').toLowerCase().includes(mentionFilter))
            .slice(0, 5)
            .map(m => {
              const name = m.user?.name || m.user?.email || 'Member';
              return (
                <button
                  key={m.id || m._id}
                  type="button"
                  onClick={() => handleSelectMention(name)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 text-xs border border-slate-700"
                >
                  @{name}
                </button>
              );
            })}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
        <input
          type="text"
          value={newComment}
          onChange={handleTextChange}
          placeholder="Write a comment or type @ to mention..."
          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
