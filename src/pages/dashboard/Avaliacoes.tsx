import CompanyPage from "../../components/dashboard/CompanyPage";
import { companyStyles as styles } from "../../components/dashboard/companyStyles";
import { useRemoteData } from "../../hooks/useRemoteData";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { companyError, displayDate, listReviews, type Review } from "./companyApi";

function ReviewActions({ item, onSaved }: { item: Review; onSaved: (message: string) => void }) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [rating, setRating] = useState(Number(item.rating));
  const [comment, setComment] = useState(item.comment ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await api.put(`/review/${item.id}`, { rating, comment: comment.trim() });
      onSaved("Avaliação atualizada.");
    } catch (cause) { setError(companyError(cause)); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true); setError("");
    try { await api.delete(`/review/${item.id}`); onSaved("Avaliação excluída."); }
    catch (cause) { setError(companyError(cause)); }
    finally { setBusy(false); }
  }
  function cancel() { setMode("view"); setRating(Number(item.rating)); setComment(item.comment ?? ""); setError(""); }
  return <div className="mt-4">
    {error && <p role="alert" className="mb-3">{error}</p>}
    {mode === "view" && <div className="flex flex-wrap gap-3"><button type="button" className={styles.secondary} onClick={() => setMode("edit")}>Editar avaliação</button><button type="button" className={styles.secondary} onClick={() => setMode("delete")}>Excluir avaliação</button></div>}
    {mode === "edit" && <form onSubmit={event => void save(event)}>
      <label htmlFor={`rating-${item.id}`}>Nota<select id={`rating-${item.id}`} className={styles.input} value={rating} disabled={busy} onChange={event => setRating(Number(event.target.value))}>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} de 5</option>)}</select></label>
      <label htmlFor={`comment-${item.id}`} className="mt-4 block">Comentário<textarea id={`comment-${item.id}`} className={styles.input} value={comment} rows={4} maxLength={1000} disabled={busy} onChange={event => setComment(event.target.value)} /></label>
      <div className="mt-4 flex flex-wrap gap-3"><button type="submit" className={styles.button} disabled={busy}>{busy ? "Salvando…" : "Salvar avaliação"}</button><button type="button" className={styles.secondary} disabled={busy} onClick={cancel}>Cancelar</button></div>
    </form>}
    {mode === "delete" && <div className="rounded-lg bg-bruma p-4"><p>Excluir esta avaliação? Esta ação não pode ser desfeita.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" className={styles.button} disabled={busy} onClick={() => void remove()}>{busy ? "Excluindo…" : "Confirmar exclusão"}</button><button type="button" className={styles.secondary} disabled={busy} onClick={cancel}>Manter avaliação</button></div></div>}
  </div>;
}

export default function Avaliacoes() {
  const { userId } = useLoggedUser();
  const { data, loading, error, reload } = useRemoteData(listReviews);
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState("");
  const visible = data?.filter(item => userId && (sent ? item.id_reviewer : item.id_reviewed)?.toLowerCase() === userId.toLowerCase()) ?? [];
  return <CompanyPage title="Avaliações" description="Consulte as avaliações recebidas e gerencie as avaliações feitas pela sua conta." loading={loading} error={error || (!userId ? "Não foi possível identificar sua conta. Entre novamente." : "")} reload={reload}>
    <label className="mt-5 block" htmlFor="review-scope">Exibir<select id="review-scope" className={`${styles.input} max-w-sm`} value={sent ? "sent" : "received"} onChange={event => { setSent(event.target.value === "sent"); setNotice(""); }}><option value="received">Recebidas pela empresa</option><option value="sent">Feitas pela minha conta</option></select></label>
    {notice && <p role="status" className="mt-4">{notice}</p>}
    {visible.length === 0 && <p className={styles.panel}>{sent ? "Sua conta ainda não fez avaliações." : "Sua empresa ainda não recebeu avaliações."}</p>}
    <ul className="mt-5 space-y-4">{visible.map(item => <li key={item.id} className={`${styles.panel} break-words`}><h2 className="text-lg font-semibold">Nota {item.rating} de 5</h2><p className="mt-2 text-sm text-tinta-suave">{displayDate(item.created_in)}</p><p className="mt-3 whitespace-pre-wrap">{item.comment || "Sem comentário."}</p>{sent && <ReviewActions item={item} onSaved={message => { setNotice(message); reload(); }} />}</li>)}</ul>
  </CompanyPage>;
}
import { useState, type FormEvent } from "react";
import api from "../../axios/Axios";
