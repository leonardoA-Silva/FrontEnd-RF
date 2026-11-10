import { useCallback, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { atualizarAvaliacao, criarAvaliacao, excluirAvaliacao, listarAvaliacoes, listarReservas, obterReserva, type BuyerReview } from "../../../axios/Axios";
import { apiError, apiStatus } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import ConfirmAction from "./ConfirmAction";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { dateLabel } from "./buyerPresentation";

export default function BuyerReviews({ userId }: { userId: string }) {
  const [params] = useSearchParams();
  const [shoppingId, setShoppingId] = useState(params.get("reserva") ?? "");
  const [sellerId, setSellerId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState<BuyerReview | null>(null);
  const [deleting, setDeleting] = useState<BuyerReview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const loader = useCallback(async (signal: AbortSignal) => {
    const [reviews, shoppings] = await Promise.all([listarAvaliacoes(signal), listarReservas(signal)]);
    return { data: { reviews: requireArray(reviews.data).filter(item => item.id_reviewer.toLowerCase() === userId.toLowerCase() || item.id_reviewed.toLowerCase() === userId.toLowerCase()), shoppings: requireArray(shoppings.data).filter(item => item.status === "completed") } };
  }, [userId]);
  const resource = useApiResource(loader);
  const detailLoader = useCallback(async (signal: AbortSignal) => shoppingId ? obterReserva(shoppingId, signal) : { data: null }, [shoppingId]);
  const detail = useApiResource(detailLoader);
  const sellers = [...new Set(detail.data?.items?.map(item => item.seller_id).filter((id): id is string => !!id) ?? [])];
  const reviewedId = sellers.length === 1 ? sellers[0] : sellerId;
  function reset() { setEditing(null); setShoppingId(""); setSellerId(""); setRating(5); setComment(""); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    if (!editing && (detail.data?.status !== "completed" || !sellers.includes(reviewedId))) { setError("Selecione uma compra concluída e um fornecedor dessa compra."); return; }
    setBusy(true); setError(""); setSuccess("");
    try {
      if (editing) await atualizarAvaliacao(editing.id, { rating, comment: comment.trim() });
      else await criarAvaliacao({ rating, comment: comment.trim(), id_shopping: shoppingId, id_reviewed: reviewedId });
      setSuccess(editing ? "Avaliação atualizada." : "Avaliação enviada."); reset(); resource.reload();
    } catch (cause) { setError(apiStatus(cause) === 409 ? "Esta compra já possui uma avaliação sua. Atualize a lista para editá-la." : apiError(cause, "Não foi possível salvar a avaliação. Seus campos foram preservados.")); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!deleting || busy) return;
    setBusy(true); setError("");
    try { await excluirAvaliacao(deleting.id); if (editing?.id === deleting.id) reset(); setDeleting(null); setSuccess("Avaliação excluída."); resource.reload(); }
    catch (cause) { setError(apiError(cause, "Não foi possível excluir a avaliação.")); }
    finally { setBusy(false); }
  }
  const visibleReviews = resource.data?.reviews.filter(item => !params.get("avaliacao") || item.id === params.get("avaliacao")) ?? [];
  return <section className="space-y-6"><h1 className={s.title}>Minhas avaliações</h1><p className={s.copy}>Avaliações enviadas e recebidas. Avalie fornecedores de compras concluídas; é permitida uma avaliação por comprador em cada compra.</p>
    <RequestState {...resource} retry={resource.reload} />
    <button type="button" disabled={busy || resource.loading} onClick={resource.reload} className={s.secondary}>Atualizar avaliações</button>
    {success && <p role="status" className={s.success}>{success}</p>}
    {error && !deleting && <p role="alert" className={s.error}>{error}</p>}
    {!resource.loading && !resource.error && <>
      {(editing || !!resource.data?.shoppings.length) && <form onSubmit={submit} className={`${s.panel} space-y-5`}>
        <h2 className={s.subtitle}>{editing ? "Editar avaliação" : "Avaliar fornecedor"}</h2>
        <fieldset disabled={busy} className="space-y-4"><legend className="sr-only">Dados da avaliação</legend>
          {!editing && <><label className={s.label}>Compra concluída<select required value={shoppingId} onChange={event => { setShoppingId(event.target.value); setSellerId(""); }} className={s.input}><option value="">Selecione uma compra</option>{resource.data?.shoppings.map(item => <option key={item.id} value={item.id}>{dateLabel(item.datetime)} · {item.id.slice(0, 8)}</option>)}</select></label>
            {shoppingId && <RequestState {...detail} retry={detail.reload} />}
            {sellers.length > 1 && <label className={s.label}>Fornecedor da compra<select required value={sellerId} onChange={event => setSellerId(event.target.value)} className={s.input}><option value="">Selecione o fornecedor</option>{sellers.map(id => <option key={id} value={id}>{detail.data?.items?.filter(item => item.seller_id === id).map(item => item.product_name).join(", ")}</option>)}</select></label>}
          </>}
          <label className={s.label}>Nota<select value={rating} onChange={event => setRating(Number(event.target.value))} className={s.input}>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} {value === 1 ? "estrela" : "estrelas"}</option>)}</select></label>
          <label className={s.label}>Comentário (opcional)<textarea maxLength={1000} rows={4} value={comment} onChange={event => setComment(event.target.value)} className={s.input} /></label>
        </fieldset><div className="flex flex-wrap gap-3"><button disabled={busy || (!editing && (!shoppingId || detail.loading || !!detail.error))} className={s.button}>{busy ? "Salvando..." : "Salvar avaliação"}</button>{editing && <button type="button" disabled={busy} onClick={reset} className={s.secondary}>Cancelar edição</button>}</div>
      </form>}
      {params.get("avaliacao") && <Link to="/dashboardUsuario?aba=avaliacoes" className={s.secondary}>Ver todas as avaliações</Link>}
      {!visibleReviews.length ? <p className={s.notice}>Nenhuma avaliação encontrada. Compras concluídas aparecerão no formulário acima.</p> : <ul className="space-y-4">{visibleReviews.map(item => <li key={item.id} className={`${s.panel} space-y-3`}><h2 className={s.subtitle}>{item.rating} de 5 estrelas</h2><p className={s.copy}>{item.id_reviewer.toLowerCase() === userId.toLowerCase() ? "Enviada por você" : "Recebida por você"}</p><p className={`${s.copy} whitespace-pre-wrap break-words`}>{item.comment || "Sem comentário."}</p><p className={s.copy}>{dateLabel(item.created_in)}</p>{item.id_reviewer.toLowerCase() === userId.toLowerCase() && <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} className={s.secondary} onClick={() => { setEditing(item); setRating(item.rating); setComment(item.comment ?? ""); setError(""); }}>Editar avaliação</button><button type="button" disabled={busy} className={s.secondary} onClick={() => { setDeleting(item); setError(""); }}>Excluir avaliação</button></div>}</li>)}</ul>}
    </>}
    {deleting && <ConfirmAction title="Excluir avaliação?" description="Sua avaliação será removida da compra." busy={busy} error={error} confirm={remove} cancel={() => setDeleting(null)} />}
  </section>;
}
