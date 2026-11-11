import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, LoaderCircle, MessageSquare, Package, Paperclip, RefreshCw, Search, Send } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useCompany } from "../CompanyContext";
import { useCommunication } from "./CommunicationContext";
import { conversationTime, dateGroup, messageTime } from "./communicationTypes";

export default function CompanyMessages() {
  const { preview, base } = useCompany();
  const { conversations, drafts, setDraft, openConversation, sendMessage, chatLoading, chatFailure, threadLoading, threadFailure, chatConnected, sending, sendError, reloadChat } = useCommunication();
  const [query, setQuery] = useSearchParams();
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [feedback, setFeedback] = useState("");
  const log = useRef<HTMLOListElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const listButtons = useRef(new Map<string, HTMLButtonElement>());
  const unread = conversations.reduce((count, item) => count + item.unread, 0);
  const visible = conversations.filter(item => (!unreadOnly || item.unread > 0) && `${item.name} ${item.messages.at(-1)?.text ?? ""}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")));
  const requestedId = query.get("conversa");
  const selected = requestedId ? conversations.find(item => item.id === requestedId) : visible[0];
  const selectedId = selected?.id;
  const messageCount = selected?.messages.length;
  const selectedUnread = selected?.unread ?? 0;
  const draft = selectedId ? drafts[selectedId] ?? "" : "";
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [selectedId, messageCount, requestedId]);
  useEffect(() => { if (requestedId && selectedId && selectedUnread > 0) openConversation(selectedId); }, [requestedId, selectedId, selectedUnread, openConversation]);
  useEffect(() => {
    if (!requestedId || !matchMedia("(max-width: 767px)").matches) return;
    backButton.current?.focus({ preventScroll: true });
    backButton.current?.closest(".messages-workspace")?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [requestedId]);
  function choose(id: string) {
    openConversation(id); setFeedback(""); setQuery({ conversa: id }, { replace: true });
  }
  function back() {
    setQuery({}, { replace: true }); setFeedback("");
    requestAnimationFrame(() => { if (selectedId) listButtons.current.get(selectedId)?.focus(); });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selectedId || sending || threadLoading || threadFailure || !chatConnected) return;
    if (await sendMessage(selectedId)) setFeedback(preview ? "Mensagem adicionada à prévia. Nenhuma mensagem foi enviada a um cliente." : "Mensagem enviada e confirmada pelo servidor.");
  }
  return <div className="communication-page">
    <header className="communication-heading"><div><h1>Mensagens</h1><p>Converse com quem se interessa pelos seus materiais.</p></div>{!preview && <button type="button" className="company-secondary" onClick={reloadChat} disabled={chatLoading || sending}><RefreshCw size={16} aria-hidden="true" />Atualizar conversas</button>}</header>
    {chatLoading ? <div className="communication-state" role="status"><LoaderCircle size={28} className="account-spinner" aria-hidden="true" /><p>Carregando suas conversas…</p></div> : chatFailure ? <div className="communication-state"><MessageSquare size={32} aria-hidden="true" /><h2>Não foi possível carregar as conversas</h2><p role="alert">{chatFailure}</p><button type="button" className="company-button" onClick={reloadChat}>Tentar novamente</button><Link to="/login" className="company-inline-link">Entrar novamente</Link></div> : <>
      <p className="communication-disclosure">{preview ? "Demonstração interativa · Conversas fictícias. Mensagens ficam apenas nesta prévia até recarregar." : chatConnected ? "Conectado às mensagens da sua conta." : "Conexão interrompida. Atualize para reconectar."}</p>
      <div className={`messages-workspace ${requestedId ? "has-conversation" : ""}`}>
        <aside className="messages-list" aria-label="Conversas com clientes">
          <label className="messages-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar conversa</span><input type="search" placeholder="Buscar conversa" value={search} onChange={event => setSearch(event.target.value)} /></label>
          <div className="communication-tabs" role="group" aria-label="Filtrar conversas"><button type="button" aria-pressed={!unreadOnly} onClick={() => { setUnreadOnly(false); setQuery({}, { replace: true }); }}>Todas</button><button type="button" aria-pressed={unreadOnly} onClick={() => { setUnreadOnly(true); setQuery({}, { replace: true }); }}>Não lidas<span>{unread}</span></button></div>
          <p className="sr-only" role="status">{visible.length} conversas encontradas</p>
          <ul className="conversation-list">{visible.map(item => {
            const last = item.messages.at(-1);
            return <li key={item.id}><button ref={element => { if (element) listButtons.current.set(item.id, element); else listButtons.current.delete(item.id); }} type="button" aria-current={selectedId === item.id ? "true" : undefined} onClick={() => choose(item.id)} aria-label={`${item.name}${item.unread ? `, ${item.unread} mensagem não lida` : ""}`}><span className="communication-avatar" aria-hidden="true">{item.initials}</span><span className="conversation-summary"><strong>{item.name}</strong><span>{last?.text ?? (item.hasHistory ? "Abra para ver as mensagens" : "Nenhuma mensagem")}</span></span><span className="conversation-meta">{(last?.at || item.lastActivity) && <time dateTime={last?.at || item.lastActivity}>{conversationTime(last?.at || item.lastActivity!)}</time>}{item.unread > 0 && <span className="communication-count">{item.unread}</span>}</span></button></li>;
          })}</ul>
          {!visible.length && <div className="communication-list-empty"><MessageSquare size={25} strokeWidth={1.4} aria-hidden="true" /><strong>{search ? "Nenhuma conversa encontrada" : conversations.length === 0 ? "Nenhuma conversa por enquanto" : "Nenhuma conversa não lida"}</strong><p>{search ? "Tente outro nome ou mensagem." : "As conversas aparecerão aqui quando estiverem disponíveis."}</p><button type="button" onClick={() => { setSearch(""); setUnreadOnly(false); }}>Ver todas as conversas</button></div>}
        </aside>
        <section className="message-thread" aria-label={selected ? `Conversa com ${selected.name}` : "Conversa"}>
          {selected ? <>
            <header className="message-thread-heading"><button ref={backButton} type="button" className="message-back company-icon-button" onClick={back} aria-label="Voltar às conversas"><ArrowLeft size={21} aria-hidden="true" /></button><span className="communication-avatar" aria-hidden="true">{selected.initials}</span><div><h2>{selected.name}</h2><p>{preview ? "Conversa de exemplo" : "Mensagens da conversa"}</p></div></header>
            {selected.productId && <div className="message-material">{selected.productImage ? <img src={selected.productImage} alt="" width={56} height={56} /> : <span className="message-material-placeholder"><Package size={26} aria-hidden="true" /></span>}<div><strong>{selected.productName}</strong><p>{selected.materialSummary}</p></div><Link to={`${base}/materiais/${selected.productId}`}>Ver material<ArrowUpRight size={15} aria-hidden="true" /></Link></div>}
            {threadLoading && <p className="message-service-note" role="status">Carregando histórico…</p>}{threadFailure && <div className="communication-error" role="alert">{threadFailure}</div>}<ol ref={log} className="message-log" aria-label="Histórico da conversa">{!preview && selected.messages.length >= 100 && <li className="message-service-note">Últimas 100 mensagens da conversa.</li>}{selected.messages.map((message, index) => {
              const group = dateGroup(message.at);
              const showDay = index === 0 || dateGroup(selected.messages[index - 1].at) !== group;
              return <li key={message.id} className={message.mine ? "is-mine" : ""}>{showDay && <p className="message-day">{group}</p>}<div className="message-bubble"><span className="sr-only">{message.mine ? "Você: " : `${selected.name}: `}</span><p>{message.text}</p><time dateTime={message.at}>{messageTime(message.at)}</time></div></li>;
            })}</ol>
            <form className="message-composer" onSubmit={submit}><div><button type="button" className="company-icon-button" disabled aria-label="Anexos indisponíveis nesta versão" title="Anexos indisponíveis nesta versão"><Paperclip size={21} aria-hidden="true" /></button><label className="sr-only" htmlFor="message-draft">{preview ? "Mensagem de exemplo" : "Mensagem"} para {selected.name}</label><textarea disabled={!chatConnected || threadLoading || !!threadFailure || sending} id="message-draft" rows={2} maxLength={2000} placeholder="Escreva sua mensagem…" value={draft} onChange={event => { setDraft(selected.id, event.target.value); setFeedback(""); }} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} aria-describedby="message-composer-hint" /><button type="submit" className="message-send" disabled={!draft.trim() || !chatConnected || threadLoading || !!threadFailure || sending} aria-label={preview ? "Adicionar mensagem à prévia" : "Enviar mensagem"}>{sending ? <LoaderCircle size={21} className="account-spinner" aria-hidden="true" /> : <Send size={21} aria-hidden="true" />}</button></div><p id="message-composer-hint">Enter para {preview ? "adicionar à prévia" : "enviar"} · Shift + Enter para nova linha <span>{draft.length}/2000</span></p><p className="message-feedback" role="status">{feedback}</p>{sendError && <p className="communication-error" role="alert">{sendError}</p>}</form>
          </> : <div className="communication-state"><MessageSquare size={32} aria-hidden="true" /><h2>{requestedId ? "Conversa não encontrada" : "Selecione uma conversa"}</h2><p>{requestedId ? "Esta conversa não foi encontrada para sua conta." : "Escolha um cliente na lista para visualizar as mensagens."}</p>{requestedId && <button className="company-secondary" onClick={back} type="button">Voltar às conversas</button>}</div>}
        </section>
      </div>
    </>}
  </div>;
}
