import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function AuthPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { signIn, signUp, user, logout } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === 'signup') {
      setMessage('Akun dibuat. Cek email jika Supabase meminta konfirmasi.');
      return;
    }

    navigate('/home');
  }

  if (user) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <h1 className="text-2xl font-semibold mb-2">Sudah login</h1>
          <p className="text-sm text-slate-300 mb-6">{user.email}</p>
          <div className="flex gap-3">
            <button className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-slate-950" onClick={() => navigate('/home')}>
              Buka Workspace
            </button>
            <button className="rounded-lg border border-white/15 px-4 py-2 text-sm" onClick={() => void logout()}>
              Logout
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold mb-2">MNWHILE FlowKit</h1>
        <p className="text-sm text-slate-300 mb-6">
          {mode === 'signin' ? 'Login ke cloud workspace.' : 'Buat akun cloud workspace.'}
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <label className="block text-sm">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-lime-400"
            />
          </label>

          <label className="block text-sm">
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-lime-400"
            />
          </label>

          {message ? <p className="text-sm text-amber-300">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-lime-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : mode === 'signin' ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          className="mt-4 text-sm text-lime-300 hover:text-lime-200"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? 'Belum punya akun? Register' : 'Sudah punya akun? Login'}
        </button>
      </section>
    </main>
  );
}
