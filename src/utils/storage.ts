import { CareerProfile } from '../types/career';

const STORAGE_KEY = 'modo_carreira_saves_v1';
const ACTIVE_ID_KEY = 'modo_carreira_active_id_v1';

export interface StoredWorkspace {
  careers: CareerProfile[];
  activeCareerId: string | null;
}

export function loadWorkspace(): StoredWorkspace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const activeRaw = localStorage.getItem(ACTIVE_ID_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CareerProfile[];
      if (Array.isArray(parsed)) {
        // Strip the previously seeded demo career if present
        const cleaned = parsed.filter((c) => c.id !== 'endrick-milan-demo');
        if (cleaned.length > 0) {
          const validActive =
            activeRaw && cleaned.some((c) => c.id === activeRaw) ? activeRaw : cleaned[0].id;
          return {
            careers: cleaned,
            activeCareerId: validActive,
          };
        }
      }
    }
  } catch {
    // Fallback cleanly to empty workspace
  }

  return {
    careers: [],
    activeCareerId: null,
  };
}

export function saveWorkspace(careers: CareerProfile[], activeCareerId: string | null): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(careers));
    if (activeCareerId) {
      localStorage.setItem(ACTIVE_ID_KEY, activeCareerId);
    } else {
      localStorage.removeItem(ACTIVE_ID_KEY);
    }
  } catch {
    // Ignore storage quota issues safely
  }
}

export function exportCareerJson(careers: CareerProfile[]): void {
  const payload = {
    app: 'modo-carreira',
    exportedAt: new Date().toISOString(),
    careers,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `modo-carreira-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportedCareers(jsonText: string): CareerProfile[] | null {
  try {
    const parsed = JSON.parse(jsonText);
    const list: unknown = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && Array.isArray((parsed as { careers?: unknown }).careers)
      ? (parsed as { careers: unknown[] }).careers
      : null;

    if (!Array.isArray(list) || list.length === 0) return null;

    const valid = list.filter(
      (item): item is CareerProfile =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as CareerProfile).id === 'string' &&
        typeof (item as CareerProfile).playerName === 'string' &&
        Array.isArray((item as CareerProfile).seasons)
    );

    return valid.length > 0 ? valid : null;
  } catch {
    return null;
  }
}
