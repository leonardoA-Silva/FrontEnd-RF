import { ArrowLeft, MessageCircle, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listarConversas } from "../../../api/services";
import { useApiResource, requireArray } from "../../../hooks/useApiResource";
import { useBuyerSocket } from "../../../hooks/useBuyerSocket";
import { useLoggedUser } from "../../../hooks/useLoggedUser";
import ConversationMessages from "./ConversationMessages";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";

export default function BuyerConversations({ company = false }: { company?: boolean }) {
  const { user, token } = useLoggedUser(); const realtime = useBuyerSocket(token);
  const [query, setQuery] = useSearchParams(); const selected = query.get("conversa");
  const [search, setSearch] = useState("");
  const loader = useCallback(async (signal: AbortSignal) => ({ data: requireArray((await listarConversas(signal)).data) }), []);
  const resource = useApiResource(loader); const { reload } = resource;
  useEffect(() => {
    if (!realtime.socket) return;
    const socket = realtime.socket; socket.on("new_message", reload);
    window.addEventListener("focus", reload);
    return () => { socket.off("new_message", reload); window.removeEventListener("focus", reload); };
  }, [realtime.socket, reload]);
  function choose(id?: string) { setQuery({ ...(!company ? { aba: "mensagens" } : {}), ...(id ? { conversa: id } : {}) }); }
  const conversations = resource.data?.filter(item => item.otherUserName.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))) ?? [];
  const current = resource.data?.find(item => item.conversationId === selected);
  return <section className="chat-page"><div className="chat-page-heading"><div><h1 className={s.title}>Mensagens</h1><p className={s.copy}>{company ? "Converse com os compradores." : "Converse com as empresas."}</p></div><button className={s.secondary} onClick={reload} disabled={resource.loading}>Atualizar conversas</button></div><RequestState {...resource} retry={reload} />{!realtime.connected && <div role="status" className={s.notice}><p>{realtime.error || "Conectando ao chat…"}</p><button type="button" className={s.secondary} onClick={realtime.reconnect}>Reconectar</button></div>}
  <div className={"chat-shell " + (selected ? "chat-has-selection" : "")}><aside className="chat-sidebar" aria-label="Conversas"><div className="chat-sidebar-title"><MessageCircle size={22} aria-hidden="true" /><strong>Suas conversas</strong><span>{resource.data?.length ?? 0}</span></div><label className="chat-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar conversa</span><input type="search" placeholder="Buscar uma conversa" value={search} onChange={event => setSearch(event.target.value)} /></label><ul className="chat-conversations">{conversations.map(item => <li key={item.conversationId}><button type="button" onClick={() => choose(item.conversationId)} aria-current={selected === item.conversationId ? "page" : undefined}><span className="chat-avatar" aria-hidden="true">{(item.otherUserName || "P").slice(0, 1).toLocaleUpperCase("pt-BR")}</span><span className="chat-contact"><strong>{item.otherUserName || "Participante"}</strong><small>Abrir conversa</small></span>{Number(item.unreadCount) > 0 && <span className="chat-unread" aria-label={item.unreadCount + " mensagens não lidas"}>{item.unreadCount}</span>}</button></li>)}</ul>{!resource.loading && !resource.error && !conversations.length && <p className="chat-list-empty">{search ? "Nenhuma conversa encontrada." : "Suas conversas aparecerão aqui."}</p>}</aside><div className="chat-thread">{selected && user ? <><header className="chat-thread-header"><button type="button" className="chat-icon-button" onClick={() => choose()} aria-label="Voltar às conversas"><ArrowLeft size={20} /></button><span className="chat-avatar" aria-hidden="true">{(current?.otherUserName || "P").slice(0, 1).toLocaleUpperCase("pt-BR")}</span><div><strong>{current?.otherUserName || "Conversa"}</strong><small>{realtime.connected ? "Conectado ao chat" : "Aguardando conexão"}</small></div></header><ConversationMessages key={selected} id={selected} userId={user.id} socket={realtime.socket} connected={realtime.connected} /></> : <div className="chat-welcome"><MessageCircle size={48} strokeWidth={1.3} aria-hidden="true" /><h2>Vamos conversar?</h2><p>Selecione uma conversa para começar.</p></div>}</div></div></section>;
}
