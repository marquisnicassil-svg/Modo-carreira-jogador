export interface CountryOption {
  code: string;
  name: string;
}

export const FOOTBALL_COUNTRIES: CountryOption[] = [
  { code: 'BR', name: 'Brasil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'PT', name: 'Portugal' },
  { code: 'ES', name: 'Espanha' },
  { code: 'FR', name: 'França' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'IT', name: 'Itália' },
  { code: 'GB-ENG', name: 'Inglaterra' },
  { code: 'NL', name: 'Holanda' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'UY', name: 'Uruguai' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'CL', name: 'Chile' },
  { code: 'PY', name: 'Paraguai' },
  { code: 'EC', name: 'Equador' },
  { code: 'PE', name: 'Peru' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'MX', name: 'México' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'CA', name: 'Canadá' },
  { code: 'HR', name: 'Croácia' },
  { code: 'CH', name: 'Suíça' },
  { code: 'NO', name: 'Noruega' },
  { code: 'SE', name: 'Suécia' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'PL', name: 'Polônia' },
  { code: 'AT', name: 'Áustria' },
  { code: 'TR', name: 'Turquia' },
  { code: 'UA', name: 'Ucrânia' },
  { code: 'MA', name: 'Marrocos' },
  { code: 'SN', name: 'Senegal' },
  { code: 'NG', name: 'Nigéria' },
  { code: 'EG', name: 'Egito' },
  { code: 'JP', name: 'Japão' },
  { code: 'KR', name: 'Coreia do Sul' },
  { code: 'SA', name: 'Arábia Saudita' },
];

export function findCountryByName(name: string): CountryOption | undefined {
  const normalized = name.trim().toLowerCase();
  return FOOTBALL_COUNTRIES.find(
    (c) => c.name.toLowerCase() === normalized || c.code.toLowerCase() === normalized
  );
}
