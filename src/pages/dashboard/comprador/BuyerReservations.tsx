import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cancelarReserva, listarReservas, obterReserva, iniciarConversa } from "../../../api/services";
import { apiError, apiStatus } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import ConfirmAction from "./ConfirmAction";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { dateLabel, money, shoppingLabel } from "./buyerPresentation";
import BuyerPayment from "./BuyerPayment";
import type { PaymentActivity } from "./paymentFlow";

export default function BuyerReservations({ history = false }: { history?: boolean }) {
  const [params, setParams] = useSearchParams();
  const selected = params.get("reserva");
  const [filter, setFilter] = useState("");
  const loader = useCallback(async (signal: AbortSignal) => {
    if (selected) return { data: [] };
    const { data } = await listarReservas(signal);
    return { data: requireArray(data) };
  }, [selected]);
  const resource = useApiResource(loader);
  const rows = (resource.data ?? []).filter(item => filter === "ativas" ? ["pending", "accepted"].includes(item.status) : filter === "concluidas" ? item.status === "completed" : true);
  if (selected) return <ReservationDetail key={selected} id={selected} paymentFirst={params.get("etapa") === "pagamento"} />;
  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className={s.title}>{history ? "Histórico de reservas" : "Minhas Reservas"}</h1><button onClick={resource.reload} disabled={resource.loading} className={s.secondary}>Atualizar reservas</button></div>
    <label className={s.label}>Filtrar por situação<select aria-label="Situação da reserva" value={filter} onChange={e => setFilter(e.target.value)} className={`${s.input} max-w-xs`}><option value="">Todas</option><option value="ativas">Ativas</option><option value="concluidas">Concluídas</option></select></label>
    <RequestState {...resource} retry={resource.reload} />
    {!resource.loading && !resource.error && (!rows.length ? <div className={`${s.panel} space-y-4`}><h2 className={s.subtitle}>Nenhuma reserva encontrada</h2><p className={s.copy}>As solicitações registradas e suas atualizações aparecerão aqui.</p><Link to="/marketplace" className={s.button}>Explorar materiais</Link></div> : <ul className="space-y-4">{rows.map(item => <li key={item.id} className={`${s.panel} flex flex-wrap items-center justify-between gap-4`}><div className="space-y-2"><h2 className={s.subtitle}>{shoppingLabel(item.status)}</h2><p className={s.copy}>{dateLabel(item.datetime)} · {item.total_items ?? 0} {Number(item.total_items) === 1 ? "item" : "itens"}</p><p className="font-bold">{money(item.value)}</p></div><button onClick={() => setParams({ aba: history ? "historico" : "reservas", reserva: item.id })} className={s.secondary}>Ver reserva</button></li>)}</ul>)}
  </section>;
}

