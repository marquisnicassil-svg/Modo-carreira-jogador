export type TrophyCategory =
  | 'liga'
  | 'copa'
  | 'supercopa'
  | 'continental_a'
  | 'continental_b'
  | 'continental_c'
  | 'intercontinental'
  | 'mundial'
  | 'selecao'
  | 'individual'
  | 'outro';

export interface TrophyPreset {
  name: string;
  shortName: string;
  category: TrophyCategory;
  country?: string;
  description: string;
}

export interface TrophyEntry {
  id: string;
  name: string;
  category: TrophyCategory;
  country?: string;
}

export interface SeasonRecord {
  id: string;
  year: number;
  club: string;
  age: number;
  goals: number;
  assists: number;
  games: number;
  rating: number;
  startOverall: number;
  endOverall: number;
  yellowCards?: number;
  redCards?: number;
  trophies: TrophyEntry[];
  notes: string;
  isCompleted: boolean;
  transferFrom?: string;
}

export interface CareerProfile {
  id: string;
  playerName: string;
  playerPhoto?: string;
  position: string;
  nationality: string;
  currentYear: number;
  currentClub: string;
  currentAge: number;
  currentOverall: number;
  retired: boolean;
  retiredYear?: number;
  createdAt: string;
  updatedAt: string;
  seasons: SeasonRecord[];
}

export type ActiveTab = 'carreira' | 'estatisticas' | 'historia' | 'saves';

export type AppThemeStyle = 'midnight' | 'amoled' | 'light';
export type AppAccentColor = 'blue' | 'emerald' | 'amber' | 'rose';
export type AppDensity = 'comfortable' | 'compact';
export type BannerStyle = 'full' | 'compact';
export type DefaultCareerTab = 'carreira' | 'estatisticas' | 'historia';

export interface AppSettings {
  themeStyle: AppThemeStyle;
  accentColor: AppAccentColor;
  density: AppDensity;
  bannerStyle: BannerStyle;
  defaultTab: DefaultCareerTab;
  showPulseBar: boolean;
  showPrimeBadge: boolean;
  showSplashIntro: boolean;
  splashSound: boolean;
  reduceAnimations: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  themeStyle: 'midnight',
  accentColor: 'blue',
  density: 'comfortable',
  bannerStyle: 'full',
  defaultTab: 'carreira',
  showPulseBar: true,
  showPrimeBadge: true,
  showSplashIntro: true,
  splashSound: true,
  reduceAnimations: false,
};

export type PositionSector = 'gol' | 'defesa' | 'meio' | 'ataque';

export interface PositionOption {
  code: string;
  label: string;
  sector: PositionSector;
}

export const PLAYER_POSITIONS: PositionOption[] = [
  { code: 'GOL', label: 'Goleiro', sector: 'gol' },
  { code: 'ZAG', label: 'Zagueiro', sector: 'defesa' },
  { code: 'LD', label: 'Lateral Direito', sector: 'defesa' },
  { code: 'LE', label: 'Lateral Esquerdo', sector: 'defesa' },
  { code: 'ALD', label: 'Ala Direito', sector: 'defesa' },
  { code: 'ALE', label: 'Ala Esquerdo', sector: 'defesa' },
  { code: 'VOL', label: 'Volante', sector: 'meio' },
  { code: 'MC', label: 'Meio-Campista', sector: 'meio' },
  { code: 'MD', label: 'Meia Direita', sector: 'meio' },
  { code: 'ME', label: 'Meia Esquerda', sector: 'meio' },
  { code: 'MEI', label: 'Meia Atacante', sector: 'meio' },
  { code: 'PD', label: 'Ponta Direita', sector: 'ataque' },
  { code: 'PE', label: 'Ponta Esquerda', sector: 'ataque' },
  { code: 'SA', label: 'Segundo Atacante', sector: 'ataque' },
  { code: 'ATA', label: 'Atacante', sector: 'ataque' },
];

export const LEAGUE_COUNTRY_ORDER = [
  'Brasil',
  'Inglaterra',
  'Espanha',
  'Itália',
  'Alemanha',
  'França',
  'Portugal',
  'Argentina',
  'Holanda',
  'Bélgica',
  'Turquia',
  'Escócia',
  'Estados Unidos',
  'Arábia Saudita',
  'México',
  'Japão',
  'Uruguai',
  'Colômbia',
  'Outras',
] as const;

