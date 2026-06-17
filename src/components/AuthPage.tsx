import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function AuthPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user, logout, resetPassword } = useAuth();

  // Get redirect path from location state (set by ProtectedRoute)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/home';
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === 'forgot') {
      const result = await resetPassword(email);
      setLoading(false);
      if (result.error) {
        setMessage(result.error.message);
        return;
      }
      setMessage('Password reset email sent. Please check your inbox.');
      return;
    }

    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === 'signup') {
      setMessage('Account created. Check your email for confirmation.');
      setMode('signin');
      setPassword('');
      return;
    }

    navigate(from, { replace: true });
  }

  if (user) {
    return (
      <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 overflow-hidden font-sans">
        {/* Premium Visual Overlays */}
        <div className="bg-noise" />
        
        <div 
          className="absolute inset-0 z-0 bg-[url('/grid.svg')] bg-[size:40px_40px] opacity-[0.08] pointer-events-none" 
          style={{ mixBlendMode: 'overlay' }}
        />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 flex w-full items-center justify-between px-6 py-5 md:px-12 pointer-events-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo-text-white.svg" alt="MNWHILE FlowKit Logo" className="h-7 w-auto hover:opacity-90 transition-opacity" />
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-semibold tracking-widest uppercase text-white/40 hover:text-white transition-all duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 hover:after:w-full after:bg-lime-400 after:transition-all after:duration-300 cursor-pointer"
          >
            Back to Home
          </button>
        </header>

        <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md z-10 hover:border-white/20 transition-all duration-300">
          {/* Logo icon inside card */}
          <div className="flex justify-center mb-6">
            <img src="/logo-icon-white.svg" alt="FlowKit Logo" className="h-10 w-auto" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-center font-outfit">Already signed in</h1>
          <p className="text-sm text-slate-300 mb-6 text-center leading-relaxed">You are currently signed in as {user.email}</p>
          <div className="flex gap-3 justify-center">
            <button 
              className="rounded-lg bg-lime-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-lime-400 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(132,204,22,0.4)] transition-all duration-200 cursor-pointer" 
              onClick={() => navigate(from, { replace: true })}
            >
              Open Workspace
            </button>
            <button 
              className="rounded-lg border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5 hover:border-white/25 transition-all duration-200 cursor-pointer" 
              onClick={() => void logout()}
            >
              Sign Out
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 z-20 flex w-full flex-col md:flex-row items-center justify-between px-6 py-4 md:px-12 text-[10px] text-white/30 border-t border-white/5 bg-black/60 backdrop-blur-md pointer-events-auto">
          <div>
            <span>&copy; {new Date().getFullYear()} MNWHILE FlowKit. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 mt-2 md:mt-0 font-medium uppercase tracking-wider">
            <a href="#privacy" className="hover:text-white/60 transition-colors duration-200">Privacy Policy</a>
            <a href="#terms" className="hover:text-white/60 transition-colors duration-200">Terms of Service</a>
            <a href="#status" className="hover:text-white/60 transition-colors duration-200">System Status</a>
          </div>
        </footer>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 overflow-hidden font-sans">
      {/* Premium Visual Overlays */}
      <div className="bg-noise" />
      
      <div 
        className="absolute inset-0 z-0 bg-[url('/grid.svg')] bg-[size:40px_40px] opacity-[0.08] pointer-events-none" 
        style={{ mixBlendMode: 'overlay' }}
      />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex w-full items-center justify-between px-6 py-5 md:px-12 pointer-events-auto">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo-text-white.svg" alt="MNWHILE FlowKit Logo" className="h-7 w-auto hover:opacity-90 transition-opacity" />
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xs font-semibold tracking-widest uppercase text-white/40 hover:text-white transition-all duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 hover:after:w-full after:bg-lime-400 after:transition-all after:duration-300 cursor-pointer"
        >
          Back to Home
        </button>
      </header>

      <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md z-10 hover:border-white/20 transition-all duration-300">
        {/* Logo icon inside card */}
        <div className="flex justify-center mb-6">
          <img src="/logo-icon-white.svg" alt="FlowKit Logo" className="h-10 w-auto" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-center font-outfit">MNWHILE FlowKit</h1>
        <p className="text-xs text-white/50 mb-6 text-center leading-relaxed">
          {mode === 'signin'
            ? 'Sign in to access your workspace.'
            : mode === 'signup'
              ? 'Create an account to save and sync your diagrams.'
              : 'Enter your email to reset your password.'}
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Email Address
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 hover:border-white/20 px-3 py-2.5 text-white outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-200 text-sm font-sans"
            />
          </label>

          {mode !== 'forgot' && (
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 hover:border-white/20 px-3 py-2.5 text-white outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-200 text-sm font-sans"
              />
            </label>
          )}

          {mode === 'signin' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-lime-400 hover:text-lime-300 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          {message ? <p className="text-xs text-center text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-lime-500 px-4 py-2.5 font-semibold text-slate-950 disabled:opacity-50 hover:bg-lime-400 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(132,204,22,0.4)] transition-all duration-200 cursor-pointer text-sm font-sans"
          >
            {loading
              ? 'Please wait...'
              : mode === 'signin'
                ? 'Sign In'
                : mode === 'signup'
                  ? 'Sign Up'
                  : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <button
            className="text-xs text-lime-300 hover:text-lime-200 transition-colors cursor-pointer"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : mode === 'signup'
                ? 'Already have an account? Sign in'
                : 'Back to Sign In'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex w-full flex-col md:flex-row items-center justify-between px-6 py-4 md:px-12 text-[10px] text-white/30 border-t border-white/5 bg-black/60 backdrop-blur-md pointer-events-auto">
        <div>
          <span>&copy; {new Date().getFullYear()} MNWHILE FlowKit. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 mt-2 md:mt-0 font-medium uppercase tracking-wider">
          <a href="#privacy" className="hover:text-white/60 transition-colors duration-200">Privacy Policy</a>
          <a href="#terms" className="hover:text-white/60 transition-colors duration-200">Terms of Service</a>
          <a href="#status" className="hover:text-white/60 transition-colors duration-200">System Status</a>
        </div>
      </footer>
    </main>
  );
}
