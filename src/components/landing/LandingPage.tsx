import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LandingCTA } from './LandingCTA';
import { LandingFeatures } from './LandingFeatures';
import { LandingFooter } from './LandingFooter';
import { LandingHero } from './LandingHero';
import { LandingNavbar } from './LandingNavbar';

export function LandingPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();

  function openAuth(): void {
    navigate(user ? '/home' : '/auth');
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060a] text-white" id="main-content">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[10%] h-96 w-96 animate-pulse rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute top-20 right-[8%] h-[28rem] w-[28rem] animate-blob rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.16),transparent_35%),linear-gradient(115deg,rgba(34,211,238,0.12),transparent_28%,rgba(168,85,247,0.12)_58%,transparent_78%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <LandingNavbar onLogin={openAuth} isAuthenticated={Boolean(user)} />
        <LandingHero onPrimaryAction={openAuth} isAuthenticated={Boolean(user)} />
        <LandingFeatures />
        <LandingCTA onAction={openAuth} isAuthenticated={Boolean(user)} />
        <LandingFooter />
      </div>
    </main>
  );
}
