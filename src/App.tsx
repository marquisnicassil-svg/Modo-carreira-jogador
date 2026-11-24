/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { HeaderNav } from './components/HeaderNav';
import { HomeDashboard, HomeScreenMode } from './components/HomeDashboard';
import { SplashIntro } from './components/SplashIntro';
import { TransitionLoader, TransitionLoaderState } from './components/TransitionLoader';
import { PlayerBanner } from './components/PlayerBanner';
import { SeasonView } from './components/SeasonView';
import { StatsView } from './components/StatsView';
import { StoryView } from './components/StoryView';
import { SavesView } from './components/SavesView';
import {
  EditPlayerModal,
  EndOfSeasonModal,
  ExitAppModal,
  NewCareerModal,
} from './components/Modals';
import { ActiveTab, CareerProfile, SeasonRecord } from './types/career';
import { createId, getPrimeSeasonId } from './utils/careerEngine';
import { loadWorkspace, saveWorkspace } from './utils/storage';

interface NavEntry {
  isHome: boolean;
  homeMode: HomeScreenMode;
  tab: ActiveTab;
  careerId: string | null;
  year: number;
}

export default function App() {
  const initial = useMemo(() => loadWorkspace(), []);
  const [careers, setCareers] = useState<CareerProfile[]>(initial.careers);
  const [activeCareerId, setActiveCareerId] = useState<string | null>(initial.activeCareerId);
  const [activeTab, setActiveTab] = useState<ActiveTab>('carreira');

  const activeCareer = useMemo(
    () =>
      careers.length === 0
        ? null
        : careers.find((c) => c.id === activeCareerId) || careers[0],
    [careers, activeCareerId]
  );

  const [selectedYear, setSelectedYear] = useState<number>(
    activeCareer ? activeCareer.currentYear : 2026
  );
  const [showEndSeasonModal, setShowEndSeasonModal] = useState(false);
  const [showNewCareerModal, setShowNewCareerModal] = useState(false);
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [bannerToast, setBannerToast] = useState<string | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const [showHomeDashboard, setShowHomeDashboard] = useState(true);
  const [homeMode, setHomeMode] = useState<HomeScreenMode>('menu');
  const [navHistory, setNavHistory] = useState<NavEntry[]>([]);
  const [transitionLoader, setTransitionLoader] = useState<TransitionLoaderState | null>(null);
  const allowExitRef = useRef(false);
  const handleBackPressRef = useRef<() => void>(() => {});

  const announce = (msg: string) => {
    setSrAnnouncement('');
    window.setTimeout(() => setSrAnnouncement(msg), 20);
  };

  const runWithTransition = (
    loader: TransitionLoaderState,
    action: () => void
  ) => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReduced ? 60 : 260;

    setTransitionLoader(loader);
    window.setTimeout(() => {
      action();
      window.setTimeout(() => {
        setTransitionLoader(null);
      }, 20);
    }, duration);
  };

  useEffect(() => {
    saveWorkspace(careers, activeCareerId);
  }, [careers, activeCareerId]);

  const showToast = (msg: string) => {
    setBannerToast(msg);
    setTimeout(() => {
      setBannerToast((prev) => (prev === msg ? null : prev));
    }, 3400);
  };

  const selectedSeason: SeasonRecord | null = useMemo(() => {
    if (!activeCareer || activeCareer.seasons.length === 0) return null;
    const found = activeCareer.seasons.find((s) => s.year === selectedYear);
    if (found) return found;
    return (
      activeCareer.seasons.find((s) => s.year === activeCareer.currentYear) ||
      activeCareer.seasons[activeCareer.seasons.length - 1]
    );
  }, [activeCareer, selectedYear]);

  const primeSeasonId = useMemo(
    () => (activeCareer ? getPrimeSeasonId(activeCareer.seasons) : null),
    [activeCareer]
  );

  const updateActiveCareer = (updater: (prev: CareerProfile) => CareerProfile) => {
    if (!activeCareer) return;
    setCareers((prevList) =>
      prevList.map((c) => {
        if (c.id !== activeCareer.id) return c;
        const next = updater(c);
        return { ...next, updatedAt: new Date().toISOString() };
      })
    );
  };

  const handleUpdateSeason = (updatedSeason: SeasonRecord) => {
    updateActiveCareer((career) => {
      const nextSeasons = career.seasons.map((s) =>
        s.id === updatedSeason.id ? updatedSeason : s
      );
      const isCurrent = updatedSeason.year === career.currentYear;
      return {
        ...career,
        currentOverall: isCurrent ? updatedSeason.endOverall : career.currentOverall,
        currentClub: isCurrent ? updatedSeason.club : career.currentClub,
        currentAge: isCurrent ? updatedSeason.age : career.currentAge,
        seasons: nextSeasons,
      };
    });
  };

  const handleAdvanceSeason = (nextClub: string, retire = false) => {
    if (!activeCareer || !selectedSeason) return;
    const closingSeason = selectedSeason;
    const currentCareer = activeCareer;
    const nextYear = closingSeason.year + 1;
    const nextAge = closingSeason.age + 1;
    const transferred = nextClub.toLowerCase() !== closingSeason.club.toLowerCase();

    setShowEndSeasonModal(false);

    runWithTransition(
      {
        title: retire
          ? 'Encerrando Carreira'
          : transferred
            ? `Transferência · ${nextYear}`
            : `Temporada ${nextYear}`,
        subtitle: retire
          ? `${currentCareer.playerName} · Legado histórico`
          : `${currentCareer.playerName} · ${nextClub}`,
        club: nextClub,
        photo: currentCareer.playerPhoto,
        accentTone: transferred || retire ? 'amber' : 'blue',
      },
      () => {
        updateActiveCareer((career) => {
          const updatedSeasons = career.seasons.map((s) =>
            s.id === closingSeason.id ? { ...s, isCompleted: true } : s
          );

          if (retire) {
            return {
              ...career,
              retired: true,
              retiredYear: closingSeason.year,
              currentOverall: closingSeason.endOverall,
              seasons: updatedSeasons,
            };
          }

          const newSeason: SeasonRecord = {
            id: createId(),
            year: nextYear,
            club: nextClub,
            age: nextAge,
            goals: 0,
            assists: 0,
            games: 0,
            rating: 0,
            startOverall: closingSeason.endOverall,
            endOverall: closingSeason.endOverall,
            trophies: [],
            notes: '',
            isCompleted: false,
            transferFrom: transferred ? closingSeason.club : undefined,
          };

          return {
            ...career,
            currentYear: nextYear,
            currentClub: nextClub,
            currentAge: nextAge,
            currentOverall: closingSeason.endOverall,
            retired: false,
            seasons: [...updatedSeasons, newSeason],
          };
        });

        if (retire) {
          setActiveTab('historia');
          showToast(`${currentCareer.playerName} encerrou a carreira em ${closingSeason.year}.`);
        } else {
          setSelectedYear(nextYear);
          showToast(
            transferred
              ? `Temporada ${nextYear} iniciada · ${currentCareer.playerName} (${nextAge} anos) no ${nextClub}!`
              : `Temporada ${nextYear} iniciada · ${currentCareer.playerName} (${nextAge} anos) segue no ${nextClub}.`
          );
        }
      }
    );
  };

  const handleCreateCareer = (data: {
    playerName: string;
    playerPhoto?: string;
    position: string;
    nationality: string;
    club: string;
    year: number;
    age: number;
    overall: number;
  }) => {
    const now = new Date().toISOString();
    const newCareer: CareerProfile = {
      id: createId(),
      playerName: data.playerName,
      playerPhoto: data.playerPhoto,
      position: data.position,
      nationality: data.nationality,
      currentYear: data.year,
      currentClub: data.club,
      currentAge: data.age,
      currentOverall: data.overall,
      retired: false,
      createdAt: now,
      updatedAt: now,
      seasons: [
        {
          id: createId(),
          year: data.year,
          club: data.club,
          age: data.age,
          goals: 0,
          assists: 0,
          games: 0,
          rating: 0,
          startOverall: data.overall,
          endOverall: data.overall,
          trophies: [],
          notes: '',
          isCompleted: false,
        },
      ],
    };

    setShowNewCareerModal(false);
    runWithTransition(
      {
        title: 'Iniciando Carreira',
        subtitle: `${data.playerName} · ${data.club} (${data.year})`,
        club: data.club,
        photo: data.playerPhoto,
        accentTone: 'blue',
      },
      () => {
        pushCurrentToHistory({
          isHome: false,
          tab: 'carreira',
          careerId: newCareer.id,
          year: data.year,
        });
        setCareers((prev) => [newCareer, ...prev]);
        setActiveCareerId(newCareer.id);
        setSelectedYear(data.year);
        setActiveTab('carreira');
        setShowHomeDashboard(false);
        setHomeMode('menu');
        showToast(`Carreira de ${data.playerName} iniciada no ${data.club} (${data.year}).`);
      }
    );
  };

  const handleEditPlayer = (updates: {
    playerName: string;
    playerPhoto?: string;
    position: string;
    nationality: string;
    seasonClub: string;
    seasonAge: number;
    retired: boolean;
  }) => {
    if (!selectedSeason) return;
    updateActiveCareer((career) => {
      const nextSeasons = career.seasons.map((s) =>
        s.id === selectedSeason.id
          ? { ...s, club: updates.seasonClub, age: updates.seasonAge }
          : s
      );
      const isCurrent = selectedSeason.year === career.currentYear;
      return {
        ...career,
        playerName: updates.playerName,
        playerPhoto: updates.playerPhoto,
        position: updates.position,
        nationality: updates.nationality,
        currentClub: isCurrent ? updates.seasonClub : career.currentClub,
        currentAge: isCurrent ? updates.seasonAge : career.currentAge,
        retired: updates.retired,
        retiredYear: updates.retired ? career.currentYear : undefined,
        seasons: nextSeasons,
      };
    });
    setShowEditPlayerModal(false);
    showToast('Perfil atualizado.');
  };

  const handleSelectCareer = (id: string) => {
    const target = careers.find((c) => c.id === id);
    if (!target) return;
    runWithTransition(
      {
        title: 'Carregando Perfil',
        subtitle: `${target.playerName} · ${target.currentClub} (${target.currentYear})`,
        club: target.currentClub,
        photo: target.playerPhoto,
        accentTone: 'blue',
      },
      () => {
        pushCurrentToHistory({
          isHome: false,
          tab: 'carreira',
          careerId: target.id,
          year: target.currentYear,
        });
        setActiveCareerId(target.id);
        setSelectedYear(target.currentYear);
        setActiveTab('carreira');
        setShowHomeDashboard(false);
        setHomeMode('menu');
        showToast(`Carreira de ${target.playerName} carregada.`);
      }
    );
  };

  const handleDuplicateCareer = (career: CareerProfile) => {
    const copy: CareerProfile = {
      ...career,
      id: createId(),
      playerName: `${career.playerName} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seasons: career.seasons.map((s) => ({ ...s, id: createId() })),
    };
    setCareers((prev) => [copy, ...prev]);
    showToast(`Save duplicado: ${copy.playerName}.`);
  };

  const handleDeleteCareer = (id: string) => {
    const remaining = careers.filter((c) => c.id !== id);
    setCareers(remaining);
    setNavHistory((prev) => prev.filter((item) => item.isHome || item.careerId !== id));
    if (remaining.length === 0) {
      setActiveCareerId(null);
      setShowHomeDashboard(true);
      setHomeMode('menu');
    } else if (activeCareerId === id) {
      setActiveCareerId(remaining[0].id);
      setSelectedYear(remaining[0].currentYear);
    }
    showToast('Carreira removida.');
  };

  const handleClearAllCareers = () => {
    setCareers([]);
    setActiveCareerId(null);
    setShowEditPlayerModal(false);
    setShowEndSeasonModal(false);
    setShowHomeDashboard(true);
    setHomeMode('menu');
    setNavHistory([]);
    setActiveTab('carreira');
    showToast('Todos os dados e carreiras foram apagados.');
  };

  const handleImportCareers = (imported: CareerProfile[]) => {
    const cleaned = imported.filter((c) => c.id !== 'endrick-milan-demo');
    if (cleaned.length === 0) return;
    const mergedIds = new Set(cleaned.map((c) => c.id));
    const kept = careers.filter((c) => !mergedIds.has(c.id));
    const nextList = [...cleaned, ...kept];
    pushCurrentToHistory({
      isHome: false,
      tab: 'carreira',
      careerId: cleaned[0].id,
      year: cleaned[0].currentYear,
    });
    setCareers(nextList);
    setActiveCareerId(cleaned[0].id);
    setSelectedYear(cleaned[0].currentYear);
    setShowHomeDashboard(false);
    setHomeMode('menu');
    setActiveTab('carreira');
  };

  const handleJumpToSeason = (year: number) => {
    if (activeTab !== 'carreira') {
      pushCurrentToHistory({
        isHome: false,
        tab: 'carreira',
        year,
      });
    }
    setSelectedYear(year);
    setActiveTab('carreira');
  };

  const isCurrentActiveSeason =
    !!activeCareer &&
    !!selectedSeason &&
    selectedSeason.year === activeCareer.currentYear &&
    !selectedSeason.isCompleted;

  const isOnHomeScreen = showHomeDashboard || !activeCareer || !selectedSeason;

  const pushCurrentToHistory = (nextState: Partial<NavEntry>) => {
    const current: NavEntry = {
      isHome: isOnHomeScreen,
      homeMode,
      tab: activeTab,
      careerId: activeCareerId,
      year: selectedYear,
    };
    const target: NavEntry = { ...current, ...nextState };
    const isSame =
      current.isHome === target.isHome &&
      (current.isHome ? current.homeMode === target.homeMode : true) &&
      current.tab === target.tab &&
      current.careerId === target.careerId;
    if (isSame) return;

    setNavHistory((prev) => {
      const last = prev[prev.length - 1];
      if (
        last &&
        last.isHome === current.isHome &&
        last.homeMode === current.homeMode &&
        last.tab === current.tab &&
        last.careerId === current.careerId
      ) {
        return prev;
      }
      return [...prev.slice(-29), current];
    });
  };

  const hasValidHistory = useMemo(
    () =>
      navHistory.some(
        (entry) =>
          entry.isHome || (entry.careerId !== null && careers.some((c) => c.id === entry.careerId))
      ),
    [navHistory, careers]
  );

  const handleBackPress = () => {
    if (showSplash) {
      setShowSplash(false);
      return;
    }
    if (showExitConfirmModal) {
      setShowExitConfirmModal(false);
      return;
    }
    if (showEditPlayerModal) {
      setShowEditPlayerModal(false);
      return;
    }
    if (showNewCareerModal) {
      setShowNewCareerModal(false);
      return;
    }
    if (showEndSeasonModal) {
      setShowEndSeasonModal(false);
      return;
    }

    let targetIdx = -1;
    for (let i = navHistory.length - 1; i >= 0; i--) {
      const entry = navHistory[i];
      if (entry.isHome || (entry.careerId && careers.some((c) => c.id === entry.careerId))) {
        targetIdx = i;
        break;
      }
    }

    if (targetIdx !== -1) {
      const entry = navHistory[targetIdx];
      setNavHistory((prev) => prev.slice(0, targetIdx));
      setShowHomeDashboard(entry.isHome);
      setHomeMode(entry.homeMode);
      setActiveTab(entry.tab);
      if (entry.careerId && careers.some((c) => c.id === entry.careerId)) {
        setActiveCareerId(entry.careerId);
        setSelectedYear(entry.year);
      }
      return;
    }

    if (isOnHomeScreen && homeMode !== 'menu') {
      setHomeMode('menu');
      return;
    }

    setShowExitConfirmModal(true);
  };

  handleBackPressRef.current = handleBackPress;

  const handleHomeModeChange = (nextMode: HomeScreenMode) => {
    if (nextMode === homeMode) return;
    if (nextMode === 'menu') {
      const top = navHistory[navHistory.length - 1];
      if (top && top.isHome && top.homeMode === 'menu') {
        handleBackPress();
        return;
      }
      setHomeMode('menu');
      return;
    }
    pushCurrentToHistory({ isHome: true, homeMode: nextMode });
    setHomeMode(nextMode);
  };

  const handleConfirmExitApp = () => {
    setShowExitConfirmModal(false);
    allowExitRef.current = true;

    const androidBridge = (
      window as unknown as {
        Android?: { exitApp?: () => void; closeApp?: () => void; finish?: () => void };
      }
    ).Android;
    if (androidBridge?.exitApp) {
      androidBridge.exitApp();
      return;
    }
    if (androidBridge?.closeApp) {
      androidBridge.closeApp();
      return;
    }
    if (androidBridge?.finish) {
      androidBridge.finish();
      return;
    }

    const capApp = (
      window as unknown as {
        Capacitor?: { Plugins?: { App?: { exitApp?: () => void } } };
      }
    ).Capacitor?.Plugins?.App;
    if (capApp?.exitApp) {
      capApp.exitApp();
      return;
    }

    const navApp = (
      navigator as unknown as {
        app?: { exitApp?: () => void };
      }
    ).app;
    if (navApp?.exitApp) {
      navApp.exitApp();
      return;
    }

    window.close();
    window.setTimeout(() => {
      try {
        if (window.history.length > 1) {
          window.history.go(-2);
        }
      } catch {
        // Ignore history restrictions
      }
      showToast('Você já pode fechar ou minimizar o aplicativo.');
      window.setTimeout(() => {
        allowExitRef.current = false;
        if (!window.history.state?.__mcAppGuard) {
          window.history.pushState({ __mcAppGuard: true }, '');
        }
      }, 1500);
    }, 120);
  };

  // Intercept mobile hardware Back button (WebView/PWA popstate + Cordova + Capacitor)
  useEffect(() => {
    const ensureHistoryGuard = () => {
      if (!window.history.state?.__mcAppGuard) {
        window.history.pushState({ __mcAppGuard: true }, '');
      }
    };

    ensureHistoryGuard();

    const onPopState = () => {
      if (allowExitRef.current) return;
      ensureHistoryGuard();
      handleBackPressRef.current();
    };

    const onCordovaBack = (e: Event) => {
      e.preventDefault();
      handleBackPressRef.current();
    };

    const onFirstInteraction = () => {
      ensureHistoryGuard();
    };

    const onDeviceReady = () => {
      document.addEventListener('backbutton', onCordovaBack, false);
    };

    window.addEventListener('popstate', onPopState);
    document.addEventListener('backbutton', onCordovaBack, false);
    document.addEventListener('deviceready', onDeviceReady, false);
    window.addEventListener('pointerdown', onFirstInteraction, { passive: true });
    window.addEventListener('keydown', onFirstInteraction, { passive: true });

    let capListenerHandle: { remove?: () => Promise<void> | void } | undefined;
    const capApp = (
      window as unknown as {
        Capacitor?: {
          Plugins?: {
            App?: {
              addListener?: (
                event: string,
                cb: () => void
              ) => Promise<{ remove?: () => Promise<void> | void }> | { remove?: () => void };
            };
          };
        };
      }
    ).Capacitor?.Plugins?.App;

    if (capApp?.addListener) {
      const maybePromise = capApp.addListener('backButton', () => {
        handleBackPressRef.current();
      });
      if (maybePromise && typeof (maybePromise as Promise<unknown>).then === 'function') {
        (maybePromise as Promise<{ remove?: () => Promise<void> | void }>).then((handle) => {
          capListenerHandle = handle;
        });
      } else {
        capListenerHandle = maybePromise as { remove?: () => void };
      }
    }

    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('backbutton', onCordovaBack, false);
      document.removeEventListener('deviceready', onDeviceReady, false);
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      capListenerHandle?.remove?.();
    };
  }, []);

  // Prevent Safari gesture zoom and desktop Ctrl+wheel zoom without blocking WebView touch scroll
  useEffect(() => {
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    const preventWheelZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    document.addEventListener('gestureend', preventGesture, { passive: false });
    window.addEventListener('wheel', preventWheelZoom, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
      window.removeEventListener('wheel', preventWheelZoom);
    };
  }, []);

  // Close topmost modal with Escape key for keyboard and switch-access users
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showExitConfirmModal) {
        setShowExitConfirmModal(false);
      } else if (showEditPlayerModal) {
        setShowEditPlayerModal(false);
      } else if (showNewCareerModal) {
        setShowNewCareerModal(false);
      } else if (showEndSeasonModal) {
        setShowEndSeasonModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showExitConfirmModal, showEditPlayerModal, showNewCareerModal, showEndSeasonModal]);

  const tabLabels: Record<ActiveTab, string> = {
    carreira: 'Carreira',
    estatisticas: 'Estatísticas',
    historia: 'História',
    saves: 'Saves',
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-app bg-[#080D1A] text-slate-100 flex flex-col">
        {/* Live region for screen readers and voice synthesizers */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {srAnnouncement}
        </div>

        <AnimatePresence>
          {showSplash && <SplashIntro onComplete={() => setShowSplash(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {transitionLoader && <TransitionLoader {...transitionLoader} />}
        </AnimatePresence>

        <HeaderNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            pushCurrentToHistory({ isHome: false, tab });
            setActiveTab(tab);
            setShowHomeDashboard(false);
            announce(`Aba ${tabLabels[tab]} aberta`);
          }}
          onOpenNewCareer={() => setShowNewCareerModal(true)}
          onGoHome={() => {
            pushCurrentToHistory({ isHome: true, homeMode: 'menu', tab: 'carreira' });
            setShowHomeDashboard(true);
            setHomeMode('menu');
            setActiveTab('carreira');
            announce('Tela inicial aberta');
          }}
          onGoBack={() => {
            handleBackPress();
            announce('Voltando para a tela anterior');
          }}
          canGoBack={hasValidHistory || (isOnHomeScreen && homeMode !== 'menu')}
          isHomeView={isOnHomeScreen}
          playerName={activeCareer ? activeCareer.playerName : 'Sem jogador'}
        />

        {/* Main Content Container (padded at bottom on mobile for thumb nav bar + safe area) */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:px-6 md:pt-6 md:pb-12 space-y-6">
          <AnimatePresence>
            {bannerToast && (
              <motion.div
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-xl border border-blue-500/35 bg-blue-600/15 px-4 py-3 text-xs sm:text-sm font-medium text-blue-100"
              >
                {bannerToast}
              </motion.div>
            )}
          </AnimatePresence>

          {!isOnHomeScreen && activeTab !== 'saves' && activeCareer && selectedSeason && (
            <PlayerBanner
              career={activeCareer}
              selectedSeason={selectedSeason}
              primeSeasonId={primeSeasonId}
              onSelectSeasonYear={(yr) => {
                if (activeTab !== 'carreira') {
                  pushCurrentToHistory({ isHome: false, tab: 'carreira', year: yr });
                  setActiveTab('carreira');
                }
                setSelectedYear(yr);
                announce(`Temporada ${yr} selecionada`);
              }}
              onOpenEditPlayer={() => setShowEditPlayerModal(true)}
              onDeleteActivePlayer={() => handleDeleteCareer(activeCareer.id)}
            />
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${isOnHomeScreen ? 'home' : activeTab}-${activeCareer?.id || 'empty'}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            >
            {isOnHomeScreen ? (
              <HomeDashboard
                careers={careers}
                mode={homeMode}
                onModeChange={handleHomeModeChange}
                onContinueCareer={handleSelectCareer}
                onOpenNewCareer={() => setShowNewCareerModal(true)}
                onImportCareers={handleImportCareers}
              />
            ) : activeTab === 'saves' ? (
              <SavesView
                careers={careers}
                activeCareerId={activeCareerId}
                onSelectCareer={(id) => handleSelectCareer(id)}
                onOpenNewCareer={() => setShowNewCareerModal(true)}
                onDuplicateCareer={handleDuplicateCareer}
                onDeleteCareer={handleDeleteCareer}
                onClearAllCareers={handleClearAllCareers}
                onImportCareers={handleImportCareers}
              />
            ) : (
              <>
                {activeTab === 'carreira' && (
                  <SeasonView
                    career={activeCareer}
                    season={selectedSeason}
                    isCurrentActiveSeason={isCurrentActiveSeason}
                    onUpdateSeason={handleUpdateSeason}
                    onOpenEndSeason={() => setShowEndSeasonModal(true)}
                    onJumpToCurrentSeason={() => {
                      setSelectedYear(activeCareer.currentYear);
                      announce(`Temporada ${activeCareer.currentYear} selecionada`);
                    }}
                    onAnnounce={announce}
                  />
                )}

                {activeTab === 'estatisticas' && (
                  <StatsView
                    career={activeCareer}
                    onSelectSeasonFromTimeline={handleJumpToSeason}
                  />
                )}

                {activeTab === 'historia' && (
                  <StoryView
                    career={activeCareer}
                    onSelectSeasonYear={handleJumpToSeason}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showEndSeasonModal && activeCareer && selectedSeason && (
          <EndOfSeasonModal
            career={activeCareer}
            season={selectedSeason}
            onClose={() => setShowEndSeasonModal(false)}
            onAdvanceSeason={handleAdvanceSeason}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewCareerModal && (
          <NewCareerModal
            onClose={() => setShowNewCareerModal(false)}
            onCreate={handleCreateCareer}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditPlayerModal && activeCareer && selectedSeason && (
          <EditPlayerModal
            career={activeCareer}
            selectedSeason={selectedSeason}
            onClose={() => setShowEditPlayerModal(false)}
            onSave={handleEditPlayer}
            onDeletePlayer={() => {
              setShowEditPlayerModal(false);
              handleDeleteCareer(activeCareer.id);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExitConfirmModal && (
          <ExitAppModal
            onCancel={() => setShowExitConfirmModal(false)}
            onConfirmExit={handleConfirmExitApp}
          />
        )}
      </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
