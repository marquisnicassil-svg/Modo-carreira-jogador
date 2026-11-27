import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowLeftRight,
  ChevronRight,
  ClipboardPaste,
  Copy,
  Download,
  FolderKanban,
  LogIn,
  LogOut,
  Play,
  Plus,
  ShieldCheck,
  Trophy,
  Upload,
} from 'lucide-react';
import { CareerProfile } from '../types/career';
import { SynapseSession } from '../utils/synapseAuth';
import { getClubAccent, getClubMonogram } from '../utils/careerEngine';
import {
  buildCareerBackupJson,
  copyTextToClipboard,
  exportCareerJson,
  parseImportedCareers,
} from '../utils/storage';

export type HomeScreenMode = 'menu' | 'players' | 'backup';

interface HomeDashboardProps {
  careers: CareerProfile[];
  mode?: HomeScreenMode;
  onModeChange?: (mode: HomeScreenMode) => void;
  onContinueCareer: (id: string) => void;
  onOpenNewCareer: () => void;
  onCompareCareers?: () => void;
  onImportCareers: (imported: CareerProfile[]) => void;
  synapseSession?: SynapseSession | null;
  onOpenSynapseAuth?: () => void;
  onQuickSynapseSso?: () => void;
  onLogoutSynapse?: () => void;
}

