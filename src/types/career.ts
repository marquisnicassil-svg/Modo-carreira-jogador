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
  description: string;
}

export interface TrophyEntry {
  id: string;
  name: string;
  category: TrophyCategory;
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

export interface PositionOption {
  code: string;
  label: string;
}

export const PLAYER_POSITIONS: PositionOption[] = [
  { code: 'GOL', label: 'Goleiro' },
  { code: 'ZAG', label: 'Zagueiro' },
  { code: 'LD', label: 'Lateral Direito' },
  { code: 'LE', label: 'Lateral Esquerdo' },
  { code: 'ALD', label: 'Ala Direito' },
  { code: 'ALE', label: 'Ala Esquerdo' },
  { code: 'VOL', label: 'Volante' },
  { code: 'MC', label: 'Meio-Campista' },
  { code: 'MD', label: 'Meia Direita' },
  { code: 'ME', label: 'Meia Esquerda' },
  { code: 'MEI', label: 'Meia Atacante' },
  { code: 'PD', label: 'Ponta Direita' },
  { code: 'PE', label: 'Ponta Esquerda' },
  { code: 'SA', label: 'Segundo Atacante' },
  { code: 'ATA', label: 'Atacante' },
];

export const TROPHY_PRESETS: TrophyPreset[] = [
  {
    name: 'Liga Nacional',
    shortName: 'Liga Nacional',
    category: 'liga',
    description: 'Campeonato nacional de pontos corridos ou liga principal',
  },
  {
    name: 'Copa Nacional',
    shortName: 'Copa Nacional',
    category: 'copa',
    description: 'Copa mata-mata do país',
  },
  {
    name: 'Supercopa Nacional',
    shortName: 'Supercopa',
    category: 'supercopa',
    description: 'Campeão da liga contra campeão da copa',
  },
  {
    name: 'Continental Nível A',
    shortName: 'Continental A',
    category: 'continental_a',
    description: 'Champions League / Libertadores',
  },
  {
    name: 'Continental Nível B',
    shortName: 'Continental B',
    category: 'continental_b',
    description: 'Liga Europa / Copa Sul-Americana',
  },
  {
    name: 'Continental Nível C',
    shortName: 'Continental C',
    category: 'continental_c',
    description: 'Conference League',
  },
  {
    name: 'Desafio Europa x América do Sul',
    shortName: 'Desafio Cont.',
    category: 'intercontinental',
    description: 'Supercopa / Desafio entre campeões continentais',
  },
  {
    name: 'Mundial de Clubes',
    shortName: 'Mundial',
    category: 'mundial',
    description: 'Torneio mundial interclubes',
  },
  {
    name: 'Copa do Mundo (Seleção)',
    shortName: 'Copa do Mundo',
    category: 'selecao',
    description: 'Título mundial pela seleção nacional',
  },
  {
    name: 'Continental de Seleções',
    shortName: 'Euro / Copa América',
    category: 'selecao',
    description: 'Eurocopa, Copa América ou torneio continental',
  },
  {
    name: 'Bola de Ouro',
    shortName: 'Bola de Ouro',
    category: 'individual',
    description: 'Melhor jogador do mundo na temporada',
  },
  {
    name: 'Artilheiro da Temporada',
    shortName: 'Artilheiro',
    category: 'individual',
    description: 'Chuteira de Ouro ou artilharia principal',
  },
];

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
