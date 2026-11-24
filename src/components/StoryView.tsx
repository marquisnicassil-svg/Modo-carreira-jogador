import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Check, Copy, Crown, Trophy } from 'lucide-react';
import { CareerProfile } from '../types/career';
import { generateCareerStory } from '../utils/careerEngine';

interface StoryViewProps {
  career: CareerProfile;
  onSelectSeasonYear: (year: number) => void;
}

export function StoryView({ career, onSelectSeasonYear }: StoryViewProps) {
  const [copied, setCopied] = useState(false);
  const story = generateCareerStory(career);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(story.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard fallback ignored silently
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" aria-hidden="true" />
            <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-wide text-white uppercase">
              História de {career.playerName}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Crônica gerada automaticamente a partir das temporadas, transferências e conquistas.
          </p>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={handleCopy}
          aria-live="polite"
          aria-label={copied ? 'História copiada para a área de transferência' : `Copiar biografia completa de ${career.playerName}`}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/[0.1] whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              História Copiada
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-slate-300" aria-hidden="true" />
              Copiar Biografia
            </>
          )}
        </motion.button>
      </div>

      {/* Narrative Chapters */}
      <div className="space-y-4" role="feed" aria-label={`Capítulos da carreira de ${career.playerName}`}>
        {story.chapters.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-6 text-center text-sm text-slate-400">
            Comece registrando gols, assistências ou encerrando a primeira temporada para escrever o primeiro capítulo.
          </div>
        ) : (
          story.chapters.map((chapter, index) => (
            <motion.article
              key={chapter.seasonId}
              aria-labelledby={`chapter-title-${chapter.seasonId}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.24,
                delay: Math.min(index * 0.04, 0.24),
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`rounded-2xl border p-5 sm:p-6 transition-colors ${
                chapter.isPrime
                  ? 'border-amber-500/35 bg-[#151D33]'
                  : 'border-white/[0.08] bg-[#11192D]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => onSelectSeasonYear(chapter.year)}
                  aria-label={`${chapter.headline}${chapter.isPrime ? ', temporada prime' : ''}. Toque para abrir temporada ${chapter.year}`}
                  className="text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
                >
                  <h3
                    id={`chapter-title-${chapter.seasonId}`}
                    className="font-display text-lg sm:text-xl font-bold tracking-wide text-white uppercase group-hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span>{chapter.headline}</span>
                    {chapter.isPrime && (
                      <Crown className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
                    )}
                  </h3>
                </button>

                {chapter.trophiesWon.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                    {chapter.trophiesWon.length}{' '}
                    {chapter.trophiesWon.length === 1 ? 'título' : 'títulos'}
                  </span>
                )}
              </div>

              <div className="space-y-2.5 text-sm sm:text-[15px] leading-relaxed text-slate-300 max-w-3xl">
                {chapter.paragraphs.map((text, idx) => (
                  <p key={idx}>{text}</p>
                ))}
              </div>
            </motion.article>
          ))
        )}

        {/* Career Epilogue / Ongoing Card */}
        <motion.article
          aria-labelledby="story-epilogue-heading"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-blue-500/25 bg-blue-950/20 p-5 sm:p-6"
        >
          <h3
            id="story-epilogue-heading"
            className="font-display text-lg font-bold tracking-wide text-blue-300 uppercase mb-2"
          >
            {story.epilogueTitle}
          </h3>
          <p className="text-sm sm:text-[15px] leading-relaxed text-slate-200 max-w-3xl">
            {story.epilogueBody}
          </p>
        </motion.article>
      </div>
    </div>
  );
}
