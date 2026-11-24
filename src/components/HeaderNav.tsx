import { motion } from 'motion/react';
import { ArrowLeft, BarChart3, BookOpen, FolderKanban, Plus, Trophy } from 'lucide-react';
import { ActiveTab } from '../types/career';

interface HeaderNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewCareer: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  isHomeView?: boolean;
  playerName: string;
}

const NAV_ITEMS: { id: ActiveTab; label: string; icon: typeof Trophy }[] = [
  { id: 'carreira', label: 'Carreira', icon: Trophy },
  { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 },
  { id: 'historia', label: 'História', icon: BookOpen },
  { id: 'saves', label: 'Saves', icon: FolderKanban },
];

export function HeaderNav({
  activeTab,
  onSelectTab,
  onOpenNewCareer,
  onGoHome,
  onGoBack,
  canGoBack = false,
  isHomeView = false,
  playerName,
}: HeaderNavProps) {
  return (
    <>
      {/* Desktop & Mobile Top Header (Compact 48px on mobile, 64px on desktop) */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#080D1A]/98 pt-safe gpu-layer">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 md:h-16 md:gap-8 md:px-6">
          {/* Zone 1: Optional App Back Button + Brand Wordmark */}
          <div className="flex items-center gap-1.5 min-w-0 shrink-0">
            {canGoBack && onGoBack && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={onGoBack}
                aria-label="Voltar para a aba anterior"
                title="Voltar"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            )}
            <button
              type="button"
              onClick={() => (onGoHome ? onGoHome() : onSelectTab('carreira'))}
              aria-label="Modo Carreira, ir para a tela inicial"
              className="font-display text-xl font-extrabold tracking-wide text-white uppercase whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-1 active:scale-[0.98] transition-transform"
            >
              Modo Carreira
            </button>
          </div>

          {!isHomeView && (
            <>
              {/* Zone 2: Desktop Navigation Links (4 single-line links) */}
              <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectTab(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-2 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="desktop-nav-indicator"
                          transition={{ type: 'spring', stiffness: 560, damping: 38, mass: 0.7 }}
                          aria-hidden="true"
                          className="absolute inset-x-2 -bottom-[13px] h-0.5 bg-blue-500 rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Center Player Context (compact, single-line) */}
              <span
                aria-label={`Jogador ativo: ${playerName}`}
                className="md:hidden text-xs font-medium text-slate-400 truncate max-w-[120px]"
              >
                {playerName}
              </span>

              {/* Zone 3: 1 Primary CTA */}
              <div className="flex items-center shrink-0">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenNewCareer}
                  aria-label="Criar nova carreira"
                  className="inline-flex min-h-[36px] md:min-h-[40px] items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 md:px-4 md:py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-blue-500 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">Nova Carreira</span>
                  <span className="sm:hidden">Nova</span>
                </motion.button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile Bottom Thumb Navigation Bar (56px height, only when inside a career) */}
      {!isHomeView && (
        <nav
          aria-label="Navegação móvel"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#0B1222]/98 pb-safe gpu-layer"
        >
          <div className="grid grid-cols-4 h-14">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Aba ${item.label}${isActive ? ', selecionada' : ''}`}
                  className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors duration-150 active:scale-95 focus-visible:outline-none focus-visible:bg-white/5 ${
                    isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="mobile-nav-indicator"
                      transition={{ type: 'spring', stiffness: 560, damping: 38, mass: 0.7 }}
                      aria-hidden="true"
                      className="absolute top-0 inset-x-4 h-0.5 rounded-b-full bg-blue-500"
                    />
                  )}
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
                  <span className="mt-0.5 text-[11px] font-medium tracking-tight whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
