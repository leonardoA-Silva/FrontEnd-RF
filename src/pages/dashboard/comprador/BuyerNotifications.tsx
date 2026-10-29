import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { contarNotificacoes, excluirNotificacao, lerNotificacao, lerTodasNotificacoes, listarNotificacoes, type BuyerNotification } from "../../../axios/Axios";
import { apiError } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import type { BuyerSocket } from "../../../realtime/buyerSocket";
import ConfirmAction from "./ConfirmAction";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { dateLabel } from "./buyerPresentation";

export default function BuyerNotifications({ socket }: { socket: BuyerSocket | null }) {
  const [read, setRead] = useState("");
  const [type, setType] = useState("");
  const loader = useCallback(async (signal: AbortSignal) => {
    const [list, count] = await Promise.all([listarNotificacoes(read, type, signal), contarNotificacoes(signal)]);
    return { data: { items: requireArray(list.data), total: count.data.total } };
  }, [read, type]);
  const resource = useApiResource(loader);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selected, setSelected] = useState<BuyerNotification | null>(null);
  useEffect(() => {
    if (!socket) return;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => { clearTimeout(timer); timer = setTimeout(resource.reload, 400); };
    const events = ["notification", "notification_read", "notifications_read_all", "notification_deleted"];
    events.forEach(event => socket.on(event, refresh));
    return () => { clearTimeout(timer); events.forEach(event => socket.off(event, refresh)); };
  }, [socket, resource.reload]);
  async function action(operation: () => Promise<unknown>, message: string) {
    if (busy) return;
    setBusy(true); setError(""); setSuccess("");
    try { await operation(); setSelected(null); setSuccess(message); resource.reload(); }
    catch (cause) { setError(apiError(cause, "Não foi possível atualizar a notificação.")); }
    finally { setBusy(false); }
  }
  return <section className="space-y-6">
    <h1 className={s.title}>Notificações</h1>
    <div className="flex flex-wrap items-center gap-3"><button disabled={resource.loading} onClick={resource.reload} className={s.secondary}>Atualizar notificações</button><button disabled={busy || resource.loading || !resource.data?.total} onClick={() => action(lerTodasNotificacoes, "Notificações marcadas como lidas.")} className={s.secondary}>Marcar todas como lidas</button>{resource.data && <p role="status" className={s.copy}>{resource.data.total} não lidas</p>}</div>
    <div className="grid max-w-2xl gap-4 sm:grid-cols-2"><label className={s.label}>Leitura<select aria-label="Leitura" value={read} onChange={e => setRead(e.target.value)} className={s.input}><option value="">Todas</option><option value="nao">Não lidas</option><option value="sim">Lidas</option></select></label><label className={s.label}>Tipo de notificação<select aria-label="Tipo de notificação" value={type} onChange={e => setType(e.target.value)} className={s.input}><option value="">Todos</option><option value="reserva_aceita">Reserva aceita</option><option value="reserva_recusada">Reserva recusada</option><option value="nova_mensagem">Nova mensagem</option><option value="sistema">Sistema</option></select></label></div>
    {error && !selected && <p role="alert" className={s.error}>{error}</p>}{success && <p role="status" className={s.success}>{success}</p>}
    <RequestState {...resource} retry={resource.reload} />
    {!resource.loading && !resource.error && (!resource.data?.items.length ? <p className={s.notice}>Nenhuma notificação encontrada.</p> : <ul className="space-y-4">{resource.data.items.map(item => <li key={item.id} className={`${s.panel} space-y-4`}><div className="flex flex-wrap justify-between gap-3"><h2 className={s.subtitle}>{item.title}</h2><span className={s.copy}>{item.read === "sim" ? "Lida" : "Não lida"}</span></div><p className={`${s.copy} whitespace-pre-wrap break-words`}>{item.content}</p><p className={s.copy}>{dateLabel(item.created_in)}</p><div className="flex flex-wrap gap-3">{item.reference_id && ["shopping", "conversation"].includes(item.reference_table ?? "") && <Link to={`/dashboardUsuario?aba=${item.reference_table === "shopping" ? "reservas&reserva" : "mensagens&conversa"}=${encodeURIComponent(item.reference_id)}`} className={s.secondary}>Abrir {item.reference_table === "shopping" ? "reserva" : "conversa"}</Link>}{item.read === "nao" && <button disabled={busy} onClick={() => action(() => lerNotificacao(item.id), "Notificação marcada como lida.")} className={s.secondary}>Marcar como lida</button>}<button disabled={busy} onClick={() => { setError(""); setSelected(item); }} className={s.secondary}>Excluir notificação</button></div></li>)}</ul>)}
    {selected && <ConfirmAction title="Excluir notificação?" description="A notificação será removida da sua conta." busy={busy} error={error} cancel={() => setSelected(null)} confirm={() => action(() => excluirNotificacao(selected.id), "Notificação excluída.")} />}
  </section>;
}
