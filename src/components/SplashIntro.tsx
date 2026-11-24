import { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashIntroProps {
  onComplete: () => void;
}

export function SplashIntro({ onComplete }: SplashIntroProps) {
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const duration = prefersReduced ? 120 : 480;
    const timer = window.setTimeout(onComplete, duration);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      onClick={onComplete}
      role="status"
      aria-live="polite"
      aria-label="Abrindo Modo Carreira, Rastreador de Jogador. Toque para pular."
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080D1A] px-6 select-none cursor-pointer overflow-hidden"
    >
      {/* Lightweight Radial Ambient Glow (GPU-friendly, no heavy CSS blur filter) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-80 w-80 sm:h-96 sm:w-96 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(245,158,11,0.08) 45%, rgba(8,13,26,0) 72%)',
        }}
      />

      {/* Custom Animated Crest Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex items-center justify-center"
      >
        <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl border border-white/10 bg-[#11192D]/90 p-2.5 shadow-2xl overflow-hidden">
          {/* Light sweep sheen */}
          <motion.div
            aria-hidden="true"
            initial={{ x: '-140%' }}
            animate={{ x: '220%' }}
            transition={{ duration: 0.42, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-y-0 w-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 128 128"
            fill="none"
            className="h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="splash-bg" x1="16" y1="10" x2="112" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#172340" />
                <stop offset="100%" stopColor="#090F1E" />
              </linearGradient>
              <linearGradient id="splash-rim" x1="20" y1="12" x2="108" y2="116" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="55%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="splash-gold" x1="42" y1="28" x2="86" y2="86" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>

            {/* Shield base */}
            <motion.path
              d="M64 10L106 25V60C106 87.2 87.8 108.4 64 117C40.2 108.4 22 87.2 22 60V25L64 10Z"
              fill="url(#splash-bg)"
              stroke="url(#splash-rim)"
              strokeWidth="4.5"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Inner crest frame */}
            <motion.path
              d="M64 20L96 31.5V59.5C96 81.2 82.2 98.4 64 105.5C45.8 98.4 32 81.2 32 59.5V31.5L64 20Z"
              stroke="#3B82F6"
              strokeOpacity="0.32"
              strokeWidth="1.75"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            />

            {/* Rising OVR / Career progression line */}
            <motion.path
              d="M42 78L55 64L64 71L86 47"
              stroke="#60A5FA"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.26, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M74 47H86V59"
              stroke="#60A5FA"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.16, delay: 0.28 }}
            />

            {/* Golden Prime Star */}
            <motion.path
              d="M64 29L67.8 36.8L76.4 38L70.2 44.1L71.7 52.6L64 48.6L56.3 52.6L57.8 44.1L51.6 38L60.2 36.8L64 29Z"
              fill="url(#splash-gold)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 520, damping: 18, delay: 0.18 }}
              style={{ transformOrigin: '64px 41px' }}
            />

            {/* Gold base accent */}
            <motion.path
              d="M45 90H83"
              stroke="#F59E0B"
              strokeOpacity="0.7"
              strokeWidth="3.2"
              strokeLinecap="round"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.24 }}
              style={{ transformOrigin: '64px 90px' }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Brand Title & Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 text-center"
      >
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-wider text-white uppercase">
          Modo Carreira
        </h1>
        <p className="mt-1 text-xs font-medium tracking-widest uppercase text-slate-400">
          Rastreador de Jogador
        </p>
      </motion.div>

      {/* Sleek Bottom Progress Bar */}
      <div className="mt-6 h-1 w-36 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left center' }}
          className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-amber-400"
        />
      </div>
    </motion.div>
  );
}
