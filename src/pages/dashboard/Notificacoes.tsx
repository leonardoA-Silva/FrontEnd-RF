import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios/Axios";
import CompanyPage from "../../components/dashboard/CompanyPage";
import { companyStyles as styles } from "../../components/dashboard/companyStyles";
import { useRemoteData } from "../../hooks/useRemoteData";
import { companyError, displayDate, listNotifications } from "./companyApi";

export default function Notificacoes() {
  const { data, loading, error, reload } = useRemoteData(listNotifications);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  async function remove() {
    if (!deleteId) return;
    setBusy(true); setActionError(""); setNotice("");
    try {
      await api.delete(`/notification/${deleteId}`);
      setDeleteId(null); setNotice("Notificação excluída.");
      window.dispatchEvent(new Event("company-notifications-changed")); reload();
    } catch (cause) { setActionError(companyError(cause)); }
    finally { setBusy(false); }
  }
  const unread = data?.filter(item => item.read === "nao").length ?? 0;
  async function markRead(id?: string) {
    setBusy(true); setActionError(""); setNotice("");
    try {
      await api.patch(id ? `/notification/${id}/read` : "/notification/read-all");
      setNotice(id ? "Notificação marcada como lida." : "Notificações marcadas como lidas.");
      window.dispatchEvent(new Event("company-notifications-changed"));
      reload();
    } catch (cause) { setActionError(companyError(cause)); }
    finally { setBusy(false); }
  }
  return <CompanyPage title="Notificações" description="Acompanhe os avisos enviados à sua empresa." loading={loading} error={error} reload={reload}>
    {notice && <p role="status" className="mt-4">{notice}</p>}
    {actionError && <p role="alert" className="mt-4">{actionError}</p>}
    <div className="mt-5 flex flex-wrap items-center gap-4">
      <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} />Somente não lidas ({unread})</label>
      <button type="button" className={styles.secondary} disabled={busy || unread === 0} onClick={() => void markRead()}>Marcar todas como lidas</button>
    </div>
    <ul className="mt-4 space-y-4">
      {data?.filter(item => !unreadOnly || item.read === "nao").map(item => <li key={item.id} className={`${styles.panel} break-words`}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{item.title}</h2><span className="text-sm">{item.read === "nao" ? "Não lida" : "Lida"} · {displayDate(item.created_in)}</span></div>
        <p className="mt-3 whitespace-pre-wrap">{item.content}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {item.read === "nao" && <button type="button" className={styles.secondary} disabled={busy} onClick={() => void markRead(item.id)}>Marcar como lida</button>}
          {item.reference_table === "dispute" && <Link className={styles.secondary} to="/dashboardEmpresa/disputas">Ver disputas</Link>}
          {item.reference_table === "review" && <Link className={styles.secondary} to="/dashboardEmpresa/avaliacoes">Ver avaliações</Link>}
          <button type="button" className={styles.secondary} disabled={busy} onClick={() => setDeleteId(item.id)}>Excluir notificação</button>
        </div>
        {deleteId === item.id && <div className="mt-4 rounded-lg bg-bruma p-4"><p>Excluir esta notificação? Esta ação não pode ser desfeita.</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" className={styles.button} disabled={busy} onClick={() => void remove()}>{busy ? "Excluindo…" : "Confirmar exclusão"}</button><button type="button" className={styles.secondary} disabled={busy} onClick={() => setDeleteId(null)}>Manter notificação</button></div></div>}
      </li>)}
    </ul>
    {data && !data.some(item => !unreadOnly || item.read === "nao") && <p className={styles.panel}>{unreadOnly ? "Nenhuma notificação não lida." : "Sua empresa ainda não recebeu notificações."}</p>}
  </CompanyPage>;
}
