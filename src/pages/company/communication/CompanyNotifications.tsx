import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, useMediaQuery } from "@mui/material";
import { ArrowRight, Bell, CalendarCheck, CheckCheck, ChevronRight, Info, LoaderCircle, MessageSquare, Package, RefreshCw, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCompany } from "../CompanyContext";
import { useCommunication } from "./CommunicationContext";
import { dateGroup, notificationCategories, notificationCategory, notificationTime, type CompanyNotification, type NotificationCategory } from "./communicationTypes";

const icons = { reservation: CalendarCheck, message: MessageSquare, system: Package, other: Info };

function NotificationImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <Package size={24} aria-hidden="true" /> : <img src={src} alt="" width={62} height={55} loading="lazy" onError={() => setFailed(true)} />;
}

export default function CompanyNotifications() {
  const { preview, base } = useCompany();
  const { notifications, loading, failure, needsLogin, actionError, busy, reload, markRead, markAllRead, openConversation } = useCommunication();
  const navigate = useNavigate();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [category, setCategory] = useState<NotificationCategory>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const unread = notifications.filter(item => !item.read).length;
  const filtered = notifications.filter(item => (!unreadOnly || !item.read) && (category === "all" || notificationCategory(item.type) === category));
  const groups = new Map<string, CompanyNotification[]>();
  filtered.forEach(item => { const key = dateGroup(item.at); groups.set(key, [...(groups.get(key) ?? []), item]); });
  const selected = notifications.find(item => item.id === selectedId);
  async function view(item: CompanyNotification) {
    if (item.conversationId) {
      if (await markRead(item.id)) { openConversation(item.conversationId); navigate(`${base}/mensagens?conversa=${encodeURIComponent(item.conversationId)}`); }
    } else { setSelectedId(item.id); await markRead(item.id); }
  }
  function clearFilters() { setUnreadOnly(false); setCategory("all"); }
  return <div className="communication-page notification-page">
    <header className="communication-heading"><div><h1>Notificações</h1><p>Acompanhe as novidades dos seus materiais e conversas.</p></div><div className="notification-heading-actions">{!preview && <button type="button" onClick={reload} disabled={loading || !!busy} aria-label="Atualizar notificações"><RefreshCw size={17} aria-hidden="true" /></button>}<button type="button" onClick={() => void markAllRead()} disabled={loading || !!failure || !!busy || unread === 0}>{busy === "all" ? <LoaderCircle size={18} className="account-spinner" aria-hidden="true" /> : <CheckCheck size={18} aria-hidden="true" />}{busy === "all" ? "Marcando como lidas…" : "Marcar todas como lidas"}</button></div></header>
    <p className="communication-disclosure">{preview ? "Demonstração interativa · Dados fictícios. Alterações são temporárias e não afetam notificações reais." : "Atualizadas ao abrir esta tela ou usar o botão de atualizar."}</p>
    {actionError && !selected && <div className="communication-error" role="alert"><p>{actionError}</p>{needsLogin && <Link to="/login">Entrar novamente</Link>}</div>}
    {loading ? <div className="communication-state" role="status"><LoaderCircle size={27} className="account-spinner" aria-hidden="true" /><p>Carregando suas notificações…</p></div> : failure ? <div className="communication-state"><Bell size={32} strokeWidth={1.3} aria-hidden="true" /><h2>Não foi possível carregar as notificações</h2><p role="alert">{failure}</p>{needsLogin ? <Link to="/login" className="company-button">Entrar novamente</Link> : <button type="button" className="company-button" onClick={reload}>Tentar novamente</button>}</div> : <section className="notification-panel" aria-label="Central de notificações">
      <div className="notification-toolbar"><div className="communication-tabs" role="group" aria-label="Filtrar notificações"><button type="button" aria-pressed={!unreadOnly} onClick={() => setUnreadOnly(false)}>Todas</button><button type="button" aria-pressed={unreadOnly} onClick={() => setUnreadOnly(true)}>Não lidas<span>{unread}</span></button></div><label className="notification-type"><span className="sr-only">Tipo de notificação</span><select value={category} onChange={event => setCategory(event.target.value as NotificationCategory)}>{Object.entries(notificationCategories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
      <p className="sr-only" role="status">{filtered.length} notificações exibidas. {unread} não lidas.</p>
      {filtered.length ? <>{Array.from(groups, ([group, items]) => <section className="notification-group" key={group} aria-label={group}><h2>{group}</h2><ul>{items.map(item => {
        const Icon = icons[notificationCategory(item.type)];
        return <li key={item.id} className={!item.read ? "is-unread" : ""}><button type="button" className="notification-open" disabled={!!busy} onClick={() => void view(item)} aria-label={`${item.read ? "Lida" : "Não lida"}: ${item.title}`}><span className="notification-read-dot" aria-hidden="true" /><Icon className="notification-icon" size={25} strokeWidth={1.4} aria-hidden="true" /><span className="notification-thumbnail">{item.image && <NotificationImage src={item.image} />}</span><span className="notification-copy"><strong>{item.title}</strong><span>{item.content || "Abra para consultar os detalhes."}</span></span><time dateTime={item.at || undefined}>{notificationTime(item.at)}</time><span className="notification-action">{item.action ?? "Ver detalhes"}<ArrowRight size={15} aria-hidden="true" /></span><ChevronRight className="notification-chevron" size={18} aria-hidden="true" /></button></li>;
      })}</ul></section>)}<p className="notification-endnote">{unread === 0 ? "Você está em dia com as notificações carregadas." : `${filtered.length} ${filtered.length === 1 ? "notificação exibida" : "notificações exibidas"}.`}</p></> : <div className="communication-state"><Bell size={35} strokeWidth={1.2} aria-hidden="true" /><h2>{notifications.length === 0 ? "Nenhuma notificação por enquanto" : unreadOnly && unread === 0 ? "Tudo lido por aqui" : "Nenhuma notificação neste filtro"}</h2><p>{notifications.length === 0 ? "Seus avisos aparecerão aqui quando estiverem disponíveis." : "Você pode consultar todas as notificações ou escolher outro tipo."}</p>{(unreadOnly || category !== "all") && <button type="button" className="company-secondary" onClick={clearFilters}>Ver todas as notificações</button>}</div>}
    </section>}
    <Dialog open={!!selected} onClose={() => setSelectedId(null)} maxWidth="sm" fullWidth transitionDuration={reducedMotion ? 0 : { enter: 180, exit: 120 }} aria-labelledby="notification-dialog-title" slotProps={{ paper: { className: "activity-dialog" } }}><DialogTitle className="activity-dialog-heading"><span id="notification-dialog-title">Detalhes da notificação</span><button type="button" className="company-icon-button" onClick={() => setSelectedId(null)} aria-label="Fechar notificação"><X size={20} aria-hidden="true" /></button></DialogTitle><DialogContent>{selected && <div className="notification-detail"><p className="company-eyebrow">{notificationCategories[notificationCategory(selected.type)]} · {selected.read ? "Lida" : "Não lida"}</p><h2>{selected.title}</h2><p>{selected.content || "Esta notificação não contém mais detalhes."}</p><time dateTime={selected.at || undefined}>{notificationTime(selected.at)}</time>{preview && <p className="activity-detail-note">Este é um registro fictício. Não confirma uma reserva, retirada ou publicação real.</p>}{actionError && <p className="communication-error" role="alert">{actionError}</p>}{needsLogin && <Link to="/login" className="company-inline-link">Entrar novamente</Link>}<div className="notification-detail-actions">{!selected.read && <button type="button" className="company-button" disabled={!!busy} onClick={() => void markRead(selected.id)}>{busy ? "Marcando…" : "Marcar como lida"}</button>}<button type="button" className="company-secondary" onClick={() => setSelectedId(null)}>Fechar detalhes</button></div></div>}</DialogContent></Dialog>
  </div>;
}
