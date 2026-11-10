import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { entrarComGoogle, type LoginResponse } from "../../axios/Axios";
import { apiError, apiStatus } from "../../axios/apiError";

interface IdentityApi {
  initialize: (options: { client_id: string; callback: (response: { credential: string }) => void; auto_select: boolean }) => void;
  renderButton: (container: HTMLElement, options: { theme: string; size: string; locale: string; width: number; text: string }) => void;
}
declare global { interface Window { google?: { accounts: { id: IdentityApi } } } }
let sdkPromise: Promise<IdentityApi> | null = null;
let initializedClientId = "";
let credentialHandler: ((credential: string) => void) | null = null;
function loadGoogle() {
  if (window.google?.accounts.id) return Promise.resolve(window.google.accounts.id);
  if (!sdkPromise) sdkPromise = new Promise<IdentityApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client?hl=pt-BR";
    script.async = true;
    const timeout = window.setTimeout(() => { script.remove(); sdkPromise = null; reject(new Error("Tempo esgotado.")); }, 15000);
    script.onload = () => { window.clearTimeout(timeout); if (window.google?.accounts.id) resolve(window.google.accounts.id); else { sdkPromise = null; reject(new Error("Provedor indisponível.")); } };
    script.onerror = () => { window.clearTimeout(timeout); script.remove(); sdkPromise = null; reject(new Error("Provedor indisponível.")); };
    document.head.append(script);
  });
  return sdkPromise;
}

// Ícone do Google usado no botão próprio; o provedor também renderiza o seu.
function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

// Mensagens próprias do fluxo do Google; os códigos genéricos seguem em apiError.
function googleErrorMessage(cause: unknown, fallback: string) {
  const status = apiStatus(cause);
  if (status === 400) return "Não foi possível validar o acesso com Google. Tente novamente.";
  if (status === 401) return "A autenticação com Google falhou ou expirou. Tente novamente ou use e-mail e senha.";
  if (status === 404) return "Empresa ainda não cadastrada. Abra o cadastro de empresa e selecione a opção Google.";
  if (status === 403) {
    const data = axios.isAxiosError(cause) ? cause.response?.data : undefined;
    const serverMessage = data && typeof data === "object" && "error" in data ? String((data as { error: unknown }).error) : "";
    if (serverMessage.includes("não é de empresa")) return "Esta conta é pessoal. Selecione Comprador / Artesão para entrar.";
    if (serverMessage.includes("vínculo")) return "Entre com e-mail e senha para confirmar o vínculo dessa conta antes de usar o Google.";
    return serverMessage.includes("ativada") || serverMessage.includes("inativa")
      ? "Sua conta está inativa ou precisa de confirmação. Use e-mail e senha ou contate o suporte."
      : "Confirme o e-mail da sua conta Google e tente novamente.";
  }
  if (status === 409) return "Este e-mail já está vinculado a outro acesso Google. Use o acesso original ou e-mail e senha.";
  if (status === 500 || status === 503) return "Login com Google indisponível no momento. Use e-mail e senha.";
  return apiError(cause, fallback);
}

const botaoSocial =
  "flex min-h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#E7E4DA] bg-white px-4 py-3 text-[15px] font-medium text-[#2F3D38] transition hover:bg-canvas";

// "entrar" no login e "criar" no cadastro: a mesma API faz login-ou-cadastro.
type GoogleVariant = "entrar" | "criar";

const variantText = {
  entrar: {
    botao: "Continuar com Google",
    indisponivel: "Entrar com Google",
    notaIndisponivel: "Entrada com Google indisponível no momento. Use e-mail e senha.",
    gsiText: "signin_with",
    validando: "Validando acesso...",
    nota: "Ao continuar, você entra no serviço do Google para autorizar o acesso à sua conta.",
    erroPadrao: "Não foi possível entrar com Google. Use e-mail e senha ou tente novamente.",
  },
  criar: {
    botao: "Criar conta com Google",
    indisponivel: "Criar conta com Google",
    notaIndisponivel: "Criação com Google indisponível no momento. Use o formulário de cadastro.",
    gsiText: "signup_with",
    validando: "Criando sua conta...",
    nota: "Ao continuar, o Google compartilha seu nome, e-mail e foto de perfil. A data de nascimento e o telefone não são fornecidos pelo Google por privacidade e podem ser completados no seu perfil após o acesso.",
    erroPadrao: "Não foi possível criar a conta com Google. Use o formulário ou tente novamente.",
  },
} as const;

