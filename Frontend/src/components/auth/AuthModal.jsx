import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/ToastContext';
import { authApi } from '../../api/auth.api';
import { LogIn, UserPlus, KeyRound, Mail, Lock, User, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function AuthModal() {
  const { authModalOpen, authModalTab, closeAuthModal, setAuthModalTab, login, register } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [showWorkspaceInput, setShowWorkspaceInput] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [forgotSentMessage, setForgotSentMessage] = useState('');

  useEffect(() => {
    if (authModalOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setResetToken('');
      setWorkspaceSlug('');
      setError('');
      setForgotSentMessage('');
    }
  }, [authModalOpen, authModalTab]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login({ 
        email, 
        password, 
        ...(workspaceSlug.trim() ? { workspaceSlug: workspaceSlug.trim() } : {}) 
      });
      addToast({
        title: 'Welcome Back!',
        message: 'Successfully signed in to LinkVault.',
        type: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass, demoWs = '') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    if (demoWs) {
      setWorkspaceSlug(demoWs);
      setShowWorkspaceInput(true);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await register({ name, email, password });
      addToast({
        title: 'Account Created!',
        message: 'Welcome to LinkVault.',
        type: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await authApi.forgotPassword({ email });
      setForgotSentMessage(res.message || 'Reset link generated.');
      if (res.devResetToken) {
        setResetToken(res.devResetToken);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to process request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetToken || !password) {
      setError('Please enter your reset token and new password');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await authApi.resetPassword({ token: resetToken, password });
      addToast({
        title: 'Password Reset',
        message: 'Your password has been changed. Please sign in.',
        type: 'success'
      });
      setAuthModalTab('login');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid or expired token');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={authModalOpen}
      onClose={closeAuthModal}
      title={
        authModalTab === 'login'
          ? 'Sign In to LinkVault'
          : authModalTab === 'register'
          ? 'Create your Knowledge Account'
          : 'Reset your Password'
      }
      description={
        authModalTab === 'login'
          ? 'Access your saved links, topics, and personal or team workspaces.'
          : authModalTab === 'register'
          ? 'Organize, sync, and access your resources from any device.'
          : 'Enter your registered email to receive reset instructions.'
      }
      maxWidth="max-w-md"
    >
      {/* Tab Switcher */}
      {authModalTab !== 'forgot' && (
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-5">
          <button
            type="button"
            onClick={() => setAuthModalTab('login')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              authModalTab === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalTab('register')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              authModalTab === 'register'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* LOGIN FORM */}
      {authModalTab === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoFocus
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setAuthModalTab('forgot')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Optional Workspace Resolution Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <button
                type="button"
                onClick={() => setShowWorkspaceInput(!showWorkspaceInput)}
                className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>{showWorkspaceInput ? '− Hide Direct Workspace' : '+ Direct Workspace Name / Slug (Optional)'}</span>
              </button>
            </div>
            {showWorkspaceInput && (
              <div className="mt-1.5 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={workspaceSlug}
                  onChange={(e) => setWorkspaceSlug(e.target.value)}
                  placeholder="e.g. PG Platform – Client Project or personal-vault"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              ⚡ Quick Demo Logins (Seed Dataset):
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleFillDemo('pgsaathi0489@gmail.com', 'Aa@123456', 'PG Platform – Client Project')}
                className="p-1.5 rounded-lg text-left text-[11px] bg-slate-100 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <div className="font-semibold truncate">Amit Sharma</div>
                <div className="text-[10px] text-slate-400">Project Manager</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('priya.singh@pgplatform.example', 'Aa@123456', 'PG Platform – Client Project')}
                className="p-1.5 rounded-lg text-left text-[11px] bg-slate-100 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <div className="font-semibold truncate">Priya Singh</div>
                <div className="text-[10px] text-slate-400">HR Manager</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('rahul.mehta@pgplatform.example', 'Aa@123456', 'PG Platform – Client Project')}
                className="p-1.5 rounded-lg text-left text-[11px] bg-slate-100 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <div className="font-semibold truncate">Rahul Mehta</div>
                <div className="text-[10px] text-slate-400">Team Lead</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('suresh.patel@pgtechnologies.example', 'Aa@123456', 'PG Platform – Client Project')}
                className="p-1.5 rounded-lg text-left text-[11px] bg-slate-100 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <div className="font-semibold truncate">Suresh Patel</div>
                <div className="text-[10px] text-slate-400">Client Stakeholder</div>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* REGISTER FORM */}
      {authModalTab === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                required
                autoFocus
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Password <span className="text-slate-400 font-normal">(min. 8 chars)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      )}

      {/* FORGOT / RESET PASSWORD FORM */}
      {authModalTab === 'forgot' && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setAuthModalTab('login')}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </button>

          {!forgotSentMessage ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Account Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Request Reset Token'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotSentMessage}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Reset Token
                </label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste reset token..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Resetting Password...' : 'Save New Password'}
              </button>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
}
