import { useEffect, useRef, useState } from "react";
import { googleAccessError } from "../../auth/googleError";
import { googleAuthTarget } from "../../auth/googleOrigin";

interface CredentialResponse { credential?: string }
interface GoogleIdentity {
  initialize(options: { client_id: string; callback: (response: CredentialResponse) => void; auto_select: boolean; ux_mode: "popup" }): void;
  renderButton(element: HTMLElement, options: { type: "standard"; theme: "outline"; size: "large"; text: "continue_with"; width: number; locale: "pt-BR"; click_listener: () => void }): void;
}
declare global { interface Window { google?: { accounts?: { id?: GoogleIdentity } } } }
let loading: Promise<GoogleIdentity> | null = null;
let initializedClient = "";
let credentialHandler: ((response: CredentialResponse) => void) | null = null;

function loadGoogle(): Promise<GoogleIdentity> {
  const existing = window.google?.accounts?.id;
  if (existing) return Promise.resolve(existing);
  if (loading) return loading;
  loading = new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    const timer = window.setTimeout(() => finish(false), 12000);
    function finish(ok: boolean) {
      window.clearTimeout(timer);
      script.onload = null; script.onerror = null;
      const sdk = window.google?.accounts?.id;
      if (ok && sdk) resolve(sdk);
      else { script.remove(); loading = null; reject(new Error("Não foi possível carregar o Google. Verifique a conexão e tente novamente.")); }
    }
    script.onload = () => finish(true);
    script.onerror = () => finish(false);
    document.head.appendChild(script);
  });
  return loading;
}

export default function GoogleSignIn({ onCredential, disabled = false, accountType = "company" }: { onCredential: (credential: string) => Promise<void>; disabled?: boolean; accountType?: "company" | "user" }) {
  const canonicalTarget = googleAuthTarget(window.location.origin, window.location.pathname, accountType);
  const container = useRef<HTMLDivElement>(null);
  const handler = useRef(onCredential);
  const active = useRef(true);
  const working = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { handler.current = onCredential; }, [onCredential]);
  useEffect(() => {
    active.current = true;
    let disposed = false;
    const receive = async (response: CredentialResponse) => {
      if (disposed || working.current) return;
      if (!response.credential) { setError("O Google não confirmou sua identificação. Tente novamente."); return; }
      working.current = true; setBusy(true); setError("");
      try { await handler.current(response.credential); }
      catch (cause) { if (active.current) setError(googleAccessError(cause)); }
      finally { working.current = false; if (active.current) setBusy(false); }
    };
    async function prepare() {
      setReady(false); setError("");
      if (canonicalTarget) return;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
      if (!clientId || !/^[\w.-]+\.apps\.googleusercontent\.com$/.test(clientId)) { setError("O acesso com Google ainda não foi configurado. Você pode continuar com e-mail e senha."); return; }
      try {
        const sdk = await loadGoogle();
        if (disposed || !container.current) return;
        if (initializedClient !== clientId) {
          sdk.initialize({ client_id: clientId, callback: response => credentialHandler?.(response), auto_select: false, ux_mode: "popup" });
          initializedClient = clientId;
        }
        credentialHandler = receive;
        container.current.replaceChildren();
        sdk.renderButton(container.current, { type: "standard", theme: "outline", size: "large", text: "continue_with", width: Math.min(380, container.current.clientWidth || 300), locale: "pt-BR", click_listener: () => { credentialHandler = receive; setError(""); } });
        setReady(true);
      } catch (cause) { if (!disposed) setError(cause instanceof Error ? cause.message : "Não foi possível carregar o Google."); }
    }
    void prepare();
    return () => { disposed = true; active.current = false; if (credentialHandler === receive) credentialHandler = null; };
  }, [attempt, canonicalTarget]);
  if (canonicalTarget) return <div className="google-access"><a className="buyer-secondary" href={canonicalTarget}>Continuar com Google no site oficial</a><p className="google-access-help">O acesso Google é concluído no domínio oficial. Assim, os links temporários dos deploys não exigem novas autorizações.</p></div>;
  return <div className="google-access" aria-busy={busy}>
    <div className={busy || disabled ? "google-access-button is-pending" : "google-access-button"} inert={busy || disabled} ref={container} />
    {!ready && <button type="button" className="buyer-secondary" disabled={busy || disabled} onClick={() => setAttempt(value => value + 1)}>Continuar com Google</button>}
    {busy && <p role="status">Confirmando seu acesso…</p>}
    {error && <p role="alert" className="account-field-error">{error}</p>}
    <p className="google-access-help">Se a janela fechar ou ocorrer uma falha, tente novamente ou continue com e-mail.</p>
  </div>;
}
