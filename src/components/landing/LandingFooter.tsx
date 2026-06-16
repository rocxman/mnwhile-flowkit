import React from 'react';
import { useTranslation } from 'react-i18next';

export function LandingFooter(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-white/10 py-8">
      <div className="flex flex-col items-center justify-between gap-4 text-xs text-white/45 sm:flex-row">
        <p>
          {t('landing.footer.copy', '© {{year}} MNWHILE FlowKit. Crafted in liquid glass.', {
            year: new Date().getFullYear(),
          })}
        </p>
        <div className="flex items-center gap-5">
          <a
            className="transition-colors hover:text-white/80"
            href="https://github.com/rocxman/mnwhile-flowkit"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            className="transition-colors hover:text-white/80"
            href="https://docs.mnwhile-flowkit.com"
            target="_blank"
            rel="noreferrer"
          >
            {t('landing.footer.docs', 'Docs')}
          </a>
          <a className="transition-colors hover:text-white/80" href="mailto:hello@mnwhile.com">
            {t('landing.footer.contact', 'Contact')}
          </a>
        </div>
      </div>
    </footer>
  );
}
