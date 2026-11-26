import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  ArrowLeft,
  ArrowRightLeft,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  Flag,
  Minus,
  NotebookPen,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import {
  CareerProfile,
  LEAGUE_COUNTRY_ORDER,
  resolveTrophyCountry,
  SeasonRecord,
  TROPHY_PRESETS,
  TrophyCategory,
  TrophyPreset,
} from '../types/career';
import { createId, formatRating } from '../utils/careerEngine';
import { CountryFlag } from './CountryFlag';

interface SeasonViewProps {
  career: CareerProfile;
  season: SeasonRecord;
  isCurrentActiveSeason: boolean;
  onUpdateSeason: (updated: SeasonRecord) => void;
  onOpenEndSeason: () => void;
  onJumpToCurrentSeason: () => void;
  onAnnounce?: (message: string) => void;
  showPulseBar?: boolean;
}

const TROPHY_CATEGORY_STYLES: Record<
  TrophyCategory,
  { badge: string; iconBg: string; label: string }
> = {
  continental_a: {
    badge: 'text-amber-300',
    iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    label: 'Continental A',
  },
  continental_b: {
    badge: 'text-amber-300',
    iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    label: 'Continental B',
  },
  continental_c: {
    badge: 'text-amber-200',
    iconBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    label: 'Continental C',
  },
  intercontinental: {
    badge: 'text-amber-300',
    iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    label: 'Intercontinental',
  },
  mundial: {
    badge: 'text-amber-300',
    iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    label: 'Mundial',
  },
  selecao: {
    badge: 'text-emerald-300',
    iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    label: 'Seleção',
  },
  liga: {
    badge: 'text-emerald-300',
    iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    label: 'Liga Nacional',
  },
  copa: {
    badge: 'text-sky-300',
    iconBg: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
    label: 'Copa',
  },
  supercopa: {
    badge: 'text-sky-300',
    iconBg: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
    label: 'Supercopa',
  },
  individual: {
    badge: 'text-violet-300',
    iconBg: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
    label: 'Individual',
  },
  outro: {
    badge: 'text-slate-300',
    iconBg: 'bg-white/[0.06] text-slate-300 border-white/10',
    label: 'Título',
  },
};

const QUICK_NOTE_TAGS = ['Artilheiro', 'Gol decisivo', 'Capitão', 'Lesão'];

function getRatingLabel(rating: number): { text: string; tone: string } {
  if (rating <= 0) return { text: 'Nota 0–10', tone: 'text-slate-400' };
  if (rating >= 8.5) return { text: 'Bola de Ouro', tone: 'text-amber-300' };
  if (rating >= 7.5) return { text: 'Destaque', tone: 'text-emerald-400' };
  if (rating >= 6.8) return { text: 'Regular', tone: 'text-sky-400' };
  return { text: 'Em evolução', tone: 'text-slate-300' };
}

type TrophyScope = 'coletivo' | 'individual';
type CollectiveSubFilter = 'all' | 'continentais' | 'selecao' | string;

function isIndividualCategory(category: TrophyCategory): boolean {
  return category === 'individual';
}

function isContinentalCategory(category: TrophyCategory): boolean {
  return (
    category === 'continental_a' ||
    category === 'continental_b' ||
    category === 'continental_c' ||
    category === 'intercontinental' ||
    category === 'mundial'
  );
}

