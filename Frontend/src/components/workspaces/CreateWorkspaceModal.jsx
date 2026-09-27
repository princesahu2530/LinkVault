import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  X, 
  Briefcase, 
  Sparkles, 
  Users, 
  Layers, 
  Code2, 
  TrendingUp, 
  Crown, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight,
  FolderPlus,
  Link,
  ShieldCheck
} from 'lucide-react';

const STARTER_PACK_META = {
  personal: {
    title: 'Custom Blank Vault',
    icon: Briefcase,
    color: '#6366f1',
    description: 'Clean workspace to store personal IDs, bookmarks, URLs, or custom fields.'
  },
  id_store: {
    title: 'Personal IDs & Links',
    icon: UserCheck,
    color: '#06b6d4',
    description: 'Specialized for LinkedIn, GitHub, Resume, Portfolio, and social profiles.'
  },
  engineering: {
    title: 'Engineering & Tech',
    icon: Code2,
    color: '#3b82f6',
    description: 'Architecture decisions, APIs, snippets, bug tracking, and projects.'
  },
  pm: {
    title: 'Product Management',
    icon: Layers,
    color: '#8b5cf6',
    description: 'Roadmaps, feature specs, ideas, feedback, and competitor research.'
  },
  hr: {
    title: 'HR & People Ops',
    icon: Users,
    color: '#ec4899',
    description: 'Recruitment pipelines, candidates, employees, and onboarding.'
  }
};

const COLOR_PRESETS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
  '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'
];

export default function CreateWorkspaceModal({ isOpen, onClose }) {
  const { createWorkspace } = useWorkspace();
  const [selectedPack, setSelectedPack] = useState('personal');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectPack = (packId) => {
    setSelectedPack(packId);
    const meta = STARTER_PACK_META[packId];
    if (meta && packId !== 'personal') {
      if (!name || Object.values(STARTER_PACK_META).some(m => name.startsWith(m.title))) {
        setName(meta.title + ' Workspace');
      }
      setDescription(meta.description);
      setColor(meta.color);
      setCategory(packId);
    } else {
      setColor('#6366f1');
      setCategory('general');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await createWorkspace({
        name: name.trim(),
        description: description.trim(),
        color,
        category,
        starterPack: (selectedPack && selectedPack !== 'personal' && selectedPack !== 'id_store') ? selectedPack : undefined
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create New Workspace</h2>
              <p className="text-xs text-slate-400">Set up a clean vault for personal profiles, links, or team workflows</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-950/50 border border-rose-800/50 rounded-lg">
              {error}
            </div>
          )}

          {/* Starter Packs / Vault Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Choose Workspace Type / Template:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(STARTER_PACK_META).map(([id, meta]) => {
                const IconComponent = meta.icon;
                const isSelected = selectedPack === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectPack(id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 pr-4">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {meta.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {meta.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 absolute top-3 right-3" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workspace Details */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Workspace Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Personal IDs & Links, Engineering Vault, Projects..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief purpose of this workspace (e.g. Storage for LinkedIn, GitHub, Resume, and important credentials)..."
                rows={2}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Color Accent */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Color Theme
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-lg transition-transform cursor-pointer ${
                      color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Creating...</span>
              ) : (
                <>
                  <span>Create Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
