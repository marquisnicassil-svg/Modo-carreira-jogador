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
  Shuffle,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import {
  CareerProfile,
  PLAYER_POSITIONS,
  POPULAR_CLUBS,
  PositionSector,
  SeasonRecord,
} from '../types/career';
import {
  COUNTRY_REGIONS,
  CountryRegion,
  FOOTBALL_COUNTRIES,
} from '../utils/countries';
import {
  formatRating,
  getClubAccent,
  getClubMonogram,
  getUnlockedSeasonAchievements,
} from '../utils/careerEngine';
import { processPlayerPhotoFile } from '../utils/imageHelper';
import { CountryFlag } from './CountryFlag';

const SECTOR_META: Record<
  PositionSector,
  { label: string; badgeBg: string; text: string; activeBorder: string }
> = {
  ataque: {
    label: 'Ataque',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
    text: 'text-emerald-300',
    activeBorder: 'border-emerald-500/60 bg-emerald-500/15',
  },
  meio: {
    label: 'Meio-Campo',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/35',
    text: 'text-sky-300',
    activeBorder: 'border-sky-500/60 bg-sky-500/15',
  },
  defesa: {
    label: 'Defesa',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
    text: 'text-amber-300',
    activeBorder: 'border-amber-500/60 bg-amber-500/15',
  },
  gol: {
    label: 'Goleiro',
    badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/35',
    text: 'text-violet-300',
    activeBorder: 'border-violet-500/60 bg-violet-500/15',
  },
};

const SECTOR_ORDER: PositionSector[] = ['ataque', 'meio', 'defesa', 'gol'];

function PositionPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (pos: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [sectorFilter, setSectorFilter] = useState<'all' | PositionSector>('all');

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => {
      window.removeEventListener('keydown', handleKey, true);
    };
  }, [open]);

  const current = PLAYER_POSITIONS.find((p) => p.code === value);
  const currentSector = current ? SECTOR_META[current.sector] : SECTOR_META.ataque;
  const visibleSectors =
    sectorFilter === 'all' ? SECTOR_ORDER : SECTOR_ORDER.filter((s) => s === sectorFilter);

  return (
    <div>
      <span id="position-picker-label" className="block text-xs font-semibold text-slate-300 mb-1.5">
        Posição
      </span>

      <button
        type="button"
        onClick={() => {
          setSectorFilter('all');
          setOpen(true);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-labelledby="position-picker-label"
        aria-label={`Posição selecionada: ${value}${current ? `, ${current.label}` : ''}. Toque para alterar`}
        className="w-full min-h-[44px] flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#0B1222] px-3 py-2 text-left text-sm text-white transition-colors hover:border-white/25 focus:border-blue-500 focus:outline-none"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 font-mono-num text-[11px] font-bold shrink-0 ${currentSector.badgeBg}`}
          >
            {value}
          </span>
          {current && <span className="truncate text-xs text-slate-300">{current.label}</span>}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="position-sheet-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-white/15 bg-[#11192D] p-5 shadow-2xl max-h-[85dvh] flex flex-col pb-safe gpu-layer"
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700 sm:hidden" aria-hidden="true" />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3
                    id="position-sheet-title"
                    className="font-display text-xl font-extrabold text-white uppercase"
                  >
                    Escolher Posição
                  </h3>
                  <p className="text-xs text-slate-400">
                    Organizadas por setor em campo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar seleção de posição"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Tactical Sector Tabs */}
              <div
                role="group"
                aria-label="Filtrar posições por setor"
                className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1"
              >
                <button
                  type="button"
                  onClick={() => setSectorFilter('all')}
                  aria-pressed={sectorFilter === 'all'}
                  className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    sectorFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'border border-white/10 bg-[#0B1222] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  Todas (15)
                </button>
                {SECTOR_ORDER.map((sec) => {
                  const active = sectorFilter === sec;
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSectorFilter(sec)}
                      aria-pressed={active}
                      className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'border border-white/10 bg-[#0B1222] text-slate-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      {SECTOR_META[sec].label}
                    </button>
                  );
                })}
              </div>

              {/* Grouped Position Grid */}
              <div className="mt-3 flex-1 overflow-y-auto overscroll-contain space-y-4 pr-0.5">
                {visibleSectors.map((sec) => {
                  const meta = SECTOR_META[sec];
                  const items = PLAYER_POSITIONS.filter((p) => p.sector === sec);
                  return (
                    <div key={sec}>
                      <div className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${meta.text}`}>
                        {meta.label}
                      </div>
                      <div className="grid grid-cols-2 gap-2" role="listbox" aria-label={`Posições de ${meta.label}`}>
                        {items.map((pos) => {
                          const selected = pos.code === value;
                          return (
                            <button
                              key={pos.code}
                              type="button"
                              role="option"
                              aria-selected={selected}
                              onClick={() => {
                                onChange(pos.code);
                                setOpen(false);
                              }}
                              className={`min-h-[48px] flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                                selected
                                  ? `${meta.activeBorder} text-white`
                                  : 'border-white/10 bg-[#0B1222] text-slate-200 hover:border-white/25 hover:bg-[#141F38]'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 font-mono-num text-xs font-bold shrink-0 ${meta.badgeBg}`}
                                >
                                  {pos.code}
                                </span>
                                <span className="text-xs font-medium truncate">{pos.label}</span>
                              </div>
                              {selected && (
                                <Check className="h-4 w-4 text-white shrink-0" aria-hidden="true" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   REUSABLE COUNTRY FLAG PICKER SHEET (REGIONS + SEARCH)
   ========================================================= */
interface CountryFlagPickerProps {
  value: string;
  onChange: (country: string) => void;
}

function CountryFlagPicker({ value, onChange }: CountryFlagPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | CountryRegion>('all');

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => {
      window.removeEventListener('keydown', handleKey, true);
    };
  }, [open]);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOOTBALL_COUNTRIES.filter((c) => {
      const matchesRegion = regionFilter === 'all' || c.region === regionFilter;
      if (!matchesRegion) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
      );
    });
  }, [query, regionFilter]);

  const exactMatchExists = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return FOOTBALL_COUNTRIES.some((c) => c.name.toLowerCase() === q);
  }, [query]);

  return (
    <div>
      <span id="country-picker-label" className="block text-xs font-semibold text-slate-300 mb-1.5">
        Nacionalidade
      </span>

      <button
        type="button"
        onClick={() => {
          setQuery('');
          setRegionFilter('all');
          setOpen(true);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-labelledby="country-picker-label"
        aria-label={`Nacionalidade selecionada: ${value}. Toque para alterar`}
        className="w-full min-h-[44px] flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#0B1222] px-3 py-2 text-left text-sm text-white transition-colors hover:border-white/25 focus:border-blue-500 focus:outline-none"
      >
        <span className="flex items-center gap-2 min-w-0">
          <CountryFlag country={value} size="sm" />
          <span className="truncate text-xs sm:text-sm font-medium">{value}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="country-sheet-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-white/15 bg-[#11192D] p-5 shadow-2xl max-h-[86dvh] flex flex-col pb-safe gpu-layer"
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700 sm:hidden" aria-hidden="true" />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3
                    id="country-sheet-title"
                    className="font-display text-xl font-extrabold text-white uppercase"
                  >
                    Selecionar País
                  </h3>
                  <p className="text-xs text-slate-400">
                    Busque por nome ou filtre por continente
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar seleção de país"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mt-3">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Buscar país"
                  placeholder="Buscar país (ex: Brasil, França, Japão...)"
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0B1222] pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Region Filter Tabs */}
              <div
                role="group"
                aria-label="Filtrar países por região"
                className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1"
              >
                <button
                  type="button"
                  onClick={() => setRegionFilter('all')}
                  aria-pressed={regionFilter === 'all'}
                  className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    regionFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'border border-white/10 bg-[#0B1222] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  Todos ({FOOTBALL_COUNTRIES.length})
                </button>
                {COUNTRY_REGIONS.map((region) => {
                  const active = regionFilter === region;
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setRegionFilter(region)}
                      aria-pressed={active}
                      className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'border border-white/10 bg-[#0B1222] text-slate-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      {region}
                    </button>
                  );
                })}
              </div>

              {/* Countries Grid */}
              <div
                role="listbox"
                aria-label="Lista de países"
                className="mt-3 flex-1 overflow-y-auto overscroll-contain grid grid-cols-1 sm:grid-cols-2 gap-2 pr-0.5 content-start"
              >
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
                      className={`min-h-[48px] flex items-center justify-between gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors ${
                        selected
                          ? 'border-blue-500/60 bg-blue-600/20 text-white'
                          : 'border-white/10 bg-[#0B1222] text-slate-200 hover:border-white/25 hover:bg-[#141F38]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CountryFlag country={country.name} size="md" />
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold truncate">
                            {country.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {country.region}
                          </div>
                        </div>
                      </div>
                      {selected && (
                        <Check className="h-4 w-4 text-blue-300 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              {query.trim() && !exactMatchExists && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(query.trim());
                    setOpen(false);
                  }}
                  className="mt-3 w-full min-h-[44px] rounded-xl bg-blue-600/20 border border-blue-500/40 px-3 text-xs font-bold text-blue-200 hover:bg-blue-600/30"
                >
                  Usar país personalizado: &ldquo;{query.trim()}&rdquo;
                </button>
              )}
            </motion.div>
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

        {((season.yellowCards || 0) > 0 || (season.redCards || 0) > 0) && (
          <div className="mt-2.5 flex items-center justify-center gap-4 text-xs text-slate-300 tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-3 w-2 rounded-[2px] bg-amber-400" />
              {season.yellowCards || 0}{' '}
              {(season.yellowCards || 0) === 1 ? 'cartão amarelo' : 'cartões amarelos'}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-3 w-2 rounded-[2px] bg-rose-500" />
              {season.redCards || 0}{' '}
              {(season.redCards || 0) === 1 ? 'cartão vermelho' : 'cartões vermelhos'}
            </span>
          </div>
        )}

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
   2. NEW CAREER MODAL (Live Preview + Pre-filled Data + Archetypes)
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

const STARTER_PROFILES = [
  { playerName: 'Rafael Silva', position: 'ATA', nationality: 'Brasil', club: 'Palmeiras', age: 18, overall: 76 },
  { playerName: 'Mateo Navarro', position: 'MEI', nationality: 'Argentina', club: 'Real Madrid', age: 19, overall: 79 },
  { playerName: 'Lucas Martins', position: 'PD', nationality: 'Brasil', club: 'Flamengo', age: 17, overall: 74 },
  { playerName: 'João Mendes', position: 'MC', nationality: 'Portugal', club: 'Milan', age: 20, overall: 80 },
  { playerName: 'Hugo Moreau', position: 'PE', nationality: 'França', club: 'PSG', age: 19, overall: 78 },
  { playerName: 'Liam Walker', position: 'VOL', nationality: 'Inglaterra', club: 'Arsenal', age: 21, overall: 81 },
  { playerName: 'Marco Bellini', position: 'ZAG', nationality: 'Itália', club: 'Inter de Milão', age: 20, overall: 79 },
  { playerName: 'Carlos Rivera', position: 'SA', nationality: 'Espanha', club: 'Barcelona', age: 18, overall: 77 },
];

const CAREER_ARCHETYPES = [
  { id: 'promessa', label: 'Promessa', subtitle: '17 anos · OVR 72', age: 17, overall: 72 },
  { id: 'titular', label: 'Titular', subtitle: '20 anos · OVR 80', age: 20, overall: 80 },
  { id: 'craque', label: 'Craque', subtitle: '25 anos · OVR 87', age: 25, overall: 87 },
];

const QUICK_STARTER_CLUBS = POPULAR_CLUBS.slice(0, 8);

export function NewCareerModal({ onClose, onCreate }: NewCareerModalProps) {
  const [playerName, setPlayerName] = useState(STARTER_PROFILES[0].playerName);
  const [playerPhoto, setPlayerPhoto] = useState<string | undefined>(undefined);
  const [position, setPosition] = useState(STARTER_PROFILES[0].position);
  const [nationality, setNationality] = useState(STARTER_PROFILES[0].nationality);
  const [club, setClub] = useState(STARTER_PROFILES[0].club);
  const [year, setYear] = useState(2026);
  const [age, setAge] = useState(STARTER_PROFILES[0].age);
  const [overall, setOverall] = useState(STARTER_PROFILES[0].overall);
  const [presetIndex, setPresetIndex] = useState(0);

  const previewAccent = getClubAccent(club || 'Clube');
  const previewMonogram = getClubMonogram(club || 'CLB');

  const handleRandomize = () => {
    const nextIdx = (presetIndex + 1 + Math.floor(Math.random() * (STARTER_PROFILES.length - 1))) % STARTER_PROFILES.length;
    const picked = STARTER_PROFILES[nextIdx];
    setPresetIndex(nextIdx);
    setPlayerName(picked.playerName);
    setPosition(picked.position);
    setNationality(picked.nationality);
    setClub(picked.club);
    setAge(picked.age);
    setOverall(picked.overall);
    setYear(2026);
  };

  const handleClearTextFields = () => {
    setPlayerName('');
    setClub('');
    setPlayerPhoto(undefined);
  };

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
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#11192D] p-5 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto overscroll-contain pb-safe gpu-layer"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700 sm:hidden" aria-hidden="true" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="new-career-title"
              className="font-display text-2xl font-extrabold text-white uppercase leading-none"
            >
              Criar Carreira
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Personalize ou inicie direto com os dados já preenchidos
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de criar carreira"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white shrink-0"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Live Player Card Preview */}
        <div
          aria-label={`Prévia do jogador: ${playerName || 'Novo Jogador'}, ${position}, ${club || 'Sem clube'}, Overall ${overall}`}
          style={{ borderTopColor: previewAccent.ring }}
          className="mt-4 rounded-2xl border border-white/[0.08] border-t-2 bg-[#0B1222] p-3.5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {playerPhoto ? (
                <div
                  aria-hidden="true"
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 bg-[#11192D]"
                  style={{ borderColor: previewAccent.ring }}
                >
                  <img
                    src={playerPhoto}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 font-display text-base font-extrabold"
                  style={{
                    backgroundColor: previewAccent.bg,
                    borderColor: previewAccent.ring,
                    color: previewAccent.text,
                  }}
                >
                  {previewMonogram}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-extrabold text-white uppercase truncate">
                    {playerName.trim() || 'Nome do Jogador'}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200 truncate">
                    {club.trim() || 'Clube Inicial'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{position}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <CountryFlag country={nationality} size="sm" />
                    <span>{nationality}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{age}a</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{year}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 pl-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                OVR
              </div>
              <div className="font-display text-3xl font-extrabold leading-none text-amber-400 tabular-nums">
                {overall}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={handleRandomize}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/15 px-3 text-xs font-semibold text-blue-200 transition-colors hover:bg-blue-600/25"
            >
              <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
              Sortear Jogador
            </motion.button>

            <button
              type="button"
              onClick={handleClearTextFields}
              className="min-h-[36px] rounded-lg px-2.5 text-xs font-medium text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
            >
              Limpar nome e clube
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Bloco 1: Identidade */}
          <div className="space-y-3">
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
                placeholder="Ex: Rafael Silva..."
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0B1222] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <PositionPicker value={position} onChange={setPosition} />

              <CountryFlagPicker value={nationality} onChange={setNationality} />
            </div>
          </div>

          {/* Bloco 2: Clube & Estreia */}
          <div className="space-y-3 pt-2 border-t border-white/[0.08]">
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
              <div
                className="mt-2 flex flex-wrap gap-1.5"
                role="group"
                aria-label="Sugestões de clubes iniciais"
              >
                {QUICK_STARTER_CLUBS.map((item) => {
                  const selected = club.trim().toLowerCase() === item.toLowerCase();
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setClub(item)}
                      className={`min-h-[32px] rounded-lg px-2.5 text-xs font-medium transition-colors ${
                        selected
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'border border-white/10 bg-[#0B1222] text-slate-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modelos de Início */}
            <div>
              <span className="block text-xs font-semibold text-slate-300 mb-1.5">
                Perfil de Início Rápido
              </span>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Perfil de início rápido">
                {CAREER_ARCHETYPES.map((arch) => {
                  const active = age === arch.age && overall === arch.overall;
                  return (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => {
                        setAge(arch.age);
                        setOverall(arch.overall);
                      }}
                      aria-pressed={active}
                      className={`min-h-[48px] rounded-xl border px-2 py-2 text-center transition-colors ${
                        active
                          ? 'border-blue-500/60 bg-blue-600/20 text-white'
                          : 'border-white/10 bg-[#0B1222] text-slate-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="text-xs font-bold">{arch.label}</div>
                      <div className="text-[10px] text-slate-400 tabular-nums mt-0.5">
                        {arch.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stepper + Slider Bars */}
            <div className="space-y-2.5">
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
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-slate-300 hover:bg-white/[0.09]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!playerName.trim() || !club.trim()}
              className="min-h-[48px] rounded-xl bg-blue-600 text-xs font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
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
