import { useCallback, useState } from "react";
import { useApiResource } from "../../hooks/useApiResource";
import { lerNotificacao, type BuyerNotification } from "../../api/services";
import { loadCompanyRequests, answerCompanyRequest } from "./companyRequestsApi";
import ConfirmAction from "../dashboard/comprador/ConfirmAction";
import RequestState from "../dashboard/comprador/RequestState";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";
import { dateLabel } from "../dashboard/comprador/buyerPresentation";
import { apiError, apiStatus } from "../../axios/apiError";

export default function CompanyRequests() {
  const loader = useCallback(async (signal: AbortSignal) => ({ data: await loadCompanyRequests(signal) }), []);
  const resource = useApiResource(loader);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selection, setSelection] = useState<{ item: BuyerNotification; status: "accepted" | "refused" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function answer() {
    if (!selection?.item.reference_id || busy) return;
    setBusy(true); setError("");
    try {
      const shopping = await answerCompanyRequest(selection.item.reference_id, selection.status);
      setAnswers(current => ({ ...current, [shopping.id]: shopping.status }));
      const notification = selection.item;
      setSelection(null); setNotice(shopping.status === "accepted" ? "Reserva aceita. O comprador foi avisado." : "Reserva recusada. O comprador foi avisado e o estoque foi restaurado.");
      if (notification.read !== "sim") {
        try { await lerNotificacao(notification.id); } catch { setNotice("Reserva respondida. Não foi possível marcar o aviso como lido; atualize as notificações."); }
      }
    } catch (cause) { setError([400, 403, 404, 409].includes(apiStatus(cause) ?? 0) ? "A reserva pode ter mudado de situação ou não pertencer integralmente à sua empresa. Atualize antes de responder novamente." : apiError(cause, "Não foi possível confirmar a resposta. Atualize antes de repetir.")); }
    finally { setBusy(false); }
  }
  return <section className="space-y-6"><header className="company-page-heading"><div><p className="company-eyebrow">Solicitações recebidas</p><h1>Reservas</h1><p>Solicitações dos compradores identificadas pelas notificações da empresa.</p></div></header>
    <p className={s.notice}>A lista reúne avisos de solicitação. A API confirma a situação atual ao aceitar ou recusar; um aviso antigo pode já ter sido respondido.</p>
    <button type="button" className={s.secondary} disabled={resource.loading || busy} onClick={resource.reload}>Atualizar solicitações</button>
    <RequestState {...resource} retry={resource.reload} />{notice && <p role="status" className={s.success}>{notice}</p>}
    {!resource.loading && !resource.error && (!resource.data?.length ? <p className={s.notice}>Nenhuma solicitação de reserva recebida.</p> : <ul className="space-y-4">{resource.data.map(item => <li key={item.id} className={`${s.panel} space-y-4`}><h2 className={s.subtitle}>{item.title}</h2><p className="whitespace-pre-wrap break-words">{item.content}</p><p className={s.copy}>{dateLabel(item.created_in)}</p>{answers[item.reference_id!] ? <p role="status">{answers[item.reference_id!] === "accepted" ? "Reserva aceita nesta sessão." : "Reserva recusada nesta sessão."}</p> : <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} className={s.button} onClick={() => { setError(""); setSelection({ item, status: "accepted" }); }}>Aceitar reserva</button><button type="button" disabled={busy} className={s.secondary} onClick={() => { setError(""); setSelection({ item, status: "refused" }); }}>Recusar reserva</button></div>}</li>)}</ul>)}
    {selection && <ConfirmAction title={selection.status === "accepted" ? "Aceitar reserva?" : "Recusar reserva?"} description={selection.status === "accepted" ? "Confirme que o material ficará reservado para este comprador." : "Ao recusar, o estoque retorna ao anúncio."} busy={busy} error={error} confirm={answer} cancel={() => { if (!busy) setSelection(null); }} />}
  </section>;
}
