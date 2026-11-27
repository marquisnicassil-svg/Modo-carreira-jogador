export const SYNAPSE_CONFIG = {
  appName: 'Modo carreira',
  appId: 'syn_app_ibbfcn6yjw6v',
  portalUrl: 'https://marquisnicassil-svg.github.io/Servidor-telegram/index.html',
  portalOrigin: 'https://marquisnicassil-svg.github.io',
  authApiUrl: 'https://hqnlyksuprjdabcgpqdl.supabase.co',
  publicAnonKey: 'sb_publishable_VNDxq3Hxp1Ly5tFF7BMBuQ_imQDmVSa',
} as const;

const STATE_STORAGE_KEY = 'synapse_oauth_state_v1';
const SESSION_STORAGE_KEY = 'synapse_auth_session_v1';

export interface SynapseSession {
  uid: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken?: string;
  appId?: string;
  provider: 'synapse_sso' | 'synapse_password';
  authenticatedAt: string;
}

export interface SynapseAuthPayload {
  synapse_access_token?: string;
  access_token?: string;
  synapse_refresh_token?: string;
  refresh_token?: string;
  synapse_uid?: string;
  uid?: string;
  synapse_email?: string;
  email?: string;
  synapse_name?: string;
  name?: string;
  synapse_app_id?: string;
  app_id?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

export function generateSynapseState(): string {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function saveSynapsePendingState(state: string): void {
  try {
    sessionStorage.setItem(STATE_STORAGE_KEY, state);
  } catch {
    // Ignore storage quota issues safely
  }
}

export function consumeSynapsePendingState(): string | null {
  try {
    const saved = sessionStorage.getItem(STATE_STORAGE_KEY);
    sessionStorage.removeItem(STATE_STORAGE_KEY);
    return saved;
  } catch {
    return null;
  }
}

export function peekSynapsePendingState(): string | null {
  try {
    return sessionStorage.getItem(STATE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getSynapseCallbackUrl(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
}

export function buildSynapsePortalUrl(state: string, mode?: 'popup'): string {
  const url = new URL(SYNAPSE_CONFIG.portalUrl);
  url.searchParams.set('synapse_auth', '1');
  url.searchParams.set('app_id', SYNAPSE_CONFIG.appId);
  url.searchParams.set('app_name', SYNAPSE_CONFIG.appName);
  url.searchParams.set('redirect_uri', getSynapseCallbackUrl());
  url.searchParams.set('state', state);
  if (mode === 'popup') {
    url.searchParams.set('mode', 'popup');
  }
  return url.toString();
}

export function loadSynapseSession(): SynapseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SynapseSession>;
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.accessToken === 'string' &&
      parsed.accessToken.length > 0 &&
      typeof parsed.email === 'string'
    ) {
      return {
        uid: parsed.uid || '',
        email: parsed.email,
        name: parsed.name || parsed.email.split('@')[0] || 'Usuário Synapse',
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        appId: parsed.appId || SYNAPSE_CONFIG.appId,
        provider: parsed.provider === 'synapse_password' ? 'synapse_password' : 'synapse_sso',
        authenticatedAt: parsed.authenticatedAt || new Date().toISOString(),
      };
    }
  } catch {
    // Ignore invalid storage JSON
  }
  return null;
}

export function saveSynapseSession(session: SynapseSession | null): void {
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota issues safely
  }
}

export function parseSynapseHashParams(hash: string): SynapseAuthPayload | null {
  if (!hash || !hash.startsWith('#')) return null;
  const raw = hash.slice(1);
  if (!raw.includes('synapse_access_token') && !raw.includes('error=')) {
    return null;
  }
  const params = new URLSearchParams(raw);
  return {
    synapse_access_token: params.get('synapse_access_token') || undefined,
    synapse_refresh_token: params.get('synapse_refresh_token') || undefined,
    synapse_uid: params.get('synapse_uid') || undefined,
    synapse_email: params.get('synapse_email') || undefined,
    synapse_name: params.get('synapse_name') || undefined,
    synapse_app_id: params.get('synapse_app_id') || undefined,
    state: params.get('state') || undefined,
    error: params.get('error') || undefined,
    error_description: params.get('error_description') || undefined,
  };
}

export function clearUrlHash(): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, '', cleanUrl);
  } catch {
    // Ignore history API restrictions
  }
}

export function buildSessionFromPayload(
  payload: SynapseAuthPayload
): { session: SynapseSession | null; error?: string } {
  if (payload.error) {
    return {
      session: null,
      error: payload.error_description || 'Autorização cancelada ou recusada no Synapse.',
    };
  }

  const accessToken = payload.synapse_access_token || payload.access_token;
  if (!accessToken) {
    return { session: null, error: 'Token de acesso não recebido do Synapse.' };
  }

  const expectedState = consumeSynapsePendingState();
  if (!expectedState || !payload.state || payload.state !== expectedState) {
    return {
      session: null,
      error: 'Falha na validação de segurança (state inválido). Tente entrar novamente.',
    };
  }

  const email = (payload.synapse_email || payload.email || '').trim();
  const uid = (payload.synapse_uid || payload.uid || '').trim();
  const rawName = (payload.synapse_name || payload.name || '').trim();
  const name = rawName || (email ? email.split('@')[0] : 'Jogador Synapse');

  return {
    session: {
      uid,
      email,
      name,
      accessToken,
      refreshToken: payload.synapse_refresh_token || payload.refresh_token,
      appId: payload.synapse_app_id || payload.app_id || SYNAPSE_CONFIG.appId,
      provider: 'synapse_sso',
      authenticatedAt: new Date().toISOString(),
    },
  };
}

