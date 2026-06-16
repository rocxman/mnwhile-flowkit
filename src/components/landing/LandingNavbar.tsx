import React from 'react';
import { useTranslation } from 'react-i18next';

type LandingNavbarProps = {
  onLogin: () => void;
  isAuthenticated: boolean;
};

export function LandingNavbar({ onLogin, isAuthenticated }: LandingNavbarProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-xl">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#logoGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight text-white/90 sm:text-base">
          MNWHILE <span className="text-white/60">FlowKit</span>
        </span>
      </div>

      <nav className="rounded-full border border-white/15 bg-white/5 px-3 py-2 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <button
          type="button"
          onClick={onLogin}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-900 transition-all hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] sm:text-sm"
        >
          {isAuthenticated ? t('landing.openWorkspace', 'Open Workspace') : t('landing.login', 'Login')}
        </button>
      </nav>
    </header>
  );
}
