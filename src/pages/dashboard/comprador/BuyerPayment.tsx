import { useCallback, useState } from "react";
import axios from "axios";
import { cancelarPagamento, criarPagamentoPix, listarPagamentosReserva, obterCheckout, sincronizarPagamento, type BuyerPaymentResult, type Shopping } from "../../../axios/Axios";
import { apiError, apiStatus } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import ConfirmAction from "./ConfirmAction";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { money } from "./buyerPresentation";

const paymentLabels = { pending: "Aguardando pagamento", approved: "Pagamento aprovado", refused: "Pagamento recusado ou cancelado", refunded: "Pagamento reembolsado" };

export default function BuyerPayment({ shopping, changed }: { shopping: Shopping; changed: () => void }) {
  const loader = useCallback(async (signal: AbortSignal) => {
    if (Number(shopping.value) <= 0) return { data: null };
    const response = await listarPagamentosReserva(shopping.id, signal);
    const rows = requireArray(response.data);
    const selected = rows.find(item => item.status === "approved") ?? rows.find(item => item.status === "pending") ?? rows[0];
    if (!selected) return { data: null };
    return obterCheckout(selected.id, signal);
  }, [shopping.id, shopping.value]);
  const resource = useApiResource<BuyerPaymentResult | null>(loader);
  const [result, setResult] = useState<BuyerPaymentResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirm, setConfirm] = useState<"create" | "cancel" | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [reconcileId, setReconcileId] = useState("");
  const current = result ?? resource.data;
  const checkout = current?.checkout;
  const qrVisible = ["pending", "accepted"].includes(shopping.status) && current?.payment.method === "pix" && current.payment.status === "pending" && checkout?.status === "pending" && !checkout.needs_review;
  const qrImage = qrVisible && checkout?.qr_code_base64 && checkout.qr_code_base64.length < 2_000_000 && /^[A-Za-z0-9+/=]+$/.test(checkout.qr_code_base64) ? `data:image/png;base64,${checkout.qr_code_base64}` : null;
  async function operate(operation: "create" | "sync" | "cancel") {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const id = current?.payment.id || reconcileId;
      const response = operation === "create" ? await criarPagamentoPix(shopping.id) : operation === "cancel" ? await cancelarPagamento(id) : await sincronizarPagamento(id);
      if (response.data.payment.id_shopping !== shopping.id) throw new Error("Resposta inválida.");
      setResult(response.data); setConfirm(null); setReconcileId("");
      changed();
    } catch (cause) {
      if (operation === "create") {
        setConfirm(null);
        // Uma resposta perdida pode ter criado a cobrança. Nunca repetir POST automaticamente.
        const status = apiStatus(cause);
        if (!status || status >= 500) setUncertain(true);
        const id: unknown = axios.isAxiosError(cause) ? cause.response?.data?.payment_id : null;
        if (typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id)) { setReconcileId(id); setUncertain(true); }
        resource.reload();
      }
      setError(apiStatus(cause) === 409 ? "A situação da compra ou do pagamento mudou. Atualize antes de continuar." : apiStatus(cause) === 503 ? "O Pix está indisponível no momento. Nenhum pagamento foi confirmado." : apiError(cause, "Não recebemos confirmação. Consulte o pagamento antes de tentar novamente."));
    } finally { setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(checkout?.qr_code ?? ""); setNotice("Código Pix copiado."); }
    catch { setNotice("Não foi possível copiar. Selecione o código e copie manualmente."); }
  }
  return <section aria-labelledby="buyer-payment-title" className={`${s.panel} space-y-5`}>
    <h2 id="buyer-payment-title" className={s.subtitle}>Pagamento da reserva</h2>
    <RequestState {...resource} retry={resource.reload} />
    {error && <p role="alert" className={s.error}>{error}</p>}
    {notice && <p role="status" className={s.notice}>{notice}</p>}
    {uncertain && <p className={s.notice}>Há uma tentativa sem confirmação. Atualize o pagamento ou entre em contato com o suporte; não gere outra cobrança.</p>}
    {!resource.loading && !resource.error && !current && <>
      <p className={s.copy}>{Number(shopping.value) <= 0 ? "Esta reserva é gratuita e não exige pagamento." : shopping.status === "pending" ? "Você pode gerar o Pix desta reserva. Confira o recebedor e o valor antes de pagar." : "Não há pagamento registrado para esta reserva."}</p>
      {Number(shopping.value) > 0 && shopping.status === "pending" && !uncertain && <button type="button" disabled={busy} className={s.button} onClick={() => { setError(""); setConfirm("create"); }}>Pagar com Pix</button>}
    </>}
    {current && <>
      <p role="status" className="font-semibold">{paymentLabels[current.payment.status]} · {money(current.payment.value)}</p>
      <p className={s.copy}>Forma: {current.payment.method === "pix" ? "Pix" : "Cartão registrado"}</p>
      {(checkout?.simulation || checkout?.provider === "simulated" || checkout?.environment === "test") && <p className={s.notice}>Ambiente de teste. Não efetue pagamentos reais com estes dados.</p>}
      {checkout?.needs_review && <p className={s.notice}>Este pagamento requer análise. Aguarde a conferência do suporte antes de pagar novamente.</p>}
      {qrVisible && checkout?.qr_code && <div className="max-w-lg space-y-4">
        {qrImage && <img src={qrImage} alt="QR Code Pix desta reserva" width={240} height={240} className="max-w-full rounded-xl" />}
        <label className={s.label}>Pix copia e cola<textarea readOnly rows={4} value={checkout.qr_code} className={`${s.input} break-all`} /></label>
        <button type="button" className={s.secondary} onClick={copy}>Copiar código Pix</button>
        <p className={s.copy}>Confira o recebedor e o valor no seu banco. Aguarde a confirmação do serviço de pagamento.</p>
      </div>}
      {current.payment.method === "pix" && <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} className={s.secondary} onClick={() => operate("sync")}>{busy ? "Consultando..." : "Consultar pagamento"}</button>{current.payment.status === "pending" && <button type="button" disabled={busy} className={s.secondary} onClick={() => { setError(""); setConfirm("cancel"); }}>Cancelar pagamento</button>}</div>}
    </>}
    {!current && <button type="button" className={s.secondary} disabled={busy || resource.loading} onClick={() => { if (reconcileId) void operate("sync"); else resource.reload(); }}>Atualizar pagamento</button>}
    {confirm && <ConfirmAction title={confirm === "create" ? "Gerar pagamento Pix?" : "Cancelar pagamento?"} description={confirm === "create" ? `Será solicitado um Pix de ${money(shopping.value)} para esta reserva. Confira o valor antes de confirmar.` : "O cancelamento precisa ser confirmado pelo serviço de pagamento. Não pague um código cancelado."} busy={busy} error={error} confirm={() => operate(confirm)} cancel={() => { if (!busy) setConfirm(null); }} />}
  </section>;
}