interface SupabaseUserResponse {
  id?: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    display_name?: string;
  };
}

interface SupabaseAuthResponse {
  access_token?: string;
  refresh_token?: string;
  user?: SupabaseUserResponse;
  error?: string;
  error_description?: string;
  msg?: string;
  message?: string;
}

function translateAuthError(rawMsg: string | undefined): string {
  const msg = (rawMsg || '').toLowerCase();
  if (msg.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de fazer login.';
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Este e-mail já possui uma conta Synapse. Use a aba Entrar.';
  }
  if (msg.includes('password should be at least')) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }
  if (msg.includes('unable to validate email')) {
    return 'Informe um endereço de e-mail válido.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Muitas tentativas seguidas. Aguarde alguns instantes.';
  }
  return rawMsg || 'Não foi possível concluir a autenticação no Synapse.';
}

function extractNameFromSupabaseUser(user: SupabaseUserResponse | undefined, email: string): string {
  const metaName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.display_name;
  if (metaName && metaName.trim()) return metaName.trim();
  if (email) return email.split('@')[0];
  return 'Usuário Synapse';
}

export async function fetchSynapseCurrentUser(
  accessToken: string
): Promise<{ uid: string; email: string; name: string } | null> {
  try {
    const res = await fetch(`${SYNAPSE_CONFIG.authApiUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        apikey: SYNAPSE_CONFIG.publicAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SupabaseUserResponse;
    const email = (data.email || '').trim();
    return {
      uid: data.id || '',
      email,
      name: extractNameFromSupabaseUser(data, email),
    };
  } catch {
    return null;
  }
}

export async function signInWithSynapsePassword(
  email: string,
  password: string
): Promise<{ session?: SynapseSession; error?: string }> {
  const cleanEmail = email.trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { error: 'Informe um e-mail válido.' };
  }
  if (!password) {
    return { error: 'Informe sua senha.' };
  }

  try {
    const res = await fetch(
      `${SYNAPSE_CONFIG.authApiUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          apikey: SYNAPSE_CONFIG.publicAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      }
    );

    const data = (await res.json()) as SupabaseAuthResponse;
    if (!res.ok || !data.access_token) {
      return {
        error: translateAuthError(data.error_description || data.msg || data.message || data.error),
      };
    }

    const verifiedEmail = (data.user?.email || cleanEmail).trim();
    return {
      session: {
        uid: data.user?.id || '',
        email: verifiedEmail,
        name: extractNameFromSupabaseUser(data.user, verifiedEmail),
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        appId: SYNAPSE_CONFIG.appId,
        provider: 'synapse_password',
        authenticatedAt: new Date().toISOString(),
      },
    };
  } catch {
    return { error: 'Erro de conexão ao acessar o servidor Synapse.' };
  }
}

export async function signUpWithSynapsePassword(
  email: string,
  password: string,
  name?: string
): Promise<{ session?: SynapseSession; requiresEmailConfirmation?: boolean; error?: string }> {
  const cleanEmail = email.trim();
  const cleanName = (name || '').trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { error: 'Informe um e-mail válido.' };
  }
  if (password.length < 6) {
    return { error: 'A senha precisa ter pelo menos 6 caracteres.' };
  }

  try {
    const bodyPayload: {
      email: string;
      password: string;
      data?: { full_name: string; name: string };
    } = {
      email: cleanEmail,
      password,
    };
    if (cleanName) {
      bodyPayload.data = { full_name: cleanName, name: cleanName };
    }

    const res = await fetch(`${SYNAPSE_CONFIG.authApiUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        apikey: SYNAPSE_CONFIG.publicAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = (await res.json()) as SupabaseAuthResponse;
    if (!res.ok) {
      return {
        error: translateAuthError(data.error_description || data.msg || data.message || data.error),
      };
    }

    if (!data.access_token) {
      return { requiresEmailConfirmation: true };
    }

    const verifiedEmail = (data.user?.email || cleanEmail).trim();
    return {
      session: {
        uid: data.user?.id || '',
        email: verifiedEmail,
        name: cleanName || extractNameFromSupabaseUser(data.user, verifiedEmail),
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        appId: SYNAPSE_CONFIG.appId,
        provider: 'synapse_password',
        authenticatedAt: new Date().toISOString(),
      },
    };
  } catch {
    return { error: 'Erro de conexão ao criar conta no Synapse.' };
  }
}

export function getSynapseAccountKey(session: SynapseSession | null): string | null {
  if (!session) return null;
  const uid = (session.uid || '').trim();
  if (uid) return uid;
  const email = (session.email || '').trim().toLowerCase();
  return email || null;
}

