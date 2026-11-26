import { CareerProfile, resolveTrophyCountry, SeasonRecord, TrophyEntry } from '../types/career';

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatRating(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

export function getClubMonogram(clubName: string): string {
  const words = clubName
    .trim()
    .split(/\s+/)
    .filter((w) => !['de', 'da', 'do', 'fc', 'sc', 'ec', 'ac'].includes(w.toLowerCase()));
  if (words.length === 0) return clubName.slice(0, 3).toUpperCase() || 'CLB';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return (words[0][0] + words[1][0] + (words[2]?.[0] || '')).toUpperCase().slice(0, 3);
}

const CLUB_COLORS: Record<string, { bg: string; ring: string; text: string }> = {
  milan: { bg: '#991B1B', ring: '#EF4444', text: '#FEE2E2' },
  'real madrid': { bg: '#1E293B', ring: '#F59E0B', text: '#FEF3C7' },
  barcelona: { bg: '#1E3A8A', ring: '#DC2626', text: '#DBEAFE' },
  palmeiras: { bg: '#14532D', ring: '#22C55E', text: '#DCFCE7' },
  flamengo: { bg: '#7F1D1D', ring: '#EF4444', text: '#FEE2E2' },
  cruzeiro: { bg: '#1E40AF', ring: '#60A5FA', text: '#DBEAFE' },
  'manchester city': { bg: '#0369A1', ring: '#38BDF8', text: '#E0F2FE' },
  arsenal: { bg: '#B91C1C', ring: '#F87171', text: '#FEE2E2' },
  liverpool: { bg: '#991B1B', ring: '#F87171', text: '#FEE2E2' },
  psg: { bg: '#1E3A8A', ring: '#F43F5E', text: '#E0E7FF' },
  bayern: { bg: '#991B1B', ring: '#3B82F6', text: '#FEE2E2' },
  botafogo: { bg: '#18181B', ring: '#A1A1AA', text: '#F4F4F5' },
};

export function getClubAccent(clubName: string): { bg: string; ring: string; text: string } {
  const key = clubName.trim().toLowerCase();
  for (const [pattern, palette] of Object.entries(CLUB_COLORS)) {
    if (key.includes(pattern)) return palette;
  }
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palettes = [
    { bg: '#1E3A8A', ring: '#3B82F6', text: '#DBEAFE' },
    { bg: '#064E3B', ring: '#10B981', text: '#D1FAE5' },
    { bg: '#7C2D12', ring: '#F97316', text: '#FFEDD5' },
    { bg: '#312E81', ring: '#818CF8', text: '#E0E7FF' },
    { bg: '#831843', ring: '#F472B6', text: '#FCE7F3' },
  ];
  return palettes[Math.abs(hash) % palettes.length];
}

export function computeSeasonScore(season: SeasonRecord): number {
  const trophyPoints = season.trophies.reduce((acc, t) => {
    if (t.category === 'individual' || t.category === 'mundial' || t.category === 'continental_a') {
      return acc + 10;
    }
    if (t.category === 'selecao') return acc + 12;
    return acc + 6;
  }, 0);

  return (
    season.goals * 1.6 +
    season.assists * 1.25 +
    season.rating * 4.5 +
    season.endOverall * 0.45 +
    trophyPoints
  );
}

export function getPrimeSeasonId(seasons: SeasonRecord[]): string | null {
  const eligible = seasons.filter(
    (s) => s.isCompleted || s.goals > 0 || s.assists > 0 || s.trophies.length > 0 || s.rating > 0
  );
  if (eligible.length === 0) return null;

  let best = eligible[0];
  let bestScore = computeSeasonScore(best);

  for (let i = 1; i < eligible.length; i++) {
    const score = computeSeasonScore(eligible[i]);
    if (score > bestScore) {
      best = eligible[i];
      bestScore = score;
    }
  }
  return best.id;
}

export interface TrophyGroup {
  name: string;
  category: TrophyEntry['category'];
  country?: string;
  count: number;
  years: number[];
}

export interface CareerSummary {
  totalSeasons: number;
  completedSeasons: number;
  totalGoals: number;
  totalAssists: number;
  totalContributions: number;
  totalGames: number;
  totalYellowCards: number;
  totalRedCards: number;
  averageRating: number;
  peakOverall: number;
  totalTrophies: number;
  collectiveTrophiesCount: number;
  individualAwardsCount: number;
  primeSeasonId: string | null;
  trophyGroups: TrophyGroup[];
}

export function computeCareerSummary(career: CareerProfile): CareerSummary {
  const seasons = [...career.seasons].sort((a, b) => a.year - b.year);
  const activeOrCompleted = seasons.filter(
    (s) =>
      s.isCompleted ||
      s.goals > 0 ||
      s.assists > 0 ||
      s.rating > 0 ||
      (s.yellowCards || 0) > 0 ||
      (s.redCards || 0) > 0 ||
      s.trophies.length > 0
  );

  const totalGoals = seasons.reduce((sum, s) => sum + s.goals, 0);
  const totalAssists = seasons.reduce((sum, s) => sum + s.assists, 0);
  const totalGames = seasons.reduce((sum, s) => sum + (s.games || 0), 0);
  const totalYellowCards = seasons.reduce((sum, s) => sum + (s.yellowCards || 0), 0);
  const totalRedCards = seasons.reduce((sum, s) => sum + (s.redCards || 0), 0);

  const ratedSeasons = seasons.filter((s) => s.rating > 0);
  const averageRating =
    ratedSeasons.length > 0
      ? ratedSeasons.reduce((sum, s) => sum + s.rating, 0) / ratedSeasons.length
      : 0;

  const peakOverall =
    seasons.length > 0
      ? Math.max(...seasons.map((s) => Math.max(s.startOverall, s.endOverall)))
      : career.currentOverall;

  const totalTrophies = seasons.reduce((sum, s) => sum + s.trophies.length, 0);
  const individualAwardsCount = seasons.reduce(
    (sum, s) => sum + s.trophies.filter((t) => t.category === 'individual').length,
    0
  );
  const collectiveTrophiesCount = totalTrophies - individualAwardsCount;
  const primeSeasonId = getPrimeSeasonId(seasons);

  const trophyMap = new Map<string, TrophyGroup>();
  for (const season of seasons) {
    for (const trophy of season.trophies) {
      const key = trophy.name.trim().toLowerCase();
      const existing = trophyMap.get(key);
      if (existing) {
        existing.count += 1;
        existing.years.push(season.year);
      } else {
        trophyMap.set(key, {
          name: trophy.name,
          category: trophy.category,
          country: resolveTrophyCountry(trophy.name, trophy.country),
          count: 1,
          years: [season.year],
        });
      }
    }
  }

  const trophyGroups = Array.from(trophyMap.values())
    .map((group) => ({ ...group, years: [...group.years].sort((a, b) => a - b) }))
    .sort((a, b) => b.count - a.count);

  return {
    totalSeasons: Math.max(activeOrCompleted.length, seasons.filter((s) => s.isCompleted).length),
    completedSeasons: seasons.filter((s) => s.isCompleted).length,
    totalGoals,
    totalAssists,
    totalContributions: totalGoals + totalAssists,
    totalGames,
    totalYellowCards,
    totalRedCards,
    averageRating,
    peakOverall,
    totalTrophies,
    collectiveTrophiesCount,
    individualAwardsCount,
    primeSeasonId,
    trophyGroups,
  };
}

export interface CareerRecords {
  bestGoals: { value: number; year: number; club: string } | null;
  bestAssists: { value: number; year: number; club: string } | null;
  bestContributions: { value: number; year: number; club: string } | null;
  bestRating: { value: number; year: number; club: string } | null;
  biggestOvrJump: { value: number; year: number; club: string } | null;
  goalsPerGame: number;
  contributionsPerGame: number;
  clubsCount: number;
}

export function computeCareerRecords(career: CareerProfile): CareerRecords {
  const seasons = career.seasons;
  const summary = computeCareerSummary(career);

  let bestGoals: CareerRecords['bestGoals'] = null;
  let bestAssists: CareerRecords['bestAssists'] = null;
  let bestContributions: CareerRecords['bestContributions'] = null;
  let bestRating: CareerRecords['bestRating'] = null;
  let biggestOvrJump: CareerRecords['biggestOvrJump'] = null;
  const clubSet = new Set<string>();

  for (const s of seasons) {
    if (s.club.trim()) clubSet.add(s.club.trim().toLowerCase());
    if (s.goals > 0 && (!bestGoals || s.goals > bestGoals.value)) {
      bestGoals = { value: s.goals, year: s.year, club: s.club };
    }
    if (s.assists > 0 && (!bestAssists || s.assists > bestAssists.value)) {
      bestAssists = { value: s.assists, year: s.year, club: s.club };
    }
    const ga = s.goals + s.assists;
    if (ga > 0 && (!bestContributions || ga > bestContributions.value)) {
      bestContributions = { value: ga, year: s.year, club: s.club };
    }
    if (s.rating > 0 && (!bestRating || s.rating > bestRating.value)) {
      bestRating = { value: s.rating, year: s.year, club: s.club };
    }
    const jump = s.endOverall - s.startOverall;
    if (jump > 0 && (!biggestOvrJump || jump > biggestOvrJump.value)) {
      biggestOvrJump = { value: jump, year: s.year, club: s.club };
    }
  }

  return {
    bestGoals,
    bestAssists,
    bestContributions,
    bestRating,
    biggestOvrJump,
    goalsPerGame: summary.totalGames > 0 ? summary.totalGoals / summary.totalGames : 0,
    contributionsPerGame:
      summary.totalGames > 0 ? summary.totalContributions / summary.totalGames : 0,
    clubsCount: Math.max(1, clubSet.size),
  };
}

export interface ClubCareerBreakdown {
  club: string;
  seasonsCount: number;
  years: number[];
  games: number;
  goals: number;
  assists: number;
  contributions: number;
  trophies: number;
  yellowCards: number;
  redCards: number;
  averageRating: number;
  peakOverall: number;
  isCurrent: boolean;
}

export function computeClubBreakdown(career: CareerProfile): ClubCareerBreakdown[] {
  const ordered = [...career.seasons].sort((a, b) => a.year - b.year);
  const relevant = ordered.filter(
    (s, idx) =>
      s.isCompleted ||
      s.games > 0 ||
      s.goals > 0 ||
      s.assists > 0 ||
      s.rating > 0 ||
      (s.yellowCards || 0) > 0 ||
      (s.redCards || 0) > 0 ||
      s.trophies.length > 0 ||
      idx === 0 ||
      ordered.length === 1
  );

  const map = new Map<
    string,
    {
      club: string;
      years: number[];
      games: number;
      goals: number;
      assists: number;
      trophies: number;
      yellowCards: number;
      redCards: number;
      ratingSum: number;
      ratingCount: number;
      peakOverall: number;
    }
  >();

  for (const s of relevant) {
    const displayClub = s.club.trim() || career.currentClub;
    const key = displayClub.toLowerCase();
    const existing = map.get(key);
    const seasonPeak = Math.max(s.startOverall, s.endOverall);

    if (existing) {
      existing.club = displayClub;
      existing.years.push(s.year);
      existing.games += s.games || 0;
      existing.goals += s.goals;
      existing.assists += s.assists;
      existing.trophies += s.trophies.length;
      existing.yellowCards += s.yellowCards || 0;
      existing.redCards += s.redCards || 0;
      if (s.rating > 0) {
        existing.ratingSum += s.rating;
        existing.ratingCount += 1;
      }
      if (seasonPeak > existing.peakOverall) {
        existing.peakOverall = seasonPeak;
      }
    } else {
      map.set(key, {
        club: displayClub,
        years: [s.year],
        games: s.games || 0,
        goals: s.goals,
        assists: s.assists,
        trophies: s.trophies.length,
        yellowCards: s.yellowCards || 0,
        redCards: s.redCards || 0,
        ratingSum: s.rating > 0 ? s.rating : 0,
        ratingCount: s.rating > 0 ? 1 : 0,
        peakOverall: seasonPeak,
      });
    }
  }

  const currentClubKey = career.currentClub.trim().toLowerCase();

  return Array.from(map.entries())
    .map(([key, item]) => {
      const sortedYears = [...item.years].sort((a, b) => a - b);
      return {
        club: item.club,
        seasonsCount: sortedYears.length,
        years: sortedYears,
        games: item.games,
        goals: item.goals,
        assists: item.assists,
        contributions: item.goals + item.assists,
        trophies: item.trophies,
        yellowCards: item.yellowCards,
        redCards: item.redCards,
        averageRating: item.ratingCount > 0 ? item.ratingSum / item.ratingCount : 0,
        peakOverall: item.peakOverall,
        isCurrent: key === currentClubKey,
      };
    })
    .sort((a, b) => {
      const aLatest = a.years[a.years.length - 1] || 0;
      const bLatest = b.years[b.years.length - 1] || 0;
      if (bLatest !== aLatest) return bLatest - aLatest;
      return b.seasonsCount - a.seasonsCount;
    });
}

export interface CareerMilestone {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progressText: string;
}

export function getCareerMilestones(career: CareerProfile): CareerMilestone[] {
  const summary = computeCareerSummary(career);
  const records = computeCareerRecords(career);
  const hasBallonDor = career.seasons.some((s) =>
    s.trophies.some(
      (t) =>
        t.name.toLowerCase().includes('bola de ouro') ||
        t.name.toLowerCase().includes('ballon')
    )
  );
  const hasFairPlaySeason = career.seasons.some(
    (s) =>
      (s.isCompleted || s.games >= 15) &&
      s.games >= 15 &&
      (s.yellowCards || 0) === 0 &&
      (s.redCards || 0) === 0
  );

  const clubCounts = new Map<string, number>();
  for (const s of career.seasons) {
    const k = s.club.trim().toLowerCase();
    if (k) clubCounts.set(k, (clubCounts.get(k) || 0) + 1);
  }
  const maxClubSeasons = clubCounts.size > 0 ? Math.max(...clubCounts.values()) : 0;

  return [
    {
      id: 'first-goal',
      title: 'Primeiro Gol',
      description: 'Balançar a rede pela primeira vez na carreira',
      unlocked: summary.totalGoals >= 1,
      progressText: `${Math.min(1, summary.totalGoals)}/1 gol`,
    },
    {
      id: 'centenario-gols',
      title: 'Centenário de Gols',
      description: 'Alcançar 100 gols acumulados na carreira',
      unlocked: summary.totalGoals >= 100,
      progressText: `${summary.totalGoals}/100 gols`,
    },
    {
      id: 'garcom-elite',
      title: 'Mestre das Assistências',
      description: 'Somar 50 assistências para companheiros',
      unlocked: summary.totalAssists >= 50,
      progressText: `${summary.totalAssists}/50 assist.`,
    },
    {
      id: 'cem-jogos',
      title: '100 Jogos Disputados',
      description: 'Entrar em campo ao menos 100 vezes',
      unlocked: summary.totalGames >= 100,
      progressText: `${summary.totalGames}/100 jogos`,
    },
    {
      id: 'estrela-90',
      title: 'Classe Mundial (90+ OVR)',
      description: 'Atingir overall 90 ou superior em uma temporada',
      unlocked: summary.peakOverall >= 90,
      progressText: `Pico ${summary.peakOverall}/90 OVR`,
    },
    {
      id: 'colecionador',
      title: 'Colecionador de Taças',
      description: 'Conquistar pelo menos 5 títulos oficiais',
      unlocked: summary.totalTrophies >= 5,
      progressText: `${summary.totalTrophies}/5 títulos`,
    },
    {
      id: 'fiel-clube',
      title: 'Ídolo do Clube',
      description: 'Defender o mesmo clube por 4 ou mais temporadas',
      unlocked: maxClubSeasons >= 4,
      progressText: `${maxClubSeasons}/4 temporadas`,
    },
    {
      id: 'fair-play',
      title: 'Conduta Impecável',
      description: 'Completar uma temporada de 15+ jogos sem cartões',
      unlocked: hasFairPlaySeason,
      progressText: hasFairPlaySeason ? 'Conquistado' : '0 cartões em 15+ jogos',
    },
    {
      id: 'andarilho',
      title: 'Experiência Internacional',
      description: 'Atuar por 3 ou mais clubes diferentes',
      unlocked: records.clubsCount >= 3,
      progressText: `${records.clubsCount}/3 clubes`,
    },
    {
      id: 'bola-ouro',
      title: 'Bola de Ouro',
      description: 'Vencer o prêmio de melhor jogador do mundo',
      unlocked: hasBallonDor,
      progressText: hasBallonDor ? 'Vencedor' : 'Não conquistado',
    },
  ];
}

export function buildCareerShareText(career: CareerProfile): string {
  const summary = computeCareerSummary(career);
  const records = computeCareerRecords(career);
  const primeSeason = career.seasons.find((s) => s.id === summary.primeSeasonId);

  const lines = [
    `MODO CARREIRA — ${career.playerName.toUpperCase()}`,
    `${career.currentClub} · ${career.position} · ${career.nationality} · ${career.currentAge} anos`,
    `Overall atual: ${career.currentOverall} (Pico: ${summary.peakOverall})`,
    '',
    `Resumo (${summary.totalSeasons} ${summary.totalSeasons === 1 ? 'temporada' : 'temporadas'}):`,
    `- Jogos: ${summary.totalGames}`,
    `- Gols: ${summary.totalGoals}`,
    `- Assistências: ${summary.totalAssists}`,
    `- Participações (G+A): ${summary.totalContributions}`,
    `- Média geral: ${formatRating(summary.averageRating)}`,
    `- Títulos: ${summary.totalTrophies}`,
    `- Cartões: ${summary.totalYellowCards} amarelos · ${summary.totalRedCards} vermelhos`,
  ];

  if (primeSeason) {
    lines.push(
      '',
      `Temporada Prime: ${primeSeason.year} (${primeSeason.club}) — ${primeSeason.goals}G, ${primeSeason.assists}A, OVR ${primeSeason.endOverall}`
    );
  }
  if (records.bestGoals) {
    lines.push(
      `Recorde de gols em 1 ano: ${records.bestGoals.value} (${records.bestGoals.year} · ${records.bestGoals.club})`
    );
  }

  return lines.join('\n');
}

export interface StoryChapter {
  seasonId: string;
  year: number;
  club: string;
  age: number;
  isPrime: boolean;
  headline: string;
  paragraphs: string[];
  trophiesWon: string[];
}

export interface GeneratedStory {
  chapters: StoryChapter[];
  epilogueTitle: string;
  epilogueBody: string;
  fullText: string;
}

export function generateCareerStory(career: CareerProfile): GeneratedStory {
  const ordered = [...career.seasons].sort((a, b) => a.year - b.year);
  const primeId = getPrimeSeasonId(ordered);
  const summary = computeCareerSummary(career);
  const trophyCountsSoFar = new Map<string, number>();

  const chapters: StoryChapter[] = [];

  ordered.forEach((season, idx) => {
    const isCurrentEmpty =
      !season.isCompleted &&
      season.goals === 0 &&
      season.assists === 0 &&
      season.trophies.length === 0 &&
      idx > 0;

    if (isCurrentEmpty) {
      return;
    }

    const isPrime = season.id === primeId && ordered.filter((s) => s.isCompleted || s.goals > 0).length > 1;
    const prevSeason = idx > 0 ? ordered[idx - 1] : null;
    const changedClub = prevSeason && prevSeason.club.toLowerCase() !== season.club.toLowerCase();

    const paragraphs: string[] = [];

    // Opening line of the season
    if (idx === 0) {
      paragraphs.push(
        `Tudo começou em ${season.year}, aos ${season.age} anos, quando ${career.playerName} estreou com a camisa do ${season.club}.`
      );
    } else if (changedClub && prevSeason) {
      paragraphs.push(
        `Em ${season.year}, aos ${season.age} anos, ${career.playerName} decidiu mudar de ares: deixou o ${prevSeason.club} e assinou com o ${season.club} para um novo desafio.`
      );
    } else {
      paragraphs.push(
        `Na temporada de ${season.year}, agora com ${season.age} anos, ${career.playerName} seguiu defendendo as cores do ${season.club}.`
      );
    }

    // Performance stats line
    const ovrDiff = season.endOverall - season.startOverall;
    let ovrPhrase = `mantendo o overall em ${season.endOverall}`;
    if (idx === 0 && ovrDiff !== 0) {
      ovrPhrase = `começou com over ${season.startOverall} e fechou o ano com ${season.endOverall}`;
    } else if (ovrDiff > 0) {
      ovrPhrase = `evoluiu de ${season.startOverall} para ${season.endOverall} de overall (+${ovrDiff})`;
    } else if (ovrDiff < 0) {
      ovrPhrase = `terminou com over ${season.endOverall} (início em ${season.startOverall})`;
    }

    const ratingText = season.rating > 0 ? `, média ${formatRating(season.rating)}` : '';
    const gamesText = season.games > 0 ? ` em ${season.games} jogos` : '';

    paragraphs.push(
      `Terminou o ano com ${season.goals} gols e ${season.assists} assistências${gamesText}${ratingText}, ${ovrPhrase}.`
    );

    const yellowCards = season.yellowCards || 0;
    const redCards = season.redCards || 0;
    if (yellowCards > 0 || redCards > 0) {
      const yellowText =
        yellowCards > 0
          ? `${yellowCards} ${yellowCards === 1 ? 'cartão amarelo' : 'cartões amarelos'}`
          : '';
      const redText =
        redCards > 0
          ? `${redCards} ${redCards === 1 ? 'cartão vermelho' : 'cartões vermelhos'}`
          : '';
      const combined = [yellowText, redText].filter(Boolean).join(' e ');
      paragraphs.push(`Na parte disciplinar, acumulou ${combined} ao longo da temporada.`);
    }

    // Assessment flavor
    const contributions = season.goals + season.assists;
    if (isPrime) {
      paragraphs.push(
        `Este foi o auge absoluto de sua carreira até aqui — sua temporada PRIME, com ${contributions} participações diretas em gol.`
      );
    } else if (season.goals >= 30) {
      paragraphs.push(
        `Uma campanha avassaladora de artilheiro nato, empilhando ${season.goals} bolas na rede.`
      );
    } else if (idx === 0 && contributions >= 20) {
      paragraphs.push(
        `Números impressionantes para um jogador de ${season.age} anos em sua temporada de estreia.`
      );
    } else if (contributions >= 25) {
      paragraphs.push(
        `Foi protagonista absoluto da equipe ao somar ${contributions} participações diretas em gols.`
      );
    }

    // Trophies narrative tracking first-time wins vs repeats
    if (season.trophies.length > 0) {
      const trophyPhrases: string[] = [];
      for (const trophy of season.trophies) {
        const key = trophy.name.trim().toLowerCase();
        const count = (trophyCountsSoFar.get(key) || 0) + 1;
        trophyCountsSoFar.set(key, count);

        if (count === 1) {
          trophyPhrases.push(`${trophy.name} (pela primeira vez)`);
        } else {
          trophyPhrases.push(`${trophy.name} (pela ${count}ª vez)`);
        }
      }

      if (trophyPhrases.length === 1) {
        paragraphs.push(`Na galeria de taças, conquistou ${trophyPhrases[0]}.`);
      } else {
        const last = trophyPhrases[trophyPhrases.length - 1];
        const rest = trophyPhrases.slice(0, -1).join(', ');
        paragraphs.push(`Na galeria de taças, levantou ${rest} e ${last}.`);
      }
    } else if (season.isCompleted) {
      paragraphs.push(`Passou a temporada sem levantar troféus coletivos, acumulando experiência para o ciclo seguinte.`);
    }

    if (season.notes.trim()) {
      paragraphs.push(`Registro da temporada: "${season.notes.trim()}".`);
    }

    const headline = isPrime
      ? `Temporada ${season.year} · ${season.club} (PRIME)`
      : `Temporada ${season.year} · ${season.club}`;

    chapters.push({
      seasonId: season.id,
      year: season.year,
      club: season.club,
      age: season.age,
      isPrime,
      headline,
      paragraphs,
      trophiesWon: season.trophies.map((t) => t.name),
    });
  });

  // Epilogue
  let epilogueTitle = '';
  let epilogueBody = '';

  if (career.retired) {
    epilogueTitle = `Legado Encerrado (${career.retiredYear || career.currentYear})`;
    epilogueBody = `Aos ${career.currentAge} anos, ${career.playerName} pendurou as chuteiras defendendo o ${career.currentClub}. Foram ${summary.totalSeasons} temporada(s) registradas, somando ${summary.totalGoals} gols, ${summary.totalAssists} assistências, média geral de ${formatRating(summary.averageRating)} e ${summary.totalTrophies} título(s) na carreira.`;
  } else {
    epilogueTitle = `Próximo Capítulo · Temporada ${career.currentYear}`;
    epilogueBody = `A história de ${career.playerName} ainda está sendo escrita. Aos ${career.currentAge} anos, ele veste a camisa do ${career.currentClub} na temporada ${career.currentYear}. Na soma da carreira até aqui: ${summary.totalSeasons} temporada(s), ${summary.totalGoals} gols, ${summary.totalAssists} assistências e ${summary.totalTrophies} título(s).`;
  }

  const fullText = [
    `HISTÓRIA DA CARREIRA — ${career.playerName.toUpperCase()} (${career.position} · ${career.nationality})`,
    '',
    ...chapters.flatMap((c) => [`[${c.headline}]`, ...c.paragraphs, '']),
    `[${epilogueTitle}]`,
    epilogueBody,
  ].join('\n');

  return {
    chapters,
    epilogueTitle,
    epilogueBody,
    fullText,
  };
}

export function getUnlockedSeasonAchievements(season: SeasonRecord, career: CareerProfile): string[] {
  const badges: string[] = [];
  if (season.trophies.length >= 2) {
    badges.push(`${season.trophies.length} títulos na temporada ${season.year}`);
  } else if (season.trophies.length === 1) {
    badges.push(`Campeão: ${season.trophies[0].name}`);
  }
  if (season.goals >= 30) {
    badges.push('Artilharia histórica (30+ gols)');
  } else if (season.goals >= 15) {
    badges.push('Temporada goleadora (15+ gols)');
  }
  if (season.assists >= 10) {
    badges.push('Garçom do elenco (10+ assistências)');
  }
  if (season.endOverall > season.startOverall) {
    badges.push(`Evolução de +${season.endOverall - season.startOverall} de Over`);
  }
  if (
    season.games >= 15 &&
    (season.yellowCards || 0) === 0 &&
    (season.redCards || 0) === 0
  ) {
    badges.push('Fair Play: zero cartões na temporada');
  }
  if (career.seasons.filter((s) => s.isCompleted).length === 0) {
    badges.push('Primeira temporada concluída');
  }
  return badges;
}
