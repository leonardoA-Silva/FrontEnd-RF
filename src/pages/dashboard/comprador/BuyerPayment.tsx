import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { criarPagamentoPix, listarPagamentosReserva, obterCheckout, sincronizarPagamento, cancelarPagamento, type BuyerPaymentResult, type Shopping } from "../../../api/services";
import { apiError, apiStatus } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import ConfirmAction from "./ConfirmAction";
import RequestState from "./RequestState";
import BuyerCardPayment from "./BuyerCardPayment";
import ReservationConfirmation from "./ReservationConfirmation";
import { buyerStyles as s } from "./buyerStyles";
import { money } from "./buyerPresentation";
import { paymentFailureAction, type PaymentActivity } from "./paymentFlow";

const labels = { pending: "Aguardando confirmação", approved: "Pagamento aprovado", refused: "Pagamento recusado", refunded: "Pagamento reembolsado" };
function isEndedPix(result: BuyerPaymentResult | null) {
  return result?.payment.method === "pix" && result.payment.status === "refused" &&
    !result.checkout?.needs_review && ["canceled", "cancelled", "expired"].includes(result.checkout?.provider_status ?? "");
}

export default function BuyerPayment({ shopping, blocked = false, onActivityChange, onReservationChange }: { shopping: Shopping; blocked?: boolean; onActivityChange?: (activity: PaymentActivity) => void; onReservationChange?: () => void }) {
  const loader = useCallback(async (signal?: AbortSignal) => {
    if (Number(shopping.value) <= 0) return { data: null };
    const rows = requireArray((await listarPagamentosReserva(shopping.id, signal)).data);
    const selected = rows.find(item => item.status === "approved") ?? rows.find(item => item.status === "pending") ?? rows[0];
    if (!selected) return { data: null };
    const response = await obterCheckout(selected.id, signal);
    if (response.data?.payment?.id !== selected.id || response.data.payment.id_shopping !== shopping.id) {
      throw new Error("Checkout não confirmado.");
    }
    return response;
  }, [shopping.id, shopping.value]);
  const resource = useApiResource<BuyerPaymentResult | null>(loader);
  const [result, setResult] = useState<BuyerPaymentResult | null>(null);
  const [busy, setBusy] = useState(false), [confirm, setConfirm] = useState(false);
  const [endConfirm, setEndConfirm] = useState(false);
  const [error, setError] = useState(""), [notice, setNotice] = useState("");
  const reconciliationKey = `rf-payment-reconciliation:${shopping.id}`;
  const [reconcileId, setReconcileId] = useState<string | null>(() => {
    try { return sessionStorage.getItem(reconciliationKey); } catch { return null; }
  });
  const uncertain = reconcileId !== null;
  const [method, setMethod] = useState("pix");
  const current = result ?? resource.data;
  const checkout = current?.checkout;
  const ended = isEndedPix(current);
  const canPay = !blocked && !ended && Number(shopping.value) > 0 && shopping.status === "pending" && !resource.loading && !resource.error && !uncertain && !current?.checkout?.needs_review && (!current || current.payment.status === "refused");
  const canEndPix = !blocked && !uncertain && !resource.loading && !resource.error && !checkout?.needs_review && current?.payment.method === "pix" && current.payment.status === "pending";
  const qrVisible = !busy && !blocked && !uncertain && current?.payment.method === "pix" && current.payment.status === "pending" && checkout?.status === "pending" && !checkout.needs_review && ["pending", "accepted"].includes(shopping.status);
  const cancelBlocked = busy || confirm || endConfirm || resource.loading || !!resource.error || uncertain || !!checkout?.needs_review || ended || (!!current && current.payment.status !== "refused");
  useEffect(() => { onActivityChange?.({ busy, cancelBlocked }); }, [busy, cancelBlocked, onActivityChange]);
  function persistReconciliation(id: string | null) {
    try {
      if (id === null) sessionStorage.removeItem(reconciliationKey);
      else sessionStorage.setItem(reconciliationKey, id);
    } catch { /* O bloqueio em memória continua disponível. */ }
  }
  function updateReconciliation(id: string | null) {
    setReconcileId(id);
    persistReconciliation(id);
  }
  function markUncertain(id?: string) { setResult(null); updateReconciliation(id ?? reconcileId ?? ""); resource.reload(); }
  function received(data: BuyerPaymentResult) {
    setResult(data); setConfirm(false); updateReconciliation(null);
    if ((data.payment.status === "approved" && !data.checkout?.needs_review) || isEndedPix(data)) onReservationChange?.();
  }
  function refreshPayments(message?: string) { if (message) setError(message); setResult(null); resource.reload(); }
  async function operate(create = false) {
    if (busy || blocked || (create && !canPay)) return;
    const id = reconcileId || current?.payment.id;
    setBusy(true); setError(""); setNotice("");
    try {
      // Sem ID, recupera a tentativa antes de sincronizar; a consulta nunca cria cobrança.
      const recovered = !create && !id ? (await loader()).data : null;
      const paymentId = id || recovered?.payment.id;
      // Persiste antes do envio sem desmontar o formulário em processamento.
      if (create) persistReconciliation("");
      const response = create ? await criarPagamentoPix(shopping.id) : paymentId ? await sincronizarPagamento(paymentId) : { data: null };
      if ((create || paymentId) && (!response.data?.payment?.id || response.data.payment.id_shopping !== shopping.id || (paymentId && !create && response.data.payment.id !== paymentId))) {
        throw new Error("Pagamento não confirmado.");
      }
      if (response.data) {
        received(response.data);
        if (resource.error) resource.reload();
      }
      else { setResult(null); updateReconciliation(null); resource.reload(); setNotice("Nenhuma tentativa foi encontrada. Esta consulta não enviou cobrança."); }
    } catch (cause) {
      if (create) {
        setConfirm(false);
        const details = axios.isAxiosError(cause) ? cause.response?.data : undefined;
        const action = paymentFailureAction(apiStatus(cause), details), paymentId: unknown = details?.payment_id;
        if (action === "reconcile") markUncertain(typeof paymentId === "string" && /^[0-9a-f-]{36}$/i.test(paymentId) ? paymentId : undefined);
        else {
          persistReconciliation(null);
          if (action === "reload") refreshPayments();
        }
      }
      setError(apiError(cause, "Não foi possível confirmar o pagamento. Consulte a tentativa antes de tentar novamente."));
    } finally { setBusy(false); }
  }
  async function endPix() {
    if (busy || !canEndPix || !current) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const id = current.payment.id;
      persistReconciliation(id);
      const { data } = await cancelarPagamento(id);
      if (data?.payment?.id !== id || data.payment.id_shopping !== shopping.id) throw new Error("Encerramento não confirmado.");
      setEndConfirm(false);
      if (isEndedPix(data) || (data.payment.status === "approved" && !data.checkout?.needs_review)) received(data);
      else {
        markUncertain(id);
        setError("O encerramento do Pix não foi confirmado. Confira a situação do pagamento antes de continuar.");
      }
    } catch (cause) {
      setEndConfirm(false); markUncertain(current.payment.id);
      setError(apiError(cause, "Não foi possível confirmar o encerramento. Verifique o pagamento antes de cancelar a reserva ou pagar novamente."));
    } finally { setBusy(false); }
  }
  if (!uncertain && current?.payment.status === "approved" && !current.checkout?.needs_review) return <ReservationConfirmation shoppingId={shopping.id} simulated={!!current.checkout?.simulation || current.checkout?.environment === "test"} />;
  return <section aria-labelledby="buyer-payment-title" className={`${s.panel} space-y-5`}><h2 id="buyer-payment-title" className={s.subtitle}>Pagamento da reserva</h2><RequestState {...resource} retry={resource.reload} />
    {Number(shopping.value) <= 0 && <p className={s.notice}>Esta reserva é uma doação e não exige pagamento.</p>}
    {error && <p role="alert" className={s.error}>{error}</p>}{notice && <p role="status" className={s.notice}>{notice}</p>}
    {uncertain && <p className={s.notice}>Existe uma tentativa sem confirmação. Consulte o pagamento antes de tentar outra cobrança.</p>}
    {current && <><p role="status" className="font-semibold">{labels[current.payment.status]} · {money(current.payment.value)}</p><p>Forma: {current.payment.method === "pix" ? "Pix" : "Cartão"}</p>
      {(checkout?.simulation || checkout?.environment === "test") && <p className={s.notice}>Ambiente de teste. Não realize pagamentos reais.</p>}{checkout?.needs_review && <p className={s.notice}>Este pagamento precisa de conferência. Não pague novamente.</p>}
      {qrVisible && checkout?.qr_code && <div className="space-y-4">{checkout.qr_code_base64 && checkout.qr_code_base64.length < 2_000_000 && /^[A-Za-z0-9+/=]+$/.test(checkout.qr_code_base64) && <img alt="QR Code Pix desta reserva" width={240} height={240} src={`data:image/png;base64,${checkout.qr_code_base64}`} />}<label className={s.label}>Pix copia e cola<textarea className={s.input} readOnly rows={4} value={checkout.qr_code} /></label><button className={s.secondary} type="button" onClick={async () => { try { await navigator.clipboard.writeText(checkout.qr_code!); setNotice("Código Pix copiado."); } catch { setNotice("Selecione o código e copie manualmente."); } }}>Copiar código Pix</button><p className={s.copy}>Confira o valor e o recebedor no aplicativo do seu banco.</p></div>}
    </>}
    {(current || uncertain) && <button className={s.secondary} type="button" disabled={busy || blocked || resource.loading} onClick={() => void operate()}>{busy ? "Consultando…" : "Verificar pagamento"}</button>}
    {canEndPix && <button className={s.secondary} type="button" disabled={busy} onClick={() => { setError(""); setEndConfirm(true); }}>Encerrar Pix</button>}
    {!uncertain && ended && <div className="space-y-3"><p className={s.notice}>Este Pix foi encerrado. A API também encerra a reserva quando não há outra tentativa ativa.</p><Link className={s.secondary} to="/marketplace">Criar nova reserva</Link></div>}
    {canPay && <><fieldset className="flex flex-wrap gap-4" disabled={busy}><legend className={s.label}>Forma de pagamento</legend><label><input type="radio" name="payment-method" checked={method === "pix"} onChange={() => setMethod("pix")} /> Pix</label><label><input type="radio" name="payment-method" checked={method === "card"} onChange={() => setMethod("card")} /> Cartão de crédito ou débito</label></fieldset>{method === "pix" ? <button className={s.button} type="button" disabled={busy} onClick={() => { setError(""); setConfirm(true); }}>Gerar Pix de {money(shopping.value)}</button> : <BuyerCardPayment shopping={shopping} onResult={received} onUncertain={markUncertain} onRefresh={refreshPayments} onBusy={setBusy} onDispatchChange={pending => persistReconciliation(pending ? "" : null)} />}</>}
    {!current && !resource.loading && !resource.error && Number(shopping.value) > 0 && !uncertain && shopping.status !== "pending" && <p className={s.notice}>Esta reserva não está disponível para iniciar um pagamento.</p>}
    {confirm && <ConfirmAction title="Gerar pagamento Pix?" description={`Será solicitado um Pix de ${money(shopping.value)}. Confira o valor e o recebedor antes de pagar.`} busy={busy} error={error} confirm={() => void operate(true)} cancel={() => { if (!busy) setConfirm(false); }} />}
    {endConfirm && <ConfirmAction title="Encerrar Pix e reserva?" description="A API tentará encerrar o Pix. Se confirmado e sem outra tentativa ativa, a reserva também será cancelada e o estoque liberado. Se você já pagou, verifique o pagamento antes de encerrar." busy={busy} error={error} confirm={() => void endPix()} cancel={() => { if (!busy) setEndConfirm(false); }} />}
  </section>;
}
