import React from 'react';
import { useNavigate } from 'react-router-dom';

export function LandingPage(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white"
    >
      <style>{`
        @keyframes iceCubeFloat {
          0%, 100% {
            transform: translate3d(-50%, -50%, 0) rotateX(58deg) rotateY(-28deg) rotateZ(2deg) scale(1);
          }
          35% {
            transform: translate3d(-50%, -56%, 0) rotateX(64deg) rotateY(32deg) rotateZ(-9deg) scale(1.05);
          }
          70% {
            transform: translate3d(-50%, -46%, 0) rotateX(50deg) rotateY(-44deg) rotateZ(8deg) scale(0.98);
          }
        }

        @keyframes iceCubeShine {
          0% { transform: translateX(-150%) skewX(-18deg); opacity: 0; }
          35% { opacity: .75; }
          70% { opacity: .3; }
          100% { transform: translateX(170%) skewX(-18deg); opacity: 0; }
        }

        @keyframes iceCubePulse {
          0%, 100% { opacity: .45; filter: blur(18px); }
          50% { opacity: .8; filter: blur(26px); }
        }

        .landing-ice-cube {
          animation: iceCubeFloat 7s ease-in-out infinite;
          transform-style: preserve-3d;
          box-shadow:
            inset 0 0 22px rgba(255,255,255,.92),
            inset 18px 18px 42px rgba(255,255,255,.25),
            inset -28px -24px 46px rgba(10,12,30,.88),
            0 0 18px rgba(255,255,255,.45),
            0 30px 70px rgba(255,255,255,.16);
        }

        .landing-ice-cube::before {
          content: '';
          position: absolute;
          inset: 9px 13px 20px 13px;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,.55);
          background:
            radial-gradient(circle at 28% 16%, rgba(255,255,255,.95), transparent 12%),
            linear-gradient(135deg, rgba(255,255,255,.58), rgba(255,255,255,.08) 34%, rgba(13,15,35,.72) 72%, rgba(255,255,255,.24));
          filter: blur(.1px);
          opacity: .9;
          transform: translateZ(34px);
        }

        .landing-ice-cube::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: -40%;
          width: 42%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.9), transparent);
          animation: iceCubeShine 3.4s ease-in-out infinite;
          mix-blend-mode: screen;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.055),transparent_34%)]" />

      <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
        <h1 className="relative z-10 select-none text-[clamp(5rem,13vw,12rem)] font-semibold leading-[0.84] tracking-[-0.09em] text-white">
          <span className="block">Explore</span>
          <span className="block">new</span>
          <span className="block">ideas</span>
        </h1>

        <div
          aria-hidden="true"
          className="landing-ice-cube pointer-events-none absolute left-1/2 top-[44%] z-20 h-[clamp(8rem,17vw,14rem)] w-[clamp(8rem,17vw,14rem)] overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.18)_24%,rgba(8,10,28,0.82)_56%,rgba(255,255,255,0.35))] backdrop-blur-[10px]"
        >
          <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_26%_20%,rgba(255,255,255,0.9),transparent_16%),radial-gradient(circle_at_78%_72%,rgba(255,255,255,0.35),transparent_24%)]" />
          <div className="absolute inset-[10%] rounded-[26px] border border-white/25" />
          <div className="absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
        </div>

        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[44%] z-0 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-3xl"
          style={{ animation: 'iceCubePulse 4s ease-in-out infinite' }}
        />

        <button
          type="button"
          onClick={() => navigate('/auth')}
          className="relative z-30 mt-28 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-medium text-black shadow-[0_0_0_1px_rgba(255,255,255,.18),0_20px_60px_rgba(255,255,255,.12)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
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
