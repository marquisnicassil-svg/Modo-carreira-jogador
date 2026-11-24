import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ChevronRight,
  Download,
  FolderKanban,
  Play,
  Plus,
  Trophy,
  Upload,
} from 'lucide-react';
import { CareerProfile } from '../types/career';
import { getClubAccent, getClubMonogram } from '../utils/careerEngine';
import { exportCareerJson, parseImportedCareers } from '../utils/storage';

export type HomeScreenMode = 'menu' | 'players' | 'backup';

interface HomeDashboardProps {
  careers: CareerProfile[];
  mode?: HomeScreenMode;
  onModeChange?: (mode: HomeScreenMode) => void;
  onContinueCareer: (id: string) => void;
  onOpenNewCareer: () => void;
  onImportCareers: (imported: CareerProfile[]) => void;
}

export function HomeDashboard({
  careers,
  mode: controlledMode,
  onModeChange,
  onContinueCareer,
  onOpenNewCareer,
  onImportCareers,
}: HomeDashboardProps) {
  const [internalMode, setInternalMode] = useState<HomeScreenMode>('menu');
  const mode = controlledMode ?? internalMode;
  const setMode = (next: HomeScreenMode) => {
    if (onModeChange) {
      onModeChange(next);
    } else {
      setInternalMode(next);
    }
  };
  const [backupFeedback, setBackupFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const parsed = parseImportedCareers(text);
      if (!parsed) {
        setBackupFeedback('Arquivo JSON inválido ou incompatível.');
      } else {
        onImportCareers(parsed);
        setBackupFeedback(`${parsed.length} carreira(s) importada(s) com sucesso.`);
      }
      setTimeout(() => setBackupFeedback(null), 3500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <AnimatePresence mode="wait">
      {mode === 'players' && careers.length > 0 ? (
        <motion.section
          key="home-players"
          aria-labelledby="home-players-heading"
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.985 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-5 sm:p-8 max-w-xl mx-auto mt-4"
        >
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('menu')}
              aria-label="Voltar para o menu inicial"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.09]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar
            </motion.button>
            <div>
              <h1
                id="home-players-heading"
                className="font-display text-xl sm:text-2xl font-extrabold text-white uppercase leading-tight"
              >
                Escolher Jogador
              </h1>
              <p className="text-xs text-slate-400">
                Toque em um jogador para abrir sua carreira
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5" aria-label="Lista de carreiras salvas">
            {careers.map((career, idx) => {
              const accent = getClubAccent(career.currentClub);
              const monogram = getClubMonogram(career.currentClub);

              return (
                <li key={career.id}>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(idx * 0.03, 0.15),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onContinueCareer(career.id)}
                    aria-label={`Carregar carreira de ${career.playerName}, clube atual ${career.currentClub}, overall ${career.currentOverall}`}
                    className="w-full min-h-[64px] flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0B1222] px-4 py-3 text-left transition-colors hover:border-blue-500/45 hover:bg-[#141F38]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {career.playerPhoto ? (
                        <div
                          aria-hidden="true"
                          className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 bg-[#11192D]"
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

                      <div className="min-w-0">
                        <span className="block font-display text-xl font-bold text-white uppercase truncate">
                          {career.playerName}
                        </span>
                        <span className="block text-xs text-slate-400 truncate">
                          {career.currentClub} · OVR {career.currentOverall}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" aria-hidden="true" />
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </motion.section>
      ) : mode === 'backup' ? (
        <motion.section
          key="home-backup"
          aria-labelledby="home-backup-heading"
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.985 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-5 sm:p-8 max-w-xl mx-auto mt-4"
        >
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('menu')}
              aria-label="Voltar para o menu inicial"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.09]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar
            </motion.button>
            <div>
              <h1
                id="home-backup-heading"
                className="font-display text-xl sm:text-2xl font-extrabold text-white uppercase leading-tight"
              >
                Backup JSON
              </h1>
              <p className="text-xs text-slate-400">
                Exporte ou importe seu arquivo de backup
              </p>
            </div>
          </div>

          {backupFeedback && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-xs sm:text-sm text-blue-200"
            >
              {backupFeedback}
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            {careers.length > 0 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  exportCareerJson(careers);
                  setBackupFeedback('Backup exportado em JSON.');
                  setTimeout(() => setBackupFeedback(null), 3000);
                }}
                className="flex-1 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Exportar Backup
              </motion.button>
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                careers.length === 0
                  ? 'bg-blue-600 font-bold text-white hover:bg-blue-500'
                  : 'border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.12]'
              }`}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Importar JSON
            </motion.button>

            <input
              ref={fileInputRef}
              type="file"
              aria-label="Selecionar arquivo JSON de backup para importar"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </motion.section>
      ) : (
        <motion.section
          key="home-menu"
          aria-labelledby="home-menu-heading"
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.985 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-8 sm:p-12 text-center max-w-2xl mx-auto mt-4"
        >
          <div
            aria-hidden="true"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400"
          >
            <Trophy className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1
            id="home-menu-heading"
            className="mt-4 font-display text-2xl sm:text-3xl font-extrabold text-white uppercase text-balance"
          >
            {careers.length === 0 ? 'Comece um novo Modo Carreira' : 'Modo Carreira'}
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            {careers.length === 0
              ? 'Registre gols, assistências, média, evolução de overall, títulos e acompanhe a história completa do seu jogador temporada por temporada.'
              : 'Crie uma nova carreira ou continue com um jogador já salvo.'}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onOpenNewCareer}
              className="w-full sm:w-auto inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {careers.length === 0 ? 'Criar Primeira Carreira' : 'Criar Carreira'}
            </motion.button>

            {careers.length > 0 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode('players')}
                className="w-full sm:w-auto inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12]"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Continuar
              </motion.button>
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode('backup')}
              className="w-full sm:w-auto inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.09]"
            >
              <FolderKanban className="h-4 w-4" aria-hidden="true" />
              Backup JSON
            </motion.button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
