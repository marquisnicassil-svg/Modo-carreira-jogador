import { motion } from 'motion/react';
import { getClubAccent, getClubMonogram } from '../utils/careerEngine';

export interface TransitionLoaderState {
  title: string;
  subtitle: string;
  club?: string;
  photo?: string;
  accentTone?: 'blue' | 'amber';
}

export function TransitionLoader({
  title,
  subtitle,
  club = '',
  photo,
  accentTone = 'blue',
}: TransitionLoaderState) {
  const accent = getClubAccent(club);
  const monogram = getClubMonogram(club || 'MC');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
      aria-label={`${title}. ${subtitle}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080D1A]/96 px-6 select-none overflow-hidden gpu-layer"
    >
      {/* Lightweight Radial Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-72 w-72 rounded-full"
        style={{
          background:
            accentTone === 'amber'
              ? 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(8,13,26,0) 70%)'
              : 'radial-gradient(circle, rgba(37,99,235,0.24) 0%, rgba(8,13,26,0) 70%)',
        }}
      />

      {/* Animated Center Emblem / Player Avatar with Dual Orbital Spinner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-24 w-24 items-center justify-center"
      >
        {/* Outer rotating arc */}
        <motion.div
          aria-hidden="true"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
          className={`absolute inset-0 rounded-full border-2 border-transparent ${
            accentTone === 'amber'
              ? 'border-t-amber-400 border-r-blue-500/60'
              : 'border-t-blue-500 border-r-amber-400/70'
          }`}
        />

        {/* Inner counter-rotating ring */}
        <motion.div
          aria-hidden="true"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-1.5 rounded-full border border-white/10 border-b-blue-400/50"
        />

        {photo ? (
          <div aria-hidden="true" className="h-16 w-16 overflow-hidden rounded-2xl border border-white/15 bg-[#11192D] shadow-xl">
            <img
              src={photo}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 font-display text-xl font-extrabold tracking-wider shadow-xl"
            style={{
              backgroundColor: accent.bg,
              borderColor: accent.ring,
              color: accent.text,
            }}
          >
            {monogram}
          </div>
        )}
      </motion.div>

      {/* Contextual Loading Copy */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.03, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 text-center"
      >
        <p className="font-display text-2xl sm:text-3xl font-extrabold tracking-wide text-white uppercase">
          {title}
        </p>
        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-400">{subtitle}</p>
      </motion.div>

      {/* Progress Sweep Bar */}
      <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left center' }}
          className={`h-full w-full rounded-full ${
            accentTone === 'amber'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-blue-500'
              : 'bg-gradient-to-r from-blue-500 via-sky-400 to-amber-400'
          }`}
        />
      </div>
    </motion.div>
  );
}
