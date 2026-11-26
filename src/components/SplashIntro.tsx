import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { startStadiumCheer, StadiumCheerController } from '../utils/stadiumAudio';

interface SplashIntroProps {
  onComplete: () => void;
  soundEnabled?: boolean;
  reducedMotion?: boolean;
}

export function SplashIntro({
  onComplete,
  soundEnabled = true,
  reducedMotion = false,
}: SplashIntroProps) {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [needsAudioTap, setNeedsAudioTap] = useState(false);
  const audioRef = useRef<StadiumCheerController | null>(null);
  const completedRef = useRef(false);

  const finishIntro = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    audioRef.current?.stop();
    onComplete();
  };

  useEffect(() => {
    const osReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const isReduced = reducedMotion || osReduced;
    const totalDuration = isReduced ? 550 : 3000;

    if (soundEnabled) {
      const controller = startStadiumCheer(isReduced ? 1.2 : 2.9);
      audioRef.current = controller;
      if (controller.started) {
        setAudioUnlocked(true);
        setNeedsAudioTap(false);
      } else if (controller.needsGesture) {
        setNeedsAudioTap(true);
      }
    }

    const unlockOnFirstInteraction = () => {
      if (!audioRef.current) return;
      void audioRef.current.unlockAndPlay().then((ok) => {
        if (ok) {
          setAudioUnlocked(true);
          setNeedsAudioTap(false);
        }
      });
    };

    window.addEventListener('pointerdown', unlockOnFirstInteraction, { once: true, passive: true });
    window.addEventListener('keydown', unlockOnFirstInteraction, { once: true, passive: true });

    const timer = window.setTimeout(finishIntro, totalDuration);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', unlockOnFirstInteraction);
      window.removeEventListener('keydown', unlockOnFirstInteraction);
      audioRef.current?.stop();
    };
  }, [soundEnabled, reducedMotion]);

  const handleUnlockAudioClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) {
      audioRef.current = startStadiumCheer(2.9);
    }
    const ok = await audioRef.current.unlockAndPlay();
    if (ok) {
      setAudioUnlocked(true);
      setNeedsAudioTap(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onClick={finishIntro}
      role="status"
      aria-live="polite"
      aria-label="Abrindo Modo Carreira, Rastreador de Jogador. Toque para pular."
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080D1A] px-6 select-none cursor-pointer overflow-hidden"
    >
      {/* Top Stadium Floodlight Beams */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(37,99,235,0.06) 45%, transparent 72%)',
          }}
        />
        <div
          className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(245,158,11,0.16) 0%, rgba(56,189,248,0.05) 45%, transparent 72%)',
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(16,185,129,0.05) 46%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Subtle Stadium Pitch Geometry Backdrop */}
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.14, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute h-[380px] w-[380px] sm:h-[480px] sm:w-[480px] text-blue-400"
        fill="none"
      >
        <circle cx="200" cy="200" r="110" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="200" cy="200" r="165" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 8" />
        <line x1="0" y1="200" x2="400" y2="200" stroke="currentColor" strokeWidth="1" />
      </motion.svg>

      {/* Center Emblem + Stadium Shockwave Rings */}
      <div className="relative flex items-center justify-center">
        {/* Expanding Stadium Pulse Ring 1 */}
        <motion.div
          aria-hidden="true"
          initial={{ scale: 0.78, opacity: 0 }}
          animate={{ scale: 1.55, opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute h-28 w-28 sm:h-32 sm:w-32 rounded-3xl border border-blue-400/50"
        />

        {/* Expanding Golden Peak Ring 2 (Synced to Star Reveal) */}
        <motion.div
          aria-hidden="true"
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 1.7, opacity: [0, 0.45, 0] }}
          transition={{ duration: 1.35, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute h-28 w-28 sm:h-32 sm:w-32 rounded-3xl border border-amber-400/55"
        />

        {/* Crest Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl border border-white/15 bg-[#11192D]/90 p-3 shadow-2xl overflow-hidden"
        >
          {/* Stadium Light Sweep Sheen */}
          <motion.div
            aria-hidden="true"
            initial={{ x: '-160%' }}
            animate={{ x: '250%' }}
            transition={{ duration: 0.85, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-y-0 w-12 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
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
              initial={{ pathLength: 0, opacity: 0.35 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Inner crest frame */}
            <motion.path
              d="M64 20L96 31.5V59.5C96 81.2 82.2 98.4 64 105.5C45.8 98.4 32 81.2 32 59.5V31.5L64 20Z"
              stroke="#3B82F6"
              strokeOpacity="0.38"
              strokeWidth="1.75"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.65, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M74 47H86V59"
              stroke="#60A5FA"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: 1.0 }}
            />

            {/* Golden Prime Star */}
            <motion.path
              d="M64 29L67.8 36.8L76.4 38L70.2 44.1L71.7 52.6L64 48.6L56.3 52.6L57.8 44.1L51.6 38L60.2 36.8L64 29Z"
              fill="url(#splash-gold)"
              initial={{ scale: 0, opacity: 0, rotate: -25 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 16, delay: 1.15 }}
              style={{ transformOrigin: '64px 41px' }}
            />

            {/* Gold base accent */}
            <motion.path
              d="M45 90H83"
              stroke="#F59E0B"
              strokeOpacity="0.8"
              strokeWidth="3.2"
              strokeLinecap="round"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 1.35 }}
              style={{ transformOrigin: '64px 90px' }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Brand Title & Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 text-center"
      >
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-wider text-white uppercase">
          Modo Carreira
        </h1>
        <motion.div
          initial={{ opacity: 0, scaleX: 0.85 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 flex items-center justify-center gap-3"
        >
          <span className="h-px w-8 bg-blue-500/50" aria-hidden="true" />
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-slate-300">
            Rastreador de Jogador
          </p>
          <span className="h-px w-8 bg-amber-400/50" aria-hidden="true" />
        </motion.div>
      </motion.div>

      {/* Progress Bar + Interactive Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-8 flex flex-col items-center gap-3.5"
      >
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'left center' }}
            className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-amber-400"
          />
        </div>

        <div className="flex items-center gap-3">
          {soundEnabled && needsAudioTap && !audioUnlocked && (
            <button
              type="button"
              onClick={handleUnlockAudioClick}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-blue-500/35 bg-blue-600/20 px-3 py-1.5 text-xs font-semibold text-blue-200 transition-colors hover:bg-blue-600/30"
            >
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ativar som da torcida</span>
            </button>
          )}

          {soundEnabled && audioUnlocked && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Volume2 className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
              <span>Torcida no estádio</span>
            </span>
          )}

          <span className="text-[11px] font-medium text-slate-500">
            Toque para pular
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