export const TROPHY_PRESETS: TrophyPreset[] = [
  // Brasil
  {
    name: 'Brasileirão Série A',
    shortName: 'Brasileirão A',
    category: 'liga',
    country: 'Brasil',
    description: 'Campeonato Brasileiro da 1ª Divisão',
  },
  {
    name: 'Brasileirão Série B',
    shortName: 'Brasileirão B',
    category: 'liga',
    country: 'Brasil',
    description: 'Campeonato Brasileiro da 2ª Divisão',
  },
  {
    name: 'Copa do Brasil',
    shortName: 'Copa do Brasil',
    category: 'copa',
    country: 'Brasil',
    description: 'Copa nacional mata-mata do Brasil',
  },
  {
    name: 'Supercopa do Brasil',
    shortName: 'Supercopa BR',
    category: 'supercopa',
    country: 'Brasil',
    description: 'Campeão do Brasileirão contra campeão da Copa do Brasil',
  },
  {
    name: 'Campeonato Estadual',
    shortName: 'Estadual',
    category: 'liga',
    country: 'Brasil',
    description: 'Paulistão, Carioca, Mineiro, Gaúcho e demais estaduais',
  },

  // Inglaterra
  {
    name: 'Premier League',
    shortName: 'Premier League',
    category: 'liga',
    country: 'Inglaterra',
    description: 'Primeira divisão do campeonato inglês',
  },
  {
    name: 'EFL Championship',
    shortName: 'Championship',
    category: 'liga',
    country: 'Inglaterra',
    description: 'Segunda divisão do campeonato inglês',
  },
  {
    name: 'FA Cup',
    shortName: 'FA Cup',
    category: 'copa',
    country: 'Inglaterra',
    description: 'Copa da Inglaterra tradicional',
  },
  {
    name: 'Copa da Liga Inglesa (EFL)',
    shortName: 'EFL Cup',
    category: 'copa',
    country: 'Inglaterra',
    description: 'Torneio eliminatório da liga inglesa',
  },
  {
    name: 'Community Shield',
    shortName: 'Community Shield',
    category: 'supercopa',
    country: 'Inglaterra',
    description: 'Supercopa da Inglaterra',
  },

  // Espanha
  {
    name: 'La Liga',
    shortName: 'La Liga',
    category: 'liga',
    country: 'Espanha',
    description: 'Primeira divisão do campeonato espanhol',
  },
  {
    name: 'LaLiga 2',
    shortName: 'LaLiga 2',
    category: 'liga',
    country: 'Espanha',
    description: 'Segunda divisão do campeonato espanhol',
  },
  {
    name: 'Copa del Rey',
    shortName: 'Copa del Rey',
    category: 'copa',
    country: 'Espanha',
    description: 'Copa nacional da Espanha',
  },
  {
    name: 'Supercopa da Espanha',
    shortName: 'Supercopa ESP',
    category: 'supercopa',
    country: 'Espanha',
    description: 'Torneio de supercopa da Espanha',
  },

  // Itália
  {
    name: 'Serie A Italiana',
    shortName: 'Serie A',
    category: 'liga',
    country: 'Itália',
    description: 'Scudetto da primeira divisão italiana',
  },
  {
    name: 'Serie B Italiana',
    shortName: 'Serie B',
    category: 'liga',
    country: 'Itália',
    description: 'Segunda divisão do campeonato italiano',
  },
  {
    name: 'Coppa Italia',
    shortName: 'Coppa Italia',
    category: 'copa',
    country: 'Itália',
    description: 'Copa nacional da Itália',
  },
  {
    name: 'Supercoppa Italiana',
    shortName: 'Supercoppa ITA',
    category: 'supercopa',
    country: 'Itália',
    description: 'Supercopa da Itália',
  },

  // Alemanha
  {
    name: 'Bundesliga',
    shortName: 'Bundesliga',
    category: 'liga',
    country: 'Alemanha',
    description: 'Primeira divisão do campeonato alemão',
  },
  {
    name: '2. Bundesliga',
    shortName: '2. Bundesliga',
    category: 'liga',
    country: 'Alemanha',
    description: 'Segunda divisão do campeonato alemão',
  },
  {
    name: 'DFB-Pokal',
    shortName: 'DFB-Pokal',
    category: 'copa',
    country: 'Alemanha',
    description: 'Copa da Alemanha',
  },
  {
    name: 'Supercopa da Alemanha',
    shortName: 'Supercopa ALE',
    category: 'supercopa',
    country: 'Alemanha',
    description: 'DFL-Supercup da Alemanha',
  },

  // França
  {
    name: 'Ligue 1',
    shortName: 'Ligue 1',
    category: 'liga',
    country: 'França',
    description: 'Primeira divisão do campeonato francês',
  },
  {
    name: 'Ligue 2',
    shortName: 'Ligue 2',
    category: 'liga',
    country: 'França',
    description: 'Segunda divisão do campeonato francês',
  },
  {
    name: 'Copa da França',
    shortName: 'Coupe de France',
    category: 'copa',
    country: 'França',
    description: 'Copa nacional da França',
  },
  {
    name: 'Supercopa da França',
    shortName: 'Trophée Champions',
    category: 'supercopa',
    country: 'França',
    description: 'Trophée des Champions da França',
  },

  // Portugal
  {
    name: 'Liga Portugal',
    shortName: 'Liga Portugal',
    category: 'liga',
    country: 'Portugal',
    description: 'Primeira divisão do campeonato português',
  },
  {
    name: 'Taça de Portugal',
    shortName: 'Taça de Portugal',
    category: 'copa',
    country: 'Portugal',
    description: 'Copa nacional de Portugal',
  },
  {
    name: 'Taça da Liga de Portugal',
    shortName: 'Taça da Liga',
    category: 'copa',
    country: 'Portugal',
    description: 'Copa da Liga portuguesa',
  },
  {
    name: 'Supertaça de Portugal',
    shortName: 'Supertaça PT',
    category: 'supercopa',
    country: 'Portugal',
    description: 'Supertaça Cândido de Oliveira',
  },

  // Argentina
  {
    name: 'Liga Argentina',
    shortName: 'Liga Argentina',
    category: 'liga',
    country: 'Argentina',
    description: 'Primeira divisão do campeonato argentino',
  },
  {
    name: 'Copa Argentina',
    shortName: 'Copa Argentina',
    category: 'copa',
    country: 'Argentina',
    description: 'Copa nacional da Argentina',
  },
  {
    name: 'Copa da Liga Argentina',
    shortName: 'Copa da Liga ARG',
    category: 'copa',
    country: 'Argentina',
    description: 'Torneio oficial da liga profissional argentina',
  },

  // Holanda
  {
    name: 'Eredivisie',
    shortName: 'Eredivisie',
    category: 'liga',
    country: 'Holanda',
    description: 'Primeira divisão do campeonato holandês',
  },
  {
    name: 'Copa da Holanda',
    shortName: 'KNVB Beker',
    category: 'copa',
    country: 'Holanda',
    description: 'Copa nacional da Holanda',
  },

  // Bélgica
  {
    name: 'Pro League (Bélgica)',
    shortName: 'Pro League BEL',
    category: 'liga',
    country: 'Bélgica',
    description: 'Primeira divisão do campeonato belga',
  },
  {
    name: 'Copa da Bélgica',
    shortName: 'Copa Bélgica',
    category: 'copa',
    country: 'Bélgica',
    description: 'Copa nacional da Bélgica',
  },

  // Turquia
  {
    name: 'Süper Lig (Turquia)',
    shortName: 'Süper Lig',
    category: 'liga',
    country: 'Turquia',
    description: 'Primeira divisão do campeonato turco',
  },
  {
    name: 'Copa da Turquia',
    shortName: 'Copa Turquia',
    category: 'copa',
    country: 'Turquia',
    description: 'Copa nacional da Turquia',
  },

  // Escócia
  {
    name: 'Scottish Premiership',
    shortName: 'Premiership ESC',
    category: 'liga',
    country: 'Escócia',
    description: 'Primeira divisão do campeonato escocês',
  },
  {
    name: 'Copa da Escócia',
    shortName: 'Scottish Cup',
    category: 'copa',
    country: 'Escócia',
    description: 'Copa nacional da Escócia',
  },

  // Estados Unidos
  {
    name: 'MLS Cup',
    shortName: 'MLS',
    category: 'liga',
    country: 'Estados Unidos',
    description: 'Major League Soccer dos Estados Unidos e Canadá',
  },
  {
    name: 'US Open Cup',
    shortName: 'US Open Cup',
    category: 'copa',
    country: 'Estados Unidos',
    description: 'Copa nacional dos Estados Unidos',
  },
  {
    name: 'Leagues Cup',
    shortName: 'Leagues Cup',
    category: 'copa',
    country: 'Estados Unidos',
    description: 'Torneio entre clubes da MLS e Liga MX',
  },

  // Arábia Saudita
  {
    name: 'Liga Saudita',
    shortName: 'Saudi Pro League',
    category: 'liga',
    country: 'Arábia Saudita',
    description: 'Primeira divisão da Arábia Saudita',
  },
  {
    name: 'Copa do Rei Saudita',
    shortName: 'King Cup',
    category: 'copa',
    country: 'Arábia Saudita',
    description: 'Copa nacional da Arábia Saudita',
  },

  // México
  {
    name: 'Liga MX',
    shortName: 'Liga MX',
    category: 'liga',
    country: 'México',
    description: 'Primeira divisão do campeonato mexicano',
  },
  {
    name: 'Copa MX',
    shortName: 'Copa MX',
    category: 'copa',
    country: 'México',
    description: 'Copa nacional do México',
  },

  // Japão
  {
    name: 'J1 League (Japão)',
    shortName: 'J1 League',
    category: 'liga',
    country: 'Japão',
    description: 'Primeira divisão do campeonato japonês',
  },
  {
    name: 'Copa do Imperador',
    shortName: 'Copa Imperador',
    category: 'copa',
    country: 'Japão',
    description: 'Copa nacional do Japão',
  },

  // Uruguai
  {
    name: 'Campeonato Uruguaio',
    shortName: 'Liga Uruguai',
    category: 'liga',
    country: 'Uruguai',
    description: 'Primeira divisão do campeonato uruguaio',
  },

  // Colômbia
  {
    name: 'Liga Colombiana',
    shortName: 'Liga BetPlay',
    category: 'liga',
    country: 'Colômbia',
    description: 'Primeira divisão do campeonato colombiano',
  },

  // Outras Ligas/Copas Genéricas
  {
    name: 'Outra Liga Nacional',
    shortName: 'Outra Liga',
    category: 'liga',
    country: 'Outras',
    description: 'Liga nacional de outro país',
  },
  {
    name: 'Outra Copa Nacional',
    shortName: 'Outra Copa',
    category: 'copa',
    country: 'Outras',
    description: 'Copa mata-mata de outro país',
  },
  {
    name: 'Outra Supercopa Nacional',
    shortName: 'Supercopa',
    category: 'supercopa',
    country: 'Outras',
    description: 'Campeão da liga contra campeão da copa',
  },

  // Continentais & Mundiais
  {
    name: 'UEFA Champions League',
    shortName: 'Champions League',
    category: 'continental_a',
    description: 'Principal competição de clubes da Europa',
  },
  {
    name: 'Copa Libertadores',
    shortName: 'Libertadores',
    category: 'continental_a',
    description: 'Principal competição de clubes da América do Sul',
  },
  {
    name: 'UEFA Europa League',
    shortName: 'Europa League',
    category: 'continental_b',
    description: 'Segunda maior competição europeia de clubes',
  },
  {
    name: 'Copa Sul-Americana',
    shortName: 'Sul-Americana',
    category: 'continental_b',
    description: 'Segunda maior competição sul-americana de clubes',
  },
  {
    name: 'UEFA Conference League',
    shortName: 'Conference League',
    category: 'continental_c',
    description: 'Terceira competição europeia de clubes',
  },
  {
    name: 'Supercopa da UEFA / Recopa',
    shortName: 'Supercopa Cont.',
    category: 'intercontinental',
    description: 'Supercopa ou Recopa entre campeões continentais',
  },
  {
    name: 'Mundial de Clubes',
    shortName: 'Mundial',
    category: 'mundial',
    description: 'Torneio mundial interclubes',
  },

  // Seleções
  {
    name: 'Copa do Mundo (Seleção)',
    shortName: 'Copa do Mundo',
    category: 'selecao',
    description: 'Título mundial pela seleção nacional',
  },
  {
    name: 'Eurocopa',
    shortName: 'Eurocopa',
    category: 'selecao',
    description: 'Campeonato europeu de seleções',
  },
  {
    name: 'Copa América',
    shortName: 'Copa América',
    category: 'selecao',
    description: 'Campeonato sul-americano de seleções',
  },
  {
    name: 'Copa Africana de Nações',
    shortName: 'CAN / AFCON',
    category: 'selecao',
    description: 'Campeonato africano de seleções',
  },
  {
    name: 'Copa da Ásia',
    shortName: 'Copa da Ásia',
    category: 'selecao',
    description: 'Campeonato asiático de seleções',
  },
  {
    name: 'Liga das Nações',
    shortName: 'Liga das Nações',
    category: 'selecao',
    description: 'Torneio oficial entre seleções',
  },
  {
    name: 'Jogos Olímpicos',
    shortName: 'Olimpíadas',
    category: 'selecao',
    description: 'Medalha de ouro olímpica pela seleção',
  },

  // Prêmios Individuais
  {
    name: 'Bola de Ouro',
    shortName: 'Bola de Ouro',
    category: 'individual',
    description: 'Melhor jogador do mundo na temporada',
  },
  {
    name: 'FIFA The Best',
    shortName: 'The Best',
    category: 'individual',
    description: 'Prêmio oficial da FIFA de melhor do mundo',
  },
  {
    name: 'Chuteira de Ouro',
    shortName: 'Chuteira de Ouro',
    category: 'individual',
    description: 'Maior artilheiro das ligas na temporada',
  },
  {
    name: 'Melhor Jogador da Liga (MVP)',
    shortName: 'MVP da Liga',
    category: 'individual',
    description: 'Craque eleito da temporada nacional',
  },
  {
    name: 'Artilheiro da Temporada',
    shortName: 'Artilheiro',
    category: 'individual',
    description: 'Maior goleador da liga ou competição',
  },
  {
    name: 'Rei das Assistências',
    shortName: 'Assistências',
    category: 'individual',
    description: 'Líder em passes para gol na temporada',
  },
  {
    name: 'Golden Boy / Revelação',
    shortName: 'Revelação',
    category: 'individual',
    description: 'Melhor jogador jovem da temporada',
  },
  {
    name: 'Seleção da Temporada',
    shortName: 'Time do Ano',
    category: 'individual',
    description: 'Eleito para a seleção ideal do campeonato',
  },
  {
    name: 'Luva de Ouro',
    shortName: 'Luva de Ouro',
    category: 'individual',
    description: 'Melhor goleiro da competição ou temporada',
  },
  {
    name: 'Prêmio Puskás',
    shortName: 'Puskás',
    category: 'individual',
    description: 'Gol mais bonito da temporada',
  },
];

export function resolveTrophyCountry(name: string, explicitCountry?: string): string | undefined {
  if (explicitCountry && explicitCountry !== 'Outras') return explicitCountry;
  const normalized = name.trim().toLowerCase();
  const matched = TROPHY_PRESETS.find((p) => p.name.toLowerCase() === normalized);
  if (matched?.country && matched.country !== 'Outras') return matched.country;
  return undefined;
}

export const POPULAR_CLUBS = [
  'Milan',
  'Real Madrid',
  'Barcelona',
  'Manchester City',
  'Arsenal',
  'Liverpool',
  'Inter de Milão',
  'Bayern de Munique',
  'PSG',
  'Palmeiras',
  'Flamengo',
  'Cruzeiro',
  'Botafogo',
  'Atlético-MG',
  'São Paulo',
  'Corinthians',
  'Santos',
  'Grêmio',
];