function ReservationDetail({ id, paymentFirst }: { id: string; paymentFirst: boolean }) {
  const [, setParams] = useSearchParams();
  const loader = useCallback(async (signal: AbortSignal) => {
    const response = await obterReserva(id, signal);
    if (response.data.id !== id || !Array.isArray(response.data.items)) throw new Error("Reserva inválida.");
    return response;
  }, [id]);
  const resource = useApiResource(loader);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [paymentActivity, setPaymentActivity] = useState<PaymentActivity>({ busy: false, cancelBlocked: true });
  const { reload } = resource;
  const reloadAfterPayment = useCallback(() => { setPaymentActivity({ busy: false, cancelBlocked: true }); reload(); }, [reload]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [success]);
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 6000);
    return () => clearTimeout(t);
  }, [error]);
  async function cancel() {
    if (busy || paymentActivity.cancelBlocked) return;
    setBusy(true); setError("");
    try {
      const { data } = await cancelarReserva(id);
      if (data.shopping.id !== id || data.shopping.status !== "cancelled") throw new Error("Resposta inválida.");
      setConfirm(false); setSuccess("Reserva cancelada com sucesso."); resource.reload();
    } catch (cause) {
      setConfirm(false);
      setError([400, 409].includes(apiStatus(cause) ?? 0) ? "A situação desta reserva pode ter mudado." : apiError(cause, "Não foi possível confirmar o cancelamento."));
      reloadAfterPayment();
    }
    finally { setBusy(false); }
  }
  return <section className="space-y-6">
    <button disabled={busy || paymentActivity.busy} onClick={() => setParams({ aba: "reservas" })} className={s.secondary}>Voltar às reservas</button><h1 className={s.title}>{paymentFirst ? "Finalizar reserva" : "Detalhes da reserva"}</h1>
    {success && <p role="status" className={s.success}>{success}</p>}
    {error && !confirm && <p role="alert" className={s.error}>{error}</p>}
    <RequestState {...resource} retry={resource.reload} />
    {paymentFirst && !resource.loading && !resource.error && resource.data && <BuyerPayment key={id} shopping={resource.data} blocked={busy || confirm} onActivityChange={setPaymentActivity} onReservationChange={reloadAfterPayment} />}
    {!resource.loading && !resource.error && resource.data && <div className={`${s.panel} space-y-6`}>
      <div className="flex flex-wrap justify-between gap-4"><h2 className={s.subtitle}>{shoppingLabel(resource.data.status)}</h2><p className="text-xl font-bold">{money(resource.data.value)}</p></div>
      <p className={s.copy}>{dateLabel(resource.data.datetime)}</p>
      <ul className="divide-y divide-[#E7E4DA]">{resource.data.items?.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-4 py-4"><div><Link className="font-semibold underline" to={`/marketplace/produto/${encodeURIComponent(item.id_product)}`}>{item.product_name}</Link><p className={`${s.copy} mt-1`}>{item.quantity} unidades</p></div><p>{money(item.subtotal)}</p></li>)}</ul>
      <p className={s.notice}>Reserva e pagamento têm situações próprias. Consulte a confirmação antes da retirada.</p>
      <div className="flex flex-wrap gap-3">{resource.data.items?.[0]?.seller_id && <button type="button" className={s.secondary} disabled={busy || paymentActivity.busy} onClick={async () => { setBusy(true); setError(""); try { const response = await iniciarConversa(resource.data!.items![0].seller_id!); if (!response.data.conversationId) throw new Error(); setParams({ aba: "mensagens", conversa: response.data.conversationId }); } catch { setError("Não foi possível abrir a conversa com a empresa."); } finally { setBusy(false); } }}>Conversar com a empresa</button>}</div>
      <div className="flex flex-wrap gap-3"><button disabled={busy || paymentActivity.busy} onClick={resource.reload} className={s.secondary}>Atualizar detalhes</button>{resource.data.status === "pending" && <button disabled={busy || paymentActivity.cancelBlocked} onClick={() => { setError(""); setConfirm(true); }} className={s.secondary}>Cancelar reserva</button>}</div>
      {resource.data.status === "pending" && paymentActivity.cancelBlocked && <p className={s.notice}>O cancelamento da reserva fica bloqueado enquanto consultamos o pagamento, durante processamento ou quando há uma cobrança ativa ou sem confirmação. Para encerrar um Pix pendente, use a opção no painel de pagamento.</p>}
    </div>}
    {!paymentFirst && !resource.loading && !resource.error && resource.data && <BuyerPayment key={id} shopping={resource.data} blocked={busy || confirm} onActivityChange={setPaymentActivity} onReservationChange={reloadAfterPayment} />}
    {confirm && <ConfirmAction title="Cancelar reserva?" description="O cancelamento só é permitido enquanto a reserva está pendente e não identificamos cobrança ativa ou sem confirmação. A confirmação será feita pelo servidor." busy={busy} error={error} confirm={cancel} cancel={() => { if (!busy) setConfirm(false); }} />}
  </section>;
}
