import { useCallback, useEffect, useState, type FormEvent } from "react";
import { obterConversa, type BuyerMessage } from "../../../axios/Axios";
import { useApiResource } from "../../../hooks/useApiResource";
import { socketRequest, type BuyerSocket } from "../../../realtime/buyerSocket";
import ConfirmAction from "./ConfirmAction";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { dateLabel } from "./buyerPresentation";

export default function ConversationMessages({ id, userId, socket, connected }: { id: string; userId: string; socket: BuyerSocket | null; connected: boolean }) {
  const loader = useCallback(async (signal: AbortSignal) => {
    const response = await obterConversa(id, signal);
    if (response.data.conversationId !== id || !response.data.participants.some(item => item.toLowerCase() === userId.toLowerCase())) throw new Error("Conversa inválida.");
    return response;
  }, [id, userId]);
  const access = useApiResource(loader);
  return <><RequestState {...access} retry={access.reload} />{!access.loading && !access.error && access.data && (socket && connected ? <MessageThread key={id} id={id} userId={userId} socket={socket} /> : <p role="status" className={s.notice}>As mensagens aguardam conexão em tempo real. Use Reconectar para tentar novamente.</p>)}</>;
}

function MessageThread({ id, userId, socket }: { id: string; userId: string; socket: BuyerSocket }) {
  const loader = useCallback(async () => {
    await socketRequest(socket, "join_conversation", id);
    const response = await socketRequest<{ messages: BuyerMessage[] }>(socket, "load_messages", { conversationId: id, limit: 50 });
    if (!Array.isArray(response.messages)) throw new Error("Resposta inválida.");
    await socketRequest(socket, "mark_read", { conversationId: id });
    return { data: response.messages };
  }, [id, socket]);
  const resource = useApiResource(loader);
  const { reload } = resource;
  const [older, setOlder] = useState<BuyerMessage[]>([]);
  const [hasOlder, setHasOlder] = useState(true);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [selected, setSelected] = useState<BuyerMessage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    const update = (payload?: unknown) => {
      if (payload && typeof payload === "object" && "id_conversation" in payload && payload.id_conversation === id) { setOlder([]); reload(); }
    };
    ["new_message", "message_edited", "message_deleted"].forEach(event => socket.on(event, update));
    return () => { ["new_message", "message_edited", "message_deleted"].forEach(event => socket.off(event, update)); };
  }, [id, socket, reload]);
  // A mensagem só aparece como enviada depois da confirmação e leitura do servidor.
  async function send(event: FormEvent) {
    event.preventDefault(); if (busy || !text.trim()) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      await socketRequest(socket, editing ? "edit_message" : "send_message", editing ? { messageId: editing, content: text.trim() } : { conversationId: id, type: "texto", content: text.trim() });
      setText(""); setEditing(null); setOlder([]); setHasOlder(true); setSuccess(editing ? "Mensagem atualizada." : "Mensagem enviada."); resource.reload();
    } catch { setError("Não recebemos confirmação da mensagem. Atualize a conversa antes de reenviar; o texto foi preservado."); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!selected || busy) return;
    setBusy(true); setError("");
    try { await socketRequest(socket, "delete_message", { messageId: selected.id }); setSelected(null); setOlder([]); resource.reload(); setSuccess("Mensagem excluída."); }
    catch { setError("Não foi possível confirmar a exclusão da mensagem. Atualize a conversa."); }
    finally { setBusy(false); }
  }
  async function loadOlder() {
    const first = older[0] ?? resource.data?.[0];
    if (!first || busy) return;
    setBusy(true); setError("");
    try {
      const response = await socketRequest<{ messages: BuyerMessage[] }>(socket, "load_messages", { conversationId: id, limit: 50, before: first.id });
      if (!Array.isArray(response.messages)) throw new Error("Resposta inválida.");
      setOlder(current => [...response.messages, ...current]); setHasOlder(response.messages.length === 50);
    } catch { setError("Não foi possível carregar mensagens anteriores."); }
    finally { setBusy(false); }
  }
  const messages = [...new Map([...older, ...(resource.data ?? [])].map(item => [item.id, item])).values()];
  return <section className={`${s.panel} space-y-5`} aria-label="Mensagens da conversa">
    <div className="flex flex-wrap gap-3"><button disabled={busy || resource.loading} onClick={() => { setOlder([]); setHasOlder(true); resource.reload(); }} className={s.secondary}>Atualizar mensagens</button>{hasOlder && (resource.data?.length ?? 0) >= 50 && <button disabled={busy} onClick={loadOlder} className={s.secondary}>Mensagens anteriores</button>}</div>
    <RequestState {...resource} retry={resource.reload} />
    {!resource.loading && !resource.error && (!messages.length ? <p className={s.copy}>Esta conversa ainda não tem mensagens.</p> : <ol className="max-h-[480px] space-y-4 overflow-y-auto" aria-label="Histórico da conversa">{messages.map(item => <li key={item.id} className="space-y-2 border-b border-[#E7E4DA] py-4"><p className="text-sm font-semibold">{item.id_user.toLowerCase() === userId.toLowerCase() ? "Você" : "Participante"} · {dateLabel(item.created_in)}</p><p className={`${s.copy} whitespace-pre-wrap break-words`}>{item.deleted_in ? "Mensagem excluída" : item.type === "texto" ? item.content : "Anexo indisponível nesta versão"}</p>{item.edited_in && !item.deleted_in && <p className="text-xs text-gray-600">Editada</p>}{item.id_user.toLowerCase() === userId.toLowerCase() && !item.deleted_in && item.type === "texto" && <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={() => { setEditing(item.id); setText(item.content ?? ""); }} className={s.secondary}>Editar mensagem</button><button disabled={busy} onClick={() => { setError(""); setSelected(item); }} className={s.secondary}>Excluir mensagem</button></div>}</li>)}</ol>)}
    {error && !selected && <p role="alert" className={s.error}>{error}</p>}{success && <p role="status" className={s.success}>{success}</p>}
    <form onSubmit={send} className="space-y-4"><label className={s.label}>{editing ? "Editar mensagem" : "Nova mensagem"}<textarea required maxLength={4000} disabled={busy || resource.loading || Boolean(resource.error)} value={text} onChange={e => setText(e.target.value)} className={`${s.input} min-h-28`} /></label><div className="flex flex-wrap gap-3"><button disabled={busy || resource.loading || Boolean(resource.error) || !text.trim()} className={s.button}>{busy ? "Enviando..." : editing ? "Salvar mensagem" : "Enviar mensagem"}</button>{editing && <button type="button" disabled={busy} onClick={() => { setEditing(null); setText(""); }} className={s.secondary}>Cancelar edição</button>}</div></form>
    {selected && <ConfirmAction title="Excluir mensagem?" description="O conteúdo será removido da conversa após a confirmação do servidor." busy={busy} error={error} confirm={remove} cancel={() => setSelected(null)} />}
  </section>;
}
