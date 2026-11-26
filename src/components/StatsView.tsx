import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  Award,
  BarChart3,
  Building2,
  Calendar,
  Check,
  ChevronRight,
  Crown,
  Flame,
  Lock,
  Share2,
  Shield,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { CareerProfile, TrophyCategory } from '../types/career';
import {
  buildCareerShareText,
  computeCareerRecords,
  computeCareerSummary,
  computeClubBreakdown,
  formatRating,
  getCareerMilestones,
  getClubAccent,
  getClubMonogram,
} from '../utils/careerEngine';
import { copyTextToClipboard } from '../utils/storage';
import { CountryFlag } from './CountryFlag';

interface StatsViewProps {
  career: CareerProfile;
  onSelectSeasonFromTimeline: (year: number) => void;
}

type StatsSectionTab = 'overview' | 'clubs' | 'honors';
type MilestoneFilter = 'all' | 'unlocked' | 'locked';

const SECTION_TABS: { id: StatsSectionTab; label: string }[] = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'clubs', label: 'Clubes & Épocas' },
  { id: 'honors', label: 'Troféus & Marcos' },
];

const TROPHY_CATEGORY_COLORS: Record<TrophyCategory, string> = {
  liga: 'text-emerald-400',
  copa: 'text-sky-400',
  supercopa: 'text-cyan-400',
  continental_a: 'text-amber-400',
  continental_b: 'text-orange-400',
  continental_c: 'text-teal-400',
  intercontinental: 'text-yellow-300',
  mundial: 'text-amber-300',
  selecao: 'text-green-400',
  individual: 'text-violet-400',
  outro: 'text-slate-300',
};