export default function GoogleSignIn({ onSuccess, remember, variant = "entrar", onCredential, accountType }: { onSuccess: (data: LoginResponse, remember: boolean) => void; remember: boolean; variant?: GoogleVariant; onCredential?: (credential: string) => Promise<void>; accountType?: "company" }) {
  const text = variantText[variant];
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();
  const successRef = useRef(onSuccess);
  const rememberRef = useRef(remember);
  const credentialRef = useRef(onCredential);
  const accountTypeRef = useRef(accountType);
  useEffect(() => { accountTypeRef.current = accountType; }, [accountType]);
  useEffect(() => { credentialRef.current = onCredential; }, [onCredential]);
  useEffect(() => { successRef.current = onSuccess; rememberRef.current = remember; }, [onSuccess, remember]);
  const container = useRef<HTMLDivElement>(null);
  const [requested, setRequested] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 6000);
    return () => clearTimeout(t);
  }, [error]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!requested || !clientId) return;
    let active = true;
    let sending = false;
    credentialHandler = async credential => {
      if (!active || sending) return;
      if (typeof credential !== "string" || !credential) { setError("O Google não confirmou o acesso. Tente novamente."); return; }
      sending = true; setBusy(true); setError("");
      try { if (credentialRef.current) await credentialRef.current(credential); else { const response = await entrarComGoogle(credential, accountTypeRef.current); if (active) successRef.current(response.data, rememberRef.current); } }
      catch (cause) { if (active) setError(googleErrorMessage(cause, text.erroPadrao)); }
      finally { sending = false; if (active) setBusy(false); }
    };
    loadGoogle().then(api => {
      if (!active || !container.current) return;
      if (initializedClientId !== clientId) { api.initialize({ client_id: clientId, auto_select: false, callback: response => credentialHandler?.(response.credential) }); initializedClientId = clientId; }
      container.current.replaceChildren();
      api.renderButton(container.current, { theme: "outline", size: "large", locale: "pt-BR", width: Math.min(container.current.clientWidth || 280, 400), text: text.gsiText });
      setReady(true);
    }).catch(() => { if (active) setError("Não foi possível carregar o Google. Verifique sua conexão e tente novamente."); });
    return () => { active = false; credentialHandler = null; };
  }, [requested, attempt, clientId, text]);

  const rotulo = variant === "criar" ? "Criação de conta com Google" : "Entrada com Google";

  if (!clientId) {
    return (
      <section aria-label={rotulo} className="space-y-3">
        <button type="button" disabled className={`${botaoSocial} cursor-not-allowed text-[#6B7670] opacity-70`}>
          <GoogleIcon />
          {text.indisponivel}
        </button>
        <p className="text-xs text-gray-600">{text.notaIndisponivel}</p>
      </section>
    );
  }

  return (
    <section aria-label={rotulo} className="space-y-3">
      {!requested && (
        <button type="button" onClick={() => setRequested(true)} className={`${botaoSocial} cursor-pointer`}>
          <GoogleIcon />
          {text.botao}
        </button>
      )}
      <div ref={container} className={busy ? "pointer-events-none opacity-50" : ""} aria-busy={busy} />
      {requested && !ready && !error && <p role="status" className="text-xs">Carregando Google...</p>}
      {busy && <p role="status" className="text-sm">{text.validando}</p>}
      {error && (
        <div role="alert" className="space-y-2 text-sm text-red-800">
          <p>{error}</p>
          <button type="button" onClick={() => { setError(""); setReady(false); setAttempt(v => v + 1); }} className="cursor-pointer underline">Tentar novamente</button>
        </div>
      )}
      <p className="text-xs text-gray-600">{onCredential ? "O Google confirmará seu e-mail. Os dados da empresa preenchidos no formulário serão enviados para criar a conta, sem senha local." : text.nota}</p>
    </section>
  );
}