export function HomeDashboard({
  careers,
  mode: controlledMode,
  onModeChange,
  onContinueCareer,
  onOpenNewCareer,
  onCompareCareers,
  onImportCareers,
  synapseSession = null,
  onOpenSynapseAuth,
  onQuickSynapseSso,
  onLogoutSynapse,
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
  const [menuFeedback, setMenuFeedback] = useState<string | null>(null);
  const [confirmExport, setConfirmExport] = useState(false);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (msg: string) => {
    setBackupFeedback(msg);
    window.setTimeout(() => setBackupFeedback((prev) => (prev === msg ? null : prev)), 3500);
  };

  const showMenuFeedback = (msg: string) => {
    setMenuFeedback(msg);
    window.setTimeout(() => setMenuFeedback((prev) => (prev === msg ? null : prev)), 3800);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const parsed = parseImportedCareers(text);
      if (!parsed) {
        showFeedback('Arquivo JSON inválido ou incompatível.');
      } else {
        onImportCareers(parsed);
        showFeedback(`${parsed.length} carreira(s) importada(s) com sucesso.`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = async () => {
    const status = await exportCareerJson(careers);
    if (status === 'shared') {
      showFeedback('Backup pronto para salvar ou compartilhar.');
    } else if (status === 'downloaded') {
      showFeedback('Backup exportado em JSON.');
    } else if (status === 'copied') {
      showFeedback('Download bloqueado no aparelho; backup JSON copiado para a área de transferência.');
    } else {
      showFeedback('Use "Copiar JSON" abaixo para salvar seu backup.');
    }
  };

  const handleCopyBackup = async () => {
    const ok = await copyTextToClipboard(buildCareerBackupJson(careers));
    showFeedback(
      ok
        ? 'Backup JSON copiado para a área de transferência.'
        : 'Não foi possível copiar automaticamente neste dispositivo.'
    );
  };

  const handlePasteImport = () => {
    const parsed = parseImportedCareers(pastedJson);
    if (!parsed) {
      showFeedback('Texto JSON inválido ou incompatível.');
      return;
    }
    onImportCareers(parsed);
    setPastedJson('');
    setShowPasteBox(false);
    showFeedback(`${parsed.length} carreira(s) importada(s) com sucesso.`);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {mode === 'players' && careers.length > 0 ? (
        <motion.section
          key="home-players"
          aria-labelledby="home-players-heading"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-5 sm:p-8 max-w-xl mx-auto mt-4"
        >
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setConfirmExport(false);
                setMode('menu');
              }}
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
            {careers.length > 0 && !confirmExport && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setConfirmExport(true)}
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
              Importar Arquivo
            </motion.button>

            <input
              ref={fileInputRef}
              type="file"
              aria-label="Selecionar arquivo JSON de backup para importar"
              accept=".json,application/json,text/plain,*/*"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>

          <AnimatePresence>
            {confirmExport && careers.length > 0 && (
              <motion.div
                role="group"
                aria-label="Confirmar exportação do backup"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 rounded-xl border border-blue-500/30 bg-blue-600/10 p-3.5 space-y-3"
              >
                <p className="text-xs sm:text-sm text-blue-100 font-medium">
                  Deseja confirmar e gerar o backup de {careers.length}{' '}
                  {careers.length === 1 ? 'carreira salva' : 'carreiras salvas'}?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setConfirmExport(false)}
                    className="min-h-[44px] rounded-xl border border-white/10 bg-white/[0.05] px-4 text-xs font-semibold text-slate-200 hover:bg-white/[0.1]"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setConfirmExport(false);
                      void handleExport();
                    }}
                    className="min-h-[44px] rounded-xl bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-500"
                  >
                    Confirmar Backup
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-3 flex flex-wrap gap-2">
            {careers.length > 0 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyBackup}
                className="flex-1 min-w-[140px] inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.09]"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Copiar JSON
              </motion.button>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPasteBox((v) => !v)}
              className="flex-1 min-w-[140px] inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.09]"
            >
              <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" />
              {showPasteBox ? 'Fechar Colagem' : 'Colar JSON'}
            </motion.button>
          </div>

          {showPasteBox && (
            <div className="mt-3 space-y-2.5 rounded-xl border border-white/10 bg-[#0B1222] p-3">
              <textarea
                rows={4}
                value={pastedJson}
                onChange={(e) => setPastedJson(e.target.value)}
                aria-label="Cole o conteúdo JSON do backup"
                placeholder="Cole aqui o texto JSON do backup..."
                className="w-full rounded-lg border border-white/10 bg-[#11192D] p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none resize-none"
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={!pastedJson.trim()}
                onClick={handlePasteImport}
                className="w-full min-h-[42px] rounded-lg bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-40"
              >
                Restaurar Backup Colado
              </motion.button>
            </div>
          )}
        </motion.section>
      ) : (
        <motion.section
          key="home-menu"
          aria-labelledby="home-menu-heading"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
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

          <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
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

            {onCompareCareers && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (careers.length >= 2) {
                    setMenuFeedback(null);
                    onCompareCareers();
                  } else {
                    showMenuFeedback(
                      'Crie ou importe pelo menos 2 carreiras salvas para comparar jogadores.'
                    );
                  }
                }}
                aria-label={
                  careers.length >= 2
                    ? 'Comparar dois jogadores salvos'
                    : 'Comparar jogador (requer pelo menos 2 carreiras salvas)'
                }
                className={`w-full sm:w-auto inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition-colors ${
                  careers.length >= 2
                    ? 'border-amber-400/35 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20'
                    : 'border-white/15 bg-white/[0.05] text-slate-200 hover:bg-white/[0.1]'
                }`}
              >
                <ArrowLeftRight
                  className={`h-4 w-4 ${careers.length >= 2 ? 'text-amber-300' : 'text-slate-300'}`}
                  aria-hidden="true"
                />
                Comparar Jogador
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

          {menuFeedback && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-xs sm:text-sm text-amber-200"
            >
              {menuFeedback}
            </div>
          )}

          {(onOpenSynapseAuth || onQuickSynapseSso) && (
            <div className="mt-6 pt-5 border-t border-white/[0.08]">
              {synapseSession ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-500/25 bg-[#0B1222] px-4 py-3 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 font-display text-sm font-extrabold text-emerald-300 uppercase"
                    >
                      {(synapseSession.name || synapseSession.email || 'SY')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {synapseSession.name}
                        </span>
                      </div>
                      <span className="block text-[11px] text-slate-400 truncate">
                        {synapseSession.email || 'Conta Synapse conectada'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onOpenSynapseAuth && (
                      <button
                        type="button"
                        onClick={onOpenSynapseAuth}
                        className="flex-1 sm:flex-initial inline-flex min-h-[38px] items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.09]"
                      >
                        Conta
                      </button>
                    )}
                    {onLogoutSynapse && (
                      <button
                        type="button"
                        onClick={onLogoutSynapse}
                        className="flex-1 sm:flex-initial inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20"
                      >
                        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                        Sair
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0B1222] px-4 py-3 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-600/15 text-blue-400"
                    >
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs sm:text-sm font-bold text-white">
                        Central de Contas Synapse
                      </span>
                      <span className="block text-[11px] text-slate-400 truncate">
                        Entre em 1 clique ou com e-mail e senha
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={onQuickSynapseSso || onOpenSynapseAuth}
                      className="flex-1 sm:flex-initial inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-bold text-white transition-colors hover:bg-blue-500 whitespace-nowrap"
                    >
                      <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                      Entrar com Synapse
                    </motion.button>
                    {onOpenSynapseAuth && (
                      <button
                        type="button"
                        onClick={onOpenSynapseAuth}
                        className="flex-1 sm:flex-initial inline-flex min-h-[40px] items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.09] whitespace-nowrap"
                      >
                        E-mail / Cadastro
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
}