export function SeasonView({
  career,
  season,
  isCurrentActiveSeason,
  onUpdateSeason,
  onOpenEndSeason,
  onJumpToCurrentSeason,
  onAnnounce,
  showPulseBar = true,
}: SeasonViewProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>(TROPHY_PRESETS[0].name);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [trophyQuery, setTrophyQuery] = useState('');
  const [trophyScope, setTrophyScope] = useState<TrophyScope>('coletivo');
  const [collectiveFilter, setCollectiveFilter] = useState<CollectiveSubFilter>('all');
  const [customTrophyName, setCustomTrophyName] = useState('');
  const [customTrophyCategory, setCustomTrophyCategory] = useState<'liga' | 'individual'>('liga');
  const [customTrophyCountry, setCustomTrophyCountry] = useState<string>('');
  const [showCustomTrophy, setShowCustomTrophy] = useState(false);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [dropdownOpen]);

  const filteredPresets = useMemo(() => {
    const q = trophyQuery.trim().toLowerCase();
    return TROPHY_PRESETS.filter((preset) => {
      const isInd = isIndividualCategory(preset.category);
      if (trophyScope === 'individual' && !isInd) return false;
      if (trophyScope === 'coletivo') {
        if (isInd) return false;
        if (collectiveFilter === 'continentais' && !isContinentalCategory(preset.category)) {
          return false;
        }
        if (collectiveFilter === 'selecao' && preset.category !== 'selecao') {
          return false;
        }
        if (
          collectiveFilter !== 'all' &&
          collectiveFilter !== 'continentais' &&
          collectiveFilter !== 'selecao' &&
          preset.country !== collectiveFilter
        ) {
          return false;
        }
      }
      if (!q) return true;
      return (
        preset.name.toLowerCase().includes(q) ||
        preset.shortName.toLowerCase().includes(q) ||
        preset.description.toLowerCase().includes(q) ||
        (preset.country || '').toLowerCase().includes(q)
      );
    });
  }, [trophyQuery, trophyScope, collectiveFilter]);

  const groupedNationalPresets = useMemo(() => {
    const groups: { country: string; items: TrophyPreset[] }[] = [];
    for (const country of LEAGUE_COUNTRY_ORDER) {
      const items = filteredPresets.filter((p) => p.country === country);
      if (items.length > 0) {
        groups.push({ country, items });
      }
    }
    return groups;
  }, [filteredPresets]);

  const continentalPresets = useMemo(
    () => filteredPresets.filter((p) => isContinentalCategory(p.category)),
    [filteredPresets]
  );

  const selectionPresets = useMemo(
    () => filteredPresets.filter((p) => p.category === 'selecao'),
    [filteredPresets]
  );

  const individualPresets = useMemo(
    () => filteredPresets.filter((p) => isIndividualCategory(p.category)),
    [filteredPresets]
  );

  const handleAddPresetDirect = (preset: TrophyPreset) => {
    setSelectedPreset(preset.name);
    const resolvedCountry = resolveTrophyCountry(preset.name, preset.country);
    onUpdateSeason({
      ...season,
      trophies: [
        ...season.trophies,
        {
          id: createId(),
          name: preset.name,
          category: preset.category,
          country: resolvedCountry,
        },
      ],
    });
    onAnnounce?.(`Título ${preset.name} adicionado à temporada ${season.year}.`);
  };

  const adjustInt = (
    field: 'goals' | 'assists' | 'games' | 'endOverall' | 'yellowCards' | 'redCards',
    delta: number
  ) => {
    const min = field === 'endOverall' ? 1 : 0;
    const max = field === 'endOverall' || field === 'yellowCards' || field === 'redCards' ? 99 : 999;
    const nextVal = Math.min(max, Math.max(min, (season[field] || 0) + delta));
    onUpdateSeason({ ...season, [field]: nextVal });
    const labels: Record<typeof field, string> = {
      goals: 'Gols',
      assists: 'Assistências',
      games: 'Jogos',
      endOverall: 'Overall',
      yellowCards: 'Cartões amarelos',
      redCards: 'Cartões vermelhos',
    };
    onAnnounce?.(`${labels[field]}: ${nextVal}`);
  };

  const adjustRating = (delta: number) => {
    const nextVal = Math.min(10, Math.max(0, Math.round((season.rating + delta) * 10) / 10));
    onUpdateSeason({ ...season, rating: nextVal });
    onAnnounce?.(`Média: ${formatRating(nextVal)}`);
  };

  const handleNumberInput = (
    field: 'goals' | 'assists' | 'games' | 'startOverall' | 'endOverall' | 'yellowCards' | 'redCards',
    raw: string
  ) => {
    const parsed = parseInt(raw, 10);
    const val = Number.isNaN(parsed) ? 0 : parsed;
    const min = field === 'startOverall' || field === 'endOverall' ? 1 : 0;
    const max =
      field === 'startOverall' ||
      field === 'endOverall' ||
      field === 'yellowCards' ||
      field === 'redCards'
        ? 99
        : 999;
    onUpdateSeason({ ...season, [field]: Math.min(max, Math.max(min, val)) });
  };

  const handleRatingInput = (raw: string) => {
    const normalized = raw.replace(',', '.');
    const parsed = parseFloat(normalized);
    if (Number.isNaN(parsed)) {
      onUpdateSeason({ ...season, rating: 0 });
      return;
    }
    const clamped = Math.min(10, Math.max(0, Math.round(parsed * 10) / 10));
    onUpdateSeason({ ...season, rating: clamped });
  };

  const handleAddTrophy = () => {
    if (showCustomTrophy) {
      const trimmed = customTrophyName.trim();
      if (!trimmed) return;
      const resolvedCountry =
        customTrophyCountry && customTrophyCountry !== 'Outras'
          ? customTrophyCountry
          : resolveTrophyCountry(trimmed);
      onUpdateSeason({
        ...season,
        trophies: [
          ...season.trophies,
          {
            id: createId(),
            name: trimmed,
            category: customTrophyCategory as TrophyCategory,
            country: resolvedCountry,
          },
        ],
      });
      setCustomTrophyName('');
      setCustomTrophyCountry('');
      setShowCustomTrophy(false);
      onAnnounce?.(`Título ${trimmed} adicionado à temporada ${season.year}.`);
      return;
    }

    const preset = TROPHY_PRESETS.find((p) => p.name === selectedPreset);
    if (!preset) return;
    onUpdateSeason({
      ...season,
      trophies: [
        ...season.trophies,
        {
          id: createId(),
          name: preset.name,
          category: preset.category,
          country: resolveTrophyCountry(preset.name, preset.country),
        },
      ],
    });
    onAnnounce?.(`Título ${preset.name} adicionado à temporada ${season.year}.`);
  };

  const handleRemoveTrophy = (trophyId: string, trophyName: string) => {
    onUpdateSeason({
      ...season,
      trophies: season.trophies.filter((t) => t.id !== trophyId),
    });
    onAnnounce?.(`Título ${trophyName} removido.`);
  };

  const handleAppendNoteTag = (tag: string) => {
    const current = season.notes.trim();
    if (current.toLowerCase().includes(tag.toLowerCase())) return;
    const nextNotes = current ? `${current} · ${tag}` : tag;
    onUpdateSeason({ ...season, notes: nextNotes });
    onAnnounce?.(`Anotação ${tag} adicionada.`);
  };

  const activePresetObj =
    TROPHY_PRESETS.find((p) => p.name === selectedPreset) || TROPHY_PRESETS[0];

  const ovrDelta = season.endOverall - season.startOverall;
  const contributions = season.goals + season.assists;
  const contribPerGame = season.games > 0 ? (contributions / season.games).toFixed(2) : '0.00';
  const goalsPerGame = season.games > 0 ? (season.goals / season.games).toFixed(2) : '0.00';
  const assistsPerGame = season.games > 0 ? (season.assists / season.games).toFixed(2) : '0.00';
  const ratingMeta = getRatingLabel(season.rating);

  return (
    <motion.div
      key={season.id}
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* Historical Season Inspection Notice */}
      {!isCurrentActiveSeason && (
        <div
          role="region"
          aria-label={`Aviso da temporada ${season.year}`}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
        >
          <div className="text-sm text-amber-100">
            <span className="font-semibold">Editando Histórico · Temporada {season.year}</span>
            <span className="block sm:inline text-xs sm:text-sm text-amber-200/80 sm:ml-1.5">
              Qualquer alteração feita abaixo atualiza automaticamente estatísticas e história.
            </span>
          </div>
          {!career.retired && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onJumpToCurrentSeason}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar para {career.currentYear}
            </motion.button>
          )}
        </div>
      )}

      {/* Section 1: Header + Quick Season Summary Strip + Primary 4 KPIs */}
      <section aria-labelledby="season-numbers-heading" className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2
              id="season-numbers-heading"
              className="font-display text-xl sm:text-2xl font-extrabold tracking-wide text-white uppercase"
            >
              Temporada {season.year}
            </h2>
            {season.transferFrom && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-300">
                <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Chegou de {season.transferFrom}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            {season.isCompleted ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Temporada encerrada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-400" aria-hidden="true" />
                Em andamento · {season.club}
              </span>
            )}
          </div>
        </div>

        {/* Live Season Pulse Bar */}
        {showPulseBar && (
          <dl
            aria-label={`Resumo rápido da temporada ${season.year}`}
            className="grid grid-cols-4 divide-x divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0B1222] py-2.5 text-center"
          >
            <div className="px-2">
              <dt className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <span className="sr-only">Participações em gol</span>
                <span aria-hidden="true">G + A</span>
              </dt>
              <dd className="font-mono-num text-base sm:text-lg font-bold text-white mt-0.5">
                {contributions}
              </dd>
            </div>
            <div className="px-2">
              <dt className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <span className="sr-only">Participações por jogo</span>
                <span aria-hidden="true">G+A / J</span>
              </dt>
              <dd className="font-mono-num text-base sm:text-lg font-bold text-sky-400 mt-0.5">
                {contribPerGame}
              </dd>
            </div>
            <div className="px-2">
              <dt className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <span className="sr-only">Evolução de Overall</span>
                <span aria-hidden="true">Evolução</span>
              </dt>
              <dd
                className={`font-mono-num text-base sm:text-lg font-bold mt-0.5 ${
                  ovrDelta > 0
                    ? 'text-emerald-400'
                    : ovrDelta < 0
                      ? 'text-rose-400'
                      : 'text-slate-300'
                }`}
              >
                {ovrDelta > 0 ? `+${ovrDelta}` : ovrDelta}
              </dd>
            </div>
            <div className="px-2">
              <dt className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Taças
              </dt>
              <dd className="font-mono-num text-base sm:text-lg font-bold text-amber-400 mt-0.5">
                {season.trophies.length}
              </dd>
            </div>
          </dl>
        )}

        {/* Primary 4 KPI Stat Cards (2x2 mobile, 4-col desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* GOLS */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] border-t-2 border-t-emerald-500/70 bg-[#11192D] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="input-goals"
                className="text-xs font-bold text-slate-300 uppercase tracking-wider"
              >
                Gols
              </label>
              <span className="text-[11px] font-mono-num font-semibold text-emerald-400">
                <span className="sr-only">{goalsPerGame} gols por jogo</span>
                <span aria-hidden="true">{goalsPerGame}/j</span>
              </span>
            </div>

            <input
              id="input-goals"
              type="number"
              inputMode="numeric"
              min={0}
              max={999}
              aria-label={`Quantidade de gols na temporada ${season.year}`}
              value={season.goals}
              onChange={(e) => handleNumberInput('goals', e.target.value)}
              className="my-2.5 w-full bg-transparent font-display text-4xl sm:text-5xl font-extrabold text-white tabular-nums focus:outline-none focus:text-emerald-400"
            />

            <div className="grid grid-cols-2 gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Diminuir gols, atual ${season.goals}`}
                onClick={() => adjustInt('goals', -1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-[#0B1222] text-slate-200 transition-colors hover:bg-white/[0.08]"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Aumentar gols, atual ${season.goals}`}
                onClick={() => adjustInt('goals', 1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 transition-colors hover:bg-emerald-500/25"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>

          {/* ASSISTÊNCIAS */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] border-t-2 border-t-sky-500/70 bg-[#11192D] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="input-assists"
                className="text-xs font-bold text-slate-300 uppercase tracking-wider"
              >
                Assistências
              </label>
              <span className="text-[11px] font-mono-num font-semibold text-sky-400">
                <span className="sr-only">{assistsPerGame} assistências por jogo</span>
                <span aria-hidden="true">{assistsPerGame}/j</span>
              </span>
            </div>

            <input
              id="input-assists"
              type="number"
              inputMode="numeric"
              min={0}
              max={999}
              aria-label={`Quantidade de assistências na temporada ${season.year}`}
              value={season.assists}
              onChange={(e) => handleNumberInput('assists', e.target.value)}
              className="my-2.5 w-full bg-transparent font-display text-4xl sm:text-5xl font-extrabold text-white tabular-nums focus:outline-none focus:text-sky-400"
            />

            <div className="grid grid-cols-2 gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Diminuir assistências, atual ${season.assists}`}
                onClick={() => adjustInt('assists', -1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-[#0B1222] text-slate-200 transition-colors hover:bg-white/[0.08]"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Aumentar assistências, atual ${season.assists}`}
                onClick={() => adjustInt('assists', 1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/35 text-sky-300 transition-colors hover:bg-sky-500/25"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>

          {/* MÉDIA */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] border-t-2 border-t-blue-500/70 bg-[#11192D] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="input-rating"
                className="text-xs font-bold text-slate-300 uppercase tracking-wider"
              >
                Média
              </label>
              <span className={`text-[11px] font-semibold ${ratingMeta.tone}`}>
                {ratingMeta.text}
              </span>
            </div>

            <div className="my-2.5">
              <input
                id="input-rating"
                type="number"
                inputMode="decimal"
                step="0.1"
                min={0}
                max={10}
                aria-label={`Nota média na temporada ${season.year}, de 0 a 10`}
                value={season.rating}
                onChange={(e) => handleRatingInput(e.target.value)}
                className="w-full bg-transparent font-display text-4xl sm:text-5xl font-extrabold text-white tabular-nums focus:outline-none focus:text-blue-400"
              />
              <div
                aria-hidden="true"
                className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]"
              >
                <div
                  className="h-full rounded-full bg-blue-500 transition-[width] duration-200"
                  style={{ width: `${Math.min(100, Math.max(0, (season.rating / 10) * 100))}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Diminuir média, atual ${formatRating(season.rating)}`}
                onClick={() => adjustRating(-0.1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-[#0B1222] text-slate-200 transition-colors hover:bg-white/[0.08]"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Aumentar média, atual ${formatRating(season.rating)}`}
                onClick={() => adjustRating(0.1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/35 text-blue-300 transition-colors hover:bg-blue-500/25"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>

          {/* OVERALL */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] border-t-2 border-t-amber-400/80 bg-[#11192D] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="input-ovr"
                className="text-xs font-bold text-slate-300 uppercase tracking-wider"
              >
                Over
              </label>
              <span
                className={`text-[11px] font-mono-num font-semibold ${
                  ovrDelta > 0
                    ? 'text-emerald-400'
                    : ovrDelta < 0
                      ? 'text-rose-400'
                      : 'text-slate-400'
                }`}
              >
                {season.startOverall}
                <span aria-hidden="true"> → </span>
                <span className="sr-only">para </span>
                {season.endOverall}
              </span>
            </div>

            <input
              id="input-ovr"
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              aria-label={`Overall ao fim da temporada ${season.year}`}
              value={season.endOverall}
              onChange={(e) => handleNumberInput('endOverall', e.target.value)}
              className="my-2.5 w-full bg-transparent font-display text-4xl sm:text-5xl font-extrabold text-amber-400 tabular-nums focus:outline-none focus:text-amber-300"
            />

            <div className="grid grid-cols-2 gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Diminuir overall, atual ${season.endOverall}`}
                onClick={() => adjustInt('endOverall', -1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-[#0B1222] text-slate-200 transition-colors hover:bg-white/[0.08]"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Aumentar overall, atual ${season.endOverall}`}
                onClick={() => adjustInt('endOverall', 1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 transition-colors hover:bg-amber-500/25"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Presença em Campo & Disciplina (Jogos, Amarelos, Vermelhos) */}
      <section
        aria-labelledby="season-discipline-heading"
        className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5 space-y-3.5"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-400" aria-hidden="true" />
            <h3
              id="season-discipline-heading"
              className="font-display text-base sm:text-lg font-bold tracking-wide text-white uppercase"
            >
              Jogos & Disciplina
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Partidas e cartões em {season.year}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Jogos Disputados */}
          <div className="rounded-xl border border-white/10 bg-[#0B1222] p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="input-games"
                className="text-xs font-semibold text-slate-300"
              >
                Jogos disputados
              </label>
              <input
                id="input-games"
                type="number"
                inputMode="numeric"
                min={0}
                max={999}
                aria-label={`Jogos disputados na temporada ${season.year}`}
                value={season.games}
                onChange={(e) => handleNumberInput('games', e.target.value)}
                className="w-16 bg-transparent text-right font-display text-3xl font-extrabold text-white tabular-nums focus:outline-none focus:text-blue-400"
              />
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Diminuir jogos, atual ${season.games}`}
                onClick={() => adjustInt('games', -1)}
                className="flex min-h-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.1]"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Aumentar jogos, atual ${season.games}`}
                onClick={() => adjustInt('games', 1)}
                className="flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 transition-colors hover:bg-blue-600/30"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>

          {/* Cartões Amarelos */}
          <div className="rounded-xl border border-white/10 bg-[#0B1222] p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="input-yellow-cards"
                className="flex items-center gap-2 text-xs font-semibold text-slate-300"
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-4 w-2.5 rounded-[2px] bg-amber-400 shrink-0"
                />
                <span>Cartões Amarelos</span>
              </label>
              <input
                id="input-yellow-cards"
                type="number"
                inputMode="numeric"
                min={0}
                max={99}
                aria-label={`Cartões amarelos na temporada ${season.year}`}
                value={season.yellowCards || 0}
                onChange={(e) => handleNumberInput('yellowCards', e.target.value)}
                className="w-14 bg-transparent text-right font-display text-3xl font-extrabold text-amber-400 tabular-nums focus:outline-none"
              />
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Diminuir cartões amarelos, atual ${season.yellowCards || 0}`}
                onClick={() => adjustInt('yellowCards', -1)}
                className="flex min-h-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.1]"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Aumentar cartões amarelos, atual ${season.yellowCards || 0}`}
                onClick={() => adjustInt('yellowCards', 1)}
                className="flex min-h-[44px] items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors hover:bg-amber-500/30"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>

          {/* Cartões Vermelhos */}
          <div className="rounded-xl border border-white/10 bg-[#0B1222] p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="input-red-cards"
                className="flex items-center gap-2 text-xs font-semibold text-slate-300"
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-4 w-2.5 rounded-[2px] bg-rose-500 shrink-0"
                />
                <span>Cartões Vermelhos</span>
              </label>
              <input
                id="input-red-cards"
                type="number"
                inputMode="numeric"
                min={0}
                max={99}
                aria-label={`Cartões vermelhos na temporada ${season.year}`}
                value={season.redCards || 0}
                onChange={(e) => handleNumberInput('redCards', e.target.value)}
                className="w-14 bg-transparent text-right font-display text-3xl font-extrabold text-rose-400 tabular-nums focus:outline-none"
              />
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Diminuir cartões vermelhos, atual ${season.redCards || 0}`}
                onClick={() => adjustInt('redCards', -1)}
                className="flex min-h-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.1]"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Aumentar cartões vermelhos, atual ${season.redCards || 0}`}
                onClick={() => adjustInt('redCards', 1)}
                className="flex min-h-[44px] items-center justify-center rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors hover:bg-rose-500/30"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Títulos & Diário da Temporada (2-Column Split on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left: Títulos da Temporada (7 cols) */}
        <section
          aria-labelledby="season-trophies-heading"
          className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" aria-hidden="true" />
              <h3
                id="season-trophies-heading"
                className="font-display text-lg font-bold tracking-wide text-white uppercase"
              >
                Títulos & Prêmios
              </h3>
            </div>

            {/* Segmented Switch: Catalog vs Custom */}
            <div
              role="group"
              aria-label="Modo de adição de título"
              className="inline-flex rounded-xl border border-white/10 bg-[#0B1222] p-0.5"
            >
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  setShowCustomTrophy(false);
                }}
                aria-pressed={!showCustomTrophy}
                className={`min-h-[34px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                  !showCustomTrophy
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Catálogo
              </button>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  setShowCustomTrophy(true);
                }}
                aria-pressed={showCustomTrophy}
                className={`min-h-[34px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                  showCustomTrophy
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Personalizado
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {!showCustomTrophy ? (
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="dialog"
                  aria-label={`Competição ou prêmio selecionado: ${activePresetObj.name}, ${activePresetObj.description}. Toque para abrir catálogo`}
                  onClick={() => {
                    setTrophyQuery('');
                    setTrophyScope('coletivo');
                    setCollectiveFilter('all');
                    setDropdownOpen(true);
                  }}
                  className="w-full min-h-[44px] flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#0B1222] px-3.5 py-2 text-left text-sm text-white transition-colors hover:border-white/25 focus:border-blue-500 focus:outline-none"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {activePresetObj.country && activePresetObj.country !== 'Outras' && (
                      <CountryFlag country={activePresetObj.country} size="sm" />
                    )}
                    <span
                      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase shrink-0 ${
                        (TROPHY_CATEGORY_STYLES[activePresetObj.category] || TROPHY_CATEGORY_STYLES.outro).iconBg
                      }`}
                    >
                      {(TROPHY_CATEGORY_STYLES[activePresetObj.category] || TROPHY_CATEGORY_STYLES.outro).label}
                    </span>
                    <span className="truncate font-semibold text-white">
                      {activePresetObj.name}
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.14, ease: 'easeOut' }}
                      onClick={() => setDropdownOpen(false)}
                      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="trophy-sheet-title"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl border border-white/15 bg-[#11192D] p-5 shadow-2xl max-h-[88dvh] flex flex-col pb-safe gpu-layer"
                      >
                        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700 sm:hidden" aria-hidden="true" />

                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h4
                              id="trophy-sheet-title"
                              className="font-display text-xl font-extrabold text-white uppercase"
                            >
                              Títulos &amp; Prêmios ({season.year})
                            </h4>
                            <p className="text-xs text-slate-400">
                              Ligas por país ou prêmios individuais
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDropdownOpen(false)}
                            aria-label="Fechar catálogo de prêmios"
                            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
                          >
                            <X className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative mt-3">
                          <Search
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                            aria-hidden="true"
                          />
                          <input
                            type="text"
                            value={trophyQuery}
                            onChange={(e) => setTrophyQuery(e.target.value)}
                            aria-label="Buscar título, país ou prêmio"
                            placeholder={
                              trophyScope === 'coletivo'
                                ? 'Buscar liga, copa ou país (ex: Brasil, Premier League...)'
                                : 'Buscar prêmio individual (ex: Bola de Ouro, Chuteira...)'
                            }
                            className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0B1222] pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Clean 2-Tab Scope: Coletivo (Ligas) vs Individual */}
                        <div
                          role="tablist"
                          aria-label="Tipo de conquista"
                          className="mt-2.5 grid grid-cols-2 gap-1 rounded-xl bg-[#0B1222] p-1 border border-white/[0.06]"
                        >
                          <button
                            type="button"
                            role="tab"
                            aria-selected={trophyScope === 'coletivo'}
                            onClick={() => setTrophyScope('coletivo')}
                            className={`min-h-[38px] rounded-lg px-3 text-xs font-bold transition-colors ${
                              trophyScope === 'coletivo'
                                ? 'bg-amber-500 text-slate-950'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            Ligas &amp; Copas (Coletivo)
                          </button>
                          <button
                            type="button"
                            role="tab"
                            aria-selected={trophyScope === 'individual'}
                            onClick={() => setTrophyScope('individual')}
                            className={`min-h-[38px] rounded-lg px-3 text-xs font-bold transition-colors ${
                              trophyScope === 'individual'
                                ? 'bg-violet-500 text-white'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            Prêmios Individuais
                          </button>
                        </div>

                        {/* Unified Scope & Country Division Bar */}
                        {trophyScope === 'coletivo' && (
                          <div
                            role="group"
                            aria-label="Filtrar por país ou competição"
                            className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1.5 border-b border-white/[0.06]"
                          >
                            <button
                              type="button"
                              onClick={() => setCollectiveFilter('all')}
                              aria-pressed={collectiveFilter === 'all'}
                              className={`min-h-[34px] rounded-lg px-2.5 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                                collectiveFilter === 'all'
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-white/10 bg-[#0B1222] text-slate-300 hover:bg-white/[0.08]'
                              }`}
                            >
                              Todos
                            </button>
                            <button
                              type="button"
                              onClick={() => setCollectiveFilter('continentais')}
                              aria-pressed={collectiveFilter === 'continentais'}
                              className={`min-h-[34px] rounded-lg px-2.5 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                                collectiveFilter === 'continentais'
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-white/10 bg-[#0B1222] text-slate-300 hover:bg-white/[0.08]'
                              }`}
                            >
                              Continentais
                            </button>
                            <button
                              type="button"
                              onClick={() => setCollectiveFilter('selecao')}
                              aria-pressed={collectiveFilter === 'selecao'}
                              className={`min-h-[34px] rounded-lg px-2.5 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                                collectiveFilter === 'selecao'
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-white/10 bg-[#0B1222] text-slate-300 hover:bg-white/[0.08]'
                              }`}
                            >
                              Seleções
                            </button>
                            {LEAGUE_COUNTRY_ORDER.map((countryName) => {
                              const active = collectiveFilter === countryName;
                              return (
                                <button
                                  key={countryName}
                                  type="button"
                                  onClick={() => setCollectiveFilter(countryName)}
                                  aria-pressed={active}
                                  className={`inline-flex items-center gap-1.5 min-h-[34px] rounded-lg px-2.5 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                                    active
                                      ? 'bg-blue-600 text-white'
                                      : 'border border-white/10 bg-[#0B1222] text-slate-300 hover:bg-white/[0.08]'
                                  }`}
                                >
                                  {countryName !== 'Outras' && (
                                    <CountryFlag country={countryName} size="sm" />
                                  )}
                                  <span>{countryName}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Preset List */}
                        <div
                          role="listbox"
                          aria-label="Catálogo de títulos e prêmios"
                          className="mt-2.5 flex-1 overflow-y-auto overscroll-contain space-y-3 pr-0.5"
                        >
                          {(() => {
                            const renderPresetRow = (preset: TrophyPreset) => {
                              const catStyle =
                                TROPHY_CATEGORY_STYLES[preset.category] ||
                                TROPHY_CATEGORY_STYLES.outro;
                              const countInSeason = season.trophies.filter(
                                (t) => t.name === preset.name
                              ).length;
                              const isSelected = preset.name === selectedPreset;
                              const showFlag = preset.country && preset.country !== 'Outras';

                              return (
                                <div
                                  key={preset.name}
                                  className={`flex items-center justify-between gap-2.5 rounded-xl border p-2.5 transition-colors ${
                                    countInSeason > 0
                                      ? 'border-amber-500/35 bg-amber-500/10'
                                      : isSelected
                                        ? 'border-blue-500/40 bg-[#141F38]'
                                        : 'border-white/10 bg-[#0B1222]'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => handleAddPresetDirect(preset)}
                                    className="flex flex-1 items-center gap-3 min-w-0 text-left"
                                  >
                                    <div
                                      aria-hidden="true"
                                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${catStyle.iconBg}`}
                                    >
                                      {showFlag ? (
                                        <CountryFlag country={preset.country!} size="sm" />
                                      ) : (
                                        <Award className="h-4 w-4" aria-hidden="true" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-white truncate">
                                          {preset.name}
                                        </span>
                                        {countInSeason > 0 && (
                                          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-300 shrink-0 tabular-nums">
                                            <Check className="h-3 w-3" aria-hidden="true" />
                                            {countInSeason}x
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-slate-400 truncate">
                                        <span className={catStyle.badge}>{catStyle.label}</span>
                                        {preset.country && preset.country !== 'Outras'
                                          ? ` · ${preset.country}`
                                          : ''}
                                        {' · '}
                                        {preset.description}
                                      </div>
                                    </div>
                                  </button>

                                  <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => handleAddPresetDirect(preset)}
                                    aria-label={`Adicionar ${preset.name} à temporada ${season.year}`}
                                    className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-lg bg-amber-500 text-slate-950 transition-colors hover:bg-amber-400"
                                  >
                                    <Plus className="h-4 w-4" aria-hidden="true" />
                                  </motion.button>
                                </div>
                              );
                            };

                            if (trophyScope === 'individual') {
                              return (
                                <div className="space-y-1.5">
                                  {individualPresets.map(renderPresetRow)}
                                </div>
                              );
                            }

                            return (
                              <>
                                {/* Continental & Mundial */}
                                {continentalPresets.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between px-1 pt-1">
                                      <span className="text-xs font-display font-bold uppercase tracking-wider text-amber-300">
                                        Continentais &amp; Mundiais
                                      </span>
                                      <span className="text-[11px] font-mono-num text-slate-500">
                                        {continentalPresets.length}
                                      </span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {continentalPresets.map(renderPresetRow)}
                                    </div>
                                  </div>
                                )}

                                {/* Seleções */}
                                {selectionPresets.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between px-1 pt-1">
                                      <span className="text-xs font-display font-bold uppercase tracking-wider text-emerald-300">
                                        Seleções Nacionais
                                      </span>
                                      <span className="text-[11px] font-mono-num text-slate-500">
                                        {selectionPresets.length}
                                      </span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {selectionPresets.map(renderPresetRow)}
                                    </div>
                                  </div>
                                )}

                                {/* National Leagues & Cups Grouped by Country */}
                                {groupedNationalPresets.length > 0 && (
                                  <div className="space-y-3">
                                    {groupedNationalPresets.map((group) => (
                                      <div key={group.country} className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-2 px-1 pt-1">
                                          <div className="flex items-center gap-2">
                                            {group.country !== 'Outras' && (
                                              <CountryFlag country={group.country} size="sm" />
                                            )}
                                            <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-200">
                                              {group.country === 'Outras'
                                                ? 'Outras Ligas Nacionais'
                                                : group.country}
                                            </span>
                                          </div>
                                          <span className="text-[11px] font-mono-num text-slate-500">
                                            {group.items.length}{' '}
                                            {group.items.length === 1 ? 'competição' : 'competições'}
                                          </span>
                                        </div>
                                        <div className="space-y-1.5">
                                          {group.items.map(renderPresetRow)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            );
                          })()}

                          {trophyQuery.trim() && filteredPresets.length === 0 && (
                            <div className="rounded-xl border border-dashed border-white/15 bg-[#0B1222] p-4 text-center space-y-2.5">
                              <p className="text-xs text-slate-400">
                                Nenhum item encontrado para &ldquo;{trophyQuery.trim()}&rdquo;.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  const custom = trophyQuery.trim();
                                  const isCountrySelected =
                                    trophyScope === 'coletivo' &&
                                    collectiveFilter !== 'all' &&
                                    collectiveFilter !== 'continentais' &&
                                    collectiveFilter !== 'selecao' &&
                                    collectiveFilter !== 'Outras';
                                  const inferredCountry = isCountrySelected
                                    ? collectiveFilter
                                    : resolveTrophyCountry(custom);
                                  const inferredCat: TrophyCategory =
                                    trophyScope === 'individual' ? 'individual' : 'liga';
                                  onUpdateSeason({
                                    ...season,
                                    trophies: [
                                      ...season.trophies,
                                      {
                                        id: createId(),
                                        name: custom,
                                        category: inferredCat,
                                        country: inferredCountry,
                                      },
                                    ],
                                  });
                                  onAnnounce?.(`Título ${custom} adicionado à temporada ${season.year}.`);
                                  setTrophyQuery('');
                                }}
                                className="min-h-[40px] rounded-xl bg-amber-500 px-4 text-xs font-bold text-slate-950 hover:bg-amber-400"
                              >
                                Adicionar &ldquo;{trophyQuery.trim()}&rdquo; como personalizado
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-400 tabular-nums">
                            {season.trophies.length}{' '}
                            {season.trophies.length === 1 ? 'taça em' : 'taças em'} {season.year}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDropdownOpen(false)}
                            className="min-h-[42px] rounded-xl bg-blue-600 px-5 text-xs font-bold text-white hover:bg-blue-500"
                          >
                            Concluir
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex-1 min-w-0 space-y-2">
                <input
                  type="text"
                  value={customTrophyName}
                  onChange={(e) => setCustomTrophyName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTrophy()}
                  aria-label="Nome do campeonato ou prêmio personalizado"
                  placeholder="Ex: Paulistão, Bola de Ouro, Liga Belga..."
                  className="w-full min-h-[44px] rounded-xl border border-white/10 bg-[#0B1222] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />

                {/* Dark-themed Type Toggle (Coletivo vs Individual) */}
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#0B1222] p-1 border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setCustomTrophyCategory('liga')}
                    aria-pressed={customTrophyCategory === 'liga'}
                    className={`min-h-[34px] rounded-lg px-2.5 text-[11px] font-semibold transition-colors ${
                      customTrophyCategory === 'liga'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Liga / Copa (Coletivo)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTrophyCategory('individual');
                      setCustomTrophyCountry('');
                    }}
                    aria-pressed={customTrophyCategory === 'individual'}
                    className={`min-h-[34px] rounded-lg px-2.5 text-[11px] font-semibold transition-colors ${
                      customTrophyCategory === 'individual'
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Prêmio Individual
                  </button>
                </div>

                {/* Dark-themed Country Flag Strip (Replaces native browser select) */}
                {customTrophyCategory === 'liga' && (
                  <div
                    role="group"
                    aria-label="País do campeonato personalizado"
                    className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => setCustomTrophyCountry('')}
                      aria-pressed={customTrophyCountry === ''}
                      className={`min-h-[32px] rounded-lg px-2.5 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        customTrophyCountry === ''
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'border border-white/10 bg-[#0B1222] text-slate-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      Geral
                    </button>
                    {LEAGUE_COUNTRY_ORDER.filter((c) => c !== 'Outras').map((countryName) => {
                      const active = customTrophyCountry === countryName;
                      return (
                        <button
                          key={countryName}
                          type="button"
                          onClick={() => setCustomTrophyCountry(countryName)}
                          aria-pressed={active}
                          className={`inline-flex items-center gap-1.5 min-h-[32px] rounded-lg px-2.5 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                            active
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'border border-white/10 bg-[#0B1222] text-slate-300 hover:bg-white/[0.08]'
                          }`}
                        >
                          <CountryFlag country={countryName} size="sm" />
                          <span>{countryName}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={handleAddTrophy}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 whitespace-nowrap shrink-0 self-start"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Adicionar
            </motion.button>
          </div>

          {/* Won Trophies List */}
          <div>
            {season.trophies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-[#0B1222]/60 py-6 px-4 text-center">
                <p className="text-sm text-slate-400">
                  Nenhum título registrado em {season.year} ainda.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Escolha uma liga por país ou prêmio individual acima para adicionar à galeria.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(() => {
                  const individualCount = season.trophies.filter(
                    (t) => t.category === 'individual'
                  ).length;
                  const collectiveCount = season.trophies.length - individualCount;
                  return (
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 px-0.5 tabular-nums">
                      <span>
                        <strong className="text-emerald-300 font-mono-num">{collectiveCount}</strong>{' '}
                        {collectiveCount === 1 ? 'coletivo' : 'coletivos'}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>
                        <strong className="text-violet-300 font-mono-num">{individualCount}</strong>{' '}
                        {individualCount === 1 ? 'individual' : 'individuais'}
                      </span>
                    </div>
                  );
                })()}
                <ul
                  aria-label={`Lista de títulos conquistados em ${season.year}`}
                  className="space-y-2"
                >
                  <AnimatePresence initial={false}>
                    {season.trophies.map((trophy) => {
                      const style =
                        TROPHY_CATEGORY_STYLES[trophy.category] || TROPHY_CATEGORY_STYLES.outro;
                      const trophyCountry = resolveTrophyCountry(trophy.name, trophy.country);
                      return (
                        <motion.li
                          key={trophy.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -14 }}
                          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#0B1222] px-3 py-2.5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              aria-hidden="true"
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${style.iconBg}`}
                            >
                              {trophyCountry ? (
                                <CountryFlag country={trophyCountry} size="sm" />
                              ) : (
                                <Award className="h-4 w-4" aria-hidden="true" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-100 truncate">
                                {trophy.name}
                              </div>
                              <div className={`text-[11px] font-medium truncate ${style.badge}`}>
                                {trophyCountry ? `${trophyCountry} · ` : ''}
                                {style.label}
                              </div>
                            </div>
                          </div>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            aria-label={`Remover título ${trophy.name}`}
                            onClick={() => handleRemoveTrophy(trophy.id, trophy.name)}
                            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-500/15 hover:text-rose-400 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </motion.button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Right: Diário, Ajuste de Over Inicial & Encerrar Temporada (5 cols) */}
        <section
          aria-labelledby="season-diary-heading"
          className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4 text-blue-400" aria-hidden="true" />
              <h3
                id="season-diary-heading"
                className="font-display text-lg font-bold tracking-wide text-white uppercase"
              >
                Diário & Fechamento
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="input-start-ovr"
                className="text-[11px] font-medium text-slate-400"
              >
                Over Inicial:
              </label>
              <input
                id="input-start-ovr"
                type="number"
                inputMode="numeric"
                min={1}
                max={99}
                aria-label={`Overall inicial da temporada ${season.year}`}
                value={season.startOverall}
                onChange={(e) => handleNumberInput('startOverall', e.target.value)}
                className="w-12 min-h-[34px] rounded-lg border border-white/10 bg-[#0B1222] text-center text-xs font-mono-num font-bold text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="input-notes"
              className="block text-xs font-medium text-slate-300"
            >
              Anotações para a História (opcional)
            </label>
            <textarea
              id="input-notes"
              rows={3}
              value={season.notes}
              onChange={(e) => onUpdateSeason({ ...season, notes: e.target.value })}
              placeholder="Ex: Gol do título nos acréscimos, artilheiro da liga, lesão..."
              className="w-full rounded-xl border border-white/10 bg-[#0B1222] p-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none resize-none"
            />
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Sugestões rápidas de anotação">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 mr-0.5">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Rápido:
              </span>
              {QUICK_NOTE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAppendNoteTag(tag)}
                  className="min-h-[32px] rounded-lg border border-white/10 bg-[#0B1222] px-2.5 text-[11px] font-medium text-slate-300 transition-colors hover:border-blue-500/40 hover:text-white"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Primary End Season CTA */}
          {isCurrentActiveSeason && !career.retired ? (
            <div className="rounded-xl border border-red-500/25 bg-red-950/20 p-3.5 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p id="end-season-hint" className="text-xs text-slate-300 leading-relaxed">
                  Ao encerrar, o ano {season.year} entra para o histórico e você define se continua no{' '}
                  <strong className="text-white">{season.club}</strong> ou muda de clube.
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={onOpenEndSeason}
                aria-describedby="end-season-hint"
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/40 transition-colors duration-150 hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <Flag className="h-4 w-4" aria-hidden="true" />
                Encerrar Temporada {season.year}
              </motion.button>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-[#0B1222] px-3.5 py-3 text-xs text-slate-400">
              {career.retired
                ? `Carreira encerrada em ${career.retiredYear || season.year}. Todos os registros permanecem editáveis.`
                : `Temporada ${season.year} concluída. Use o seletor acima do painel para voltar à temporada ativa (${career.currentYear}).`}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