export function StatsView({ career, onSelectSeasonFromTimeline }: StatsViewProps) {
  const [activeSection, setActiveSection] = useState<StatsSectionTab>('overview');
  const [chartMode, setChartMode] = useState<'ga' | 'ovr'>('ga');
  const [timelineOrder, setTimelineOrder] = useState<'asc' | 'desc'>('asc');
  const [milestoneFilter, setMilestoneFilter] = useState<MilestoneFilter>('all');
  const [trophyScope, setTrophyScope] = useState<'all' | 'collective' | 'individual'>('all');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const summary = useMemo(() => computeCareerSummary(career), [career]);
  const records = useMemo(() => computeCareerRecords(career), [career]);
  const milestones = useMemo(() => getCareerMilestones(career), [career]);
  const clubBreakdown = useMemo(() => computeClubBreakdown(career), [career]);

  const unlockedCount = useMemo(() => milestones.filter((m) => m.unlocked).length, [milestones]);
  const milestonePct =
    milestones.length > 0 ? Math.round((unlockedCount / milestones.length) * 100) : 0;

  const seasons = useMemo(
    () =>
      [...career.seasons]
        .filter(
          (s, idx) =>
            s.isCompleted ||
            s.games > 0 ||
            s.goals > 0 ||
            s.assists > 0 ||
            s.rating > 0 ||
            (s.yellowCards || 0) > 0 ||
            (s.redCards || 0) > 0 ||
            s.trophies.length > 0 ||
            idx === 0
        )
        .sort((a, b) => a.year - b.year),
    [career.seasons]
  );

  const orderedTimelineSeasons = useMemo(
    () => (timelineOrder === 'asc' ? seasons : [...seasons].reverse()),
    [seasons, timelineOrder]
  );

  const filteredMilestones = useMemo(() => {
    if (milestoneFilter === 'unlocked') return milestones.filter((m) => m.unlocked);
    if (milestoneFilter === 'locked') return milestones.filter((m) => !m.unlocked);
    return milestones;
  }, [milestones, milestoneFilter]);

  const primeSeason = useMemo(
    () => seasons.find((s) => s.id === summary.primeSeasonId) || null,
    [seasons, summary.primeSeasonId]
  );

  const maxGA = Math.max(10, ...seasons.map((s) => Math.max(s.goals, s.assists)));
  const ratedSeasonsCount = seasons.filter((s) => s.rating > 0).length;
  const assistsPerGame =
    summary.totalGames > 0 ? (summary.totalAssists / summary.totalGames).toFixed(2) : '0.00';
  const gaPerSeason = (summary.totalContributions / Math.max(1, summary.totalSeasons)).toFixed(1);
  const totalCards = summary.totalYellowCards + summary.totalRedCards;
  const cardsPerGame =
    summary.totalGames > 0 ? (totalCards / summary.totalGames).toFixed(2) : '0.00';

  const handleShareCareer = async () => {
    const text = buildCareerShareText(career);
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Carreira · ${career.playerName}`,
          text,
        });
        setShareFeedback('Resumo compartilhado!');
        window.setTimeout(() => setShareFeedback(null), 2500);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    const ok = await copyTextToClipboard(text);
    setShareFeedback(ok ? 'Resumo copiado!' : 'Erro ao copiar resumo.');
    window.setTimeout(() => setShareFeedback(null), 2500);
  };

  const kpiCards = [
    {
      label: 'Temporadas',
      value: String(summary.totalSeasons),
      subtext: `${summary.completedSeasons} concluída${summary.completedSeasons === 1 ? '' : 's'}`,
      borderClass: 'border-t-slate-400/70',
      valueClass: 'text-white',
      icon: Calendar,
      iconClass: 'text-slate-300',
      srText: `${summary.totalSeasons} ${summary.totalSeasons === 1 ? 'temporada' : 'temporadas'}, ${summary.completedSeasons} concluídas`,
    },
    {
      label: 'Jogos',
      value: String(summary.totalGames),
      subtext: `${records.clubsCount} ${records.clubsCount === 1 ? 'clube' : 'clubes'}`,
      borderClass: 'border-t-indigo-500/80',
      valueClass: 'text-indigo-200',
      icon: Activity,
      iconClass: 'text-indigo-400',
      srText: `${summary.totalGames} jogos disputados por ${records.clubsCount} clube ou clubes`,
    },
    {
      label: 'Gols',
      value: String(summary.totalGoals),
      subtext: summary.totalGames > 0 ? `${records.goalsPerGame.toFixed(2)} por jogo` : 'Carreira',
      borderClass: 'border-t-emerald-500/85',
      valueClass: 'text-emerald-400',
      icon: Target,
      iconClass: 'text-emerald-400',
      srText: `${summary.totalGoals} gols na carreira`,
    },
    {
      label: 'Assistências',
      value: String(summary.totalAssists),
      subtext: summary.totalGames > 0 ? `${assistsPerGame} por jogo` : 'Passes decisivos',
      borderClass: 'border-t-sky-500/85',
      valueClass: 'text-sky-400',
      icon: Zap,
      iconClass: 'text-sky-400',
      srText: `${summary.totalAssists} assistências na carreira`,
    },
    {
      label: 'Participações (G+A)',
      value: String(summary.totalContributions),
      subtext:
        summary.totalGames > 0
          ? `${records.contributionsPerGame.toFixed(2)} por jogo`
          : `${gaPerSeason} por época`,
      borderClass: 'border-t-blue-500/85',
      valueClass: 'text-blue-300',
      icon: TrendingUp,
      iconClass: 'text-blue-400',
      srText: `${summary.totalContributions} participações diretas em gols`,
    },
    {
      label: 'Média Geral',
      value: formatRating(summary.averageRating),
      subtext: `${ratedSeasonsCount} ${ratedSeasonsCount === 1 ? 'época avaliada' : 'épocas avaliadas'}`,
      borderClass: 'border-t-violet-500/85',
      valueClass: 'text-violet-300',
      icon: Star,
      iconClass: 'text-violet-400',
      srText: `Média geral de ${formatRating(summary.averageRating)}`,
    },
    {
      label: 'Títulos',
      value: String(summary.totalTrophies),
      subtext: `${summary.collectiveTrophiesCount} coletivo${summary.collectiveTrophiesCount === 1 ? '' : 's'} · ${summary.individualAwardsCount} indiv.`,
      borderClass: 'border-t-amber-500/85',
      valueClass: 'text-amber-400',
      icon: Trophy,
      iconClass: 'text-amber-400',
      srText: `${summary.totalTrophies} conquistas: ${summary.collectiveTrophiesCount} coletivas e ${summary.individualAwardsCount} individuais`,
    },
    {
      label: 'Over Pico',
      value: String(summary.peakOverall),
      subtext: `Atual: ${career.currentOverall}`,
      borderClass: 'border-t-yellow-400/85',
      valueClass: 'text-yellow-300',
      icon: Crown,
      iconClass: 'text-yellow-400',
      srText: `Overall máximo de ${summary.peakOverall}, atual ${career.currentOverall}`,
    },
  ];

  const personalRecords = [
    {
      id: 'goals',
      label: 'Mais gols em 1 temporada',
      value: records.bestGoals ? String(records.bestGoals.value) : null,
      year: records.bestGoals?.year ?? null,
      club: records.bestGoals?.club ?? null,
      valueClass: 'text-emerald-400',
      accentClass: 'border-l-emerald-500',
    },
    {
      id: 'assists',
      label: 'Mais assistências em 1 temporada',
      value: records.bestAssists ? String(records.bestAssists.value) : null,
      year: records.bestAssists?.year ?? null,
      club: records.bestAssists?.club ?? null,
      valueClass: 'text-sky-400',
      accentClass: 'border-l-sky-500',
    },
    {
      id: 'ga',
      label: 'Maior participação (G+A)',
      value: records.bestContributions ? String(records.bestContributions.value) : null,
      year: records.bestContributions?.year ?? null,
      club: records.bestContributions?.club ?? null,
      valueClass: 'text-blue-300',
      accentClass: 'border-l-blue-500',
    },
    {
      id: 'rating',
      label: 'Melhor média em 1 temporada',
      value: records.bestRating ? formatRating(records.bestRating.value) : null,
      year: records.bestRating?.year ?? null,
      club: records.bestRating?.club ?? null,
      valueClass: 'text-violet-300',
      accentClass: 'border-l-violet-500',
    },
    {
      id: 'ovr',
      label: 'Maior evolução de Over',
      value: records.biggestOvrJump ? `+${records.biggestOvrJump.value}` : null,
      year: records.biggestOvrJump?.year ?? null,
      club: records.biggestOvrJump?.club ?? null,
      valueClass: 'text-amber-400',
      accentClass: 'border-l-amber-500',
    },
    {
      id: 'clubs',
      label: 'Clubes defendidos',
      value: String(records.clubsCount),
      year: null,
      club: `${summary.totalSeasons} ${summary.totalSeasons === 1 ? 'época' : 'épocas'}`,
      valueClass: 'text-white',
      accentClass: 'border-l-slate-400',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Command Header & Segmented Sub-Navigation */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <BarChart3 className="h-5 w-5 text-blue-400" aria-hidden="true" />
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-wide text-white uppercase">
                Central de Estatísticas
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 tabular-nums">
              {career.playerName} · {summary.totalSeasons}{' '}
              {summary.totalSeasons === 1 ? 'época' : 'épocas'} · {records.clubsCount}{' '}
              {records.clubsCount === 1 ? 'clube' : 'clubes'} · {unlockedCount}/{milestones.length}{' '}
              marcos
            </p>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={handleShareCareer}
            aria-live="polite"
            aria-label={`Compartilhar resumo da carreira de ${career.playerName}`}
            className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#0B1222] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.08] self-start sm:self-auto"
          >
            {shareFeedback ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                <span>{shareFeedback}</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-blue-400" aria-hidden="true" />
                <span>Compartilhar Resumo</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Sub-Tabs */}
        <div
          role="tablist"
          aria-label="Seções de estatísticas"
          className="grid grid-cols-3 rounded-xl bg-[#0B1222] p-1 border border-white/[0.06] gap-1"
        >
          {SECTION_TABS.map((tab) => {
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveSection(tab.id)}
                className={`relative min-h-[40px] rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors truncate ${
                  active ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="stats-section-pill"
                    transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-lg bg-blue-600"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeSection === 'overview' && (
          <motion.div
            key="stats-overview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            {/* Primary KPI Grid */}
            <section aria-labelledby="career-totals-heading">
              <h3 id="career-totals-heading" className="sr-only">
                Totais da Carreira
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {kpiCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.16,
                        delay: Math.min(idx * 0.02, 0.12),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      tabIndex={0}
                      aria-label={card.srText}
                      className={`rounded-2xl border border-white/[0.08] border-t-2 ${card.borderClass} bg-[#11192D] p-3.5 sm:p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                    >
                      <div aria-hidden="true" className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                          {card.label}
                        </span>
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${card.iconClass}`} />
                      </div>
                      <div
                        aria-hidden="true"
                        className={`mt-1.5 font-display text-2xl sm:text-3xl font-extrabold tabular-nums leading-none ${card.valueClass}`}
                      >
                        {card.value}
                      </div>
                      <div
                        aria-hidden="true"
                        className="mt-1.5 text-[11px] text-slate-400 tabular-nums truncate"
                      >
                        {card.subtext}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Efficiency & Discipline Dual Panel */}
            <section
              aria-label="Eficiência e disciplina"
              className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
            >
              {/* Eficiência Ofensiva */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                    <h3 className="font-display text-sm font-bold tracking-wider text-white uppercase">
                      Eficiência em Campo
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono-num text-slate-400 tabular-nums">
                    {summary.totalGames > 0 ? `${summary.totalGames} jogos` : 'Sem jogos'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-[#0B1222] border border-white/[0.05] px-2.5 py-2.5 text-center">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Gols / Jogo
                    </div>
                    <div className="mt-1 font-mono-num text-lg font-extrabold text-emerald-400 tabular-nums">
                      {records.goalsPerGame.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#0B1222] border border-white/[0.05] px-2.5 py-2.5 text-center">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      G+A / Jogo
                    </div>
                    <div className="mt-1 font-mono-num text-lg font-extrabold text-blue-300 tabular-nums">
                      {records.contributionsPerGame.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#0B1222] border border-white/[0.05] px-2.5 py-2.5 text-center">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      G+A / Época
                    </div>
                    <div className="mt-1 font-mono-num text-lg font-extrabold text-white tabular-nums">
                      {gaPerSeason}
                    </div>
                  </div>
                </div>
              </div>

              {/* Disciplina */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-400" aria-hidden="true" />
                    <h3 className="font-display text-sm font-bold tracking-wider text-white uppercase">
                      Disciplina &amp; Cartões
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono-num text-slate-400 tabular-nums">
                    {totalCards} {totalCards === 1 ? 'cartão' : 'cartões'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-[#0B1222] border border-white/[0.05] px-2.5 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2.5 w-1.5 rounded-[1px] bg-amber-400"
                      />
                      Amarelos
                    </div>
                    <div className="mt-1 font-mono-num text-lg font-extrabold text-amber-300 tabular-nums">
                      {summary.totalYellowCards}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#0B1222] border border-white/[0.05] px-2.5 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2.5 w-1.5 rounded-[1px] bg-rose-500"
                      />
                      Vermelhos
                    </div>
                    <div className="mt-1 font-mono-num text-lg font-extrabold text-rose-400 tabular-nums">
                      {summary.totalRedCards}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#0B1222] border border-white/[0.05] px-2.5 py-2.5 text-center">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Cart. / Jogo
                    </div>
                    <div className="mt-1 font-mono-num text-lg font-extrabold text-slate-200 tabular-nums">
                      {cardsPerGame}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Prime Season Spotlight */}
            {primeSeason && (
              <section aria-labelledby="prime-spotlight-heading">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelectSeasonFromTimeline(primeSeason.year)}
                  aria-label={`Temporada Prime: ${primeSeason.year} no ${primeSeason.club}, ${primeSeason.goals} gols, ${primeSeason.assists} assistências, média ${formatRating(primeSeason.rating)}, overall ${primeSeason.endOverall}. Toque para abrir`}
                  className="w-full text-left rounded-2xl border border-amber-500/30 bg-[#11192D] p-4 sm:p-5 transition-colors hover:border-amber-400/50 hover:bg-[#15203A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/10">
                        <Crown className="h-5 w-5 text-amber-400" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            id="prime-spotlight-heading"
                            className="text-[11px] font-bold uppercase tracking-wider text-amber-400"
                          >
                            Temporada Prime
                          </span>
                          <span className="text-slate-600" aria-hidden="true">
                            ·
                          </span>
                          <span className="font-mono-num text-xs font-bold text-slate-200">
                            {primeSeason.year} · {primeSeason.age} anos
                          </span>
                        </div>
                        <div className="text-base sm:text-lg font-display font-extrabold text-white truncate">
                          {primeSeason.club}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 tabular-nums">
                      <div className="text-center">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                          Gols
                        </div>
                        <div className="font-mono-num text-base font-extrabold text-emerald-400">
                          {primeSeason.goals}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                          Assist.
                        </div>
                        <div className="font-mono-num text-base font-extrabold text-sky-400">
                          {primeSeason.assists}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                          Média
                        </div>
                        <div className="font-mono-num text-base font-extrabold text-violet-300">
                          {formatRating(primeSeason.rating)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                          OVR
                        </div>
                        <div className="font-mono-num text-base font-extrabold text-amber-300">
                          {primeSeason.endOverall}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                          Taças
                        </div>
                        <div className="font-mono-num text-base font-extrabold text-amber-400">
                          {primeSeason.trophies.length}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-amber-400 hidden sm:block" aria-hidden="true" />
                    </div>
                  </div>
                </motion.button>
              </section>
            )}

            {/* Evolution Chart */}
            <section
              aria-labelledby="career-evolution-heading"
              className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h3
                    id="career-evolution-heading"
                    className="font-display text-lg font-bold tracking-wide text-white uppercase"
                  >
                    Evolução por Temporada
                  </h3>
                  <p className="text-xs text-slate-400">
                    Toque em qualquer coluna para abrir a temporada correspondente
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
                    className={`relative min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
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
                    className={`relative min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
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
                <div className="rounded-xl bg-[#0B1222] border border-white/[0.06] p-3 sm:p-4">
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
                        <div className="relative min-w-[320px]">
                          {/* Subtle horizontal reference lines */}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 top-6 bottom-12 flex flex-col justify-between"
                          >
                            <div className="border-t border-dashed border-white/[0.05]" />
                            <div className="border-t border-dashed border-white/[0.05]" />
                            <div className="border-t border-dashed border-white/[0.05]" />
                          </div>

                          <div
                            role="list"
                            aria-label="Gráfico de gols e assistências por temporada"
                            className="relative z-10 flex items-end justify-around gap-3 pt-6 pb-2 h-52 border-b border-white/[0.08]"
                          >
                            {seasons.map((s, idx) => {
                              const gHeight = Math.max(6, Math.round((s.goals / maxGA) * 136));
                              const aHeight = Math.max(6, Math.round((s.assists / maxGA) * 136));
                              const isPrime =
                                s.id === summary.primeSeasonId && seasons.length > 1;
                              return (
                                <div key={s.id} role="listitem">
                                  <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => onSelectSeasonFromTimeline(s.year)}
                                    aria-label={`Temporada ${s.year} no ${s.club}: ${s.goals} gols, ${s.assists} assistências${isPrime ? ', temporada prime' : ''}. Toque para abrir`}
                                    className={`group flex flex-col items-center gap-2 px-2 py-1 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                      isPrime ? 'bg-amber-500/[0.06]' : 'hover:bg-white/[0.03]'
                                    }`}
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
                                            duration: 0.24,
                                            delay: Math.min(idx * 0.025, 0.12),
                                            ease: [0.22, 1, 0.36, 1],
                                          }}
                                          style={{
                                            height: `${gHeight}px`,
                                            transformOrigin: 'bottom',
                                          }}
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
                                            duration: 0.24,
                                            delay: Math.min(idx * 0.025 + 0.02, 0.14),
                                            ease: [0.22, 1, 0.36, 1],
                                          }}
                                          style={{
                                            height: `${aHeight}px`,
                                            transformOrigin: 'bottom',
                                          }}
                                          className="w-5 sm:w-7 rounded-t-md bg-sky-500/85 group-hover:bg-sky-400 transition-colors"
                                        />
                                      </div>
                                    </div>
                                    <div aria-hidden="true" className="text-center">
                                      <div
                                        className={`text-xs font-mono-num font-bold transition-colors ${
                                          isPrime
                                            ? 'text-amber-300'
                                            : 'text-white group-hover:text-blue-400'
                                        }`}
                                      >
                                        {s.year}
                                        {isPrime ? ' ★' : ''}
                                      </div>
                                      <div className="text-[11px] text-slate-400 truncate max-w-[74px]">
                                        {s.club}
                                      </div>
                                    </div>
                                  </motion.button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div
                          aria-hidden="true"
                          className="mt-3 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                            Gols
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
                            Assistências
                          </span>
                          {seasons.length > 1 && (
                            <span className="inline-flex items-center gap-1 text-amber-300">
                              ★ Prime
                            </span>
                          )}
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
                        <div className="relative min-w-[320px]">
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 top-6 bottom-12 flex flex-col justify-between"
                          >
                            <div className="border-t border-dashed border-white/[0.05]" />
                            <div className="border-t border-dashed border-white/[0.05]" />
                            <div className="border-t border-dashed border-white/[0.05]" />
                          </div>

                          <div
                            role="list"
                            aria-label="Gráfico de overall e nota média por temporada"
                            className="relative z-10 flex items-end justify-around gap-3 pt-6 pb-2 h-52 border-b border-white/[0.08]"
                          >
                            {seasons.map((s, idx) => {
                              const ovrHeight = Math.max(
                                12,
                                Math.round(((s.endOverall - 40) / 60) * 136)
                              );
                              const ratingHeight = Math.max(8, Math.round((s.rating / 10) * 136));
                              const isPrime =
                                s.id === summary.primeSeasonId && seasons.length > 1;
                              return (
                                <div key={s.id} role="listitem">
                                  <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => onSelectSeasonFromTimeline(s.year)}
                                    aria-label={`Temporada ${s.year} no ${s.club}: overall ${s.endOverall}, média ${formatRating(s.rating)}. Toque para abrir`}
                                    className={`group flex flex-col items-center gap-2 px-2 py-1 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                      isPrime ? 'bg-amber-500/[0.06]' : 'hover:bg-white/[0.03]'
                                    }`}
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
                                            duration: 0.24,
                                            delay: Math.min(idx * 0.025, 0.12),
                                            ease: [0.22, 1, 0.36, 1],
                                          }}
                                          style={{
                                            height: `${Math.min(136, ovrHeight)}px`,
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
                                            duration: 0.24,
                                            delay: Math.min(idx * 0.025 + 0.02, 0.14),
                                            ease: [0.22, 1, 0.36, 1],
                                          }}
                                          style={{
                                            height: `${ratingHeight}px`,
                                            transformOrigin: 'bottom',
                                          }}
                                          className="w-5 sm:w-7 rounded-t-md bg-blue-500/85 group-hover:bg-blue-400 transition-colors"
                                        />
                                      </div>
                                    </div>
                                    <div aria-hidden="true" className="text-center">
                                      <div
                                        className={`text-xs font-mono-num font-bold transition-colors ${
                                          isPrime
                                            ? 'text-amber-300'
                                            : 'text-white group-hover:text-blue-400'
                                        }`}
                                      >
                                        {s.year}
                                        {isPrime ? ' ★' : ''}
                                      </div>
                                      <div className="text-[11px] text-slate-400 truncate max-w-[74px]">
                                        {s.club}
                                      </div>
                                    </div>
                                  </motion.button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div
                          aria-hidden="true"
                          className="mt-3 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400"
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
                </div>
              )}
            </section>
          </motion.div>
        )}

        {activeSection === 'clubs' && (
          <motion.div
            key="stats-clubs"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            {/* Histórico por Clube */}
            <section aria-labelledby="club-breakdown-heading" className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  <h3
                    id="club-breakdown-heading"
                    className="font-display text-lg font-bold tracking-wide text-white uppercase"
                  >
                    Histórico por Clube
                  </h3>
                </div>
                <span className="text-xs font-mono-num text-slate-400 tabular-nums">
                  {clubBreakdown.length} {clubBreakdown.length === 1 ? 'clube' : 'clubes'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clubBreakdown.map((clubItem, idx) => {
                  const accent = getClubAccent(clubItem.club);
                  const monogram = getClubMonogram(clubItem.club);
                  const firstYear = clubItem.years[0];
                  const lastYear = clubItem.years[clubItem.years.length - 1];
                  const periodLabel =
                    firstYear === lastYear ? `${firstYear}` : `${firstYear}–${lastYear}`;

                  return (
                    <motion.div
                      key={clubItem.club}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.16,
                        delay: Math.min(idx * 0.025, 0.12),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="rounded-2xl border border-white/[0.08] border-t-2 bg-[#11192D] p-4 space-y-3"
                      style={{ borderTopColor: accent.ring }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            aria-hidden="true"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xs font-display font-bold"
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
                              <h4 className="font-display text-base font-extrabold text-white truncate">
                                {clubItem.club}
                              </h4>
                              {clubItem.isCurrent && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                                  Atual
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono-num text-slate-400 tabular-nums">
                              {periodLabel} · {clubItem.seasonsCount}{' '}
                              {clubItem.seasonsCount === 1 ? 'temporada' : 'temporadas'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 tabular-nums">
                          <div className="text-[10px] uppercase tracking-wider text-slate-400">
                            OVR Pico
                          </div>
                          <div className="font-mono-num text-lg font-extrabold text-amber-300">
                            {clubItem.peakOverall}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 rounded-xl bg-[#0B1222] border border-white/[0.05] p-2.5 text-center tabular-nums">
                        <div>
                          <div className="text-[10px] uppercase text-slate-500">Jogos</div>
                          <div className="text-sm font-mono-num font-bold text-slate-200">
                            {clubItem.games}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-500">Gols</div>
                          <div className="text-sm font-mono-num font-bold text-emerald-400">
                            {clubItem.goals}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-500">Assist.</div>
                          <div className="text-sm font-mono-num font-bold text-sky-400">
                            {clubItem.assists}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-500">Média</div>
                          <div className="text-sm font-mono-num font-bold text-violet-300">
                            {clubItem.averageRating > 0 ? formatRating(clubItem.averageRating) : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-500">Taças</div>
                          <div className="text-sm font-mono-num font-bold text-amber-400">
                            {clubItem.trophies}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Linha do Tempo da Carreira */}
            <section
              aria-labelledby="career-timeline-heading"
              className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div>
                  <h3
                    id="career-timeline-heading"
                    className="font-display text-lg font-bold tracking-wide text-white uppercase"
                  >
                    Linha do Tempo da Carreira
                  </h3>
                  <p className="text-xs text-slate-400">
                    Toque em qualquer temporada para abrir o resumo e editar
                  </p>
                </div>

                <div
                  role="group"
                  aria-label="Ordem da linha do tempo"
                  className="inline-flex rounded-xl bg-[#0B1222] p-1 border border-white/[0.06] self-start sm:self-auto"
                >
                  <button
                    type="button"
                    onClick={() => setTimelineOrder('asc')}
                    aria-pressed={timelineOrder === 'asc'}
                    className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      timelineOrder === 'asc'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cronológica
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineOrder('desc')}
                    aria-pressed={timelineOrder === 'desc'}
                    className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      timelineOrder === 'desc'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mais recente
                  </button>
                </div>
              </div>

              <ul className="space-y-2" aria-label="Temporadas da carreira">
                {orderedTimelineSeasons.map((season, idx) => {
                  const isPrime = season.id === summary.primeSeasonId;
                  const accent = getClubAccent(season.club);
                  const monogram = getClubMonogram(season.club);
                  return (
                    <li key={season.id}>
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.15,
                          delay: Math.min(idx * 0.02, 0.1),
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => onSelectSeasonFromTimeline(season.year)}
                        aria-label={`Temporada ${season.year}, ${season.club}, ${season.age} anos, ${season.games} jogos, ${season.goals} gols, ${season.assists} assistências, média ${formatRating(season.rating)}, overall ${season.endOverall}${(season.yellowCards || 0) > 0 ? `, ${season.yellowCards} amarelos` : ''}${(season.redCards || 0) > 0 ? `, ${season.redCards} vermelhos` : ''}${season.trophies.length > 0 ? `, ${season.trophies.length} ${season.trophies.length === 1 ? 'título' : 'títulos'}` : ''}${isPrime ? ', temporada prime' : ''}. Toque para abrir`}
                        className={`w-full min-h-[68px] flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          isPrime
                            ? 'border-amber-500/35 bg-amber-500/[0.06] hover:bg-amber-500/[0.10]'
                            : 'border-white/[0.06] bg-[#0B1222] hover:bg-white/[0.04]'
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
                              {season.games > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{season.games} J</span>
                                </>
                              )}
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-400 font-medium">{season.goals} G</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-sky-400 font-medium">{season.assists} A</span>
                              <span aria-hidden="true">·</span>
                              <span>Média {formatRating(season.rating)}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-amber-300 font-medium">
                                OVR {season.endOverall}
                              </span>
                              {(season.yellowCards || 0) > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-amber-400 font-medium">
                                    {season.yellowCards} Am
                                  </span>
                                </>
                              )}
                              {(season.redCards || 0) > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-rose-400 font-medium">
                                    {season.redCards} Vm
                                  </span>
                                </>
                              )}
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
          </motion.div>
        )}

        {activeSection === 'honors' && (
          <motion.div
            key="stats-honors"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            {/* Trophy Cabinet + Personal Records */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Sala de Troféus (5 cols) */}
              <section
                aria-labelledby="trophy-cabinet-heading"
                className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    <h3
                      id="trophy-cabinet-heading"
                      className="font-display text-lg font-bold tracking-wide text-white uppercase"
                    >
                      Sala de Troféus
                    </h3>
                  </div>
                  <span className="font-mono-num text-xs font-bold text-amber-300 tabular-nums">
                    {(() => {
                      const shownCount =
                        trophyScope === 'collective'
                          ? summary.collectiveTrophiesCount
                          : trophyScope === 'individual'
                            ? summary.individualAwardsCount
                            : summary.totalTrophies;
                      return `${shownCount} ${shownCount === 1 ? 'conquista' : 'conquistas'}`;
                    })()}
                  </span>
                </div>

                {summary.trophyGroups.length > 0 && (
                  <div
                    role="group"
                    aria-label="Filtrar conquistas entre coletivos e individuais"
                    className="grid grid-cols-3 rounded-xl bg-[#0B1222] p-1 border border-white/[0.06] gap-1"
                  >
                    {(
                      [
                        { id: 'all', label: 'Todos' },
                        { id: 'collective', label: 'Coletivos' },
                        { id: 'individual', label: 'Individuais' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTrophyScope(opt.id)}
                        aria-pressed={trophyScope === opt.id}
                        className={`min-h-[32px] rounded-lg px-2 text-[11px] font-semibold transition-colors ${
                          trophyScope === opt.id
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {summary.trophyGroups.length === 0 ? (
                  <div className="rounded-xl bg-[#0B1222] border border-white/[0.05] px-4 py-8 text-center">
                    <Trophy className="h-7 w-7 text-slate-600 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-sm text-slate-400">
                      Nenhuma conquista registrada até o momento.
                    </p>
                  </div>
                ) : (() => {
                  const filteredTrophies = summary.trophyGroups.filter((g) => {
                    if (trophyScope === 'individual') return g.category === 'individual';
                    if (trophyScope === 'collective') return g.category !== 'individual';
                    return true;
                  });

                  if (filteredTrophies.length === 0) {
                    return (
                      <div className="rounded-xl bg-[#0B1222] border border-white/[0.05] px-4 py-6 text-center text-xs text-slate-400">
                        Nenhuma conquista nesta categoria ainda.
                      </div>
                    );
                  }

                  return (
                    <ul
                      className="space-y-2"
                      aria-label="Conquistas acumuladas na carreira"
                    >
                      {filteredTrophies.map((group) => {
                        const iconColor =
                          TROPHY_CATEGORY_COLORS[group.category] || 'text-amber-400';
                        const isIndividual = group.category === 'individual';
                        return (
                          <li
                            key={group.name}
                            tabIndex={0}
                            aria-label={`${group.name}${group.country ? `, ${group.country}` : ''}, conquistado ${group.count} ${group.count === 1 ? 'vez' : 'vezes'}, nos anos ${group.years.join(', ')}`}
                            className="rounded-xl border border-white/[0.06] bg-[#0B1222] px-3.5 py-2.5 flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {group.country ? (
                                <CountryFlag country={group.country} size="sm" />
                              ) : (
                                <Trophy
                                  className={`h-4 w-4 shrink-0 ${iconColor}`}
                                  aria-hidden="true"
                                />
                              )}
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-100 truncate">
                                  {group.name}
                                </div>
                                <div className="text-[11px] font-mono-num text-slate-400 tabular-nums mt-0.5 truncate">
                                  {group.country
                                    ? `${group.country} · `
                                    : isIndividual
                                      ? 'Individual · '
                                      : ''}
                                  {group.years.join(', ')}
                                </div>
                              </div>
                            </div>
                            <span
                              aria-hidden="true"
                              className="font-display text-xl font-extrabold text-amber-400 tabular-nums shrink-0"
                            >
                              {group.count}x
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()}
              </section>

              {/* Recordes Pessoais (7 cols) */}
              <section
                aria-labelledby="personal-records-heading"
                className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    <h3
                      id="personal-records-heading"
                      className="font-display text-lg font-bold tracking-wide text-white uppercase"
                    >
                      Recordes Pessoais
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Toque para abrir a temporada
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {personalRecords.map((rec) => {
                    const interactive = rec.year !== null;
                    const body = (
                      <>
                        <div className="text-xs font-medium text-slate-400">{rec.label}</div>
                        <div className="mt-1.5 flex items-baseline justify-between gap-2 tabular-nums">
                          <span
                            className={`font-display text-2xl font-extrabold ${
                              rec.value ? rec.valueClass : 'text-slate-600'
                            }`}
                          >
                            {rec.value || '—'}
                          </span>
                          {rec.value && (
                            <span className="text-[11px] text-slate-400 truncate">
                              {rec.year ? `${rec.year} · ${rec.club}` : rec.club}
                            </span>
                          )}
                        </div>
                      </>
                    );

                    if (interactive && rec.year !== null) {
                      const targetYear = rec.year;
                      return (
                        <button
                          key={rec.id}
                          type="button"
                          onClick={() => onSelectSeasonFromTimeline(targetYear)}
                          aria-label={`${rec.label}: ${rec.value} em ${targetYear} no ${rec.club}. Toque para abrir`}
                          className={`rounded-xl border border-white/[0.06] border-l-2 ${rec.accentClass} bg-[#0B1222] p-3 text-left transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                        >
                          {body}
                        </button>
                      );
                    }

                    return (
                      <div
                        key={rec.id}
                        className={`rounded-xl border border-white/[0.06] border-l-2 ${rec.accentClass} bg-[#0B1222] p-3`}
                      >
                        {body}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Marcos da Carreira */}
            <section
              aria-labelledby="career-milestones-heading"
              className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    <h3
                      id="career-milestones-heading"
                      className="font-display text-lg font-bold tracking-wide text-white uppercase"
                    >
                      Marcos da Carreira
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                    {unlockedCount} de {milestones.length} conquistas desbloqueadas ({milestonePct}%)
                  </p>
                </div>

                <div
                  role="group"
                  aria-label="Filtrar marcos da carreira"
                  className="inline-flex rounded-xl bg-[#0B1222] p-1 border border-white/[0.06] self-start sm:self-auto"
                >
                  {(
                    [
                      { id: 'all', label: 'Todos' },
                      { id: 'unlocked', label: 'Conquistados' },
                      { id: 'locked', label: 'Em progresso' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setMilestoneFilter(f.id)}
                      aria-pressed={milestoneFilter === f.id}
                      className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                        milestoneFilter === f.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overall Milestone Progress Bar */}
              <div
                aria-hidden="true"
                className="h-2 w-full overflow-hidden rounded-full bg-[#0B1222] border border-white/[0.05]"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${milestonePct}%` }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-emerald-500"
                />
              </div>

              {filteredMilestones.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">
                  Nenhum marco nesta categoria no momento.
                </p>
              ) : (
                <ul
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
                  aria-label="Marcos da carreira"
                >
                  {filteredMilestones.map((m) => (
                    <li
                      key={m.id}
                      tabIndex={0}
                      aria-label={`${m.title}: ${m.description}. ${
                        m.unlocked ? 'Conquistado' : `Em progresso: ${m.progressText}`
                      }`}
                      className={`rounded-xl border p-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        m.unlocked
                          ? 'border-emerald-500/35 bg-emerald-500/[0.08]'
                          : 'border-white/[0.06] bg-[#0B1222]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-sm font-semibold leading-tight ${
                            m.unlocked ? 'text-white' : 'text-slate-300'
                          }`}
                        >
                          {m.title}
                        </span>
                        {m.unlocked ? (
                          <Check
                            className="h-4 w-4 text-emerald-400 shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" aria-hidden="true" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-400 leading-snug">{m.description}</p>
                      <div
                        className={`mt-2 text-[11px] font-mono-num tabular-nums ${
                          m.unlocked ? 'text-emerald-300 font-semibold' : 'text-slate-500'
                        }`}
                      >
                        {m.unlocked ? 'Desbloqueado' : m.progressText}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
