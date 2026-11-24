import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRightLeft,
  Award,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Flag,
  LogOut,
  Minus,
  Plus,
  Search,
  Shield,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import {
  CareerProfile,
  PLAYER_POSITIONS,
  POPULAR_CLUBS,
  SeasonRecord,
} from '../types/career';
import { FOOTBALL_COUNTRIES } from '../utils/countries';
import { formatRating, getUnlockedSeasonAchievements } from '../utils/careerEngine';
import { processPlayerPhotoFile } from '../utils/imageHelper';
import { CountryFlag } from './CountryFlag';

function PositionPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (pos: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const current = PLAYER_POSITIONS.find((p) => p.code === value);

  return (
    <div className="relative" ref={containerRef}>
      <span id="position-picker-label" className="block text-xs font-semibold text-slate-300 mb-1.5">
        Posição
      </span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby="position-picker-label"
        aria-label={`Posição selecionada: ${value}${current ? `, ${current.label}` : ''}. Toque para alterar`}
        className="w-full min-h-[44px] flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#0B1222] px-3 py-2 text-left text-sm text-white transition-colors hover:border-white/25 focus:border-blue-500 focus:outline-none"
      >
        <span className="truncate">
          <span className="font-semibold">{value}</span>
          {current ? (
            <span className="text-slate-400"> · {current.label}</span>
          ) : null}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Selecionar posição"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 sm:right-auto sm:w-64 z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-white/15 bg-[#0B1222] p-1.5 shadow-2xl space-y-0.5"
          >
            {PLAYER_POSITIONS.map((pos) => {
              const selected = pos.code === value;
              return (
                <button
                  key={pos.code}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={`${pos.code}, ${pos.label}`}
                  onClick={() => {
                    onChange(pos.code);
                    setOpen(false);
                  }}
                  className={`w-full min-h-[38px] flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    selected
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-200 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="font-mono-num font-bold w-9 shrink-0">{pos.code}</span>
                    <span className="truncate text-slate-300">{pos.label}</span>
                  </span>
                  {selected && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   REUSABLE COUNTRY FLAG DROPDOWN PICKER
   ========================================================= */
interface CountryFlagPickerProps {
  value: string;
  onChange: (country: string) => void;
}

function CountryFlagPicker({ value, onChange }: CountryFlagPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FOOTBALL_COUNTRIES;
    return FOOTBALL_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="relative" ref={containerRef}>
      <span id="country-picker-label" className="block text-xs font-semibold text-slate-300 mb-1.5">
        Nacionalidade
      </span>

      <button
        type="button"
        onClick={() => {
          setQuery('');
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby="country-picker-label"
        aria-label={`Nacionalidade selecionada: ${value}. Toque para alterar`}
        className="w-full min-h-[44px] flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#0B1222] px-3 py-2 text-left text-sm text-white transition-colors hover:border-white/25 focus:border-blue-500 focus:outline-none"
      >
        <span className="flex items-center gap-2 min-w-0">
          <CountryFlag country={value} size="sm" />
          <span className="truncate">{value}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 left-0 sm:left-auto sm:w-72 z-30 mt-2 rounded-xl border border-white/15 bg-[#0B1222] p-2.5 shadow-2xl space-y-2"
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar país"
                placeholder="Buscar país..."
                className="w-full min-h-[36px] rounded-lg border border-white/10 bg-[#11192D] pl-8 pr-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div role="listbox" aria-label="Países" className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-0.5">
              {filteredCountries.map((country) => {
                const selected = value.toLowerCase() === country.name.toLowerCase();
                return (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(country.name);
                      setOpen(false);
                    }}
                    className={`min-h-[38px] flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-200 hover:bg-white/[0.06]'
                    }`}
                  >
                    <CountryFlag country={country.name} size="sm" />
                    <span className="truncate flex-1">{country.name}</span>
                  </button>
                );
              })}
            </div>

            {query.trim() && filteredCountries.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  onChange(query.trim());
                  setOpen(false);
                }}
                className="w-full min-h-[36px] rounded-lg bg-blue-600/20 border border-blue-500/30 px-2.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/30"
              >
                Usar &ldquo;{query.trim()}&rdquo;
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   REUSABLE OPTIONAL PHOTO PICKER WITH AI FACE FOCUS
   ========================================================= */
interface PhotoPickerFieldProps {
  photo?: string;
  playerName?: string;
  onChange: (photo: string | undefined) => void;
}

function PhotoPickerField({ photo, playerName, onChange }: PhotoPickerFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const [facePhoto, setFacePhoto] = useState<string | null>(null);
  const [fullPhoto, setFullPhoto] = useState<string | null>(null);
  const [usingFullCrop, setUsingFullCrop] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setLoading(true);
    setError(null);
    setAiStatus(null);
    setFacePhoto(null);
    setFullPhoto(null);
    setUsingFullCrop(false);

    try {
      const result = await processPlayerPhotoFile(file, playerName);
      onChange(result.photo);
      setAiStatus(result.statusText);
      if (result.faceFocused) {
        setFacePhoto(result.photo);
        setFullPhoto(result.fullCrop);
      }
      if (result.apiError) {
        setError(result.apiError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar imagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCrop = () => {
    if (!facePhoto || !fullPhoto) return;
    const nextUseFull = !usingFullCrop;
    setUsingFullCrop(nextUseFull);
    onChange(nextUseFull ? fullPhoto : facePhoto);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0B1222] p-3">
      <div className="flex items-center gap-3.5">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-[#11192D] flex items-center justify-center text-slate-500">
          {photo ? (
            <img
              src={photo}
              alt={playerName ? `Foto de ${playerName}` : 'Foto do jogador'}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-6 w-6" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-200">
            Foto do Jogador <span className="font-normal text-slate-400">(opcional)</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/[0.12] disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
              {loading ? 'Focando rosto...' : photo ? 'Trocar foto' : 'Escolher foto'}
            </button>

            {facePhoto && fullPhoto && (
              <button
                type="button"
                onClick={handleToggleCrop}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.08]"
              >
                {usingFullCrop ? 'Focar rosto' : 'Foto inteira'}
              </button>
            )}

            {photo && (
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setAiStatus(null);
                  setFacePhoto(null);
                  setFullPhoto(null);
                  setError(null);
                }}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/15"
              >
                Remover
              </button>
            )}
          </div>
        </div>
      </div>

      {aiStatus && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-blue-300">
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{aiStatus}</span>
        </p>
      )}
      {error && <p className="mt-1.5 text-xs text-amber-300">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

/* =========================================================
   REUSABLE STEPPER + SLIDER CONTROL ("BARRINHA" + "-" / "+")
   ========================================================= */
interface StepperSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  accentClass?: string;
  onChange: (val: number) => void;
}

function StepperSlider({
  id,
  label,
  value,
  min,
  max,
  accentClass = 'text-white',
  onChange,
}: StepperSliderProps) {
  const adjust = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0B1222] p-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-slate-300">
          {label}
        </label>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            if (!Number.isNaN(parsed)) {
              onChange(Math.min(max, Math.max(min, parsed)));
            }
          }}
          className={`w-20 bg-transparent text-right font-display text-2xl font-extrabold tabular-nums focus:outline-none ${accentClass}`}
        />
      </div>

      <div className="mt-2 flex items-center gap-2.5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          aria-label={`Diminuir ${label}, atual ${value}`}
          onClick={() => adjust(-1)}
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.1]"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </motion.button>

        <input
          type="range"
          aria-label={`Barra de ${label}`}
          aria-valuetext={`${value}`}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="flex-1 h-2 rounded-lg appearance-none bg-slate-800 accent-blue-500 cursor-pointer"
        />

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          aria-label={`Aumentar ${label}, atual ${value}`}
          onClick={() => adjust(1)}
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 transition-colors hover:bg-blue-600/30"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      </div>
    </div>
  );
}

/* =========================================================
   1. END OF SEASON & TRANSFER MODAL
   ========================================================= */
interface EndOfSeasonModalProps {
  career: CareerProfile;
  season: SeasonRecord;
  onClose: () => void;
  onAdvanceSeason: (nextClub: string, retire?: boolean) => void;
}

export function EndOfSeasonModal({
  career,
  season,
  onClose,
  onAdvanceSeason,
}: EndOfSeasonModalProps) {
  const [transferMode, setTransferMode] = useState(false);
  const [newClub, setNewClub] = useState('');

  const achievements = getUnlockedSeasonAchievements(season, career);

  const handleConfirmTransfer = () => {
    const trimmed = newClub.trim();
    if (!trimmed) return;
    onAdvanceSeason(trimmed, false);
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
      aria-labelledby="end-season-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#11192D] p-5 sm:p-6 shadow-2xl max-h-[90dvh] overflow-y-auto overscroll-contain pb-safe gpu-layer"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700 sm:hidden" aria-hidden="true" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Fim da Temporada {season.year}
            </p>
            <h2
              id="end-season-title"
              className="mt-0.5 font-display text-2xl font-extrabold text-white uppercase"
            >
              {career.playerName} · {season.club}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl border border-white/[0.08] bg-[#0B1222] p-3 text-center">
          <div>
            <div className="text-[11px] text-slate-400">Gols</div>
            <div className="font-display text-2xl font-extrabold text-emerald-400 tabular-nums">
              {season.goals}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Assist.</div>
            <div className="font-display text-2xl font-extrabold text-sky-400 tabular-nums">
              {season.assists}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Média</div>
            <div className="font-display text-2xl font-extrabold text-white tabular-nums">
              {formatRating(season.rating)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Over</div>
            <div className="font-display text-2xl font-extrabold text-amber-400 tabular-nums">
              {season.endOverall}
            </div>
          </div>
        </div>

        {achievements.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Award className="h-4 w-4" aria-hidden="true" />
              Destaques da Temporada
            </div>
            <ul className="space-y-1">
              {achievements.map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-amber-100">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!transferMode ? (
            <motion.div
              key="eos-choice"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 space-y-3"
            >
              <div className="text-center">
                <h3 className="text-base font-bold text-white">Você mudou de time?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Escolha o destino para a temporada {season.year + 1} ({season.age + 1} anos)
                </p>
              </div>

              <button
                type="button"
                onClick={() => onAdvanceSeason(season.club, false)}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500"
              >
                <Shield className="h-4 w-4" aria-hidden="true" />
                Continuar no {season.club}
              </button>

              <button
                type="button"
                onClick={() => setTransferMode(true)}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400"
              >
                <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
                Mudar de Clube (Transferência)
              </button>

              <button
                type="button"
                onClick={() => onAdvanceSeason(season.club, true)}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-rose-400"
              >
                <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                Encerrar Carreira (Aposentar Jogador)
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="eos-transfer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 space-y-3"
            >
              <div>
                <label
                  htmlFor="transfer-club-input"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  Novo clube para {season.year + 1}
                </label>
                <input
                  id="transfer-club-input"
                  type="text"
                  value={newClub}
                  onChange={(e) => setNewClub(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmTransfer()}
                  placeholder="Digite o nome do novo clube..."
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0B1222] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CLUBS.filter((c) => c.toLowerCase() !== season.club.toLowerCase())
                  .slice(0, 10)
                  .map((club) => (
                    <button
                      key={club}
                      type="button"
                      onClick={() => setNewClub(club)}
                      className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        newClub === club
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]'
                      }`}
                    >
                      {club}
                    </button>
                  ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferMode(false)}
                  className="min-h-[44px] rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-slate-300 hover:bg-white/[0.09]"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={!newClub.trim()}
                  onClick={handleConfirmTransfer}
                  className="min-h-[44px] rounded-xl bg-amber-500 px-4 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-40"
                >
                  Confirmar Transferência
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   2. NEW CAREER MODAL (Original layout + Photo + Flag Picker + Stepper/Slider)
   ========================================================= */
interface NewCareerModalProps {
  onClose: () => void;
  onCreate: (data: {
    playerName: string;
    playerPhoto?: string;
    position: string;
    nationality: string;
    club: string;
    year: number;
    age: number;
    overall: number;
  }) => void;
}

export function NewCareerModal({ onClose, onCreate }: NewCareerModalProps) {
  const [playerName, setPlayerName] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState<string | undefined>(undefined);
  const [position, setPosition] = useState('ATA');
  const [nationality, setNationality] = useState('Brasil');
  const [club, setClub] = useState('');
  const [year, setYear] = useState(2026);
  const [age, setAge] = useState(18);
  const [overall, setOverall] = useState(76);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !club.trim()) return;
    onCreate({
      playerName: playerName.trim(),
      playerPhoto,
      position,
      nationality: nationality.trim() || 'Brasil',
      club: club.trim(),
      year,
      age,
      overall,
    });
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
      aria-labelledby="new-career-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#11192D] p-5 sm:p-6 shadow-2xl max-h-[90dvh] overflow-y-auto overscroll-contain pb-safe gpu-layer"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700 sm:hidden" aria-hidden="true" />

        <div className="flex items-center justify-between">
          <h2
            id="new-career-title"
            className="font-display text-2xl font-extrabold text-white uppercase"
          >
            Nova Carreira
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <PhotoPickerField
            photo={playerPhoto}
            playerName={playerName}
            onChange={setPlayerPhoto}
          />

          <div>
            <label htmlFor="nc-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nome do Jogador
            </label>
            <input
              id="nc-name"
              type="text"
              required
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ex: Nome do jogador..."
              className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0B1222] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PositionPicker value={position} onChange={setPosition} />

            <CountryFlagPicker value={nationality} onChange={setNationality} />
          </div>

          <div>
            <label htmlFor="nc-club" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Clube Inicial
            </label>
            <input
              id="nc-club"
              type="text"
              required
              value={club}
              onChange={(e) => setClub(e.target.value)}
              placeholder="Ex: Palmeiras, Real Madrid, Arsenal..."
              className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0B1222] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Stepper + Slider Bars */}
          <div className="space-y-2.5 pt-1">
            <StepperSlider
              id="nc-year"
              label="Ano Inicial"
              value={year}
              min={1990}
              max={2050}
              onChange={setYear}
            />

            <StepperSlider
              id="nc-age"
              label="Idade"
              value={age}
              min={15}
              max={45}
              onChange={setAge}
            />

            <StepperSlider
              id="nc-ovr"
              label="Over Inicial (OVR)"
              value={overall}
              min={40}
              max={99}
              accentClass="text-amber-400"
              onChange={setOverall}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-slate-300 hover:bg-white/[0.09]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500"
            >
              Iniciar Carreira
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   3. EDIT PLAYER MODAL
   ========================================================= */
interface EditPlayerModalProps {
  career: CareerProfile;
  selectedSeason: SeasonRecord;
  onClose: () => void;
  onSave: (updates: {
    playerName: string;
    playerPhoto?: string;
    position: string;
    nationality: string;
    seasonClub: string;
    seasonAge: number;
    retired: boolean;
  }) => void;
  onDeletePlayer: () => void;
}

export function EditPlayerModal({
  career,
  selectedSeason,
  onClose,
  onSave,
  onDeletePlayer,
}: EditPlayerModalProps) {
  const [playerName, setPlayerName] = useState(career.playerName);
  const [playerPhoto, setPlayerPhoto] = useState<string | undefined>(career.playerPhoto);
  const [position, setPosition] = useState(career.position);
  const [nationality, setNationality] = useState(career.nationality);
  const [seasonClub, setSeasonClub] = useState(selectedSeason.club);
  const [seasonAge, setSeasonAge] = useState(selectedSeason.age);
  const [retired, setRetired] = useState(career.retired);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !seasonClub.trim()) return;
    onSave({
      playerName: playerName.trim(),
      playerPhoto,
      position,
      nationality: nationality.trim() || 'Brasil',
      seasonClub: seasonClub.trim(),
      seasonAge,
      retired,
    });
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
      aria-labelledby="edit-player-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#11192D] p-5 sm:p-6 shadow-2xl max-h-[90dvh] overflow-y-auto overscroll-contain pb-safe gpu-layer"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700 sm:hidden" aria-hidden="true" />

        <div className="flex items-center justify-between">
          <h2
            id="edit-player-title"
            className="font-display text-2xl font-extrabold text-white uppercase"
          >
            Editar Jogador
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <PhotoPickerField
            photo={playerPhoto}
            playerName={playerName}
            onChange={setPlayerPhoto}
          />

          <div>
            <label htmlFor="ep-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nome
            </label>
            <input
              id="ep-name"
              type="text"
              required
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0B1222] px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PositionPicker value={position} onChange={setPosition} />

            <CountryFlagPicker value={nationality} onChange={setNationality} />
          </div>

          <div>
            <label htmlFor="ep-club" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Clube em {selectedSeason.year}
            </label>
            <input
              id="ep-club"
              type="text"
              required
              value={seasonClub}
              onChange={(e) => setSeasonClub(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0B1222] px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <StepperSlider
            id="ep-age"
            label={`Idade em ${selectedSeason.year}`}
            value={seasonAge}
            min={15}
            max={50}
            onChange={setSeasonAge}
          />

          <label className="flex items-center gap-3 min-h-[44px] rounded-xl border border-white/10 bg-[#0B1222] px-3.5 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={retired}
              onChange={(e) => setRetired(e.target.checked)}
              className="h-4 w-4 rounded accent-blue-600"
            />
            <span className="text-sm text-slate-200">Jogador aposentado</span>
          </label>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-slate-300 hover:bg-white/[0.09]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500"
            >
              Salvar Alterações
            </button>
          </div>

          <div className="pt-3 border-t border-white/[0.08]">
            {confirmDelete ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onDeletePlayer}
                  className="min-h-[44px] rounded-xl bg-rose-600 px-3 text-xs font-bold text-white hover:bg-rose-500"
                >
                  Confirmar Exclusão
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="min-h-[44px] rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-300 hover:bg-white/[0.08]"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Apagar Jogador
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   4. EXIT APP CONFIRMATION MODAL (MOBILE BACK BUTTON)
   ========================================================= */
interface ExitAppModalProps {
  onCancel: () => void;
  onConfirmExit: () => void;
}

export function ExitAppModal({ onCancel, onConfirmExit }: ExitAppModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="exit-app-title"
      aria-describedby="exit-app-message"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#11192D] p-5 sm:p-6 shadow-2xl pb-safe gpu-layer"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700 sm:hidden" aria-hidden="true" />

        <div className="flex flex-col items-center text-center">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-400"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </div>

          <h2
            id="exit-app-title"
            className="mt-3.5 font-display text-2xl font-extrabold text-white uppercase tracking-wide"
          >
            Fechar Aplicativo
          </h2>

          <p id="exit-app-message" className="mt-2 text-sm text-slate-300 leading-relaxed">
            Caso não tiver mais abas para voltar, deseja fechar o app?
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            autoFocus
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            className="min-h-[46px] rounded-xl border border-white/10 bg-white/[0.05] px-4 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.1]"
          >
            Continuar no app
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onConfirmExit}
            className="min-h-[46px] rounded-xl bg-rose-600 px-4 text-xs font-bold text-white transition-colors hover:bg-rose-500"
          >
            Fechar app
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
