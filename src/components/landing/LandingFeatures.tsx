import React from 'react';
import { useTranslation } from 'react-i18next';

type Feature = {
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
};

function SparkIcon(): React.ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <path d="M12 2l2.4 6.4L21 11l-6.6 2.6L12 21l-2.4-7.4L3 11l6.6-2.6L12 2z" />
    </svg>
  );
}

function CloudIcon(): React.ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <path d="M17.5 19a4.5 4.5 0 000-9h-.5a7 7 0 10-13.7 3.2A4 4 0 004 21h13.5z" />
    </svg>
  );
}

function ShareIcon(): React.ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

export function LandingFeatures(): React.JSX.Element {
  const { t } = useTranslation();

  const features: Feature[] = [
    {
      titleKey: 'landing.features.ai.title',
      descriptionKey: 'landing.features.ai.description',
      icon: <SparkIcon />,
    },
    {
      titleKey: 'landing.features.sync.title',
      descriptionKey: 'landing.features.sync.description',
      icon: <CloudIcon />,
    },
    {
      titleKey: 'landing.features.share.title',
      descriptionKey: 'landing.features.share.description',
      icon: <ShareIcon />,
    },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
          {t('landing.features.kicker', 'Built for builders')}
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          {t('landing.features.title', 'Everything you need, glassed up.')}
        </h2>
        <p className="mt-4 text-white/60">
          {t(
            'landing.features.subtitle',
            'An opinionated stack of capabilities wrapped in one workspace.'
          )}
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <article
            key={feature.titleKey}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-7 backdrop-blur-2xl transition-all hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_30px_80px_rgba(34,211,238,0.12)]"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-300/30 to-fuchsia-400/20 opacity-60 blur-3xl transition-opacity group-hover:opacity-100" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
              {feature.icon}
            </div>
            <h3 className="relative mt-5 text-lg font-semibold text-white">
              {t(feature.titleKey, fallbackFeatureTitle(index))}
            </h3>
            <p className="relative mt-2 text-sm leading-relaxed text-white/60">
              {t(feature.descriptionKey, fallbackFeatureDescription(index))}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function fallbackFeatureTitle(index: number): string {
  const titles = ['AI Generation', 'Cloud Sync', 'Instant Sharing'];
  return titles[index] ?? '';
}

function fallbackFeatureDescription(index: number): string {
  const descriptions = [
    'Generate architecture diagrams from a single prompt. Powered by Claude, Grok, and local models.',
    'Autosave to IndexedDB, sync across devices via Supabase, and export to R2-backed public URLs.',
    'Toggle a link, share with teammates, or make it public — all secured with row-level access.',
  ];
  return descriptions[index] ?? '';
}
