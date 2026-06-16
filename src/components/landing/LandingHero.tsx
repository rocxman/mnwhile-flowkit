import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type LandingHeroProps = {
  onPrimaryAction: () => void;
  isAuthenticated: boolean;
};

export function LandingHero({ onPrimaryAction, isAuthenticated }: LandingHeroProps): React.JSX.Element {
  const { t } = useTranslation();
  const glassRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = glassRef.current;
    if (!target) return undefined;
    const handleMove = (event: MouseEvent): void => {
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      target.style.setProperty('--mx', `${x}px`);
      target.style.setProperty('--my', `${y}px`);
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <section className="relative mt-10 flex flex-1 flex-col items-center justify-center py-20 sm:py-28">
      <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-xl">
        {t('landing.badge', 'Liquid glass · Local-first AI diagramming')}
      </span>

      <h1 className="mt-8 max-w-4xl text-center text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
        <span className="block bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-transparent">
          {t('landing.heroTitle', 'Visualize Your Ideas')}
        </span>
        <span className="mt-4 block text-white/80">
          {t('landing.heroSubtitle', 'in liquid glass.')}
        </span>
      </h1>

      <p className="mt-6 max-w-2xl text-center text-base text-white/60 sm:text-lg">
        {t(
          'landing.heroDescription',
          'Free, local-first AI diagramming for builders. Generate flows with natural language, sync across devices, and ship production-ready architecture — without leaving your browser.'
        )}
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={onPrimaryAction}
          className="group relative rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,255,255,0.45)] sm:text-base"
        >
          <span className="relative z-10">
            {isAuthenticated
              ? t('landing.openWorkspace', 'Open Workspace')
              : t('landing.getStarted', 'Get Started')}
          </span>
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-300/80 via-white/0 to-fuchsia-300/80 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
        </button>

        <a
          href="https://github.com/rocxman/mnwhile-flowkit"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-semibold text-white/90 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 sm:text-base"
        >
          {t('landing.viewSource', 'View on GitHub')}
        </a>
      </div>

      <div
        ref={glassRef}
        className="relative mx-auto mt-20 w-full max-w-5xl rounded-[32px] border border-white/15 bg-white/5 p-2 backdrop-blur-2xl shadow-[0_30px_120px_rgba(34,211,238,0.15),inset_0_1px_0_rgba(255,255,255,0.18)]"
        style={{
          backgroundImage:
            'radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(34,211,238,0.18), transparent 60%)',
        }}
      >
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-3 rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-white/50">
              mnwhile-flowkit.vercel.app/#/flow
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
              >
                <div className="mb-3 h-2 w-1/2 rounded-full bg-gradient-to-r from-cyan-300/70 to-fuchsia-300/70" />
                <div className="space-y-1.5">
                  <div className="h-1.5 rounded-full bg-white/20" />
                  <div className="h-1.5 w-4/5 rounded-full bg-white/15" />
                  <div className="h-1.5 w-3/5 rounded-full bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
