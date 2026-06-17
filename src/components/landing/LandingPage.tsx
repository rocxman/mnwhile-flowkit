import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

const LazyThreeJSBackground = React.lazy(() => import('./ThreeJSBackground').then(m => ({ default: m.ThreeJSBackground })));

export function LandingPage(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white font-sans selection:bg-lime-500/30 selection:text-lime-200"
    >
      {/* Premium Visual Overlays */}
      <div className="bg-noise" />
      
      <div 
        className="absolute inset-0 z-0 bg-[url('/grid.svg')] bg-[size:40px_40px] opacity-[0.08] pointer-events-none" 
        style={{ mixBlendMode: 'overlay' }}
      />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-lime-500/5 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />

      {/* 3D Background */}
      <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
        <LazyThreeJSBackground />
      </Suspense>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex w-full items-center justify-between px-6 py-5 md:px-12 pointer-events-auto">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo-text-white.svg" alt="MNWHILE FlowKit Logo" className="h-7 w-auto hover:opacity-90 transition-opacity" />
        </div>
      </header>

      {/* Main Section */}
      <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 text-center pointer-events-none">
        <button
          type="button"
          onClick={() => navigate('/auth')}
          className="pointer-events-auto mt-auto mb-[18vh] inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(255,255,255,.15),0_20px_60px_rgba(255,255,255,.08)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-lime-400 hover:shadow-[0_0_30px_rgba(132,204,22,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white cursor-pointer"
        >
          Get Started
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
