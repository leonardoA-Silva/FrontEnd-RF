import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarNotificacoes, lerNotificacao, lerTodasNotificacoes, type BuyerNotification } from "../../api/services";
import { useApiResource, requireArray } from "../../hooks/useApiResource";
import { apiError } from "../../axios/apiError";
import type { BuyerSocket } from "../../realtime/buyerSocket";
import { CommunicationContext } from "../../pages/company/communication/CommunicationContext";
import RequestState from "../../pages/dashboard/comprador/RequestState";
import { dateLabel } from "../../pages/dashboard/comprador/buyerPresentation";
import { buyerStyles as s } from "../../pages/dashboard/comprador/buyerStyles";

export default function AccountNotifications({ company = false, socket }: { company?: boolean; socket?: BuyerSocket | null }) {
  const navigate = useNavigate(); const communication = useContext(CommunicationContext);
  const loader = useCallback(async (signal: AbortSignal) => ({ data: requireArray((await listarNotificacoes("", "", signal)).data) }), []);
  const resource = useApiResource(loader); const { reload } = resource;
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => { if (!socket) return; const refresh = () => reload(); const events = ["notification", "notification_read", "notifications_read_all"]; events.forEach(event => socket.on(event, refresh)); return () => events.forEach(event => socket.off(event, refresh)); }, [socket, reload]);
  async function open(item: BuyerNotification) {
    if (busy) return; setBusy(true); setError("");
    try { if (item.read !== "sim") { await lerNotificacao(item.id); reload(); communication?.reload(); }
      if (company && item.type === "reserva_solicitada") navigate("/dashboardEmpresa/reservas");
      else if (item.reference_table === "conversation" && item.reference_id) navigate(company ? `/dashboardEmpresa/mensagens?conversa=${encodeURIComponent(item.reference_id)}` : `/dashboardUsuario?aba=mensagens&conversa=${encodeURIComponent(item.reference_id)}`);
      else if (!company && ["reserva_aceita", "reserva_recusada", "pagamento_confirmado"].includes(item.type)) navigate("/dashboardUsuario?aba=historico");
    } catch (cause) { setError(apiError(cause, "Não foi possível marcar o aviso como lido.")); } finally { setBusy(false); }
  }
  return <section className="space-y-6"><h1 className={s.title}>Notificações</h1><div className="flex flex-wrap gap-3"><button className={s.secondary} disabled={busy || resource.loading} onClick={reload}>Atualizar</button><button className={s.secondary} disabled={busy || resource.loading || !resource.data?.some(item => item.read !== "sim")} onClick={async () => { setBusy(true); setError(""); try { await lerTodasNotificacoes(); reload(); communication?.reload(); } catch (cause) { setError(apiError(cause)); } finally { setBusy(false); } }}>Marcar todas como lidas</button></div><RequestState {...resource} retry={reload} />{error && <p role="alert" className={s.error}>{error}</p>}{!resource.loading && !resource.error && (!resource.data?.length ? <p className={s.notice}>Nenhuma notificação recebida.</p> : <ul className="space-y-4">{resource.data.map(item => <li key={item.id} className={`${s.panel} space-y-3`}><h2 className={s.subtitle}>{item.title}</h2><p className="whitespace-pre-wrap break-words">{item.content}</p><p className={s.copy}>{dateLabel(item.created_in)} · {item.read === "sim" ? "Lida" : "Não lida"}</p><button className={s.secondary} disabled={busy} onClick={() => void open(item)}>{item.read === "sim" ? "Abrir aviso" : "Abrir e marcar como lida"}</button></li>)}</ul>)}</section>;
}
