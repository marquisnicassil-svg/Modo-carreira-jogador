import { AppSettings, CareerProfile, DEFAULT_APP_SETTINGS } from '../types/career';

const STORAGE_KEY = 'modo_carreira_saves_v1';
const ACTIVE_ID_KEY = 'modo_carreira_active_id_v1';
const SETTINGS_KEY = 'modo_carreira_settings_v1';
const LEGACY_MIGRATED_KEY = 'modo_carreira_legacy_migrated_v1';

export interface StoredWorkspace {
  careers: CareerProfile[];
  activeCareerId: string | null;
}

function getAccountScopeKey(accountId: string): string {
  return encodeURIComponent(accountId.trim().toLowerCase());
}

export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      if (parsed && typeof parsed === 'object') {
        const validTheme =
          parsed.themeStyle === 'midnight' ||
          parsed.themeStyle === 'amoled' ||
          parsed.themeStyle === 'light'
            ? parsed.themeStyle
            : DEFAULT_APP_SETTINGS.themeStyle;
        return {
          ...DEFAULT_APP_SETTINGS,
          ...parsed,
          themeStyle: validTheme,
        };
      }
    }
  } catch {
    // Fallback cleanly to defaults
  }
  return { ...DEFAULT_APP_SETTINGS };
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota issues safely
  }
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

export function loadAccountWorkspace(accountId: string | null): StoredWorkspace {
  if (!accountId || !accountId.trim()) {
    return { careers: [], activeCareerId: null };
  }

  const scope = getAccountScopeKey(accountId);
  const scopedSavesKey = `${STORAGE_KEY}_acc_${scope}`;
  const scopedActiveKey = `${ACTIVE_ID_KEY}_acc_${scope}`;

  try {
    const raw = localStorage.getItem(scopedSavesKey);
    const activeRaw = localStorage.getItem(scopedActiveKey);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as CareerProfile[];
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((c) => c.id !== 'endrick-milan-demo');
        const validActive =
          cleaned.length > 0
            ? activeRaw && cleaned.some((c) => c.id === activeRaw)
              ? activeRaw
              : cleaned[0].id
            : null;
        return {
          careers: cleaned,
          activeCareerId: validActive,
        };
      }
    }

    // One-time migration of pre-login local careers to the first authenticated account
    const alreadyMigrated = localStorage.getItem(LEGACY_MIGRATED_KEY);
    if (!alreadyMigrated) {
      const legacy = loadWorkspace();
      if (legacy.careers.length > 0) {
        localStorage.setItem(scopedSavesKey, JSON.stringify(legacy.careers));
        if (legacy.activeCareerId) {
          localStorage.setItem(scopedActiveKey, legacy.activeCareerId);
        }
        localStorage.setItem(LEGACY_MIGRATED_KEY, scope);
        return legacy;
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

export function saveAccountWorkspace(
  accountId: string | null,
  careers: CareerProfile[],
  activeCareerId: string | null
): void {
  if (!accountId || !accountId.trim()) return;

  const scope = getAccountScopeKey(accountId);
  const scopedSavesKey = `${STORAGE_KEY}_acc_${scope}`;
  const scopedActiveKey = `${ACTIVE_ID_KEY}_acc_${scope}`;

  try {
    localStorage.setItem(scopedSavesKey, JSON.stringify(careers));
    if (activeCareerId) {
      localStorage.setItem(scopedActiveKey, activeCareerId);
    } else {
      localStorage.removeItem(scopedActiveKey);
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
