import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  ChevronDown,
  ClipboardPaste,
  Copy,
  CopyPlus,
  Download,
  Flag,
  FolderKanban,
  HardDrive,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { CareerProfile } from '../types/career';
import {
  computeCareerSummary,
  formatRating,
  getClubAccent,
  getClubMonogram,
} from '../utils/careerEngine';
import {
  buildCareerBackupJson,
  copyTextToClipboard,
  exportCareerJson,
  parseImportedCareers,
} from '../utils/storage';
import { CountryFlag } from './CountryFlag';

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

type SaveSortOption = 'recent' | 'ovr' | 'goals' | 'trophies';

const SORT_OPTIONS: { id: SaveSortOption; label: string }[] = [
  { id: 'recent', label: 'Recentes' },
  { id: 'ovr', label: 'Maior OVR' },
  { id: 'goals', label: 'Mais Gols' },
  { id: 'trophies', label: 'Mais Títulos' },
];

function formatUpdatedDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch {
    return '';
  }
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
  const [confirmExport, setConfirmExport] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [showBackupPanel, setShowBackupPanel] = useState(careers.length === 0);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SaveSortOption>('recent');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (msg: string) => {
    setImportFeedback(msg);
    window.setTimeout(() => setImportFeedback((prev) => (prev === msg ? null : prev)), 3500);
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
      showFeedback('Download indisponível no aparelho; backup JSON copiado.');
    } else {
      showFeedback('Use "Copiar JSON" para salvar seu backup.');
    }
  };

  const handleCopyBackup = async (targetCareers = careers, label = 'Backup JSON') => {
    const ok = await copyTextToClipboard(buildCareerBackupJson(targetCareers));
    showFeedback(
      ok
        ? `${label} copiado para a área de transferência.`
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

  const visibleCareers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const enriched = careers
      .filter((c) => {
        if (!q) return true;
        return (
          c.playerName.toLowerCase().includes(q) ||
          c.currentClub.toLowerCase().includes(q) ||
          c.nationality.toLowerCase().includes(q) ||
          c.position.toLowerCase().includes(q)
        );
      })
      .map((career) => ({
        career,
        summary: computeCareerSummary(career),
      }));

    enriched.sort((a, b) => {
      if (sortBy === 'ovr') {
        return b.career.currentOverall - a.career.currentOverall;
      }
      if (sortBy === 'goals') {
        return b.summary.totalGoals - a.summary.totalGoals;
      }
      if (sortBy === 'trophies') {
        return b.summary.totalTrophies - a.summary.totalTrophies;
      }
      return new Date(b.career.updatedAt).getTime() - new Date(a.career.updatedAt).getTime();
    });

    return enriched;
  }, [careers, searchQuery, sortBy]);

  const totalSeasonsSaved = useMemo(
    () => careers.reduce((sum, c) => sum + c.seasons.length, 0),
    [careers]
  );

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <FolderKanban className="h-5 w-5 text-blue-400" aria-hidden="true" />
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-wide text-white uppercase">
                Saves & Backup
              </h2>
              <span className="font-mono-num text-xs font-semibold text-slate-400">
                {careers.length} {careers.length === 1 ? 'carreira' : 'carreiras'} · {totalSeasonsSaved}{' '}
                {totalSeasonsSaved === 1 ? 'temporada' : 'temporadas'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gerencie seus jogadores salvos localmente e faça backup em JSON entre dispositivos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowBackupPanel((v) => !v)}
              aria-expanded={showBackupPanel}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-[#0B1222] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.08] whitespace-nowrap"
            >
              <HardDrive className="h-4 w-4 text-blue-400" aria-hidden="true" />
              <span>Backup & Importar</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  showBackupPanel ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onOpenNewCareer}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-500 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Criar Jogador
            </motion.button>
          </div>
        </div>

        {/* Collapsible Backup & Restore Center */}
        <AnimatePresence initial={false}>
          {showBackupPanel && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="pt-3.5 border-t border-white/[0.08] space-y-3"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Export Group */}
                <div className="rounded-xl border border-white/[0.07] bg-[#0B1222] p-3.5 space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Exportar Dados
                  </div>
                  {careers.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Salve pelo menos uma carreira para habilitar a exportação.
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {confirmExport ? (
                        <div className="flex flex-wrap items-center gap-1.5 w-full" role="group" aria-label="Confirmar exportação do backup">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                              setConfirmExport(false);
                              void handleExport();
                            }}
                            className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-500 whitespace-nowrap"
                          >
                            <Download className="h-4 w-4" aria-hidden="true" />
                            Confirmar Backup
                          </motion.button>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setConfirmExport(false)}
                            className="min-h-[42px] rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 whitespace-nowrap"
                          >
                            Cancelar
                          </motion.button>
                        </div>
                      ) : (
                        <>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setConfirmExport(true)}
                            className="flex-1 min-w-[140px] inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-blue-600/20 border border-blue-500/35 px-3.5 py-2 text-xs font-bold text-blue-200 transition-colors hover:bg-blue-600/30 whitespace-nowrap"
                          >
                            <Download className="h-4 w-4" aria-hidden="true" />
                            Exportar Backup
                          </motion.button>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => void handleCopyBackup()}
                            className="flex-1 min-w-[120px] inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.09] whitespace-nowrap"
                          >
                            <Copy className="h-4 w-4 text-slate-300" aria-hidden="true" />
                            Copiar JSON
                          </motion.button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Import Group */}
                <div className="rounded-xl border border-white/[0.07] bg-[#0B1222] p-3.5 space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Restaurar Backup
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 min-w-[140px] inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.09] whitespace-nowrap"
                    >
                      <Upload className="h-4 w-4 text-slate-300" aria-hidden="true" />
                      Importar Arquivo
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowPasteBox((v) => !v)}
                      className="flex-1 min-w-[120px] inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.09] whitespace-nowrap"
                    >
                      <ClipboardPaste className="h-4 w-4 text-slate-300" aria-hidden="true" />
                      {showPasteBox ? 'Fechar Colagem' : 'Colar JSON'}
                    </motion.button>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                aria-label="Selecionar arquivo JSON de backup para importar"
                accept=".json,application/json,text/plain,*/*"
                onChange={handleImportFile}
                className="hidden"
              />

              {showPasteBox && (
                <div className="rounded-xl border border-white/10 bg-[#0B1222] p-3.5 space-y-2.5">
                  <p className="text-xs text-slate-300">
                    Cole o texto JSON do backup abaixo caso seu aparelho não abra o seletor de arquivos:
                  </p>
                  <textarea
                    rows={4}
                    value={pastedJson}
                    onChange={(e) => setPastedJson(e.target.value)}
                    aria-label="Cole o conteúdo JSON do backup"
                    placeholder="Cole aqui o texto JSON do backup..."
                    className="w-full rounded-xl border border-white/10 bg-[#11192D] p-3 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPasteBox(false)}
                      className="min-h-[40px] rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-slate-300 hover:bg-white/[0.08]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={!pastedJson.trim()}
                      onClick={handlePasteImport}
                      className="min-h-[40px] rounded-xl bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-40"
                    >
                      Restaurar Backup Colado
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Search & Sort Controls (shown when >= 2 careers exist) */}
      {careers.length >= 2 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar save por jogador, clube ou país"
              placeholder="Buscar jogador, clube, posição ou país..."
              className="w-full min-h-[42px] rounded-xl border border-white/10 bg-[#11192D] pl-9 pr-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div
            role="group"
            aria-label="Ordenar carreiras salvas"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar"
          >
            {SORT_OPTIONS.map((opt) => {
              const active = sortBy === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSortBy(opt.id)}
                  aria-pressed={active}
                  className={`min-h-[38px] rounded-xl px-3 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'border border-white/10 bg-[#11192D] text-slate-300 hover:bg-white/[0.06]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Saved Careers Grid or Empty State */}
      {careers.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-8 text-center">
          <h3 className="font-display text-xl font-bold text-white uppercase">
            Nenhuma carreira salva
          </h3>
          <p className="mt-1.5 text-sm text-slate-400">
            Crie seu primeiro jogador ou importe um arquivo de backup em JSON acima.
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
      ) : visibleCareers.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#11192D] p-6 text-center space-y-2">
          <p className="text-sm text-slate-300">
            Nenhum save encontrado para &ldquo;{searchQuery.trim()}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="min-h-[38px] rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-blue-300 hover:bg-white/[0.08]"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <div
          role="list"
          aria-label="Lista de carreiras salvas"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <AnimatePresence initial={false}>
            {visibleCareers.map(({ career, summary }, idx) => {
              const isActive = career.id === activeCareerId;
              const accent = getClubAccent(career.currentClub);
              const monogram = getClubMonogram(career.currentClub);
              const isConfirmingDelete = confirmDeleteId === career.id;
              const updatedLabel = formatUpdatedDate(career.updatedAt);

              return (
                <motion.article
                  key={career.id}
                  role="listitem"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.16,
                    delay: Math.min(idx * 0.02, 0.1),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ borderTopColor: accent.ring }}
                  aria-label={`Carreira de ${career.playerName}, ${career.currentClub}, ${career.position}, ${career.currentAge} anos, temporada ${career.currentYear}, overall ${career.currentOverall}${isActive ? ', carreira ativa' : ''}`}
                  className={`rounded-2xl border border-t-2 p-4 sm:p-5 transition-colors ${
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-xl font-bold text-white uppercase truncate">
                            {career.playerName}
                          </h3>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 shrink-0">
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              Ativo
                            </span>
                          )}
                          {career.retired && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 shrink-0">
                              <Flag className="h-3 w-3" aria-hidden="true" />
                              Aposentado
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                          <CountryFlag country={career.nationality} size="sm" />
                          <span className="text-slate-200 font-medium truncate">
                            {career.currentClub}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{career.position}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{career.currentAge}a</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{career.currentYear}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-display text-2xl font-extrabold leading-none text-amber-400 tabular-nums">
                        <span className="sr-only">Overall </span>
                        {career.currentOverall}
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                        {summary.peakOverall > career.currentOverall
                          ? `Pico ${summary.peakOverall}`
                          : 'OVR'}
                      </div>
                    </div>
                  </div>

                  {/* Stats Strip */}
                  <div className="mt-3.5 grid grid-cols-5 gap-1.5 rounded-xl border border-white/[0.06] bg-[#0B1222] py-2.5 px-2 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400">
                        <span className="sr-only">Temporadas</span>
                        <span aria-hidden="true">Temps</span>
                      </div>
                      <div className="font-mono-num text-xs sm:text-sm font-bold text-white">
                        {summary.totalSeasons}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Gols</div>
                      <div className="font-mono-num text-xs sm:text-sm font-bold text-emerald-400">
                        {summary.totalGoals}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">
                        <span className="sr-only">Assistências</span>
                        <span aria-hidden="true">Assist.</span>
                      </div>
                      <div className="font-mono-num text-xs sm:text-sm font-bold text-sky-400">
                        {summary.totalAssists}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Média</div>
                      <div className="font-mono-num text-xs sm:text-sm font-bold text-slate-200">
                        {formatRating(summary.averageRating)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Títulos</div>
                      <div className="font-mono-num text-xs sm:text-sm font-bold text-amber-400">
                        {summary.totalTrophies}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!isActive ? (
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => onSelectCareer(career.id)}
                          aria-label={`Carregar carreira de ${career.playerName}`}
                          className="min-h-[44px] rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-500"
                        >
                          Carregar
                        </motion.button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 py-2">
                          <span className="h-2 w-2 rounded-full bg-blue-400" aria-hidden="true" />
                          Em exibição
                        </span>
                      )}
                      {updatedLabel && (
                        <span className="text-[11px] text-slate-500 tabular-nums hidden sm:inline">
                          {updatedLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        onClick={() =>
                          void handleCopyBackup([career], `JSON de ${career.playerName}`)
                        }
                        aria-label={`Copiar JSON da carreira de ${career.playerName}`}
                        title="Copiar JSON deste jogador"
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      </motion.button>

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
                        <div
                          className="flex items-center gap-1"
                          role="group"
                          aria-label={`Confirmar exclusão de ${career.playerName}`}
                        >
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

      {/* Danger Zone: Clear All Careers */}
      {careers.length > 0 && (
        <div className="rounded-2xl border border-rose-500/20 bg-[#11192D] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-300">
              Zona de Risco
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Apaga todas as {careers.length}{' '}
              {careers.length === 1 ? 'carreira salva' : 'carreiras salvas'} deste aparelho.
            </p>
          </div>

          {confirmClearAll ? (
            <div className="flex items-center gap-2" role="group" aria-label="Confirmar limpeza total">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onClearAllCareers();
                  setConfirmClearAll(false);
                }}
                className="min-h-[44px] rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 whitespace-nowrap"
              >
                Confirmar Limpeza
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setConfirmClearAll(false)}
                className="min-h-[44px] rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 whitespace-nowrap"
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
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Limpar Tudo
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}
