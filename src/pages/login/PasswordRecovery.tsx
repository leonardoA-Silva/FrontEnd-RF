import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { solicitarRedefinicao } from "../../axios/Axios";
import { apiError } from "../../axios/apiError";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";

export default function PasswordRecovery() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; setError(""); setSuccess(false); setBusy(true);
    try { await solicitarRedefinicao(email.trim()); setSuccess(true); setEmail(""); }
    catch (cause) { setError(apiError(cause, "Não foi possível solicitar a recuperação de acesso.")); }
    finally { setBusy(false); }
  }
  return <div className="flex min-h-screen flex-col bg-[#FAF9F5] text-[#1B4B3A]"><Header variant="marketplace" /><main className="mx-auto flex w-full max-w-xl flex-1 items-center px-5 py-12"><form onSubmit={submit} className={`${s.panel} w-full space-y-6`}><h1 className={s.title}>Recuperar senha</h1><p className={s.copy}>Informe seu e-mail para solicitar um link de redefinição de senha.</p><label className={s.label}>E-mail *<input required type="email" autoComplete="email" maxLength={254} disabled={busy} value={email} onChange={e => setEmail(e.target.value)} className={s.input} /></label>{error && <p role="alert" className={s.error}>{error}</p>}{success && <p role="status" className={s.success}>Se o e-mail estiver cadastrado, você receberá um link de redefinição. Confira também a pasta de spam.</p>}<button disabled={busy} className={`${s.button} w-full`}>{busy ? "Solicitando..." : "Enviar link de recuperação"}</button><Link to="/login" className={s.secondary}>Voltar para entrar</Link></form></main><Footer /></div>;
}
