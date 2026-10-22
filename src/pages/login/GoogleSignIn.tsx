import { useEffect, useRef, useState } from "react";
import { entrarComGoogle, type LoginResponse } from "../../axios/Axios";
import { apiError } from "../../axios/apiError";

interface IdentityApi {
  initialize: (options: { client_id: string; callback: (response: { credential: string }) => void; auto_select: boolean }) => void;
  renderButton: (container: HTMLElement, options: { theme: string; size: string; locale: string; width: number; text: string }) => void;
}
declare global { interface Window { google?: { accounts: { id: IdentityApi } } } }
let sdkPromise: Promise<IdentityApi> | null = null;
let initialized = false;
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

export default function GoogleSignIn({ onSuccess, remember }: { onSuccess: (data: LoginResponse, remember: boolean) => void; remember: boolean }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const container = useRef<HTMLDivElement>(null);
  const [requested, setRequested] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!requested || !clientId) return;
    let active = true;
    let sending = false;
    credentialHandler = async credential => {
      if (!active || sending) return;
      sending = true; setBusy(true); setError("");
      try { const response = await entrarComGoogle(credential); if (active) onSuccess(response.data, remember); }
      catch (cause) { if (active) setError(apiError(cause, "Não foi possível entrar com Google. Use e-mail e senha ou tente novamente.")); }
      finally { sending = false; if (active) setBusy(false); }
    };
    loadGoogle().then(api => {
      if (!active || !container.current) return;
      if (!initialized) { api.initialize({ client_id: clientId, auto_select: false, callback: response => credentialHandler?.(response.credential) }); initialized = true; }
      container.current.replaceChildren();
      api.renderButton(container.current, { theme: "outline", size: "large", locale: "pt-BR", width: Math.min(container.current.clientWidth || 280, 400), text: "signin_with" });
      setReady(true);
    }).catch(() => { if (active) setError("Não foi possível carregar o Google. Verifique sua conexão e tente novamente."); });
    return () => { active = false; credentialHandler = null; };
  }, [requested, attempt, clientId, onSuccess, remember]);
  return <section aria-label="Entrada com Google" className="space-y-3">{!clientId ? <><button type="button" disabled className="min-h-11 w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-500">Entrar com Google</button><p className="text-xs text-gray-600">Entrada com Google indisponível no momento. Use e-mail e senha.</p></> : <>{!requested && <button type="button" onClick={() => setRequested(true)} className="min-h-11 w-full cursor-pointer rounded-xl border border-gray-300 bg-white p-3 text-sm font-semibold hover:bg-emerald-50">Continuar com Google</button>}<div ref={container} className={busy ? "pointer-events-none opacity-50" : ""} aria-busy={busy} />{requested && !ready && !error && <p role="status" className="text-xs">Carregando Google...</p>}{busy && <p role="status" className="text-sm">Validando acesso...</p>}{error && <div role="alert" className="space-y-2 text-sm text-red-800"><p>{error}</p><button type="button" onClick={() => { setError(""); setAttempt(v => v + 1); }} className="cursor-pointer underline">Tentar novamente</button></div>}<p className="text-xs text-gray-600">Ao continuar, você entra no serviço do Google para autorizar o acesso à sua conta.</p></>}</section>;
}
