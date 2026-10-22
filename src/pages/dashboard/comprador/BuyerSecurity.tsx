import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { excluirMinhaConta } from "../../../axios/Axios";
import { apiError, apiStatus } from "../../../axios/apiError";
import { clearSession } from "../../../auth/session";
import PasswordForm from "./PasswordForm";
import { buyerStyles as s } from "./buyerStyles";

export default function BuyerSecurity({ userId }: { userId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  async function remove() {
    if (!confirmed || busy) return; setBusy(true); setError("");
    try {
      await excluirMinhaConta(userId);
      // Finish the protected-route redirect before attaching the confirmation.
      flushSync(() => clearSession());
      navigate("/login", { replace: true, state: { accountDeleted: true } });
    }
    catch (cause) { setError(apiStatus(cause) === 409 ? "Sua conta possui vínculos que impedem a exclusão. Entre em contato com o suporte antes de tentar novamente." : apiError(cause, "Não foi possível excluir sua conta. Nenhuma confirmação de exclusão foi recebida.")); }
    finally { setBusy(false); }
  }
  return <section className="space-y-6"><h1 className={s.title}>Segurança da conta</h1><PasswordForm /><Link to="/recuperar-senha" className={s.secondary}>Recuperar acesso por e-mail</Link><section className={`${s.panel} max-w-2xl space-y-4`}><h2 className={s.subtitle}>Excluir minha conta</h2><p className={s.copy}>A exclusão é permanente e pode ser recusada se houver registros vinculados.</p><button type="button" onClick={() => { setError(""); setConfirmed(false); dialog.current?.showModal(); }} className="min-h-11 cursor-pointer rounded-xl border border-red-300 px-5 py-3 text-sm font-bold text-red-800 hover:bg-red-50">Excluir minha conta</button></section>
    <dialog ref={dialog} onCancel={event => { if (busy) event.preventDefault(); }} aria-labelledby="delete-account-title" className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%_-_32px)] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-[#1B4B3A] shadow-xl backdrop:bg-black/40">
      <h2 id="delete-account-title" className={s.subtitle}>Confirmar exclusão da conta</h2><p className={`${s.copy} my-4`}>Esta ação exclui sua conta e encerra sua sessão após a confirmação da exclusão.</p><label className="my-5 flex items-start gap-3 text-sm"><input type="checkbox" disabled={busy} checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1 accent-red-700" /><span>Entendo que a exclusão é permanente.</span></label>{error && <p role="alert" className={`${s.error} mb-4`}>{error}</p>}<div className="flex flex-wrap gap-3"><button disabled={busy} onClick={() => dialog.current?.close()} className={s.secondary}>Cancelar</button><button disabled={!confirmed || busy} onClick={remove} className="min-h-11 cursor-pointer rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Excluindo..." : "Excluir definitivamente"}</button></div>
    </dialog>
  </section>;
}
