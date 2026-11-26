import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Edit3, Flag, Trash2 } from 'lucide-react';
import { BannerStyle, CareerProfile, SeasonRecord } from '../types/career';
import { getClubAccent, getClubMonogram } from '../utils/careerEngine';
import { CountryFlag } from './CountryFlag';

interface PlayerBannerProps {
  career: CareerProfile;
  selectedSeason: SeasonRecord;
  primeSeasonId: string | null;
  bannerStyle?: BannerStyle;
  showPrimeBadge?: boolean;
  onSelectSeasonYear: (year: number) => void;
  onOpenEditPlayer: () => void;
  onDeleteActivePlayer: () => void;
}

export function PlayerBanner({
  career,
  selectedSeason,
  primeSeasonId,
  bannerStyle = 'full',
  showPrimeBadge = true,
  onSelectSeasonYear,
  onOpenEditPlayer,
  onDeleteActivePlayer,
}: PlayerBannerProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    setPhotoError(false);
  }, [career.playerPhoto, career.id]);

  const accent = getClubAccent(selectedSeason.club);
  const monogram = getClubMonogram(selectedSeason.club);
  const orderedSeasons = [...career.seasons].sort((a, b) => a.year - b.year);
  const hasPhoto = Boolean(career.playerPhoto) && !photoError;
  const isCompact = bannerStyle === 'compact';

  return (
    <motion.section
      aria-label={`Resumo do jogador ${career.playerName}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      style={{ borderTopColor: accent.ring }}
      className={`rounded-2xl border border-white/[0.08] border-t-2 bg-[#11192D] ${
        isCompact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'
      }`}
    >
      <div
        className={
          isCompact
            ? 'flex items-center justify-between gap-3'
            : 'flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'
        }
      >
        {/* Left: Player Photo or Club Crest + Player Identity */}
        <div className={`flex items-center min-w-0 flex-1 ${isCompact ? 'gap-3' : 'gap-4'}`}>
          {hasPhoto ? (
            <div
              className={`shrink-0 overflow-hidden border-2 bg-[#0B1222] ${
                isCompact
                  ? 'h-10 w-10 sm:h-11 sm:w-11 rounded-xl'
                  : 'h-14 w-14 sm:h-16 sm:w-16 rounded-2xl'
              }`}
              style={{ borderColor: accent.ring }}
            >
              <img
                src={career.playerPhoto}
                alt={`Foto de ${career.playerName}`}
                referrerPolicy="no-referrer"
                onError={() => setPhotoError(true)}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              aria-hidden="true"
              className={`flex shrink-0 items-center justify-center border-2 font-display font-extrabold tracking-wider shadow-inner ${
                isCompact
                  ? 'h-10 w-10 sm:h-11 sm:w-11 rounded-xl text-sm sm:text-base'
                  : 'h-14 w-14 sm:h-16 sm:w-16 rounded-2xl text-lg sm:text-xl'
              }`}
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className={`font-display font-extrabold tracking-tight text-white uppercase truncate ${
                  isCompact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'
                }`}
              >
                {career.playerName}
              </h1>
              {career.retired && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                  <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                  Aposentado
                </span>
              )}
            </div>

            {/* Clean unboxed metadata with typographic separators */}
            <p
              className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-400 ${
                isCompact ? 'mt-0.5 text-[11px] sm:text-xs' : 'mt-1 text-xs sm:text-sm'
              }`}
            >
              <span className="font-semibold text-slate-200">
                <span className="sr-only">Clube: </span>
                {selectedSeason.club}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <span className="sr-only">Posição: </span>
                {career.position}
              </span>
              {!isCompact && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <CountryFlag country={career.nationality} size="sm" />
                    <span className="sr-only">Nacionalidade: </span>
                    {career.nationality}
                  </span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{selectedSeason.age} anos</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num font-bold text-blue-400">
                <span className="sr-only">Overall </span>
                <span aria-hidden="true">OVR </span>
                {selectedSeason.endOverall}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Actions & Active Year Display */}
        <div
          className={
            isCompact
              ? 'flex items-center gap-1.5 shrink-0'
              : 'flex flex-wrap items-center justify-between sm:justify-end gap-2.5 border-t border-white/[0.06] pt-3 lg:border-t-0 lg:pt-0'
          }
        >
          {!isCompact && (
            <div className="text-left lg:text-right mr-1">
              <div className="text-[11px] font-medium text-slate-400">
                {selectedSeason.year === career.currentYear && !career.retired
                  ? 'Temporada Atual'
                  : 'Temporada Selecionada'}
              </div>
              <div className="font-display text-2xl font-extrabold text-white tabular-nums leading-none mt-0.5">
                {selectedSeason.year}
              </div>
            </div>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onOpenEditPlayer}
            aria-label={`Editar perfil de ${career.playerName}`}
            title="Editar jogador"
            className={`inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-slate-200 transition-colors duration-150 hover:bg-white/[0.09] hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isCompact ? 'min-h-[40px] px-2.5' : 'min-h-[44px] px-3.5 py-2'
            }`}
          >
            <Edit3 className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span className={isCompact ? 'hidden sm:inline' : ''}>Editar</span>
          </motion.button>

          {confirmingDelete ? (
            <div className="flex items-center gap-1.5" role="group" aria-label="Confirmar exclusão do jogador">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setConfirmingDelete(false);
                  onDeleteActivePlayer();
                }}
                aria-label={`Confirmar exclusão de ${career.playerName}`}
                className={`rounded-xl bg-rose-600 px-3 text-xs font-bold text-white transition-colors hover:bg-rose-500 whitespace-nowrap ${
                  isCompact ? 'min-h-[40px]' : 'min-h-[44px] px-3.5 py-2'
                }`}
              >
                {isCompact ? 'Confirmar' : 'Apagar Jogador'}
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setConfirmingDelete(false)}
                className={`rounded-xl border border-white/10 bg-white/[0.04] px-2.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] whitespace-nowrap ${
                  isCompact ? 'min-h-[40px]' : 'min-h-[44px] px-3 py-2'
                }`}
              >
                Cancelar
              </motion.button>
            </div>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Apagar jogador ${career.playerName}`}
              title="Apagar jogador"
              className={`inline-flex items-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 text-xs font-semibold text-rose-300 transition-colors duration-150 hover:bg-rose-500/20 hover:text-rose-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                isCompact ? 'min-h-[40px] px-2.5' : 'min-h-[44px] px-3 py-2'
              }`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span className={isCompact ? 'hidden sm:inline' : ''}>Apagar</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Horizontal Season Year Scroller */}
      <div
        role="group"
        aria-label="Selecionar temporada"
        className={`rounded-xl border border-white/[0.06] bg-[#0B1222] flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
          isCompact ? 'mt-2.5 p-1' : 'mt-4 p-1.5'
        }`}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 shrink-0 px-2" aria-hidden="true">
          Épocas
        </span>
        {orderedSeasons.map((season) => {
          const isSelected = season.id === selectedSeason.id;
          const isPrime =
            showPrimeBadge && season.id === primeSeasonId && orderedSeasons.length > 1;
          return (
            <motion.button
              key={season.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectSeasonYear(season.year)}
              aria-pressed={isSelected}
              aria-label={`Temporada ${season.year}, clube ${season.club}${isPrime ? ', temporada prime' : ''}${isSelected ? ', selecionada' : ''}`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 text-xs font-semibold tabular-nums whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isCompact ? 'min-h-[34px] py-1' : 'min-h-[38px] py-1.5'
              } ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <span>{season.year}</span>
              <span className={isSelected ? 'text-blue-200' : 'text-slate-500'}>
                {season.club}
              </span>
              {isPrime && (
                <span
                  aria-hidden="true"
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-amber-200' : 'text-amber-400'
                  }`}
                >
                  ★
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
