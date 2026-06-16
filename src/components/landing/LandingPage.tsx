import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

const LazyThreeJSBackground = React.lazy(() => import('./ThreeJSBackground').then(m => ({ default: m.ThreeJSBackground })));

export function LandingPage(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white"
    >
      <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
        <LazyThreeJSBackground />
      </Suspense>

      <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 text-center pointer-events-none">
        <button
          type="button"
          onClick={() => navigate('/auth')}
          className="pointer-events-auto mt-auto mb-[15vh] inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-medium text-black shadow-[0_0_0_1px_rgba(255,255,255,.18),0_20px_60px_rgba(255,255,255,.12)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Explore Now
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
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </section>
    </main>
  );
}
