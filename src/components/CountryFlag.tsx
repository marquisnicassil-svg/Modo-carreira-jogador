import { Globe } from 'lucide-react';
import { findCountryByName } from '../utils/countries';

interface CountryFlagProps {
  country: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CountryFlag({ country, size = 'md' }: CountryFlagProps) {
  const match = findCountryByName(country);
  const code = match?.code || '';

  const dims =
    size === 'sm'
      ? 'w-5 h-3.5 rounded-[3px]'
      : size === 'lg'
      ? 'w-8 h-5 rounded-[4px]'
      : 'w-6 h-4 rounded-[3px]';

  const renderFlagSvg = () => {
    switch (code) {
      case 'BR':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#009B3A" />
            <polygon points="18,3 33,12 18,21 3,12" fill="#FEDF00" />
            <circle cx="18" cy="12" r="5" fill="#002776" />
            <path d="M13.5,11.2 Q18,10.2 22.5,12.8" stroke="#FFFFFF" strokeWidth="1" fill="none" />
          </svg>
        );
      case 'AR':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="8" y="0" fill="#74ACDF" />
            <rect width="36" height="8" y="8" fill="#FFFFFF" />
            <rect width="36" height="8" y="16" fill="#74ACDF" />
            <circle cx="18" cy="12" r="2.6" fill="#F6B40E" />
          </svg>
        );
      case 'PT':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="14" height="24" x="0" fill="#006600" />
            <rect width="22" height="24" x="14" fill="#FF0000" />
            <circle cx="14" cy="12" r="4" fill="#FFCC00" />
            <rect x="12.5" y="10" width="3" height="4" rx="0.5" fill="#FFFFFF" stroke="#003399" strokeWidth="0.8" />
          </svg>
        );
      case 'ES':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="6" y="0" fill="#AA151B" />
            <rect width="36" height="12" y="6" fill="#F1BF00" />
            <rect width="36" height="6" y="18" fill="#AA151B" />
            <rect x="8" y="9" width="4" height="6" rx="1" fill="#AA151B" />
          </svg>
        );
      case 'FR':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="12" height="24" x="0" fill="#002395" />
            <rect width="12" height="24" x="12" fill="#FFFFFF" />
            <rect width="12" height="24" x="24" fill="#ED2939" />
          </svg>
        );
      case 'DE':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="8" y="0" fill="#111111" />
            <rect width="36" height="8" y="8" fill="#DD0000" />
            <rect width="36" height="8" y="16" fill="#FFCE00" />
          </svg>
        );
      case 'IT':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="12" height="24" x="0" fill="#009246" />
            <rect width="12" height="24" x="12" fill="#FFFFFF" />
            <rect width="12" height="24" x="24" fill="#CE2B37" />
          </svg>
        );
      case 'GB-ENG':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#FFFFFF" />
            <rect x="15" y="0" width="6" height="24" fill="#CE1124" />
            <rect x="0" y="9" width="36" height="6" fill="#CE1124" />
          </svg>
        );
      case 'NL':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="8" y="0" fill="#AE1C28" />
            <rect width="36" height="8" y="8" fill="#FFFFFF" />
            <rect width="36" height="8" y="16" fill="#21468B" />
          </svg>
        );
      case 'BE':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="12" height="24" x="0" fill="#111111" />
            <rect width="12" height="24" x="12" fill="#FAE042" />
            <rect width="12" height="24" x="24" fill="#ED2939" />
          </svg>
        );
      case 'UY':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#FFFFFF" />
            <rect width="36" height="3" y="3" fill="#0038A8" />
            <rect width="36" height="3" y="9" fill="#0038A8" />
            <rect width="36" height="3" y="15" fill="#0038A8" />
            <rect width="36" height="3" y="21" fill="#0038A8" />
            <rect width="13" height="12" fill="#FFFFFF" />
            <circle cx="6.5" cy="6" r="3" fill="#FCD116" />
          </svg>
        );
      case 'CO':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="12" y="0" fill="#FCD116" />
            <rect width="36" height="6" y="12" fill="#003893" />
            <rect width="36" height="6" y="18" fill="#CE1126" />
          </svg>
        );
      case 'CL':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="12" y="0" fill="#FFFFFF" />
            <rect width="36" height="12" y="12" fill="#D52B1E" />
            <rect width="12" height="12" fill="#0039A6" />
            <circle cx="6" cy="6" r="2.2" fill="#FFFFFF" />
          </svg>
        );
      case 'PY':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="8" y="0" fill="#D52B1E" />
            <rect width="36" height="8" y="8" fill="#FFFFFF" />
            <rect width="36" height="8" y="16" fill="#0038A8" />
            <circle cx="18" cy="12" r="2.3" fill="#FCD116" />
          </svg>
        );
      case 'EC':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="12" y="0" fill="#FFD100" />
            <rect width="36" height="6" y="12" fill="#034EA2" />
            <rect width="36" height="6" y="18" fill="#EF3340" />
            <circle cx="18" cy="12" r="2.5" fill="#7A5230" />
          </svg>
        );
      case 'PE':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="12" height="24" x="0" fill="#D91023" />
            <rect width="12" height="24" x="12" fill="#FFFFFF" />
            <rect width="12" height="24" x="24" fill="#D91023" />
          </svg>
        );
      case 'VE':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="8" y="0" fill="#FCE300" />
            <rect width="36" height="8" y="8" fill="#00247D" />
            <rect width="36" height="8" y="16" fill="#CF142B" />
            <path d="M13,13 Q18,10 23,13" stroke="#FFFFFF" strokeWidth="1.3" strokeDasharray="1.5,1.5" fill="none" />
          </svg>
        );
      case 'MX':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="12" height="24" x="0" fill="#006847" />
            <rect width="12" height="24" x="12" fill="#FFFFFF" />
            <rect width="12" height="24" x="24" fill="#CE1126" />
            <circle cx="18" cy="12" r="2.5" fill="#8C5A2B" />
          </svg>
        );
      case 'US':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#B22234" />
            <rect width="36" height="3" y="3" fill="#FFFFFF" />
            <rect width="36" height="3" y="9" fill="#FFFFFF" />
            <rect width="36" height="3" y="15" fill="#FFFFFF" />
            <rect width="36" height="3" y="21" fill="#FFFFFF" />
            <rect width="15" height="12" fill="#3C3B6E" />
          </svg>
        );
      case 'CA':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="9" height="24" x="0" fill="#FF0000" />
            <rect width="18" height="24" x="9" fill="#FFFFFF" />
            <rect width="9" height="24" x="27" fill="#FF0000" />
            <polygon points="18,6 20,11 23,11 20,14 21,18 18,16 15,18 16,14 13,11 16,11" fill="#FF0000" />
          </svg>
        );
      case 'HR':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="8" y="0" fill="#FF0000" />
            <rect width="36" height="8" y="8" fill="#FFFFFF" />
            <rect width="36" height="8" y="16" fill="#171796" />
            <rect x="15" y="7" width="6" height="7" fill="#FF0000" stroke="#FFFFFF" strokeWidth="0.6" />
          </svg>
        );
      case 'CH':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#D52B1E" />
            <rect x="15.5" y="5" width="5" height="14" fill="#FFFFFF" />
            <rect x="11" y="9.5" width="14" height="5" fill="#FFFFFF" />
          </svg>
        );
      case 'NO':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#BA0C2F" />
            <rect x="10" y="0" width="6" height="24" fill="#FFFFFF" />
            <rect x="0" y="9" width="36" height="6" fill="#FFFFFF" />
            <rect x="11.5" y="0" width="3" height="24" fill="#00205B" />
            <rect x="0" y="10.5" width="36" height="3" fill="#00205B" />
          </svg>
        );
      case 'SE':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#006AA7" />
            <rect x="10" y="0" width="5" height="24" fill="#FECC02" />
            <rect x="0" y="9.5" width="36" height="5" fill="#FECC02" />
          </svg>
        );
      case 'DK':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#C8102E" />
            <rect x="10" y="0" width="4" height="24" fill="#FFFFFF" />
            <rect x="0" y="10" width="36" height="4" fill="#FFFFFF" />
          </svg>
        );
      case 'PL':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="12" y="0" fill="#FFFFFF" />
            <rect width="36" height="12" y="12" fill="#DC143C" />
          </svg>
        );
      case 'AT':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="8" y="0" fill="#ED2939" />
            <rect width="36" height="8" y="8" fill="#FFFFFF" />
            <rect width="36" height="8" y="16" fill="#ED2939" />
          </svg>
        );
      case 'TR':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#E30A17" />
            <circle cx="14" cy="12" r="5" fill="#FFFFFF" />
            <circle cx="15.5" cy="12" r="4" fill="#E30A17" />
            <circle cx="20.5" cy="12" r="1.5" fill="#FFFFFF" />
          </svg>
        );
      case 'UA':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="12" y="0" fill="#0057B7" />
            <rect width="36" height="12" y="12" fill="#FFD700" />
          </svg>
        );
      case 'MA':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#C1272D" />
            <polygon
              points="18,6 20,12 25,12 21,15 22,20 18,17 14,20 15,15 11,12 16,12"
              fill="none"
              stroke="#006233"
              strokeWidth="1.5"
            />
          </svg>
        );
      case 'SN':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="12" height="24" x="0" fill="#00853F" />
            <rect width="12" height="24" x="12" fill="#FDEF42" />
            <rect width="12" height="24" x="24" fill="#E31B23" />
            <circle cx="18" cy="12" r="2.2" fill="#00853F" />
          </svg>
        );
      case 'NG':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="12" height="24" x="0" fill="#008751" />
            <rect width="12" height="24" x="12" fill="#FFFFFF" />
            <rect width="12" height="24" x="24" fill="#008751" />
          </svg>
        );
      case 'EG':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="8" y="0" fill="#CE1126" />
            <rect width="36" height="8" y="8" fill="#FFFFFF" />
            <rect width="36" height="8" y="16" fill="#111111" />
            <circle cx="18" cy="12" r="2.2" fill="#C09300" />
          </svg>
        );
      case 'JP':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#FFFFFF" />
            <circle cx="18" cy="12" r="6" fill="#BC002D" />
          </svg>
        );
      case 'KR':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#FFFFFF" />
            <path d="M18,7 A5,5 0 0,1 18,17 A2.5,2.5 0 0,1 18,12 A2.5,2.5 0 0,0 18,7" fill="#CD2E3A" />
            <path d="M18,17 A5,5 0 0,1 18,7 A2.5,2.5 0 0,1 18,12 A2.5,2.5 0 0,0 18,17" fill="#0047A0" />
          </svg>
        );
      case 'SA':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#006C35" />
            <rect x="9" y="14" width="18" height="2" rx="1" fill="#FFFFFF" />
            <rect x="11" y="9" width="14" height="2.5" rx="1" fill="#FFFFFF" />
          </svg>
        );
      case 'RS':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="8" y="0" fill="#C6363C" />
            <rect width="36" height="8" y="8" fill="#0C4076" />
            <rect width="36" height="8" y="16" fill="#FFFFFF" />
            <rect x="9" y="7" width="5" height="8" rx="1" fill="#FFFFFF" stroke="#C6363C" strokeWidth="0.8" />
          </svg>
        );
      case 'GR':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#0D5EAF" />
            <rect width="36" height="3" y="3" fill="#FFFFFF" />
            <rect width="36" height="3" y="9" fill="#FFFFFF" />
            <rect width="36" height="3" y="15" fill="#FFFFFF" />
            <rect width="36" height="3" y="21" fill="#FFFFFF" />
            <rect width="14" height="12" fill="#0D5EAF" />
            <rect x="5.5" y="0" width="3" height="12" fill="#FFFFFF" />
            <rect x="0" y="4.5" width="14" height="3" fill="#FFFFFF" />
          </svg>
        );
      case 'IE':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="12" height="24" x="0" fill="#169B62" />
            <rect width="12" height="24" x="12" fill="#FFFFFF" />
            <rect width="12" height="24" x="24" fill="#FF883E" />
          </svg>
        );
      case 'GB-SCT':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#005EB8" />
            <line x1="0" y1="0" x2="36" y2="24" stroke="#FFFFFF" strokeWidth="4" />
            <line x1="36" y1="0" x2="0" y2="24" stroke="#FFFFFF" strokeWidth="4" />
          </svg>
        );
      case 'CR':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="4" y="0" fill="#002B7F" />
            <rect width="36" height="4" y="4" fill="#FFFFFF" />
            <rect width="36" height="8" y="8" fill="#CE1126" />
            <rect width="36" height="4" y="16" fill="#FFFFFF" />
            <rect width="36" height="4" y="20" fill="#002B7F" />
          </svg>
        );
      case 'CI':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="12" height="24" x="0" fill="#F77F00" />
            <rect width="12" height="24" x="12" fill="#FFFFFF" />
            <rect width="12" height="24" x="24" fill="#009E60" />
          </svg>
        );
      case 'CM':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="12" height="24" x="0" fill="#007A5E" />
            <rect width="12" height="24" x="12" fill="#CE1126" />
            <rect width="12" height="24" x="24" fill="#FCD116" />
            <circle cx="18" cy="12" r="2.2" fill="#FCD116" />
          </svg>
        );
      case 'GH':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="8" y="0" fill="#CF0921" />
            <rect width="36" height="8" y="8" fill="#FCD20F" />
            <rect width="36" height="8" y="16" fill="#006B3F" />
            <circle cx="18" cy="12" r="2.3" fill="#111111" />
          </svg>
        );
      case 'DZ':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="18" height="24" x="0" fill="#006233" />
            <rect width="18" height="24" x="18" fill="#FFFFFF" />
            <circle cx="18" cy="12" r="4.5" fill="#D21034" />
            <circle cx="19.5" cy="12" r="3.5" fill="#FFFFFF" />
          </svg>
        );
      case 'AU':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#00008B" />
            <rect width="15" height="11" fill="#012169" />
            <rect x="6" y="0" width="3" height="11" fill="#FFFFFF" />
            <rect x="0" y="4" width="15" height="3" fill="#FFFFFF" />
            <rect x="6.5" y="0" width="2" height="11" fill="#C8102E" />
            <rect x="0" y="4.5" width="15" height="2" fill="#C8102E" />
            <circle cx="26" cy="7" r="1.3" fill="#FFFFFF" />
            <circle cx="29" cy="12" r="1.3" fill="#FFFFFF" />
            <circle cx="24" cy="15" r="1.3" fill="#FFFFFF" />
            <circle cx="27" cy="19" r="1.3" fill="#FFFFFF" />
          </svg>
        );
      default:
        return null;
    }
  };

  const svg = renderFlagSvg();
  if (!svg) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center bg-slate-800 border border-white/15 text-slate-300 shrink-0 ${dims}`}
      >
        <Globe className="h-3 w-3" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      className={`inline-block overflow-hidden border border-white/15 shadow-sm shrink-0 ${dims}`}
      aria-hidden="true"
    >
      {svg}
    </span>
  );
}
