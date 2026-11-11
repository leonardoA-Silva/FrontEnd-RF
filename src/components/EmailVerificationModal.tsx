import axios from "axios";
import { useEffect, useState } from "react";
import { Dialog } from "@mui/material";
import { ArrowRight, CheckCircle2, LoaderCircle, Mail, X } from "lucide-react";
import { verificarCodigoOtp } from "../api/services";
import { accountError } from "./account/accountError";
import AccountSteps from "./account/AccountSteps";

interface Props { open: boolean; userId: string; email: string; emailSent?: boolean; onSuccess: () => void; onClose?: () => void }
export default function EmailVerificationModal(props: Props) { return props.open ? <VerificationContent {...props} /> : null; }
function VerificationContent({ open, userId, email, emailSent = true, onSuccess, onClose }: Props) {
  const [code, setCode] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState(""), [success, setSuccess] = useState(false);
  useEffect(() => { if (!success) return; const timer = setTimeout(onSuccess, 1500); return () => clearTimeout(timer); }, [success, onSuccess]);
  async function verify() {
    if (busy || success || code.length !== 6 || !userId) return;
    setBusy(true); setError("");
    try { await verificarCodigoOtp(userId, code); setSuccess(true); }
    catch (cause) { setError(axios.isAxiosError(cause) && [400, 401].includes(cause.response?.status ?? 0) ? "Código incorreto ou expirado. Confira o código recebido por e-mail." : accountError(cause, "Não foi possível confirmar o código. Tente novamente.")); }
    finally { setBusy(false); }
  }
  return <Dialog open={open} onClose={() => { if (!busy && !success) onClose?.(); }} aria-labelledby="verification-title" aria-describedby="verification-description" maxWidth="sm" fullWidth slotProps={{ paper: { className: "account-verification", sx: { borderRadius: "24px", m: 2, width: "calc(100% - 32px)", maxWidth: 520, backgroundColor: "#FAF9F5", fontFamily: "inherit" } } }}>
    <div className="account-verification-inner">{onClose && <button type="button" className="account-dialog-close" onClick={onClose} disabled={busy || success} aria-label="Fechar confirmação de e-mail"><X size={20} /></button>}<AccountSteps current={3} /><div className="account-verification-icon" aria-hidden="true">{success ? <CheckCircle2 size={32} /> : <Mail size={32} />}</div><h2 id="verification-title">{success ? "Conta confirmada." : "Confirme seu e-mail."}</h2><p id="verification-description">{success ? "Você será encaminhado para entrar na conta." : <>Informe o código de seis dígitos enviado para <strong>{email || "seu e-mail"}</strong>.</>}</p>
      {success ? <p role="status" className="account-alert account-alert-success">E-mail confirmado. Abrindo o login…</p> : <form onSubmit={event => { event.preventDefault(); void verify(); }} aria-busy={busy}>{!emailSent && <p role="status" className="account-alert">O envio inicial não foi concluído. Entre em contato com o suporte para ativar a conta.</p>}{error && <p id="verification-error" role="alert" className="account-alert account-alert-error">{error}</p>}<label htmlFor="verification-code" className="account-code-label">Código de confirmação</label><input id="verification-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={6} value={code} onChange={event => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} disabled={busy} required pattern="[0-9]{6}" aria-invalid={!!error} aria-describedby={error ? "verification-error" : undefined} className="account-code-input" /><button type="submit" className="home-button account-submit" disabled={code.length !== 6 || busy}>{busy ? <><LoaderCircle size={17} className="account-spinner" /> Confirmando…</> : <>Confirmar e-mail <ArrowRight size={17} /></>}</button></form>}
    </div>
  </Dialog>;
}
