export type CountryRegion =
  | 'América do Sul'
  | 'Europa'
  | 'América do Norte'
  | 'África'
  | 'Ásia/Oceania';

export interface CountryOption {
  code: string;
  name: string;
  region: CountryRegion;
}

export const FOOTBALL_COUNTRIES: CountryOption[] = [
  { code: 'BR', name: 'Brasil', region: 'América do Sul' },
  { code: 'AR', name: 'Argentina', region: 'América do Sul' },
  { code: 'UY', name: 'Uruguai', region: 'América do Sul' },
  { code: 'CO', name: 'Colômbia', region: 'América do Sul' },
  { code: 'CL', name: 'Chile', region: 'América do Sul' },
  { code: 'PY', name: 'Paraguai', region: 'América do Sul' },
  { code: 'EC', name: 'Equador', region: 'América do Sul' },
  { code: 'PE', name: 'Peru', region: 'América do Sul' },
  { code: 'VE', name: 'Venezuela', region: 'América do Sul' },

  { code: 'PT', name: 'Portugal', region: 'Europa' },
  { code: 'ES', name: 'Espanha', region: 'Europa' },
  { code: 'FR', name: 'França', region: 'Europa' },
  { code: 'DE', name: 'Alemanha', region: 'Europa' },
  { code: 'IT', name: 'Itália', region: 'Europa' },
  { code: 'GB-ENG', name: 'Inglaterra', region: 'Europa' },
  { code: 'NL', name: 'Holanda', region: 'Europa' },
  { code: 'BE', name: 'Bélgica', region: 'Europa' },
  { code: 'HR', name: 'Croácia', region: 'Europa' },
  { code: 'CH', name: 'Suíça', region: 'Europa' },
  { code: 'NO', name: 'Noruega', region: 'Europa' },
  { code: 'SE', name: 'Suécia', region: 'Europa' },
  { code: 'DK', name: 'Dinamarca', region: 'Europa' },
  { code: 'PL', name: 'Polônia', region: 'Europa' },
  { code: 'AT', name: 'Áustria', region: 'Europa' },
  { code: 'TR', name: 'Turquia', region: 'Europa' },
  { code: 'UA', name: 'Ucrânia', region: 'Europa' },
  { code: 'RS', name: 'Sérvia', region: 'Europa' },
  { code: 'GR', name: 'Grécia', region: 'Europa' },
  { code: 'IE', name: 'Irlanda', region: 'Europa' },
  { code: 'GB-SCT', name: 'Escócia', region: 'Europa' },

  { code: 'MX', name: 'México', region: 'América do Norte' },
  { code: 'US', name: 'Estados Unidos', region: 'América do Norte' },
  { code: 'CA', name: 'Canadá', region: 'América do Norte' },
  { code: 'CR', name: 'Costa Rica', region: 'América do Norte' },

  { code: 'MA', name: 'Marrocos', region: 'África' },
  { code: 'SN', name: 'Senegal', region: 'África' },
  { code: 'NG', name: 'Nigéria', region: 'África' },
  { code: 'EG', name: 'Egito', region: 'África' },
  { code: 'CI', name: 'Costa do Marfim', region: 'África' },
  { code: 'CM', name: 'Camarões', region: 'África' },
  { code: 'GH', name: 'Gana', region: 'África' },
  { code: 'DZ', name: 'Argélia', region: 'África' },

  { code: 'JP', name: 'Japão', region: 'Ásia/Oceania' },
  { code: 'KR', name: 'Coreia do Sul', region: 'Ásia/Oceania' },
  { code: 'SA', name: 'Arábia Saudita', region: 'Ásia/Oceania' },
  { code: 'AU', name: 'Austrália', region: 'Ásia/Oceania' },
];

export const COUNTRY_REGIONS: CountryRegion[] = [
  'América do Sul',
  'Europa',
  'América do Norte',
  'África',
  'Ásia/Oceania',
];

export function findCountryByName(name: string): CountryOption | undefined {
  const normalized = name.trim().toLowerCase();
  return FOOTBALL_COUNTRIES.find(
    (c) => c.name.toLowerCase() === normalized || c.code.toLowerCase() === normalized
  );
}
