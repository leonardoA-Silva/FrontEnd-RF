import { useCallback, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cancelarReserva, listarReservas, obterReserva } from "../../../axios/Axios";
import { apiError, apiStatus } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import ConfirmAction from "./ConfirmAction";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { dateLabel, money, shoppingLabel } from "./buyerPresentation";

export default function BuyerReservations({ history = false }: { history?: boolean }) {
  const [params, setParams] = useSearchParams();
  const selected = params.get("reserva");
  const [filter, setFilter] = useState("");
  const loader = useCallback(async (signal: AbortSignal) => {
    const { data } = await listarReservas(signal);
    return { data: requireArray(data) };
  }, []);
  const resource = useApiResource(loader);
  const rows = (resource.data ?? []).filter(item => (!history || ["completed", "refused", "cancelled"].includes(item.status)) && (!filter || item.status === filter));
  if (selected) return <ReservationDetail key={selected} id={selected} />;
  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className={s.title}>{history ? "Histórico de reservas" : "Minhas Reservas"}</h1><button onClick={resource.reload} disabled={resource.loading} className={s.secondary}>Atualizar reservas</button></div>
    <label className={s.label}>Filtrar por situação<select aria-label="Situação da reserva" value={filter} onChange={e => setFilter(e.target.value)} className={`${s.input} max-w-xs`}><option value="">Todas</option>{(history ? ["completed", "refused", "cancelled"] as const : ["pending", "accepted", "completed", "refused", "cancelled"] as const).map(value => <option key={value} value={value}>{shoppingLabel(value)}</option>)}</select></label>
    <RequestState {...resource} retry={resource.reload} />
    {!resource.loading && !resource.error && (!rows.length ? <div className={`${s.panel} space-y-4`}><h2 className={s.subtitle}>Nenhuma reserva encontrada</h2><p className={s.copy}>As solicitações registradas e suas atualizações aparecerão aqui.</p><Link to="/marketplace" className={s.button}>Explorar materiais</Link></div> : <ul className="space-y-4">{rows.map(item => <li key={item.id} className={`${s.panel} flex flex-wrap items-center justify-between gap-4`}><div className="space-y-2"><h2 className={s.subtitle}>{shoppingLabel(item.status)}</h2><p className={s.copy}>{dateLabel(item.datetime)} · {item.total_items ?? 0} {Number(item.total_items) === 1 ? "item" : "itens"}</p><p className="font-bold">{money(item.value)}</p></div><button onClick={() => setParams({ aba: history ? "historico" : "reservas", reserva: item.id })} className={s.secondary}>Ver reserva</button></li>)}</ul>)}
  </section>;
}

function ReservationDetail({ id }: { id: string }) {
  const [, setParams] = useSearchParams();
  const loader = useCallback(async (signal: AbortSignal) => {
    const response = await obterReserva(id, signal);
    if (response.data.id !== id || !Array.isArray(response.data.items)) throw new Error("Reserva inválida.");
    return response;
  }, [id]);
  const resource = useApiResource(loader);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function cancel() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { data } = await cancelarReserva(id);
      if (data.shopping.id !== id || data.shopping.status !== "cancelled") throw new Error("Resposta inválida.");
      setConfirm(false); setSuccess("Reserva cancelada com sucesso."); resource.reload();
    } catch (cause) { setError(apiStatus(cause) === 400 ? "A situação desta reserva mudou. Atualize os detalhes antes de tentar cancelar novamente." : apiError(cause, "Não foi possível confirmar o cancelamento. Atualize a reserva antes de tentar novamente.")); }
    finally { setBusy(false); }
  }
  return <section className="space-y-6">
    <button onClick={() => setParams({ aba: "reservas" })} className={s.secondary}>Voltar às reservas</button><h1 className={s.title}>Detalhes da reserva</h1>
    {success && <p role="status" className={s.success}>{success}</p>}
    <RequestState {...resource} retry={resource.reload} />
    {!resource.loading && !resource.error && resource.data && <div className={`${s.panel} space-y-6`}>
      <div className="flex flex-wrap justify-between gap-4"><h2 className={s.subtitle}>{shoppingLabel(resource.data.status)}</h2><p className="text-xl font-bold">{money(resource.data.value)}</p></div>
      <p className={s.copy}>{dateLabel(resource.data.datetime)}</p>
      <ul className="divide-y divide-[#E7E4DA]">{resource.data.items?.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-4 py-4"><div><Link className="font-semibold underline" to={`/marketplace/produto/${encodeURIComponent(item.id_product)}`}>{item.product_name}</Link><p className={`${s.copy} mt-1`}>{item.quantity} unidades</p></div><p>{money(item.subtotal)}</p></li>)}</ul>
      <p className={s.notice}>Esta solicitação não confirma pagamento. O aceite é feito pelo fornecedor; cobranças ainda não estão disponíveis.</p>
      <div className="flex flex-wrap gap-3"><button onClick={resource.reload} className={s.secondary}>Atualizar detalhes</button>{resource.data.status === "pending" && <button onClick={() => { setError(""); setConfirm(true); }} className={s.secondary}>Cancelar reserva</button>}</div>
    </div>}
    {confirm && <ConfirmAction title="Cancelar reserva?" description="O cancelamento só é permitido enquanto a reserva aguarda aceite. A confirmação será feita pelo servidor." busy={busy} error={error} confirm={cancel} cancel={() => setConfirm(false)} />}
  </section>;
}
