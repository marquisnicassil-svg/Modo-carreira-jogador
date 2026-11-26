import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Copy,
  Crown,
  Flag,
  Share2,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { CareerProfile } from '../types/career';
import {
  computeCareerRecords,
  computeCareerSummary,
  formatRating,
  generateCareerStory,
  getClubAccent,
  getClubMonogram,
} from '../utils/careerEngine';
import { copyTextToClipboard } from '../utils/storage';

interface StoryViewProps {
  career: CareerProfile;
  onSelectSeasonYear: (year: number) => void;
}

type ChapterFilter = 'all' | 'trophies' | 'transfers';

export function StoryView({ career, onSelectSeasonYear }: StoryViewProps) {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<ChapterFilter>('all');

  const story = useMemo(() => generateCareerStory(career), [career]);
  const summary = useMemo(() => computeCareerSummary(career), [career]);
  const records = useMemo(() => computeCareerRecords(career), [career]);

  const seasonById = useMemo(() => {
    const map = new Map(career.seasons.map((s) => [s.id, s]));
    return map;
  }, [career.seasons]);

  const visibleChapters = useMemo(() => {
    const filtered = story.chapters.filter((ch) => {
      if (filter === 'trophies') return ch.trophiesWon.length > 0;
      if (filter === 'transfers') {
        const s = seasonById.get(ch.seasonId);
        return Boolean(s?.transferFrom);
      }
      return true;
    });
    return order === 'asc' ? filtered : [...filtered].reverse();
  }, [story.chapters, filter, order, seasonById]);

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(story.fullText);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleShareStory = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `História · ${career.playerName}`,
          text: story.fullText,
        });
        setShareFeedback('História compartilhada!');
        window.setTimeout(() => setShareFeedback(null), 2400);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    const ok = await copyTextToClipboard(story.fullText);
    setShareFeedback(ok ? 'Biografia copiada!' : 'Erro ao copiar.');
    window.setTimeout(() => setShareFeedback(null), 2400);
  };

  return (
    <div className="space-y-5">
      {/* Header Command Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <BookOpen className="h-5 w-5 text-blue-400" aria-hidden="true" />
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-wide text-white uppercase">
                História de {career.playerName}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 tabular-nums">
              {story.chapters.length}{' '}
              {story.chapters.length === 1 ? 'capítulo' : 'capítulos'} · {records.clubsCount}{' '}
              {records.clubsCount === 1 ? 'clube' : 'clubes'} · {summary.totalTrophies}{' '}
              {summary.totalTrophies === 1 ? 'título' : 'títulos'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={handleShareStory}
              aria-live="polite"
              aria-label={`Compartilhar história de ${career.playerName}`}
              className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#0B1222] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.08] whitespace-nowrap"
            >
              {shareFeedback ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  <span>{shareFeedback}</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 text-blue-400" aria-hidden="true" />
                  <span>Compartilhar</span>
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={handleCopy}
              aria-live="polite"
              aria-label={
                copied
                  ? 'História copiada para a área de transferência'
                  : `Copiar biografia completa de ${career.playerName}`
              }
              className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-blue-500/35 bg-blue-600/20 px-3.5 py-2 text-xs font-semibold text-blue-100 transition-colors hover:bg-blue-600/30 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  <span>História Copiada</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-blue-300" aria-hidden="true" />
                  <span>Copiar Biografia</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Filter & Order Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div
            role="group"
            aria-label="Filtrar capítulos da história"
            className="inline-flex rounded-xl bg-[#0B1222] p-1 border border-white/[0.06] self-start"
          >
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: 'trophies', label: 'Com Títulos' },
                { id: 'transfers', label: 'Transferências' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                aria-pressed={filter === item.id}
                className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  filter === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div
            role="group"
            aria-label="Ordem dos capítulos"
            className="inline-flex rounded-xl bg-[#0B1222] p-1 border border-white/[0.06] self-start sm:self-auto"
          >
            <button
              type="button"
              onClick={() => setOrder('asc')}
              aria-pressed={order === 'asc'}
              className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                order === 'asc' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cronológica
            </button>
            <button
              type="button"
              onClick={() => setOrder('desc')}
              aria-pressed={order === 'desc'}
              className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                order === 'desc' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mais recente
            </button>
          </div>
        </div>
      </div>

      {/* Narrative Chapters */}
      <div
        className="space-y-4"
        role="feed"
        aria-label={`Capítulos da carreira de ${career.playerName}`}
      >
        {story.chapters.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-6 text-center text-sm text-slate-400">
            Comece registrando gols, assistências ou encerrando a primeira temporada para escrever o primeiro capítulo.
          </div>
        ) : visibleChapters.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-6 text-center space-y-2">
            <p className="text-sm text-slate-300">
              Nenhum capítulo encontrado com o filtro selecionado.
            </p>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Mostrar todos os capítulos
            </button>
          </div>
        ) : (
          visibleChapters.map((chapter, index) => {
            const season = seasonById.get(chapter.seasonId);
            const accent = getClubAccent(chapter.club);
            const monogram = getClubMonogram(chapter.club);
            const isTransfer = Boolean(season?.transferFrom);

            return (
              <motion.article
                key={chapter.seasonId}
                aria-labelledby={`chapter-title-${chapter.seasonId}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.18,
                  delay: Math.min(index * 0.025, 0.12),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`rounded-2xl border border-t-2 p-4 sm:p-5 space-y-3.5 transition-colors ${
                  chapter.isPrime
                    ? 'border-amber-500/35 bg-[#151D33]'
                    : 'border-white/[0.08] bg-[#11192D]'
                }`}
                style={{
                  borderTopColor: chapter.isPrime ? '#F59E0B' : accent.ring,
                }}
              >
                {/* Chapter Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-display font-bold"
                      style={{
                        backgroundColor: accent.bg,
                        borderColor: accent.ring,
                        color: accent.text,
                      }}
                    >
                      {monogram}
                    </div>

                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onSelectSeasonYear(chapter.year)}
                        aria-label={`${chapter.headline}${chapter.isPrime ? ', temporada prime' : ''}. Toque para abrir temporada ${chapter.year}`}
                        className="text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
                      >
                        <h3
                          id={`chapter-title-${chapter.seasonId}`}
                          className="font-display text-base sm:text-lg font-bold tracking-wide text-white uppercase group-hover:text-blue-400 transition-colors flex items-center gap-2 flex-wrap"
                        >
                          <span>{chapter.headline}</span>
                          {chapter.isPrime && (
                            <Crown
                              className="h-4 w-4 text-amber-400 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </h3>
                      </button>

                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400 tabular-nums mt-0.5">
                        <span>{chapter.age} anos</span>
                        {isTransfer && season?.transferFrom && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-sky-300 font-medium">
                              Chegou de {season.transferFrom}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectSeasonYear(chapter.year)}
                    aria-label={`Abrir temporada ${chapter.year}`}
                    className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-white/[0.08] bg-[#0B1222] px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition-colors hover:text-white hover:border-white/20 shrink-0"
                  >
                    <span>Abrir {chapter.year}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
                  </button>
                </div>

                {/* Compact Season Metrics Strip */}
                {season && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 rounded-xl bg-[#0B1222] border border-white/[0.05] px-3 py-2 text-center tabular-nums">
                    <div>
                      <div className="text-[10px] uppercase text-slate-500">Gols</div>
                      <div className="text-sm font-mono-num font-bold text-emerald-400">
                        {season.goals}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-slate-500">Assist.</div>
                      <div className="text-sm font-mono-num font-bold text-sky-400">
                        {season.assists}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-slate-500">Média</div>
                      <div className="text-sm font-mono-num font-bold text-violet-300">
                        {season.rating > 0 ? formatRating(season.rating) : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-slate-500">OVR</div>
                      <div className="text-sm font-mono-num font-bold text-amber-300">
                        {season.endOverall}
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-[10px] uppercase text-slate-500">Taças</div>
                      <div className="text-sm font-mono-num font-bold text-amber-400">
                        {chapter.trophiesWon.length}
                      </div>
                    </div>
                  </div>
                )}

                {/* Narrative Body */}
                <div className="space-y-2 text-sm sm:text-[15px] leading-relaxed text-slate-300 max-w-3xl">
                  {chapter.paragraphs.map((text, idx) => (
                    <p key={idx}>{text}</p>
                  ))}
                </div>

                {/* Trophies Footer */}
                {chapter.trophiesWon.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-white/[0.06] pt-2.5 text-xs text-amber-300">
                    <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
                      <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                      Conquistas:
                    </span>
                    <span className="text-slate-200">{chapter.trophiesWon.join(' · ')}</span>
                  </div>
                )}
              </motion.article>
            );
          })
        )}

        {/* Career Epilogue / Ongoing Card */}
        <motion.article
          aria-labelledby="story-epilogue-heading"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={`rounded-2xl border p-5 sm:p-6 space-y-3 ${
            career.retired
              ? 'border-amber-500/35 bg-[#151D33]'
              : 'border-blue-500/30 bg-[#11192D]'
          }`}
        >
          <div className="flex items-center gap-2">
            {career.retired ? (
              <Flag className="h-4 w-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4 text-blue-400" aria-hidden="true" />
            )}
            <h3
              id="story-epilogue-heading"
              className={`font-display text-lg font-bold tracking-wide uppercase ${
                career.retired ? 'text-amber-300' : 'text-blue-300'
              }`}
            >
              {story.epilogueTitle}
            </h3>
          </div>

          <p className="text-sm sm:text-[15px] leading-relaxed text-slate-200 max-w-3xl">
            {story.epilogueBody}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 tabular-nums">
            <div className="rounded-xl bg-[#0B1222] border border-white/[0.05] px-3 py-2 text-center">
              <div className="text-[10px] uppercase text-slate-400">Gols Totais</div>
              <div className="font-mono-num text-base font-extrabold text-emerald-400">
                {summary.totalGoals}
              </div>
            </div>
            <div className="rounded-xl bg-[#0B1222] border border-white/[0.05] px-3 py-2 text-center">
              <div className="text-[10px] uppercase text-slate-400">Assistências</div>
              <div className="font-mono-num text-base font-extrabold text-sky-400">
                {summary.totalAssists}
              </div>
            </div>
            <div className="rounded-xl bg-[#0B1222] border border-white/[0.05] px-3 py-2 text-center">
              <div className="text-[10px] uppercase text-slate-400">Taças</div>
              <div className="font-mono-num text-base font-extrabold text-amber-400">
                {summary.totalTrophies}
              </div>
            </div>
            <div className="rounded-xl bg-[#0B1222] border border-white/[0.05] px-3 py-2 text-center">
              <div className="text-[10px] uppercase text-slate-400">Over Pico</div>
              <div className="font-mono-num text-base font-extrabold text-yellow-300">
                {summary.peakOverall}
              </div>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
