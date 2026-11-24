import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  CopyPlus,
  Download,
  FolderKanban,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { CareerProfile } from '../types/career';
import { computeCareerSummary, getClubAccent, getClubMonogram } from '../utils/careerEngine';
import { exportCareerJson, parseImportedCareers } from '../utils/storage';

interface SavesViewProps {
  careers: CareerProfile[];
  activeCareerId: string | null;
  onSelectCareer: (id: string) => void;
  onOpenNewCareer: () => void;
  onDuplicateCareer: (career: CareerProfile) => void;
  onDeleteCareer: (id: string) => void;
  onClearAllCareers: () => void;
  onImportCareers: (imported: CareerProfile[]) => void;
}

export function SavesView({
  careers,
  activeCareerId,
  onSelectCareer,
  onOpenNewCareer,
  onDuplicateCareer,
  onDeleteCareer,
  onClearAllCareers,
  onImportCareers,
}: SavesViewProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const parsed = parseImportedCareers(text);
      if (!parsed) {
        setImportFeedback('Arquivo JSON inválido ou incompatível.');
      } else {
        onImportCareers(parsed);
        setImportFeedback(`${parsed.length} carreira(s) importada(s) com sucesso.`);
      }
      setTimeout(() => setImportFeedback(null), 3500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header & Backup Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-blue-400" aria-hidden="true" />
            <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-wide text-white uppercase">
              Carreiras Salvas
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Dados salvos localmente no navegador. Exporte um backup em JSON para levar para outro dispositivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {careers.length > 0 && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => exportCareerJson(careers)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.09] whitespace-nowrap"
            >
              <Download className="h-4 w-4 text-slate-300" aria-hidden="true" />
              Exportar Backup
            </motion.button>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.09] whitespace-nowrap"
          >
            <Upload className="h-4 w-4 text-slate-300" aria-hidden="true" />
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

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onOpenNewCareer}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-500 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Criar Jogador
          </motion.button>

          {careers.length > 0 &&
            (confirmClearAll ? (
              <div className="flex items-center gap-1.5" role="group" aria-label="Confirmar limpeza total">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    onClearAllCareers();
                    setConfirmClearAll(false);
                  }}
                  className="min-h-[44px] rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-500 whitespace-nowrap"
                >
                  Confirmar Limpeza
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setConfirmClearAll(false)}
                  className="min-h-[44px] rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-300 hover:bg-white/10 whitespace-nowrap"
                >
                  Cancelar
                </motion.button>
              </div>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setConfirmClearAll(true)}
                aria-label="Apagar todas as carreiras salvas"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Limpar Tudo
              </motion.button>
            ))}
        </div>
      </div>

      {importFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200"
        >
          {importFeedback}
        </div>
      )}

      {/* Saved Careers Grid or Empty State */}
      {careers.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-8 text-center">
          <h3 className="font-display text-xl font-bold text-white uppercase">
            Nenhuma carreira salva
          </h3>
          <p className="mt-1.5 text-sm text-slate-400">
            Crie seu primeiro jogador ou importe um arquivo de backup em JSON.
          </p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onOpenNewCareer}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Iniciar Primeira Carreira
          </motion.button>
        </div>
      ) : (
        <div
          role="list"
          aria-label="Lista de carreiras salvas"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <AnimatePresence initial={false}>
            {careers.map((career, idx) => {
              const isActive = career.id === activeCareerId;
              const summary = computeCareerSummary(career);
              const accent = getClubAccent(career.currentClub);
              const monogram = getClubMonogram(career.currentClub);
              const isConfirmingDelete = confirmDeleteId === career.id;

              return (
                <motion.article
                  key={career.id}
                  role="listitem"
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.22,
                    delay: Math.min(idx * 0.03, 0.18),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  aria-label={`Carreira de ${career.playerName}, ${career.currentClub}, ${career.position}, ${career.currentAge} anos, temporada ${career.currentYear}, overall ${career.currentOverall}${isActive ? ', carreira ativa' : ''}`}
                  className={`rounded-2xl border p-4 sm:p-5 transition-colors ${
                    isActive
                      ? 'border-blue-500/50 bg-[#141F38]'
                      : 'border-white/[0.08] bg-[#11192D]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {career.playerPhoto ? (
                        <div
                          aria-hidden="true"
                          className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 bg-[#0B1222]"
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
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 font-display text-base font-extrabold"
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
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-xl font-bold text-white uppercase truncate">
                            {career.playerName}
                          </h3>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400">
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {career.currentClub} · {career.position} · {career.currentAge} anos ·{' '}
                          {career.currentYear}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono-num text-sm font-bold text-amber-400 shrink-0">
                      <span className="sr-only">Overall </span>
                      <span aria-hidden="true">OVR </span>
                      {career.currentOverall}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2 border-y border-white/[0.06] py-3 text-center">
                    <div>
                      <div className="text-[11px] text-slate-400">
                        <span className="sr-only">Temporadas</span>
                        <span aria-hidden="true">Temps</span>
                      </div>
                      <div className="font-mono-num text-sm font-bold text-white">
                        {summary.totalSeasons}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Gols</div>
                      <div className="font-mono-num text-sm font-bold text-emerald-400">
                        {summary.totalGoals}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">
                        <span className="sr-only">Assistências</span>
                        <span aria-hidden="true">Assist.</span>
                      </div>
                      <div className="font-mono-num text-sm font-bold text-sky-400">
                        {summary.totalAssists}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Títulos</div>
                      <div className="font-mono-num text-sm font-bold text-amber-400">
                        {summary.totalTrophies}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    {!isActive ? (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onSelectCareer(career.id)}
                        aria-label={`Carregar carreira de ${career.playerName}`}
                        className="min-h-[44px] rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-500"
                      >
                        Carregar Carreira
                      </motion.button>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 py-2">
                        Em exibição no painel
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        onClick={() => onDuplicateCareer(career)}
                        aria-label={`Duplicar carreira de ${career.playerName}`}
                        title="Duplicar save"
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <CopyPlus className="h-4 w-4" aria-hidden="true" />
                      </motion.button>

                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1" role="group" aria-label={`Confirmar exclusão de ${career.playerName}`}>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              onDeleteCareer(career.id);
                              setConfirmDeleteId(null);
                            }}
                            aria-label={`Confirmar exclusão da carreira de ${career.playerName}`}
                            className="min-h-[40px] rounded-lg bg-rose-600 px-3 text-xs font-bold text-white hover:bg-rose-500"
                          >
                            Confirmar
                          </motion.button>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setConfirmDeleteId(null)}
                            className="min-h-[40px] rounded-lg bg-white/10 px-2.5 text-xs text-slate-300 hover:bg-white/15"
                          >
                            Cancelar
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setConfirmDeleteId(career.id)}
                          aria-label={`Excluir carreira de ${career.playerName}`}
                          title="Excluir carreira"
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-500/15 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
