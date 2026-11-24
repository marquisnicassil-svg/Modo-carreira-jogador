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

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to legacy execCommand below (common in file:// or restricted WebViews)
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function buildCareerBackupJson(careers: CareerProfile[]): string {
  const payload = {
    app: 'modo-carreira',
    exportedAt: new Date().toISOString(),
    careers,
  };
  return JSON.stringify(payload, null, 2);
}

export async function exportCareerJson(
  careers: CareerProfile[]
): Promise<'shared' | 'downloaded' | 'copied' | 'failed'> {
  const jsonText = buildCareerBackupJson(careers);
  const fileName = `modo-carreira-backup-${new Date().toISOString().slice(0, 10)}.json`;

  const isMobileOrWebView =
    typeof navigator !== 'undefined' &&
    (/android|iphone|ipad|ipod|wv/i.test(navigator.userAgent) ||
      'ontouchstart' in window);

  if (isMobileOrWebView && typeof navigator.share === 'function') {
    try {
      const file = new File([jsonText], fileName, { type: 'application/json' });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Backup Modo Carreira',
          files: [file],
        });
        return 'shared';
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'shared';
      }
      // Fall through to download / clipboard if WebView share failed
    }
  }

  try {
    // Data URI works much more reliably than blob: in Android WebView DownloadListeners
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonText)}`;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 500);
    return 'downloaded';
  } catch {
    const copied = await copyTextToClipboard(jsonText);
    return copied ? 'copied' : 'failed';
  }
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
