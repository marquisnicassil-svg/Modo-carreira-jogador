import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Eye,
  Palette,
  RotateCcw,
  Settings,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import {
  AppAccentColor,
  AppDensity,
  AppSettings,
  AppThemeStyle,
  BannerStyle,
  DEFAULT_APP_SETTINGS,
  DefaultCareerTab,
} from '../types/career';

interface SettingsModalProps {
  settings: AppSettings;
  onChange: (next: AppSettings) => void;
  onClose: () => void;
}

const THEME_OPTIONS: {
  id: AppThemeStyle;
  label: string;
  desc: string;
  bg: string;
  surface: string;
  well: string;
  border: string;
}[] = [
  {
    id: 'amoled',
    label: 'Preto Puro',
    desc: 'Pixels apagados',
    bg: '#000000',
    surface: '#0A0A0D',
    well: '#000000',
    border: 'rgba(255,255,255,0.3)',
  },
  {
    id: 'light',
    label: 'Branco',
    desc: 'Tradicional claro',
    bg: '#F1F5F9',
    surface: '#FFFFFF',
    well: '#E2E8F0',
    border: 'rgba(15,23,42,0.28)',
  },
  {
    id: 'midnight',
    label: 'Original',
    desc: 'Azul noturno',
    bg: '#080D1A',
    surface: '#11192D',
    well: '#0B1222',
    border: 'rgba(255,255,255,0.25)',
  },
];

const ACCENT_OPTIONS: {
  id: AppAccentColor;
  label: string;
  swatch: string;
}[] = [
  { id: 'blue', label: 'Azul', swatch: '#2563EB' },
  { id: 'emerald', label: 'Esmeralda', swatch: '#059669' },
  { id: 'amber', label: 'Dourado', swatch: '#D97706' },
  { id: 'rose', label: 'Rubro', swatch: '#E11D48' },
];

