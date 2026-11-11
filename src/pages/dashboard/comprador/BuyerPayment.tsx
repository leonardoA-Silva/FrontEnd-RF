import { useCallback, useState } from "react";
import axios from "axios";
import { criarPagamentoPix, listarPagamentosReserva, obterCheckout, sincronizarPagamento, type BuyerPaymentResult, type Shopping } from "../../../api/services";
import { apiError, apiStatus } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import ConfirmAction from "./ConfirmAction";
import RequestState from "./RequestState";
import BuyerCardPayment from "./BuyerCardPayment";
import ReservationConfirmation from "./ReservationConfirmation";
import { buyerStyles as s } from "./buyerStyles";
import { money } from "./buyerPresentation";

const labels = { pending: "Aguardando confirmação", approved: "Pagamento aprovado", refused: "Pagamento recusado", refunded: "Pagamento reembolsado" };
export default function BuyerPayment({ shopping }: { shopping: Shopping }) {
  const loader = useCallback(async (signal: AbortSignal) => {
    if (Number(shopping.value) <= 0) return { data: null };
    const rows = requireArray((await listarPagamentosReserva(shopping.id, signal)).data);
    const selected = rows.find(item => item.status === "approved") ?? rows.find(item => item.status === "pending") ?? rows[0];
    return selected ? obterCheckout(selected.id, signal) : { data: null };
  }, [shopping.id, shopping.value]);
  const resource = useApiResource<BuyerPaymentResult | null>(loader);
  const [result, setResult] = useState<BuyerPaymentResult | null>(null);
  const [busy, setBusy] = useState(false), [confirm, setConfirm] = useState(false);
  const [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [uncertain, setUncertain] = useState(false), [reconcileId, setReconcileId] = useState("");
  const [method, setMethod] = useState("pix");
  const current = result ?? resource.data;
  const checkout = current?.checkout;
  const canPay = Number(shopping.value) > 0 && shopping.status === "pending" && !resource.loading && !resource.error && !uncertain && !current?.checkout?.needs_review && (!current || current.payment.status === "refused");
  const qrVisible = current?.payment.method === "pix" && current.payment.status === "pending" && checkout?.status === "pending" && !checkout.needs_review && ["pending", "accepted"].includes(shopping.status);
  function markUncertain(id?: string) { setResult(null); setUncertain(true); if (id) setReconcileId(id); resource.reload(); }
  function received(data: BuyerPaymentResult) { setResult(data); setConfirm(false); setReconcileId(""); setUncertain(false); }
  async function operate(create = false) {
    if (busy || (create && !canPay)) return;
    const id = reconcileId || current?.payment.id;
    if (!create && !id) { resource.reload(); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const response = create ? await criarPagamentoPix(shopping.id) : await sincronizarPagamento(id!);
      if (response.data.payment?.id_shopping !== shopping.id) throw new Error("Pagamento não confirmado.");
      received(response.data);
    } catch (cause) {
      if (create) {
        setConfirm(false);
        const status = apiStatus(cause), paymentId: unknown = axios.isAxiosError(cause) ? cause.response?.data?.payment_id : null;
        if (!status || status >= 500 || status === 409 || typeof paymentId === "string") markUncertain(typeof paymentId === "string" && /^[0-9a-f-]{36}$/i.test(paymentId) ? paymentId : undefined);
      }
      setError(apiError(cause, "Não foi possível confirmar o pagamento. Consulte a tentativa antes de tentar novamente."));
    } finally { setBusy(false); }
  }
  if (current?.payment.status === "approved" && !current.checkout?.needs_review) return <ReservationConfirmation shoppingId={shopping.id} simulated={!!current.checkout?.simulation || current.checkout?.environment === "test"} />;
  return <section aria-labelledby="buyer-payment-title" className={`${s.panel} space-y-5`}><h2 id="buyer-payment-title" className={s.subtitle}>Pagamento da reserva</h2><RequestState {...resource} retry={resource.reload} />
    {Number(shopping.value) <= 0 && <p className={s.notice}>Esta reserva é uma doação e não exige pagamento.</p>}
    {error && <p role="alert" className={s.error}>{error}</p>}{notice && <p role="status" className={s.notice}>{notice}</p>}
    {uncertain && <p className={s.notice}>Existe uma tentativa sem confirmação. Consulte o pagamento antes de tentar outra cobrança.</p>}
    {current && <><p role="status" className="font-semibold">{labels[current.payment.status]} · {money(current.payment.value)}</p><p>Forma: {current.payment.method === "pix" ? "Pix" : "Cartão"}</p>
      {(checkout?.simulation || checkout?.environment === "test") && <p className={s.notice}>Ambiente de teste. Não realize pagamentos reais.</p>}{checkout?.needs_review && <p className={s.notice}>Este pagamento precisa de conferência. Não pague novamente.</p>}
      {qrVisible && checkout?.qr_code && <div className="space-y-4">{checkout.qr_code_base64 && checkout.qr_code_base64.length < 2_000_000 && /^[A-Za-z0-9+/=]+$/.test(checkout.qr_code_base64) && <img alt="QR Code Pix desta reserva" width={240} height={240} src={`data:image/png;base64,${checkout.qr_code_base64}`} />}<label className={s.label}>Pix copia e cola<textarea className={s.input} readOnly rows={4} value={checkout.qr_code} /></label><button className={s.secondary} type="button" onClick={async () => { try { await navigator.clipboard.writeText(checkout.qr_code!); setNotice("Código Pix copiado."); } catch { setNotice("Selecione o código e copie manualmente."); } }}>Copiar código Pix</button><p className={s.copy}>Confira o valor e o recebedor no aplicativo do seu banco.</p></div>}
    </>}
    {(current || uncertain) && <button className={s.secondary} type="button" disabled={busy || resource.loading} onClick={() => void operate()}>{busy ? "Consultando…" : "Verificar pagamento"}</button>}
    {canPay && <><fieldset className="flex flex-wrap gap-4" disabled={busy}><legend className={s.label}>Forma de pagamento</legend><label><input type="radio" name="payment-method" checked={method === "pix"} onChange={() => setMethod("pix")} /> Pix</label><label><input type="radio" name="payment-method" checked={method === "card"} onChange={() => setMethod("card")} /> Cartão de crédito ou débito</label></fieldset>{method === "pix" ? <button className={s.button} type="button" disabled={busy} onClick={() => { setError(""); setConfirm(true); }}>Gerar Pix de {money(shopping.value)}</button> : <BuyerCardPayment shopping={shopping} onResult={received} onUncertain={markUncertain} onBusy={setBusy} />}</>}
    {!canPay && !current && !resource.loading && !resource.error && Number(shopping.value) > 0 && !uncertain && <p className={s.notice}>Esta reserva não está mais disponível para pagamento.</p>}
    {confirm && <ConfirmAction title="Gerar pagamento Pix?" description={`Será solicitado um Pix de ${money(shopping.value)}. Confira o valor e o recebedor antes de pagar.`} busy={busy} error={error} confirm={() => void operate(true)} cancel={() => { if (!busy) setConfirm(false); }} />}
  </section>;
}
