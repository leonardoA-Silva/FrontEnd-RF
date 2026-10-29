import { useCallback, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { criarReserva, obterProdutoPorId } from "../../axios/Axios";
import { apiError, apiStatus } from "../../axios/apiError";
import { useApiResource } from "../../hooks/useApiResource";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";
import { money } from "../dashboard/comprador/buyerPresentation";
import RequestState from "../dashboard/comprador/RequestState";

export default function LiveReservationRequest() {
  const { productId = "" } = useParams();
  return <ReservationForm key={productId} productId={productId} />;
}

function ReservationForm({ productId }: { productId: string }) {
  const navigate = useNavigate();
  const loader = useCallback(async (signal: AbortSignal) => {
    const response = await obterProdutoPorId(productId, signal);
    if (response.data.id !== productId) throw new Error("Material inválido.");
    return response;
  }, [productId]);
  const resource = useApiResource(loader);
  const [quantity, setQuantity] = useState("1");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState("");
  const product = resource.data;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || uncertain || !product) return;
    const count = Number(quantity);
    if (!accepted || !Number.isInteger(count) || count < 1 || count > product.quantity) { setError("Confira a quantidade disponível e confirme a solicitação."); return; }
    setBusy(true); setError("");
    try {
      const { data } = await criarReserva(productId, count);
      if (!data.shopping?.id || data.shopping.status !== "pending") throw new Error("Resposta inválida.");
      navigate(`/dashboardUsuario?aba=reservas&reserva=${encodeURIComponent(data.shopping.id)}`, { replace: true });
    } catch (cause) {
      const status = apiStatus(cause);
      if (!status || status >= 500) { setUncertain(true); setError("Não recebemos a confirmação da solicitação. Consulte Minhas Reservas antes de solicitar novamente para evitar duplicidade."); }
      else setError(status === 400 || status === 409 ? "O material ou a quantidade não está mais disponível. Atualize o anúncio antes de solicitar novamente." : apiError(cause, "Não foi possível solicitar a reserva."));
    } finally { setBusy(false); }
  }
  return <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-5 py-10">
    <Link to={`/marketplace/produto/${encodeURIComponent(productId)}`} className={s.secondary}>Voltar ao material</Link><h1 className={s.title}>Solicitar reserva</h1>
    <RequestState {...resource} retry={resource.reload} />
    {!resource.loading && !resource.error && product && (product.status !== "available" || product.quantity < 1 ? <p role="status" className={s.notice}>Este material não está disponível para novas reservas.</p> : <form onSubmit={submit} className={`${s.panel} space-y-6`}>
      <h2 className={s.subtitle}>{product.name}</h2><p className={s.copy}>{product.quantity} unidades disponíveis</p>
      <fieldset disabled={busy || uncertain} className="space-y-6"><legend className="sr-only">Solicitação de material</legend>
        <label className={s.label}>Quantidade de unidades *<input required type="number" min={1} max={product.quantity} step={1} value={quantity} onChange={e => setQuantity(e.target.value)} className={s.input} /></label>
        <p className="text-lg font-semibold">{product.type_negotiation === "donation" ? "Doação gratuita" : `Estimativa: ${money(Number(product.price) * Number(quantity))}`}</p>
        <p className={s.notice}>O valor final é calculado pelo servidor. A solicitação fica aguardando aceite do fornecedor. Nenhum pagamento é realizado nesta etapa.</p>
        <label className="flex items-start gap-3 text-sm"><input required type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-1 accent-emerald-700" /><span>Confirmo a quantidade e quero solicitar a reserva deste material.</span></label>
      </fieldset>
      {error && <p role="alert" className={s.error}>{error}</p>}
      <div className="flex flex-wrap gap-3"><button disabled={busy || uncertain || !accepted} className={s.button}>{busy ? "Enviando solicitação..." : "Solicitar reserva"}</button><Link to="/dashboardUsuario?aba=reservas" className={s.secondary}>Minhas Reservas</Link></div>
    </form>)}
  </main>;
}
