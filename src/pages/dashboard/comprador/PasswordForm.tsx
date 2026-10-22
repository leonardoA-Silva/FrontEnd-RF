import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { alterarSenha } from "../../../axios/Axios";
import { apiError, apiStatus } from "../../../axios/apiError";
import { updateSessionUser } from "../../../auth/session";
import { buyerStyles as s } from "./buyerStyles";

export default function PasswordForm({ firstAccess = false }: { firstAccess?: boolean }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; setError(""); setSuccess(false);
    if (password.length < 6 || password !== confirm || password === current) { setError("A nova senha deve ter ao menos 6 caracteres, ser diferente da atual e coincidir com a confirmação."); return; }
    setBusy(true);
    try {
      await alterarSenha(current, password, firstAccess);
      setCurrent(""); setPassword(""); setConfirm(""); setSuccess(true);
      if (firstAccess) { updateSessionUser({ mustChangePassword: false, status: "active" }); navigate("/dashboardUsuario", { replace: true }); }
    } catch (cause) { setError(apiStatus(cause) === 401 ? "A senha atual não confere ou sua sessão expirou. Confira os dados e tente novamente." : apiError(cause, "Não foi possível alterar a senha.")); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className={`${s.panel} max-w-2xl space-y-5`}>
    <h2 className={s.subtitle}>{firstAccess ? "Definir senha de primeiro acesso" : "Alterar senha"}</h2>
    <p className={s.copy}>Informe sua senha {firstAccess ? "temporária" : "atual"} e escolha uma nova senha. Contas criadas com login social devem continuar usando o provedor.</p>
    <fieldset disabled={busy} className="space-y-5"><legend className="sr-only">Senhas da conta</legend>
      <label className={s.label}>{firstAccess ? "Senha temporária" : "Senha atual"} *<input required type="password" autoComplete="current-password" maxLength={200} value={current} onChange={e => setCurrent(e.target.value)} className={s.input} /></label>
      <label className={s.label}>Nova senha *<input required minLength={6} maxLength={200} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className={s.input} /></label>
      <label className={s.label}>Confirmar nova senha *<input required minLength={6} maxLength={200} type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className={s.input} /></label>
    </fieldset>
    {error && <p role="alert" className={s.error}>{error}</p>}{success && <p role="status" className={s.success}>Senha alterada com sucesso.</p>}
    <button disabled={busy} className={s.button}>{busy ? "Alterando..." : "Salvar nova senha"}</button>
  </form>;
}
