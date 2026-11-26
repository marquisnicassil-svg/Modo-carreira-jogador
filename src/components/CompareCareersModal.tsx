import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeftRight, Crown, Trophy, X } from 'lucide-react';
import { CareerProfile } from '../types/career';
import {
  computeCareerRecords,
  computeCareerSummary,
  formatRating,
  getClubAccent,
  getClubMonogram,
} from '../utils/careerEngine';

interface CompareCareersModalProps {
  careers: CareerProfile[];
  initialLeftId?: string | null;
  onClose: () => void;
}

interface CompareMetricRow {
  label: string;
  leftDisplay: string;
  rightDisplay: string;
  leftVal: number;
  rightVal: number;
  lowerIsBetter?: boolean;
  srLabel: string;
}

export function CompareCareersModal({
  careers,
  initialLeftId,
  onClose,
}: CompareCareersModalProps) {
  const defaultLeft =
    (initialLeftId && careers.some((c) => c.id === initialLeftId)
      ? initialLeftId
      : careers[0]?.id) || '';
  const defaultRight =
    careers.find((c) => c.id !== defaultLeft)?.id || careers[0]?.id || '';

  const [leftId, setLeftId] = useState(defaultLeft);
  const [rightId, setRightId] = useState(defaultRight);

  const leftCareer = useMemo(
    () => careers.find((c) => c.id === leftId) || careers[0],
    [careers, leftId]
  );
  const rightCareer = useMemo(
    () => careers.find((c) => c.id === rightId) || careers[1] || careers[0],
    [careers, rightId]
  );

  const leftSummary = useMemo(() => computeCareerSummary(leftCareer), [leftCareer]);
  const rightSummary = useMemo(() => computeCareerSummary(rightCareer), [rightCareer]);
  const leftRecords = useMemo(() => computeCareerRecords(leftCareer), [leftCareer]);
  const rightRecords = useMemo(() => computeCareerRecords(rightCareer), [rightCareer]);

  const leftPrime = leftCareer.seasons.find((s) => s.id === leftSummary.primeSeasonId);
  const rightPrime = rightCareer.seasons.find((s) => s.id === rightSummary.primeSeasonId);

  const metrics: CompareMetricRow[] = [
    {
      label: 'Over Atual',
      leftDisplay: `${leftCareer.currentOverall}`,
      rightDisplay: `${rightCareer.currentOverall}`,
      leftVal: leftCareer.currentOverall,
      rightVal: rightCareer.currentOverall,
      srLabel: `Overall atual`,
    },
    {
      label: 'Over Pico',
      leftDisplay: `${leftSummary.peakOverall}`,
      rightDisplay: `${rightSummary.peakOverall}`,
      leftVal: leftSummary.peakOverall,
      rightVal: rightSummary.peakOverall,
      srLabel: `Overall máximo`,
    },
    {
      label: 'Temporadas',
      leftDisplay: `${leftSummary.totalSeasons}`,
      rightDisplay: `${rightSummary.totalSeasons}`,
      leftVal: leftSummary.totalSeasons,
      rightVal: rightSummary.totalSeasons,
      srLabel: `Temporadas disputadas`,
    },
    {
      label: 'Jogos',
      leftDisplay: `${leftSummary.totalGames}`,
      rightDisplay: `${rightSummary.totalGames}`,
      leftVal: leftSummary.totalGames,
      rightVal: rightSummary.totalGames,
      srLabel: `Jogos disputados`,
    },
    {
      label: 'Gols',
      leftDisplay: `${leftSummary.totalGoals}`,
      rightDisplay: `${rightSummary.totalGoals}`,
      leftVal: leftSummary.totalGoals,
      rightVal: rightSummary.totalGoals,
      srLabel: `Gols na carreira`,
    },
    {
      label: 'Assistências',
      leftDisplay: `${leftSummary.totalAssists}`,
      rightDisplay: `${rightSummary.totalAssists}`,
      leftVal: leftSummary.totalAssists,
      rightVal: rightSummary.totalAssists,
      srLabel: `Assistências na carreira`,
    },
    {
      label: 'Participações (G+A)',
      leftDisplay: `${leftSummary.totalContributions}`,
      rightDisplay: `${rightSummary.totalContributions}`,
      leftVal: leftSummary.totalContributions,
      rightVal: rightSummary.totalContributions,
      srLabel: `Participações diretas em gol`,
    },
    {
      label: 'Gols por Jogo',
      leftDisplay: leftRecords.goalsPerGame.toFixed(2),
      rightDisplay: rightRecords.goalsPerGame.toFixed(2),
      leftVal: leftRecords.goalsPerGame,
      rightVal: rightRecords.goalsPerGame,
      srLabel: `Média de gols por jogo`,
    },
    {
      label: 'Média Geral',
      leftDisplay: formatRating(leftSummary.averageRating),
      rightDisplay: formatRating(rightSummary.averageRating),
      leftVal: leftSummary.averageRating,
      rightVal: rightSummary.averageRating,
      srLabel: `Nota média geral`,
    },
    {
      label: 'Títulos',
      leftDisplay: `${leftSummary.totalTrophies}`,
      rightDisplay: `${rightSummary.totalTrophies}`,
      leftVal: leftSummary.totalTrophies,
      rightVal: rightSummary.totalTrophies,
      srLabel: `Títulos conquistados`,
    },
    {
      label: 'Cartões Amarelos',
      leftDisplay: `${leftSummary.totalYellowCards}`,
      rightDisplay: `${rightSummary.totalYellowCards}`,
      leftVal: leftSummary.totalYellowCards,
      rightVal: rightSummary.totalYellowCards,
      lowerIsBetter: true,
      srLabel: `Cartões amarelos, menor é melhor`,
    },
    {
      label: 'Cartões Vermelhos',
      leftDisplay: `${leftSummary.totalRedCards}`,
      rightDisplay: `${rightSummary.totalRedCards}`,
      leftVal: leftSummary.totalRedCards,
      rightVal: rightSummary.totalRedCards,
      lowerIsBetter: true,
      srLabel: `Cartões vermelhos, menor é melhor`,
    },
  ];

  let leftWins = 0;
  let rightWins = 0;
  for (const m of metrics) {
    if (m.leftVal === m.rightVal) continue;
    const leftBetter = m.lowerIsBetter ? m.leftVal < m.rightVal : m.leftVal > m.rightVal;
    if (leftBetter) leftWins += 1;
    else rightWins += 1;
  }

  const handleSwap = () => {
    setLeftId(rightId);
    setRightId(leftId);
  };

  const renderPlayerHeader = (career: CareerProfile, side: 'left' | 'right') => {
    const accent = getClubAccent(career.currentClub);
    const monogram = getClubMonogram(career.currentClub);

    return (
      <div
        className={`flex items-center gap-2.5 min-w-0 ${
          side === 'right' ? 'flex-row-reverse text-right' : ''
        }`}
      >
        {career.playerPhoto ? (
          <div
            aria-hidden="true"
            className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 bg-[#0B1222]"
            style={{ borderColor: accent.ring }}
          >
            <img
              src={career.playerPhoto}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 font-display text-sm font-extrabold"
            style={{
              backgroundColor: accent.bg,
              borderColor: accent.ring,
              color: accent.text,
            }}
          >
            {monogram}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-extrabold text-white uppercase truncate">
            {career.playerName}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {career.currentClub} · {career.position}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-careers-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#11192D] p-5 sm:p-6 shadow-2xl max-h-[90dvh] overflow-y-auto overscroll-contain pb-safe gpu-layer"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700 sm:hidden" aria-hidden="true" />

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2
              id="compare-careers-title"
              className="font-display text-2xl font-extrabold text-white uppercase"
            >
              Comparar Carreiras
            </h2>
            <p className="text-xs text-slate-400">
              Duelo direto entre dois jogadores salvos
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar comparação"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Selectors */}
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div className="min-w-0">
            <label htmlFor="compare-left" className="block text-[11px] font-semibold text-blue-300 mb-1">
              Jogador A
            </label>
            <select
              id="compare-left"
              value={leftCareer.id}
              onChange={(e) => setLeftId(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0B1222] px-2.5 text-xs font-semibold text-white focus:border-blue-500 focus:outline-none"
            >
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.playerName} ({c.currentClub})
                </option>
              ))}
            </select>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={handleSwap}
            aria-label="Inverter jogadores comparados"
            title="Inverter lados"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.1]"
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          </motion.button>

          <div className="min-w-0">
            <label htmlFor="compare-right" className="block text-[11px] font-semibold text-amber-300 mb-1 text-right">
              Jogador B
            </label>
            <select
              id="compare-right"
              value={rightCareer.id}
              onChange={(e) => setRightId(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0B1222] px-2.5 text-xs font-semibold text-white focus:border-amber-400 focus:outline-none"
            >
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.playerName} ({c.currentClub})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Player Cards + Scoreboard */}
        <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[#0B1222] p-3.5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
            {renderPlayerHeader(leftCareer, 'left')}

            <div
              aria-label={`Placar do duelo: ${leftCareer.playerName} vence ${leftWins} categorias, ${rightCareer.playerName} vence ${rightWins} categorias`}
              className="flex items-center justify-center gap-2 font-display text-2xl font-extrabold tabular-nums px-2"
            >
              <span className="text-blue-400">{leftWins}</span>
              <span className="text-xs font-sans font-semibold text-slate-500 uppercase">x</span>
              <span className="text-amber-400">{rightWins}</span>
            </div>

            {renderPlayerHeader(rightCareer, 'right')}
          </div>
        </div>

        {/* Metric Rows */}
        <ul className="mt-4 divide-y divide-white/[0.06]" aria-label="Comparação estatística">
          {metrics.map((m) => {
            const sum = m.leftVal + m.rightVal;
            const leftPct = sum > 0 ? Math.round((m.leftVal / sum) * 100) : 50;
            const rightPct = sum > 0 ? 100 - leftPct : 50;
            const isTie = m.leftVal === m.rightVal;
            const leftBetter =
              !isTie && (m.lowerIsBetter ? m.leftVal < m.rightVal : m.leftVal > m.rightVal);
            const rightBetter = !isTie && !leftBetter;

            return (
              <li
                key={m.label}
                tabIndex={0}
                aria-label={`${m.srLabel}: ${leftCareer.playerName} com ${m.leftDisplay}, ${rightCareer.playerName} com ${m.rightDisplay}. ${
                  isTie
                    ? 'Empate'
                    : `Vantagem de ${leftBetter ? leftCareer.playerName : rightCareer.playerName}`
                }`}
                className="py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    className={`font-mono-num text-sm font-bold tabular-nums w-14 ${
                      leftBetter ? 'text-blue-400' : 'text-slate-300'
                    }`}
                  >
                    {m.leftDisplay}
                  </span>
                  <span className="text-slate-400 font-medium text-center flex-1">
                    {m.label}
                  </span>
                  <span
                    className={`font-mono-num text-sm font-bold tabular-nums w-14 text-right ${
                      rightBetter ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    {m.rightDisplay}
                  </span>
                </div>

                <div
                  aria-hidden="true"
                  className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] gap-0.5"
                >
                  <div
                    className={`h-full rounded-l-full ${
                      leftBetter ? 'bg-blue-500' : 'bg-blue-500/40'
                    }`}
                    style={{ width: `${leftPct}%` }}
                  />
                  <div
                    className={`h-full rounded-r-full ${
                      rightBetter ? 'bg-amber-400' : 'bg-amber-400/40'
                    }`}
                    style={{ width: `${rightPct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        {/* Prime Season Comparison */}
        {(leftPrime || rightPrime) && (
          <div className="mt-4 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2.5">
              <Crown className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Temporada Prime</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-blue-500/25 bg-[#0B1222] p-3">
                <div className="text-xs font-semibold text-blue-300 truncate">
                  {leftCareer.playerName}
                </div>
                {leftPrime ? (
                  <div className="mt-1 text-xs text-slate-300 tabular-nums">
                    {leftPrime.year} · {leftPrime.club} — {leftPrime.goals}G, {leftPrime.assists}A,
                    OVR {leftPrime.endOverall}
                    {leftPrime.trophies.length > 0 && (
                      <span className="inline-flex items-center gap-1 ml-1.5 text-amber-400">
                        <Trophy className="h-3 w-3" aria-hidden="true" />
                        {leftPrime.trophies.length}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-slate-500">Sem temporada prime</div>
                )}
              </div>

              <div className="rounded-xl border border-amber-500/25 bg-[#0B1222] p-3">
                <div className="text-xs font-semibold text-amber-300 truncate">
                  {rightCareer.playerName}
                </div>
                {rightPrime ? (
                  <div className="mt-1 text-xs text-slate-300 tabular-nums">
                    {rightPrime.year} · {rightPrime.club} — {rightPrime.goals}G, {rightPrime.assists}A,
                    OVR {rightPrime.endOverall}
                    {rightPrime.trophies.length > 0 && (
                      <span className="inline-flex items-center gap-1 ml-1.5 text-amber-400">
                        <Trophy className="h-3 w-3" aria-hidden="true" />
                        {rightPrime.trophies.length}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-slate-500">Sem temporada prime</div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