export function SettingsModal({ settings, onChange, onClose }: SettingsModalProps) {
  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const isDefault =
    settings.themeStyle === DEFAULT_APP_SETTINGS.themeStyle &&
    settings.accentColor === DEFAULT_APP_SETTINGS.accentColor &&
    settings.density === DEFAULT_APP_SETTINGS.density &&
    settings.bannerStyle === DEFAULT_APP_SETTINGS.bannerStyle &&
    settings.defaultTab === DEFAULT_APP_SETTINGS.defaultTab &&
    settings.showPulseBar === DEFAULT_APP_SETTINGS.showPulseBar &&
    settings.showPrimeBadge === DEFAULT_APP_SETTINGS.showPrimeBadge &&
    settings.showSplashIntro === DEFAULT_APP_SETTINGS.showSplashIntro &&
    settings.reduceAnimations === DEFAULT_APP_SETTINGS.reduceAnimations;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-white/15 bg-[#11192D] shadow-2xl max-h-[88dvh] flex flex-col pb-safe gpu-layer"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0B1222] text-blue-400">
              <Settings className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2
                id="settings-modal-title"
                className="font-display text-xl font-extrabold text-white uppercase tracking-wide leading-none"
              >
                Configurações
              </h2>
              <p className="mt-1 text-xs text-slate-400 truncate">
                Personalize o estilo, visualização e comportamento
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar configurações"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0B1222] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Section 1: Estilo & Cores */}
          <section aria-labelledby="settings-style-heading" className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Palette className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
              <h3 id="settings-style-heading">Estilo & Aparência</h3>
            </div>

            {/* Theme Palette */}
            <div className="space-y-2">
              <span className="block text-xs font-medium text-slate-400">
                Tema de fundo
              </span>
              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map((theme) => {
                  const selected = settings.themeStyle === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => update('themeStyle', theme.id)}
                      aria-pressed={selected}
                      className={`min-h-[76px] rounded-xl border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        selected
                          ? 'border-blue-500 bg-white/[0.08]'
                          : 'border-white/10 bg-[#0B1222] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center -space-x-1" aria-hidden="true">
                          <span
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                          />
                          <span
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                          />
                          <span
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: theme.well, borderColor: theme.border }}
                          />
                        </div>
                        {selected && (
                          <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" aria-hidden="true" />
                        )}
                      </div>
                      <span className="mt-2 block text-xs font-bold text-white whitespace-nowrap truncate">
                        {theme.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-slate-400 whitespace-nowrap truncate">
                        {theme.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <span className="block text-xs font-medium text-slate-400">
                Cor de destaque
              </span>
              <div className="grid grid-cols-4 gap-2">
                {ACCENT_OPTIONS.map((accent) => {
                  const selected = settings.accentColor === accent.id;
                  return (
                    <button
                      key={accent.id}
                      type="button"
                      onClick={() => update('accentColor', accent.id)}
                      aria-pressed={selected}
                      className={`min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        selected
                          ? 'border-white/35 bg-white/[0.1] text-white'
                          : 'border-white/10 bg-[#0B1222] text-slate-300 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-3.5 w-3.5 rounded-full shrink-0 border border-white/25"
                        style={{ backgroundColor: accent.swatch }}
                      />
                      <span className="truncate">{accent.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section 2: Visualização */}
          <section
            aria-labelledby="settings-view-heading"
            className="space-y-3.5 border-t border-white/[0.08] pt-5"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Eye className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
              <h3 id="settings-view-heading">Modo de Visualização</h3>
            </div>

            {/* Banner Style */}
            <div className="space-y-2">
              <span className="block text-xs font-medium text-slate-400">
                Painel do jogador
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      id: 'full' as BannerStyle,
                      label: 'Completo',
                      desc: 'Foto grande, OVR e botões em destaque',
                    },
                    {
                      id: 'compact' as BannerStyle,
                      label: 'Compacto',
                      desc: 'Barra enxuta para focar nas estatísticas',
                    },
                  ] as const
                ).map((opt) => {
                  const selected = settings.bannerStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => update('bannerStyle', opt.id)}
                      aria-pressed={selected}
                      className={`min-h-[58px] rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        selected
                          ? 'border-blue-500 bg-white/[0.08]'
                          : 'border-white/10 bg-[#0B1222] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">{opt.label}</span>
                        {selected && (
                          <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" aria-hidden="true" />
                        )}
                      </div>
                      <span className="mt-1 block text-[11px] leading-snug text-slate-400">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Density */}
            <div className="space-y-2">
              <span className="block text-xs font-medium text-slate-400">
                Espaçamento da tela
              </span>
              <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-white/[0.08] bg-[#0B1222] p-1">
                {(
                  [
                    { id: 'comfortable' as AppDensity, label: 'Confortável' },
                    { id: 'compact' as AppDensity, label: 'Compacto' },
                  ] as const
                ).map((opt) => {
                  const selected = settings.density === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => update('density', opt.id)}
                      aria-pressed={selected}
                      className={`min-h-[40px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                        selected
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Default Tab */}
            <div className="space-y-2">
              <span className="block text-xs font-medium text-slate-400">
                Aba inicial ao abrir carreira
              </span>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/[0.08] bg-[#0B1222] p-1">
                {(
                  [
                    { id: 'carreira' as DefaultCareerTab, label: 'Carreira' },
                    { id: 'estatisticas' as DefaultCareerTab, label: 'Estatísticas' },
                    { id: 'historia' as DefaultCareerTab, label: 'História' },
                  ] as const
                ).map((opt) => {
                  const selected = settings.defaultTab === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => update('defaultTab', opt.id)}
                      aria-pressed={selected}
                      className={`min-h-[40px] rounded-lg px-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                        selected
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Toggles */}
            <div className="space-y-2">
              <SettingToggleRow
                label="Barra de resumo da temporada"
                description="Mostra G+A, média por jogo, evolução e taças no topo"
                checked={settings.showPulseBar}
                onToggle={() => update('showPulseBar', !settings.showPulseBar)}
              />
              <SettingToggleRow
                label="Estrela de Temporada Prime (★)"
                description="Destaca automaticamente a melhor época do jogador"
                checked={settings.showPrimeBadge}
                onToggle={() => update('showPrimeBadge', !settings.showPrimeBadge)}
              />
            </div>
          </section>

          {/* Section 3: Experiência & Desempenho */}
          <section
            aria-labelledby="settings-ux-heading"
            className="space-y-3 border-t border-white/[0.08] pt-5"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Sliders className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
              <h3 id="settings-ux-heading">Experiência & Desempenho</h3>
            </div>

            <div className="space-y-2">
              <SettingToggleRow
                label="Tela de abertura ao iniciar"
                description="Exibe a apresentação rápida antes do menu inicial"
                checked={settings.showSplashIntro}
                onToggle={() => update('showSplashIntro', !settings.showSplashIntro)}
              />
              <SettingToggleRow
                label="Reduzir animações"
                description="Transições instantâneas para resposta mais rápida"
                checked={settings.reduceAnimations}
                onToggle={() => update('reduceAnimations', !settings.reduceAnimations)}
                icon={<Sparkles className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-5 py-3.5 shrink-0">
          <button
            type="button"
            disabled={isDefault}
            onClick={() => onChange({ ...DEFAULT_APP_SETTINGS })}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/10 bg-[#0B1222] px-3.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Restaurar padrão</span>
          </button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            className="min-h-[44px] rounded-xl bg-blue-600 px-5 text-xs sm:text-sm font-bold text-white transition-colors hover:bg-blue-500 whitespace-nowrap"
          >
            Concluir
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface SettingToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  icon?: ReactNode;
}

function SettingToggleRow({
  label,
  description,
  checked,
  onToggle,
  icon,
}: SettingToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="w-full min-h-[56px] flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0B1222] px-3.5 py-2.5 text-left transition-colors hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs sm:text-sm font-semibold text-white">{label}</span>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{description}</p>
      </div>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
          checked
            ? 'border-blue-500 bg-blue-600'
            : 'border-white/15 bg-white/[0.08]'
        }`}
      >
        <span
          data-switch-thumb="true"
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  );
}
