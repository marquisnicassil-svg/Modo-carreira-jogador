import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Mail,
  Settings,
  ShieldCheck,
  Trophy,
  User,
  UserPlus,
} from 'lucide-react';
import {
  signInWithSynapsePassword,
  signUpWithSynapsePassword,
  SynapseSession,
} from '../utils/synapseAuth';

interface LoginScreenProps {
  ssoWaiting: boolean;
  ssoPopupBlocked: boolean;
  externalError: string | null;
  toastMessage?: string | null;
  onStartSynapseSso: (mode: 'popup' | 'redirect') => void;
  onAuthenticated: (session: SynapseSession) => void;
  onOpenSettings: () => void;
}

type AuthFormMode = 'login' | 'signup';

export function LoginScreen({
  ssoWaiting,
  ssoPopupBlocked,
  externalError,
  toastMessage,
  onStartSynapseSso,
  onAuthenticated,
  onOpenSettings,
}: LoginScreenProps) {
  const [formMode, setFormMode] = useState<AuthFormMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const displayedError = errorMsg || externalError;

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    if (formMode === 'login') {
      const result = await signInWithSynapsePassword(email, password);
      setLoading(false);
      if (result.error) {
        setErrorMsg(result.error);
        return;
      }
      if (result.session) {
        onAuthenticated(result.session);
      }
      return;
    }

    const result = await signUpWithSynapsePassword(email, password, name);
    setLoading(false);
    if (result.error) {
      setErrorMsg(result.error);
      return;
    }
    if (result.requiresEmailConfirmation) {
      setInfoMsg(
        'Conta criada! Verifique seu e-mail para confirmar o cadastro e depois faça login.'
      );
      setFormMode('login');
      return;
    }
    if (result.session) {
      onAuthenticated(result.session);
    }
  };

  return (
    <div className="min-h-app bg-[#080D1A] text-slate-100 flex flex-col">
      {/* Minimal Top Bar */}
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#080D1A]/98 pt-safe gpu-layer">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:h-16 md:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/15 text-blue-400"
            >
              <Trophy className="h-4.5 w-4.5" />
            </div>
            <span className="font-display text-lg sm:text-xl font-extrabold tracking-wide text-white uppercase whitespace-nowrap">
              Modo Carreira
            </span>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSettings}
            aria-label="Abrir configurações"
            title="Configurações"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.08] px-3 text-xs font-semibold text-white transition-colors hover:bg-white/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap"
          >
            <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Configurações</span>
          </motion.button>
        </div>
      </header>

      {/* Centered Login Gate */}
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-8 sm:py-12 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="w-full max-w-md rounded-xl border border-blue-500/35 bg-blue-600/15 px-4 py-3 text-xs sm:text-sm font-medium text-blue-100"
          >
            {toastMessage}
          </div>
        )}

        <motion.section
          aria-labelledby="login-screen-title"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-2xl border border-white/[0.09] bg-[#11192D] p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Identity Header */}
          <div className="text-center space-y-2">
            <div
              aria-hidden="true"
              className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-600/15 text-blue-400"
            >
              <ShieldCheck className="h-6.5 w-6.5" />
            </div>
            <h1
              id="login-screen-title"
              className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wide leading-tight"
            >
              Entrar no Modo Carreira
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Acesse sua conta Synapse para carregar seus jogadores criados, temporadas e títulos.
            </p>
          </div>

          {displayedError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/35 bg-rose-500/15 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-rose-200"
            >
              {displayedError}
            </div>
          )}

          {infoMsg && (
            <div
              role="status"
              className="rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-emerald-300"
            >
              {infoMsg}
            </div>
          )}

          {/* Primary 1-Click Synapse Portal SSO */}
          <div className="space-y-2.5">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setErrorMsg(null);
                setInfoMsg(null);
                onStartSynapseSso('popup');
              }}
              className="w-full min-h-[50px] inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {ssoWaiting ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin shrink-0" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              )}
              <span>{ssoWaiting ? 'Aguardando Synapse...' : 'Entrar com Synapse'}</span>
            </motion.button>

            {ssoPopupBlocked && (
              <button
                type="button"
                onClick={() => onStartSynapseSso('redirect')}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/20"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Janela bloqueada · Abrir login nesta aba</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-white/[0.08]" aria-hidden="true" />
            <span className="text-[11px] font-medium text-slate-400">
              ou acesse com e-mail e senha
            </span>
            <span className="h-px flex-1 bg-white/[0.08]" aria-hidden="true" />
          </div>

          {/* Direct Email / Password Mode Tabs */}
          <div
            role="tablist"
            aria-label="Entrar ou criar conta Synapse"
            className="grid grid-cols-2 gap-1 rounded-xl border border-white/[0.08] bg-[#0B1222] p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={formMode === 'login'}
              onClick={() => {
                setFormMode('login');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors ${
                formMode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={formMode === 'signup'}
              onClick={() => {
                setFormMode('signup');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors ${
                formMode === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={(e) => void handleSubmitForm(e)} className="space-y-3">
            {formMode === 'signup' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="login-screen-name"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Nome do treinador (opcional)
                </label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="login-screen-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como deseja ser chamado"
                    className="w-full min-h-[44px] rounded-xl border border-white/10 bg-[#0B1222] pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="login-screen-email"
                className="block text-xs font-semibold text-slate-300"
              >
                E-mail Synapse
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="login-screen-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full min-h-[44px] rounded-xl border border-white/10 bg-[#0B1222] pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-screen-password"
                className="block text-xs font-semibold text-slate-300"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="login-screen-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={formMode === 'signup' ? 6 : 1}
                  autoComplete={formMode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={formMode === 'signup' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                  className="w-full min-h-[44px] rounded-xl border border-white/10 bg-[#0B1222] pl-3.5 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : formMode === 'login' ? (
                <LogIn className="h-4 w-4" aria-hidden="true" />
              ) : (
                <UserPlus className="h-4 w-4" aria-hidden="true" />
              )}
              <span>
                {loading
                  ? 'Conectando...'
                  : formMode === 'login'
                    ? 'Entrar com e-mail'
                    : 'Criar conta Synapse'}
              </span>
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-white/[0.06]">
            Seus jogadores criados, estatísticas e troféus ficam organizados por conta Synapse.
          </p>
        </motion.section>
      </main>
    </div>
  );
}
