import React from 'react';
import { useTranslation } from 'react-i18next';

type LandingCTAProps = {
  onAction: () => void;
  isAuthenticated: boolean;
};

export function LandingCTA({ onAction, isAuthenticated }: LandingCTAProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <section className="py-20">
      <div className="relative overflow-hidden rounded-[36px] border border-white/15 bg-gradient-to-br from-white/[0.09] via-white/[0.03] to-white/[0.09] p-10 text-center backdrop-blur-2xl shadow-[0_40px_120px_rgba(168,85,247,0.18),inset_0_1px_0_rgba(255,255,255,0.2)] sm:p-16">
        <div className="absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.32em] text-fuchsia-200/70">
          {t('landing.cta.kicker', 'Ready to build')}
        </p>
        <h2 className="relative mt-4 text-3xl font-semibold text-white sm:text-5xl">
          {t('landing.cta.title', 'Ship your next diagram in minutes.')}
        </h2>
        <p className="relative mx-auto mt-5 max-w-xl text-white/60">
          {t(
            'landing.cta.description',
            'No sign-up wall. No credit card. Just a workspace that works.'
          )}
        </p>

        <button
          type="button"
          onClick={onAction}
          className="relative mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(255,255,255,0.45)] sm:text-base"
        >
          {isAuthenticated
            ? t('landing.openWorkspace', 'Open Workspace')
            : t('landing.startForFree', 'Start for Free')}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
