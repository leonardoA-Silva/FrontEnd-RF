import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { redefinirSenha } from "../../axios/Axios";
import { apiError, apiStatus } from "../../axios/apiError";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(() => new URLSearchParams(location.search).get("token") ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => { if (location.search) navigate(location.pathname, { replace: true }); }, [location.pathname, location.search, navigate]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || !token) return; setError("");
    if (password !== confirm || password.length < 6) { setError("As senhas devem coincidir e ter pelo menos 6 caracteres."); return; }
    setBusy(true);
    try { await redefinirSenha(token, password); setToken(""); setPassword(""); setConfirm(""); setSuccess(true); }
    catch (cause) { if ([401,404].includes(apiStatus(cause) ?? 0)) { setError("Este link é inválido ou expirou. Solicite um novo link de recuperação."); setToken(""); setPassword(""); setConfirm(""); } else setError(apiError(cause, "Não foi possível redefinir sua senha.")); }
    finally { setBusy(false); }
  }
  return <div className="flex min-h-screen flex-col bg-[#FAF9F5] text-[#1B4B3A]"><Header variant="marketplace" /><main className="mx-auto flex w-full max-w-xl flex-1 items-center px-5 py-12"><section className={`${s.panel} w-full space-y-6`}><h1 className={s.title}>Redefinir senha</h1>{success ? <><p role="status" className={s.success}>Senha redefinida com sucesso. Entre novamente com sua nova senha.</p><Link to="/login" className={s.button}>Entrar</Link></> : <>{error && <p role="alert" className={s.error}>{error}</p>}{!token ? <><p className={s.copy}>Abra o link recebido por e-mail ou solicite um novo link. Ao recarregar esta página, será necessário abrir o link novamente.</p><Link to="/recuperar-senha" className={s.button}>Solicitar novo link</Link></> : <form onSubmit={submit} className="space-y-5"><p className={s.copy}>Escolha uma nova senha. O link é válido por tempo limitado.</p><fieldset disabled={busy} className="space-y-5"><legend className="sr-only">Nova senha de acesso</legend><label className={s.label}>Nova senha *<input required minLength={6} maxLength={200} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className={s.input} /></label><label className={s.label}>Confirmar nova senha *<input required minLength={6} maxLength={200} type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className={s.input} /></label></fieldset><button disabled={busy} className={s.button}>{busy ? "Redefinindo..." : "Salvar nova senha"}</button></form>}</>}</section></main><Footer /></div>;
}
