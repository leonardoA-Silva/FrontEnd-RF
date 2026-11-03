import { useEffect, useState } from "react";
import { Dialog } from "@mui/material";
import { ArrowRight, CheckCircle2, LoaderCircle, Mail, RefreshCw, X } from "lucide-react";
import { enviarCodigoOtp, verificarCodigoOtp } from "../axios/Axios";
import { accountError } from "./account/accountError";
import AccountSteps from "./account/AccountSteps";

interface EmailVerificationModalProps {
  open: boolean;
  userId: string;
  email: string;
  emailSent?: boolean;
  onSuccess: () => void;
  onClose?: () => void;
}

export default function EmailVerificationModal(props: EmailVerificationModalProps) {
  // Mounting each open session clears codes and transient messages without effect-driven resets.
  return props.open ? <VerificationContent {...props} /> : null;
}

function VerificationContent({ open, userId, email, emailSent = true, onSuccess, onClose }: EmailVerificationModalProps) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"verify" | "resend" | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [success, setSuccess] = useState(false);
  const [remaining, setRemaining] = useState(emailSent ? 30 : 0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [remaining]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(onSuccess, 1500);
    return () => window.clearTimeout(timer);
  }, [success, onSuccess]);

  async function verify() {
    if (busy || success || code.length !== 6 || !userId) return;
    setBusy("verify"); setError(""); setInfo("");
    try { await verificarCodigoOtp(userId, code); setSuccess(true); }
    catch (failure) { setError(accountError(failure, "Código incorreto ou expirado. Confira e tente novamente.")); }
    finally { setBusy(null); }
  }

  async function resend() {
    if (busy || success || remaining > 0 || !userId) return;
    setBusy("resend"); setError("");
    try {
      await enviarCodigoOtp(userId);
      setInfo("Novo código enviado. Confira também a pasta de spam.");
      setRemaining(30); setCode("");
    } catch (failure) { setError(accountError(failure, "Não foi possível reenviar. Aguarde um pouco e tente novamente.")); }
    finally { setBusy(null); }
  }

  return (
    <Dialog open={open} onClose={() => { if (!busy && !success) onClose?.(); }} aria-labelledby="verification-title" aria-describedby="verification-description" maxWidth="sm" fullWidth slotProps={{ paper: { className: "account-verification", sx: { borderRadius: "24px", m: 2, width: "calc(100% - 32px)", maxWidth: 520, backgroundColor: "#FAF9F5", fontFamily: "inherit" } } }}>
      <div className="account-verification-inner">
        {onClose && <button type="button" className="account-dialog-close" onClick={onClose} disabled={!!busy || success} aria-label="Fechar confirmação de e-mail"><X size={20} /></button>}
        <AccountSteps current={3} />
        <div className="account-verification-icon" aria-hidden="true">{success ? <CheckCircle2 size={32} strokeWidth={1.4} /> : <Mail size={32} strokeWidth={1.4} />}</div>
        <p className="home-eyebrow">Mais uma conexão para começar</p>
        <h2 id="verification-title">{success ? <>Tudo pronto.<br /><em>Bem-vindo à rede.</em></> : <>Só falta<br /><em>confirmar seu e-mail.</em></>}</h2>
        <p id="verification-description" className="account-verification-description">{success ? "E-mail confirmado. Você será encaminhado para entrar na sua conta." : <>Informe o código de 6 dígitos enviado para <strong>{email || "seu e-mail"}</strong>.</>}</p>
        {success ? <p role="status" className="account-alert account-alert-success"><CheckCircle2 size={18} /> Conta confirmada. Abrindo o login…</p> : <form onSubmit={event => { event.preventDefault(); void verify(); }} aria-busy={!!busy}>
          {!emailSent && !info && <p role="status" className="account-alert">O envio inicial não foi concluído. Solicite um novo código abaixo.</p>}
          {error && <p id="verification-error" className="account-alert account-alert-error" role="alert">{error}</p>}
          {info && <p className="account-alert account-alert-success" role="status">{info}</p>}
          <label htmlFor="verification-code" className="account-code-label">Código de confirmação</label>
          <input id="verification-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={6} value={code} onChange={event => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} disabled={!!busy} required pattern="[0-9]{6}" aria-invalid={!!error} aria-describedby={error ? "verification-error" : "verification-code-hint"} className="account-code-input" />
          <p id="verification-code-hint" className="account-field-hint">Você pode colar o código completo neste campo.</p>
          <button type="submit" className="home-button account-submit" disabled={code.length !== 6 || !!busy}>{busy === "verify" ? <><LoaderCircle size={17} className="account-spinner" /> Confirmando…</> : <>Confirmar e-mail <ArrowRight size={17} /></>}</button>
          <div className="account-resend"><p>Não recebeu o código?</p><button type="button" disabled={remaining > 0 || !!busy} onClick={() => void resend()}><RefreshCw size={14} className={busy === "resend" ? "account-spinner" : ""} />{busy === "resend" ? "Reenviando…" : remaining > 0 ? `Reenviar em ${remaining}s` : "Reenviar código"}</button></div>
        </form>}
      </div>
    </Dialog>
  );
}
