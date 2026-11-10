import CompanyPage from "../../components/dashboard/CompanyPage";
import { companyStyles as styles } from "../../components/dashboard/companyStyles";
import { useRemoteData } from "../../hooks/useRemoteData";
import { companyError, displayDate, listDisputes, type Dispute } from "./companyApi";

function DisputeEditor({ item, onSaved }: { item: Dispute; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(item.description);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!description.trim()) { setError("Descreva o motivo da disputa."); return; }
    setBusy(true); setError("");
    try {
      await api.put(`/dispute/${item.id}`, { description: description.trim() });
      onSaved();
    } catch (cause) { setError(companyError(cause)); }
    finally { setBusy(false); }
  }
  return editing ? <form className="mt-4" onSubmit={event => void save(event)}>
    <label htmlFor={`description-${item.id}`} className="block font-semibold">Descrição da disputa</label>
    <textarea id={`description-${item.id}`} className={styles.input} rows={5} value={description} required disabled={busy} onChange={event => setDescription(event.target.value)} />
    {error && <p role="alert" className="mt-3">{error}</p>}
    <div className="mt-4 flex flex-wrap gap-3"><button type="submit" className={styles.button} disabled={busy}>{busy ? "Salvando…" : "Salvar descrição"}</button><button type="button" className={styles.secondary} disabled={busy} onClick={() => { setEditing(false); setDescription(item.description); setError(""); }}>Cancelar</button></div>
  </form> : <button type="button" className={`${styles.secondary} mt-4`} onClick={() => setEditing(true)}>Editar descrição</button>;
}

const statuses: Record<string, string> = { aberta: "Aberta", em_analise: "Em análise", resolvida: "Resolvida", rejeitada: "Rejeitada" };
export default function Disputas() {
  const { data, loading, error, reload } = useRemoteData(listDisputes);
  const { userId } = useLoggedUser();
  const [notice, setNotice] = useState("");
  return <CompanyPage title="Disputas" description="Acompanhe disputas de negociações em que sua empresa participa. A resolução e a rejeição são exclusivas da administração." loading={loading} error={error} reload={reload}>
    {notice && <p role="status" className="mt-4">{notice}</p>}
    {data?.length === 0 && <p className={styles.panel}>Nenhuma disputa encontrada para sua conta.</p>}
    <ul className="mt-5 space-y-4">{data?.map(item => <li key={item.id} className={`${styles.panel} break-words`}>
      <h2 className="text-lg font-semibold">Disputa de {displayDate(item.created_in)}</h2>
      <p className="mt-2">Situação: {statuses[item.status] ?? "Situação não reconhecida"}</p>
      <p className="mt-3 whitespace-pre-wrap">{item.description}</p>
      {userId && item.status === "aberta" && item.id_opened_by?.toLowerCase() === userId.toLowerCase() && <DisputeEditor item={item} onSaved={() => { setNotice("Descrição atualizada."); reload(); }} />}
      {item.resolution && <div className="mt-4 rounded-lg bg-bruma p-4"><h3 className="font-semibold">Resposta da administração</h3><p className="mt-2 whitespace-pre-wrap">{item.resolution}</p></div>}
    </li>)}</ul>
  </CompanyPage>;
}
import { useState, type FormEvent } from "react";
import api from "../../axios/Axios";
import { useLoggedUser } from "../../hooks/useLoggedUser";
