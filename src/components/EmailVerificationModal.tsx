import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Mail, X } from "lucide-react";
import { enviarCodigoOtp, verificarCodigoOtp } from "../axios/Axios";
import { accountError } from "./account/accountError";
import { buyerStyles as s } from "../pages/dashboard/comprador/buyerStyles";

type Props = { open?: boolean; userId: string; email: string; emailSent?: boolean; resuming?: boolean; onSuccess: () => void; onClose?: () => void };
export default function EmailVerificationModal(props: Props) {
  return props.open === false ? null : <VerificationContent {...props} />;
}
function VerificationContent({ userId, email, emailSent = true, resuming = false, onSuccess, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [success, setSuccess] = useState(false);
  const [remaining, setRemaining] = useState(emailSent && !resuming ? 30 : 0);
  useEffect(() => { const element = dialog.current; const trigger = document.activeElement; element?.showModal(); return () => { element?.close(); if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus(); }; }, []);
  useEffect(() => { if (!remaining) return; const timer = setTimeout(() => setRemaining(value => value - 1), 1000); return () => clearTimeout(timer); }, [remaining]);
  useEffect(() => { if (!success) return; const timer = setTimeout(onSuccess, 1500); return () => clearTimeout(timer); }, [success, onSuccess]);
  async function verify() {
    if (busy || code.length !== 6 || success) return;
    setBusy(true); setError("");
    try { await verificarCodigoOtp(userId, code); setSuccess(true); }
    catch (cause) { setError(axios.isAxiosError(cause) && [400, 401].includes(cause.response?.status ?? 0) ? "Código incorreto ou expirado. Confira ou solicite um novo código." : accountError(cause, "Não foi possível confirmar o código.")); }
    finally { setBusy(false); }
  }
  async function resend() {
    if (busy || remaining || success) return;
    setBusy(true); setError("");
    try { await enviarCodigoOtp(userId); setInfo("Novo código enviado. Confira também a pasta de spam."); setCode(""); setRemaining(30); }
    catch (cause) { setError(accountError(cause, "Não foi possível reenviar o código.")); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialog} aria-labelledby="verification-title" aria-describedby="verification-description" onCancel={event => { event.preventDefault(); if (!busy && !success) onClose?.(); }} className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%_-_32px)] max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-6 text-ink shadow-xl backdrop:bg-ink/60 sm:p-8">
    {onClose && <button type="button" disabled={busy || success} className="float-right rounded-full p-2 hover:bg-canvas" aria-label="Fechar confirmação de e-mail" onClick={onClose}><X size={20} /></button>}
    <Mail className="mb-5 text-primary" size={32} /><h2 id="verification-title" className={s.subtitle}>{success ? "E-mail confirmado!" : "Confirme seu e-mail"}</h2>
    <p id="verification-description" className={`${s.copy} my-4 break-words`}>{success ? "Conta confirmada. Entre novamente para acessar." : <>Informe o código de 6 dígitos enviado para <strong>{email}</strong>.</>}</p>
    {success ? <p role="status" className={s.success}>Conta confirmada. Abrindo o login…</p> : <form onSubmit={event => { event.preventDefault(); void verify(); }} className="space-y-5" aria-busy={busy}>
      {!emailSent && !info && <p className={s.notice}>O envio inicial não foi concluído. Solicite um novo código.</p>}
      {error && <p role="alert" id="verification-error" className={s.error}>{error}</p>}{info && <p role="status" className={s.success}>{info}</p>}
      <label className={s.label}>Código de confirmação<input autoFocus required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => { setCode(event.target.value.replace(/\D/g, "")); setError(""); }} disabled={busy} aria-invalid={!!error} aria-describedby={error ? "verification-error" : undefined} className={`${s.input} text-center tracking-[0.4em]`} /></label>
      <button type="submit" className={`${s.button} w-full`} disabled={busy || code.length !== 6}>{busy ? "Aguarde…" : "Confirmar e-mail"}</button>
      <button type="button" className={s.secondary} disabled={busy || remaining > 0} onClick={() => void resend()}>{remaining ? `Reenviar em ${remaining}s` : "Reenviar código"}</button>
    </form>}
  </dialog>;
}
