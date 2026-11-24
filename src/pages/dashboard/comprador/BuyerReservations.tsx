import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Star, AlertTriangle, RefreshCw } from "lucide-react";
import {
  cancelarReserva,
  listarReservas,
  obterReserva,
  iniciarConversa,
  listarAvaliacoes,
  listarDisputas,
  type ReviewBackend,
  type DisputeBackend,
  type BuyerNotification,
} from "../../../api/services";
import type { BuyerSocket } from "../../../realtime/buyerSocket";
import { apiError, apiStatus } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import ConfirmAction from "./ConfirmAction";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { dateLabel, money, shoppingLabel } from "./buyerPresentation";
import BuyerPayment from "./BuyerPayment";
import type { PaymentActivity } from "./paymentFlow";
import ReviewDialog, { ReviewCard } from "./ReviewDialog";
import DisputeDialog, { DisputeCard } from "./DisputeDialog";

export default function BuyerReservations({
  history = false,
  socket,
}: {
  history?: boolean;
  socket?: BuyerSocket | null;
}) {
  const [params, setParams] = useSearchParams();
  const selected = params.get("reserva");
  const [filter, setFilter] = useState("");
  const loader = useCallback(async (signal: AbortSignal) => {
    if (selected) return { data: [] };
    const { data } = await listarReservas(signal);
    return { data: requireArray(data) };
  }, [selected]);
  const resource = useApiResource(loader);
  const { reload } = resource;
  const rows = (resource.data ?? []).filter(item => filter === "ativas" ? ["pending", "accepted"].includes(item.status) : filter === "concluidas" ? item.status === "completed" : true);

  // Escuta socket em tempo real na lista de reservas
  useEffect(() => {
    if (!socket) return;
    const handleNotification = (notif?: unknown) => {
      const n = notif as BuyerNotification | undefined;
      if (!n) {
        reload();
        return;
      }
      if (["reserva_aceita", "reserva_recusada", "reserva_solicitada", "pagamento_confirmado"].includes(n.type)) {
        reload();
      }
    };
    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, reload]);

  // Polling automático enquanto houver reservas pendentes
  useEffect(() => {
    if (selected) return;
    const hasPending = (resource.data ?? []).some(item => item.status === "pending");
    if (!hasPending) return;
    const interval = setInterval(() => {
      reload();
    }, 4000);
    return () => clearInterval(interval);
  }, [selected, resource.data, reload]);

  if (selected) {
    return (
      <ReservationDetail
        key={selected}
        id={selected}
        paymentFirst={params.get("etapa") === "pagamento"}
        socket={socket}
      />
    );
  }

  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className={s.title}>{history ? "Histórico de reservas" : "Minhas Reservas"}</h1>
      <button onClick={resource.reload} disabled={resource.loading} className={s.secondary}>
        <RefreshCw size={15} className="inline mr-1" aria-hidden="true" />
        Atualizar reservas
      </button>
    </div>
    <label className={s.label}>Filtrar por situação
      <select aria-label="Situação da reserva" value={filter} onChange={e => setFilter(e.target.value)} className={`${s.input} max-w-xs`}>
        <option value="">Todas</option>
        <option value="ativas">Ativas</option>
        <option value="concluidas">Concluídas</option>
      </select>
    </label>
    <RequestState {...resource} retry={resource.reload} />
    {!resource.loading && !resource.error && (!rows.length ? (
      <div className={`${s.panel} space-y-4`}>
        <h2 className={s.subtitle}>Nenhuma reserva encontrada</h2>
        <p className={s.copy}>As solicitações registradas e suas atualizações aparecerão aqui.</p>
        <Link to="/marketplace" className={s.button}>Explorar materiais</Link>
      </div>
    ) : (
      <ul className="space-y-4">
        {rows.map(item => (
          <li key={item.id} className={`${s.panel} flex flex-wrap items-center justify-between gap-4`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  item.status === "accepted" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                  item.status === "pending" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                  item.status === "refused" ? "bg-rose-100 text-rose-800 border border-rose-200" :
                  item.status === "completed" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {shoppingLabel(item.status)}
                </span>
              </div>
              <p className={s.copy}>{dateLabel(item.datetime)} · {item.total_items ?? 0} {Number(item.total_items) === 1 ? "item" : "itens"}</p>
              <p className="font-bold">{money(item.value)}</p>
            </div>
            <button onClick={() => setParams({ aba: history ? "historico" : "reservas", reserva: item.id })} className={s.secondary}>
              Ver detalhes da reserva
            </button>
          </li>
        ))}
      </ul>
    ))}
  </section>;
}

function ReservationDetail({
  id,
  paymentFirst,
  socket,
}: {
  id: string;
  paymentFirst: boolean;
  socket?: BuyerSocket | null;
}) {
  const [, setParams] = useSearchParams();
  const loader = useCallback(async (signal: AbortSignal) => {
    const [resResponse, revResponse, dispResponse] = await Promise.allSettled([
      obterReserva(id, signal),
      listarAvaliacoes(signal),
      listarDisputas(signal),
    ]);

    if (resResponse.status === "rejected") {
      throw resResponse.reason;
    }

    const response = resResponse.value;
    if (response.data.id !== id || !Array.isArray(response.data.items)) throw new Error("Reserva inválida.");

    const allReviews = revResponse.status === "fulfilled" && Array.isArray(revResponse.value.data) ? revResponse.value.data : [];
    const shoppingReviews = allReviews.filter(
      (r: ReviewBackend) => r.id_shopping?.toLowerCase() === id.toLowerCase()
    );

    const allDisputes = dispResponse.status === "fulfilled" && Array.isArray(dispResponse.value.data) ? dispResponse.value.data : [];
    const shoppingDisputes = allDisputes.filter(
      (d: DisputeBackend) => d.id_shopping?.toLowerCase() === id.toLowerCase()
    );

    return {
      data: {
        ...response.data,
        reviews: shoppingReviews,
        disputes: shoppingDisputes,
      },
    };
  }, [id]);
  const resource = useApiResource(loader);
  const [confirm, setConfirm] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [paymentActivity, setPaymentActivity] = useState<PaymentActivity>({ busy: false, cancelBlocked: true });
  const { reload } = resource;
  const reloadAfterPayment = useCallback(() => { setPaymentActivity({ busy: false, cancelBlocked: true }); reload(); }, [reload]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Escuta socket para atualização em tempo real quando o fornecedor responder
  useEffect(() => {
    if (!socket) return;
    const handleNotification = (notif?: unknown) => {
      const n = notif as BuyerNotification | undefined;
      if (!n) {
        reload();
        return;
      }
      if (
        n.reference_id?.toLowerCase() === id.toLowerCase() ||
        ["reserva_aceita", "reserva_recusada", "pagamento_confirmado"].includes(n.type)
      ) {
        reload();
      }
    };
    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, id, reload]);

  // Polling automático a cada 3.5 segundos enquanto a reserva estiver pendente
  useEffect(() => {
    if (resource.data?.status !== "pending") return;
    const timer = setInterval(() => {
      reload();
    }, 3500);
    return () => clearInterval(timer);
  }, [resource.data?.status, reload]);

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

  const shopping = resource.data;
  const sellerId = shopping?.items?.[0]?.seller_id;
  const reviews = shopping?.reviews ?? [];
  const disputes = shopping?.disputes ?? [];
  const hasReview = reviews.length > 0;
  const hasActiveDispute = disputes.some(d => ["aberta", "em_analise"].includes(d.status));
  const canOpenDispute = shopping?.status === "completed" && !hasActiveDispute;

  return <section className="space-y-6">
    <button disabled={busy || paymentActivity.busy} onClick={() => setParams({ aba: "reservas" })} className={s.secondary}>Voltar às reservas</button>
    <h1 className={s.title}>{paymentFirst ? "Finalizar reserva" : "Detalhes da reserva"}</h1>
    {success && <p role="status" className={s.success}>{success}</p>}
    {error && !confirm && <p role="alert" className={s.error}>{error}</p>}
    <RequestState {...resource} retry={resource.reload} />
    {paymentFirst && !resource.loading && !resource.error && shopping && <BuyerPayment key={id} shopping={shopping} blocked={busy || confirm} onActivityChange={setPaymentActivity} onReservationChange={reloadAfterPayment} />}
    {!resource.loading && !resource.error && shopping && <div className={`${s.panel} space-y-6`}>
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            shopping.status === "accepted" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
            shopping.status === "pending" ? "bg-amber-100 text-amber-800 border border-amber-200" :
            shopping.status === "refused" ? "bg-rose-100 text-rose-800 border border-rose-200" :
            shopping.status === "completed" ? "bg-blue-100 text-blue-800 border border-blue-200" :
            "bg-gray-100 text-gray-700"
          }`}>
            {shoppingLabel(shopping.status)}
          </span>
          <h2 className={`${s.subtitle} mt-2`}>{shoppingLabel(shopping.status)}</h2>
        </div>
        <p className="text-xl font-bold">{money(shopping.value)}</p>
      </div>

      {shopping.status === "pending" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-center justify-between gap-3">
          <span>Aguardando a resposta da empresa fornecedora. Esta tela atualiza automaticamente assim que a reserva for aceita ou recusada.</span>
          <button type="button" onClick={resource.reload} className="shrink-0 underline font-semibold">Atualizar agora</button>
        </div>
      )}

      {shopping.status === "accepted" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
          <strong>Reserva aceita pelo fornecedor!</strong> O material está separado para você. Siga para a etapa de pagamento ou combine a retirada com a empresa.
        </div>
      )}

      {shopping.status === "refused" && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
          <strong>Reserva recusada pela empresa fornecedora.</strong> O material não pôde ser reservado e o estoque foi restaurado.
        </div>
      )}

      <p className={s.copy}>{dateLabel(shopping.datetime)}</p>
      <ul className="divide-y divide-[#E7E4DA]">{shopping.items?.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-4 py-4"><div><Link className="font-semibold underline" to={`/marketplace/produto/${encodeURIComponent(item.id_product)}`}>{item.product_name}</Link><p className={`${s.copy} mt-1`}>{item.quantity} unidades</p></div><p>{money(item.subtotal)}</p></li>)}</ul>
      <p className={s.notice}>Reserva e pagamento têm situações próprias. Consulte a confirmação antes da retirada.</p>
      
      {/* Botões de Ação da Reserva */}
      <div className="flex flex-wrap gap-3">
        {sellerId && <button type="button" className={s.secondary} disabled={busy || paymentActivity.busy} onClick={async () => { setBusy(true); setError(""); try { const response = await iniciarConversa(sellerId); if (!response.data.conversationId) throw new Error(); setParams({ aba: "mensagens", conversa: response.data.conversationId }); } catch { setError("Não foi possível abrir a conversa com a empresa."); } finally { setBusy(false); } }}>Conversar com a empresa</button>}
        
        {/* Avaliação de Pedido Concluído ou Aceito */}
        {sellerId && !hasReview && ["completed", "accepted"].includes(shopping.status) && (
          <button
            type="button"
            className={`${s.button} flex items-center gap-2`}
            disabled={busy || paymentActivity.busy}
            onClick={() => setReviewOpen(true)}
          >
            <Star size={18} className="fill-current" aria-hidden="true" />
            <span>Avaliar fornecedor</span>
          </button>
        )}

        {/* Denúncia / Abertura de Disputa */}
        {canOpenDispute && (
          <button
            type="button"
            className="buyer-secondary flex items-center gap-2 text-rose-700 hover:text-rose-800 hover:border-rose-300"
            disabled={busy || paymentActivity.busy}
            onClick={() => setDisputeOpen(true)}
          >
            <AlertTriangle size={18} aria-hidden="true" />
            <span>Denunciar pedido / problema</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button disabled={busy || paymentActivity.busy} onClick={resource.reload} className={s.secondary}>
          <RefreshCw size={15} className="inline mr-1" aria-hidden="true" />
          Atualizar detalhes
        </button>
        {shopping.status === "pending" && <button disabled={busy || paymentActivity.cancelBlocked} onClick={() => { setError(""); setConfirm(true); }} className={s.secondary}>Cancelar reserva</button>}
      </div>

      {shopping.status === "pending" && paymentActivity.cancelBlocked && <p className={s.notice}>O cancelamento da reserva fica bloqueado enquanto consultamos o pagamento, durante processamento ou quando há uma cobrança ativa ou sem confirmação. Para encerrar um Pix pendente, use a opção no painel de pagamento.</p>}

      {/* Seção de Avaliação Registrada */}
      {reviews.length > 0 && (
        <div className="border-t border-[#E7E4DA] pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Star size={18} className="text-amber-500 fill-amber-500" aria-hidden="true" />
              <span>Avaliação enviada</span>
            </h3>
            <Link to="/dashboardUsuario?aba=avaliacoes" className="text-xs font-semibold text-emerald-800 underline">
              Ver em Minhas Avaliações
            </Link>
          </div>
          <div className="space-y-3">
            {reviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        </div>
      )}

      {/* Seção de Denúncias / Disputas Registradas */}
      {disputes.length > 0 && (
        <div className="border-t border-[#E7E4DA] pt-5 space-y-3">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-600" aria-hidden="true" />
            <span>Ocorrências e denúncias</span>
          </h3>
          <div className="space-y-3">
            {disputes.map((disp) => (
              <DisputeCard key={disp.id} dispute={disp} />
            ))}
          </div>
        </div>
      )}
    </div>}
    {!paymentFirst && !resource.loading && !resource.error && shopping && <BuyerPayment key={id} shopping={shopping} blocked={busy || confirm} onActivityChange={setPaymentActivity} onReservationChange={reloadAfterPayment} />}
    
    {confirm && <ConfirmAction title="Cancelar reserva?" description="O cancelamento só é permitido enquanto a reserva está pendente e não identificamos cobrança ativa ou sem confirmação. A confirmação será feita pelo servidor." busy={busy} error={error} confirm={cancel} cancel={() => { if (!busy) setConfirm(false); }} />}
    
    {reviewOpen && sellerId && (
      <ReviewDialog
        shoppingId={id}
        sellerId={sellerId}
        onSuccess={() => {
          setReviewOpen(false);
          setSuccess("Avaliação enviada com sucesso! Obrigado pela colaboração.");
          resource.reload();
        }}
        onClose={() => setReviewOpen(false)}
      />
    )}

    {disputeOpen && canOpenDispute && !resource.loading && !resource.error && (
      <DisputeDialog
        shoppingId={id}
        onSuccess={() => {
          setDisputeOpen(false);
          setSuccess("Denúncia/disputa aberta com sucesso. Nossa equipe administrativa analisará o caso.");
          resource.reload();
        }}
        onClose={() => setDisputeOpen(false)}
      />
    )}
  </section>;
}
