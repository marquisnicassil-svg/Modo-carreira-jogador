import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  Flag,
  Minus,
  Plus,
  Trash2,
  Trophy,
} from 'lucide-react';
import {
  CareerProfile,
  SeasonRecord,
  TROPHY_PRESETS,
  TrophyCategory,
} from '../types/career';
import { createId, formatRating } from '../utils/careerEngine';

interface SeasonViewProps {
  career: CareerProfile;
  season: SeasonRecord;
  isCurrentActiveSeason: boolean;
  onUpdateSeason: (updated: SeasonRecord) => void;
  onOpenEndSeason: () => void;
  onJumpToCurrentSeason: () => void;
  onAnnounce?: (message: string) => void;
}

export function SeasonView({
  career,
  season,
  isCurrentActiveSeason,
  onUpdateSeason,
  onOpenEndSeason,
  onJumpToCurrentSeason,
  onAnnounce,
}: SeasonViewProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>(TROPHY_PRESETS[0].name);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customTrophyName, setCustomTrophyName] = useState('');
  const [showCustomTrophy, setShowCustomTrophy] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const adjustInt = (field: 'goals' | 'assists' | 'games' | 'endOverall', delta: number) => {
    const min = field === 'endOverall' ? 1 : 0;
    const max = field === 'endOverall' ? 99 : 999;
    const nextVal = Math.min(max, Math.max(min, (season[field] || 0) + delta));
    onUpdateSeason({ ...season, [field]: nextVal });
    const labels: Record<typeof field, string> = {
      goals: 'Gols',
      assists: 'Assistências',
      games: 'Jogos',
      endOverall: 'Overall',
    };
    onAnnounce?.(`${labels[field]}: ${nextVal}`);
  };

  const adjustRating = (delta: number) => {
    const nextVal = Math.min(10, Math.max(0, Math.round((season.rating + delta) * 10) / 10));
    onUpdateSeason({ ...season, rating: nextVal });
    onAnnounce?.(`Média: ${formatRating(nextVal)}`);
  };

  const handleNumberInput = (
    field: 'goals' | 'assists' | 'games' | 'startOverall' | 'endOverall',
    raw: string
  ) => {
    const parsed = parseInt(raw, 10);
    const val = Number.isNaN(parsed) ? 0 : parsed;
    const min = field === 'startOverall' || field === 'endOverall' ? 1 : 0;
    const max = field === 'startOverall' || field === 'endOverall' ? 99 : 999;
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
      onUpdateSeason({
        ...season,
        trophies: [
          ...season.trophies,
          { id: createId(), name: trimmed, category: 'outro' as TrophyCategory },
        ],
      });
      setCustomTrophyName('');
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
        { id: createId(), name: preset.name, category: preset.category },
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

  const activePresetObj =
    TROPHY_PRESETS.find((p) => p.name === selectedPreset) || TROPHY_PRESETS[0];

  const ovrDelta = season.endOverall - season.startOverall;

  return (
    <motion.div
      key={season.id}
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Historical Season Inspection Notice */}
      {!isCurrentActiveSeason && (
        <div
          role="region"
          aria-label={`Aviso da temporada ${season.year}`}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4"
        >
          <div className="text-sm text-amber-100">
            <span className="font-semibold">Resumo da Temporada {season.year}</span>
            <span className="text-amber-200/80">
              {' '}
              — Você pode corrigir ou editar qualquer número e título desta temporada abaixo.
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

      {/* Primary 4 KPI Stat Cards (2x2 mobile, 4-col desktop) */}
      <section aria-labelledby="season-numbers-heading">
        <div className="flex items-center justify-between mb-3">
          <h2
            id="season-numbers-heading"
            className="font-display text-lg sm:text-xl font-bold tracking-wide text-white uppercase"
          >
            Números de {season.year}
          </h2>
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            {season.isCompleted ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                Temporada encerrada
              </>
            ) : (
              <span>Em andamento · {season.club}</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* GOLS */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="input-goals"
                className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                Gols
              </label>
              <span className="text-[11px] font-medium text-emerald-400 tabular-nums">
                {season.games > 0 ? (
                  <>
                    <span className="sr-only">
                      {(season.goals / season.games).toFixed(2)} gols por jogo
                    </span>
                    <span aria-hidden="true">
                      {(season.goals / season.games).toFixed(2)}/j
                    </span>
                  </>
                ) : (
                  'Ataque'
                )}
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
              className="my-2 w-full bg-transparent font-display text-4xl sm:text-5xl font-extrabold text-white tabular-nums focus:outline-none focus:text-blue-400"
            />

            <div className="grid grid-cols-2 gap-2 pt-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Diminuir gols, atual ${season.goals}`}
                onClick={() => adjustInt('goals', -1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.1]"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Aumentar gols, atual ${season.goals}`}
                onClick={() => adjustInt('goals', 1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 transition-colors hover:bg-blue-600/30"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>

          {/* ASSISTÊNCIAS */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="input-assists"
                className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                Assistências
              </label>
              <span className="text-[11px] font-medium text-sky-400 tabular-nums">
                <span className="sr-only">
                  Participações em gols: {season.goals + season.assists}
                </span>
                <span aria-hidden="true">G+A: {season.goals + season.assists}</span>
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
              className="my-2 w-full bg-transparent font-display text-4xl sm:text-5xl font-extrabold text-white tabular-nums focus:outline-none focus:text-blue-400"
            />

            <div className="grid grid-cols-2 gap-2 pt-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Diminuir assistências, atual ${season.assists}`}
                onClick={() => adjustInt('assists', -1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.1]"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Aumentar assistências, atual ${season.assists}`}
                onClick={() => adjustInt('assists', 1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 transition-colors hover:bg-blue-600/30"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>

          {/* MÉDIA */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="input-rating"
                className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                Média
              </label>
              <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                Nota 0 a 10
              </span>
            </div>

            <div className="my-2 flex items-baseline gap-2">
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
              <span aria-hidden="true" className="text-xs font-mono-num text-slate-500 shrink-0">
                ({formatRating(season.rating)})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Diminuir média, atual ${formatRating(season.rating)}`}
                onClick={() => adjustRating(-0.1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.1]"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Aumentar média, atual ${formatRating(season.rating)}`}
                onClick={() => adjustRating(0.1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 transition-colors hover:bg-blue-600/30"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>

          {/* OVERALL */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="input-ovr"
                className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                Over
              </label>
              <span
                className={`text-[11px] font-semibold tabular-nums ${
                  ovrDelta > 0
                    ? 'text-emerald-400'
                    : ovrDelta < 0
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                Início {season.startOverall}
                {ovrDelta !== 0 ? (
                  <>
                    <span className="sr-only">
                      , evolução de {ovrDelta > 0 ? `mais ${ovrDelta}` : ovrDelta} pontos
                    </span>
                    <span aria-hidden="true">
                      {` (${ovrDelta > 0 ? `+${ovrDelta}` : ovrDelta})`}
                    </span>
                  </>
                ) : null}
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
              className="my-2 w-full bg-transparent font-display text-4xl sm:text-5xl font-extrabold text-amber-400 tabular-nums focus:outline-none focus:text-amber-300"
            />

            <div className="grid grid-cols-2 gap-2 pt-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Diminuir overall, atual ${season.endOverall}`}
                onClick={() => adjustInt('endOverall', -1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.1]"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                aria-label={`Aumentar overall, atual ${season.endOverall}`}
                onClick={() => adjustInt('endOverall', 1)}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors hover:bg-amber-500/30"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Details & Trophies 2-Column Split on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left: Títulos da Temporada (7 cols) */}
        <section
          aria-labelledby="season-trophies-heading"
          className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" aria-hidden="true" />
              <h2
                id="season-trophies-heading"
                className="font-display text-lg font-bold tracking-wide text-white uppercase"
              >
                Títulos da Temporada
              </h2>
            </div>
            <span className="text-xs font-mono-num text-slate-400">
              {season.trophies.length} {season.trophies.length === 1 ? 'taça' : 'taças'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              {!showCustomTrophy ? (
                <div className="relative flex-1 min-w-0" ref={dropdownRef}>
                  <button
                    type="button"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="listbox"
                    aria-label={`Competição ou prêmio selecionado: ${activePresetObj.name}, ${activePresetObj.description}. Toque para trocar`}
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="w-full min-h-[44px] flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#0B1222] px-3.5 py-2 text-left text-sm text-white transition-colors hover:border-white/20 focus:border-blue-500 focus:outline-none"
                  >
                    <span className="truncate">
                      <span className="font-medium text-white">{activePresetObj.name}</span>
                      <span className="text-slate-400"> — {activePresetObj.description}</span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        role="listbox"
                        aria-label="Selecionar competição ou título"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/15 bg-[#0B1222] p-1.5 shadow-2xl"
                      >
                        {TROPHY_PRESETS.map((preset) => {
                          const isSelected = preset.name === selectedPreset;
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                setSelectedPreset(preset.name);
                                setDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                                isSelected
                                  ? 'bg-blue-600/20 text-white'
                                  : 'text-slate-200 hover:bg-white/[0.06]'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-semibold truncate">{preset.name}</div>
                                <div className="text-xs text-slate-400 truncate">
                                  {preset.description}
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <input
                  type="text"
                  value={customTrophyName}
                  onChange={(e) => setCustomTrophyName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTrophy()}
                  aria-label="Nome do campeonato ou prêmio personalizado"
                  placeholder="Nome do campeonato ou prêmio..."
                  className="flex-1 min-h-[44px] rounded-xl border border-white/10 bg-[#0B1222] px-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              )}

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={handleAddTrophy}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Adicionar Título
              </motion.button>
            </div>

            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                setShowCustomTrophy((v) => !v);
              }}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors py-1"
            >
              {showCustomTrophy
                ? 'Escolher da lista padrão (Continental A/B, Liga, Copa...)'
                : '+ Digitar título personalizado'}
            </button>
          </div>

          {/* Won Trophies List */}
          <div className="mt-4">
            {season.trophies.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500 border-t border-white/[0.06]">
                Nenhum título registrado em {season.year} ainda.
              </p>
            ) : (
              <ul
                aria-label={`Lista de títulos conquistados em ${season.year}`}
                className="divide-y divide-white/[0.06]"
              >
                <AnimatePresence initial={false}>
                  {season.trophies.map((trophy) => (
                    <motion.li
                      key={trophy.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -14 }}
                      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400"
                        >
                          <Award className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <span className="text-sm font-medium text-slate-100 truncate">
                          {trophy.name}
                        </span>
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
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </section>

        {/* Right: Season Context, Games, Start OVR & Notes (5 cols) */}
        <section
          aria-labelledby="season-details-heading"
          className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5 space-y-4"
        >
          <h2
            id="season-details-heading"
            className="font-display text-lg font-bold tracking-wide text-white uppercase"
          >
            Detalhes da Temporada
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="input-games"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                Jogos disputados
              </label>
              <input
                id="input-games"
                type="number"
                inputMode="numeric"
                min={0}
                max={999}
                value={season.games}
                onChange={(e) => handleNumberInput('games', e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-white/10 bg-[#0B1222] px-3 text-sm font-mono-num text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="input-start-ovr"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                Over Inicial ({season.year})
              </label>
              <input
                id="input-start-ovr"
                type="number"
                inputMode="numeric"
                min={1}
                max={99}
                value={season.startOverall}
                onChange={(e) => handleNumberInput('startOverall', e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-white/10 bg-[#0B1222] px-3 text-sm font-mono-num text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="input-notes"
              className="block text-xs font-medium text-slate-400 mb-1.5"
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
          </div>

          {/* Primary End Season CTA */}
          {isCurrentActiveSeason && !career.retired && (
            <div className="pt-2">
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
              <p id="end-season-hint" className="mt-2 text-center text-xs text-slate-400">
                Registra o ano no histórico e pergunta se houve transferência de clube.
              </p>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
