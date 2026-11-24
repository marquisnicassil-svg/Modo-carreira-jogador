import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, ChevronRight, Crown, Trophy } from 'lucide-react';
import { CareerProfile } from '../types/career';
import {
  computeCareerSummary,
  formatRating,
  getClubAccent,
  getClubMonogram,
} from '../utils/careerEngine';

interface StatsViewProps {
  career: CareerProfile;
  onSelectSeasonFromTimeline: (year: number) => void;
}

export function StatsView({ career, onSelectSeasonFromTimeline }: StatsViewProps) {
  const [chartMode, setChartMode] = useState<'ga' | 'ovr'>('ga');
  const summary = computeCareerSummary(career);

  const seasons = [...career.seasons]
    .filter(
      (s, idx) =>
        s.isCompleted ||
        s.goals > 0 ||
        s.assists > 0 ||
        s.rating > 0 ||
        s.trophies.length > 0 ||
        idx === 0
    )
    .sort((a, b) => a.year - b.year);

  const maxGA = Math.max(10, ...seasons.map((s) => Math.max(s.goals, s.assists)));

  const totalsList = [
    {
      label: 'Temporadas',
      value: summary.totalSeasons,
      colorClass: 'text-white',
      srText: `${summary.totalSeasons} ${summary.totalSeasons === 1 ? 'temporada' : 'temporadas'}`,
    },
    {
      label: 'Gols',
      value: summary.totalGoals,
      colorClass: 'text-emerald-400',
      srText: `${summary.totalGoals} gols na carreira`,
    },
    {
      label: 'Assistências',
      value: summary.totalAssists,
      colorClass: 'text-sky-400',
      srText: `${summary.totalAssists} assistências na carreira`,
    },
    {
      label: 'Participações (G+A)',
      value: summary.totalContributions,
      colorClass: 'text-white',
      srText: `${summary.totalContributions} participações em gols`,
    },
    {
      label: 'Média Geral',
      value: formatRating(summary.averageRating),
      colorClass: 'text-white',
      srText: `Média geral de ${formatRating(summary.averageRating)}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Career Totals Summary Grid */}
      <section aria-labelledby="career-totals-heading">
        <h2
          id="career-totals-heading"
          className="font-display text-lg sm:text-xl font-bold tracking-wide text-white uppercase mb-3"
        >
          Totais da Carreira
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {totalsList.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.22,
                delay: idx * 0.035,
                ease: [0.22, 1, 0.36, 1],
              }}
              tabIndex={0}
              aria-label={item.srText}
              className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div aria-hidden="true" className="text-xs font-medium text-slate-400">
                {item.label}
              </div>
              <div
                aria-hidden="true"
                className={`mt-1 font-display text-3xl font-extrabold tabular-nums ${item.colorClass}`}
              >
                {item.value}
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.22,
              delay: totalsList.length * 0.035,
              ease: [0.22, 1, 0.36, 1],
            }}
            tabIndex={0}
            aria-label={`${summary.totalTrophies} ${summary.totalTrophies === 1 ? 'título' : 'títulos'}, overall máximo ${summary.peakOverall}`}
            className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div aria-hidden="true" className="text-xs font-medium text-slate-400">
              Títulos · Over Pico
            </div>
            <div
              aria-hidden="true"
              className="mt-1 font-display text-3xl font-extrabold text-amber-400 tabular-nums"
            >
              {summary.totalTrophies}{' '}
              <span className="text-base font-mono-num text-slate-400 font-semibold">
                / {summary.peakOverall}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Evolution Chart */}
      <section
        aria-labelledby="career-evolution-heading"
        className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2
              id="career-evolution-heading"
              className="font-display text-lg font-bold tracking-wide text-white uppercase"
            >
              Evolução por Temporada
            </h2>
            <p className="text-xs text-slate-400">
              Desempenho comparativo ano a ano na carreira
            </p>
          </div>

          <div
            role="group"
            aria-label="Modo de visualização do gráfico"
            className="inline-flex rounded-xl bg-[#0B1222] p-1 border border-white/[0.06] self-start sm:self-auto"
          >
            <button
              type="button"
              onClick={() => setChartMode('ga')}
              aria-pressed={chartMode === 'ga'}
              className={`relative min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                chartMode === 'ga' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {chartMode === 'ga' && (
                <motion.span
                  layoutId="stats-chart-pill"
                  transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-lg bg-blue-600"
                />
              )}
              <span className="relative z-10">Gols &amp; Assist.</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('ovr')}
              aria-pressed={chartMode === 'ovr'}
              className={`relative min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                chartMode === 'ovr' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {chartMode === 'ovr' && (
                <motion.span
                  layoutId="stats-chart-pill"
                  transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-lg bg-blue-600"
                />
              )}
              <span className="relative z-10">Over &amp; Média</span>
            </button>
          </div>
        </div>

        {seasons.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            Registre estatísticas na aba Carreira para visualizar o gráfico.
          </p>
        ) : (
          <AnimatePresence mode="wait">
            {chartMode === 'ga' ? (
              <motion.div
                key="chart-ga"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="overflow-x-auto no-scrollbar"
              >
                <div
                  role="list"
                  aria-label="Gráfico de gols e assistências por temporada"
                  className="min-w-[320px] flex items-end justify-around gap-3 pt-6 pb-2 h-52 border-b border-white/[0.08]"
                >
                  {seasons.map((s, idx) => {
                    const gHeight = Math.max(4, Math.round((s.goals / maxGA) * 140));
                    const aHeight = Math.max(4, Math.round((s.assists / maxGA) * 140));
                    const isPrime = s.id === summary.primeSeasonId && seasons.length > 1;
                    return (
                      <div key={s.id} role="listitem">
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => onSelectSeasonFromTimeline(s.year)}
                          aria-label={`Temporada ${s.year} no ${s.club}: ${s.goals} gols, ${s.assists} assistências${isPrime ? ', temporada prime' : ''}. Toque para abrir`}
                          className="group flex flex-col items-center gap-2 px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
                          title={`Abrir temporada ${s.year}`}
                        >
                          <div aria-hidden="true" className="flex items-end gap-1.5 h-36">
                            <div className="flex flex-col items-center">
                              <span className="text-[11px] font-mono-num font-bold text-emerald-400 mb-1">
                                {s.goals}
                              </span>
                              <motion.div
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{
                                  duration: 0.38,
                                  delay: Math.min(idx * 0.04, 0.25),
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                style={{ height: `${gHeight}px`, transformOrigin: 'bottom' }}
                                className="w-5 sm:w-7 rounded-t-md bg-emerald-500/85 group-hover:bg-emerald-400 transition-colors"
                              />
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[11px] font-mono-num font-bold text-sky-400 mb-1">
                                {s.assists}
                              </span>
                              <motion.div
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{
                                  duration: 0.38,
                                  delay: Math.min(idx * 0.04 + 0.04, 0.28),
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                style={{ height: `${aHeight}px`, transformOrigin: 'bottom' }}
                                className="w-5 sm:w-7 rounded-t-md bg-sky-500/85 group-hover:bg-sky-400 transition-colors"
                              />
                            </div>
                          </div>
                          <div aria-hidden="true" className="text-center">
                            <div className="text-xs font-mono-num font-bold text-white group-hover:text-blue-400 transition-colors">
                              {s.year}
                              {isPrime ? ' ★' : ''}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[72px]">
                              {s.club}
                            </div>
                          </div>
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
                <div
                  aria-hidden="true"
                  className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-400"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                    Gols
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
                    Assistências
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chart-ovr"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="overflow-x-auto no-scrollbar"
              >
                <div
                  role="list"
                  aria-label="Gráfico de overall e nota média por temporada"
                  className="min-w-[320px] flex items-end justify-around gap-3 pt-6 pb-2 h-52 border-b border-white/[0.08]"
                >
                  {seasons.map((s, idx) => {
                    const ovrHeight = Math.max(12, Math.round(((s.endOverall - 40) / 60) * 140));
                    const ratingHeight = Math.max(8, Math.round((s.rating / 10) * 140));
                    return (
                      <div key={s.id} role="listitem">
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => onSelectSeasonFromTimeline(s.year)}
                          aria-label={`Temporada ${s.year} no ${s.club}: overall ${s.endOverall}, média ${formatRating(s.rating)}. Toque para abrir`}
                          className="group flex flex-col items-center gap-2 px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
                        >
                          <div aria-hidden="true" className="flex items-end gap-1.5 h-36">
                            <div className="flex flex-col items-center">
                              <span className="text-[11px] font-mono-num font-bold text-amber-400 mb-1">
                                {s.endOverall}
                              </span>
                              <motion.div
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{
                                  duration: 0.38,
                                  delay: Math.min(idx * 0.04, 0.25),
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                style={{
                                  height: `${Math.min(140, ovrHeight)}px`,
                                  transformOrigin: 'bottom',
                                }}
                                className="w-5 sm:w-7 rounded-t-md bg-amber-500/85 group-hover:bg-amber-400 transition-colors"
                              />
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[11px] font-mono-num font-bold text-blue-300 mb-1">
                                {formatRating(s.rating)}
                              </span>
                              <motion.div
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{
                                  duration: 0.38,
                                  delay: Math.min(idx * 0.04 + 0.04, 0.28),
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                style={{ height: `${ratingHeight}px`, transformOrigin: 'bottom' }}
                                className="w-5 sm:w-7 rounded-t-md bg-blue-500/85 group-hover:bg-blue-400 transition-colors"
                              />
                            </div>
                          </div>
                          <div aria-hidden="true" className="text-center">
                            <div className="text-xs font-mono-num font-bold text-white group-hover:text-blue-400 transition-colors">
                              {s.year}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[72px]">
                              {s.club}
                            </div>
                          </div>
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
                <div
                  aria-hidden="true"
                  className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-400"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                    Over (OVR)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                    Média (0–10)
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>

      {/* Clickable Timeline + Trophy Cabinet 2-Col Split on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Linha do Tempo (8 cols) */}
        <section
          aria-labelledby="career-timeline-heading"
          className="lg:col-span-8 rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2
                id="career-timeline-heading"
                className="font-display text-lg font-bold tracking-wide text-white uppercase"
              >
                Linha do Tempo da Carreira
              </h2>
              <p className="text-xs text-slate-400">
                Toque em qualquer temporada para abrir o resumo e editar
              </p>
            </div>
          </div>

          <ul className="divide-y divide-white/[0.06]" aria-label="Temporadas da carreira">
            {seasons.map((season, idx) => {
              const isPrime = season.id === summary.primeSeasonId;
              const accent = getClubAccent(season.club);
              const monogram = getClubMonogram(season.club);
              return (
                <li key={season.id}>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(idx * 0.03, 0.2),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => onSelectSeasonFromTimeline(season.year)}
                    aria-label={`Temporada ${season.year}, ${season.club}, ${season.age} anos, ${season.goals} gols, ${season.assists} assistências, média ${formatRating(season.rating)}, overall ${season.endOverall}${season.trophies.length > 0 ? `, ${season.trophies.length} ${season.trophies.length === 1 ? 'título' : 'títulos'}` : ''}${isPrime ? ', temporada prime' : ''}. Toque para abrir`}
                    className={`w-full min-h-[68px] flex items-center justify-between gap-3 py-3.5 px-2 -mx-2 rounded-xl text-left transition-colors duration-150 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isPrime ? 'bg-amber-500/[0.06]' : ''
                    }`}
                  >
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono-num text-sm font-bold text-white">
                            {season.year}
                          </span>
                          <span className="text-sm font-semibold text-slate-200 truncate">
                            {season.club}
                          </span>
                          {isPrime && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                              <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                              PRIME
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-400 tabular-nums">
                          <span>{season.age} anos</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400 font-medium">{season.goals} G</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-sky-400 font-medium">{season.assists} A</span>
                          <span aria-hidden="true">·</span>
                          <span>Média {formatRating(season.rating)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-300 font-medium">OVR {season.endOverall}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {season.trophies.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-mono-num font-bold text-amber-400">
                          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                          {season.trophies.length}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    </div>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Sala de Troféus (4 cols) */}
        <section
          aria-labelledby="trophy-cabinet-heading"
          className="lg:col-span-4 rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <h2
              id="trophy-cabinet-heading"
              className="font-display text-lg font-bold tracking-wide text-white uppercase"
            >
              Sala de Troféus
            </h2>
          </div>

          {summary.trophyGroups.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">
              Nenhuma conquista registrada até o momento.
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.06]" aria-label="Conquistas acumuladas na carreira">
              {summary.trophyGroups.map((group) => (
                <li
                  key={group.name}
                  tabIndex={0}
                  aria-label={`${group.name}, conquistado ${group.count} ${group.count === 1 ? 'vez' : 'vezes'}, nos anos ${group.years.join(', ')}`}
                  className="py-3 flex items-start justify-between gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100">{group.name}</div>
                    <div className="text-xs text-slate-400 tabular-nums mt-0.5">
                      {group.years.join(', ')}
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className="font-display text-xl font-extrabold text-amber-400 tabular-nums shrink-0"
                  >
                    {group.count}x
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
