import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import api from "../../../axios/Axios";
import { chatIdentity, loadConversations, readChatMessage, record } from "./chatApi";
import { notificationFailure } from "./notificationApi";
import { uuidPattern } from "../companyTypes";
import type { Conversation, ChatMessage } from "./communicationTypes";

function mergeMessages(previous: ChatMessage[], incoming: ChatMessage[]) {
  const items = new Map(previous.map(item => [item.id, item]));
  incoming.forEach(item => items.set(item.id, item));
  return Array.from(items.values()).sort((a, b) => Date.parse(a.at) - Date.parse(b.at)).slice(-100);
}
async function request(socket: Socket, event: string, payload: unknown): Promise<Record<string, unknown>> {
  if (!socket.connected) throw new Error("Disconnected");
  const response: unknown = await socket.timeout(10000).emitWithAck(event, payload);
  const result = record(response);
  if (result.error) throw new Error("Chat operation rejected");
  return result;
}

export function useLiveChat(enabled: boolean, requestedId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState("");
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadFailure, setThreadFailure] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [version, setVersion] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const activeRef = useRef<string | null>(null);
  const pendingSend = useRef(false);
  const threadVersion = useRef(0);
  const ownId = useRef("");
  const [connectionVersion, setConnectionVersion] = useState(0);
  const reload = useCallback(() => { setLoading(true); setFailure(""); setVersion(value => value + 1); }, []);
  useEffect(() => {
    if (!enabled) return;
    ownId.current = chatIdentity();
    const controller = new AbortController();
    let alive = true;
    const baseUrl = api.defaults.baseURL ?? "/api/reaproveitafranca";
    const socketUrl = baseUrl.startsWith("http") ? new URL(baseUrl).origin : undefined;
    const socket = io(socketUrl, {
      autoConnect: false,
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5,
      timeout: 10000,
      auth: callback => callback({ token: localStorage.getItem("token") ?? sessionStorage.getItem("token") ?? "" })
    });
    socketRef.current = socket;
    const refresh = async () => {
      try {
        const items = await loadConversations(controller.signal);
        if (!alive) return;
        setConversations(previous => items.map(item => ({ ...item, messages: previous.find(old => old.id === item.id)?.messages ?? [] })));
        setFailure(""); setLoading(false); setConnected(true); setConnectionVersion(value => value + 1);
      } catch (error) { if (alive) { setFailure(notificationFailure(error).message); setLoading(false); } }
    };
    socket.on("connect", () => { void refresh(); });
    socket.on("connect_error", () => { if (alive) { setFailure("Não foi possível conectar às mensagens. Verifique sua conexão e tente novamente."); setLoading(false); setConnected(false); } });
    socket.on("disconnect", () => { if (alive) { setConnected(false); setThreadFailure("Conexão interrompida. Aguarde a reconexão ou atualize a conversa."); } });
    socket.on("new_message", (value: unknown) => {
      if (!alive) return;
      const row = record(value), message = readChatMessage(value, ownId.current);
      if (!message || typeof row.id_conversation !== "string") return;
      const id = row.id_conversation;
      setConversations(items => items.map(item => item.id === id ? { ...item, messages: mergeMessages(item.messages, [message]), hasHistory: true, lastActivity: message.at, unread: activeRef.current !== id && !message.mine && !item.messages.some(old => old.id === message.id) ? item.unread + 1 : item.unread } : item));
      if (activeRef.current === id && !message.mine) void request(socket, "mark_read", { conversationId: id, upToMessageId: message.id }).then(() => { if (alive) setConversations(items => items.map(item => item.id === id ? { ...item, unread: 0 } : item)); }).catch(() => { /* Reading can be retried by reopening the conversation. */ });
    });
    socket.on("message_edited", (value: unknown) => {
      const row = record(value);
      if (typeof row.id !== "string" || typeof row.content !== "string") return;
      const text = row.content;
      setConversations(items => items.map(item => ({ ...item, messages: item.messages.map(message => message.id === row.id ? { ...message, text } : message) })));
    });
    socket.on("message_deleted", (value: unknown) => {
      const row = record(value);
      setConversations(items => items.map(item => ({ ...item, messages: item.messages.map(message => message.id === row.id ? { ...message, text: "Mensagem excluída" } : message) })));
    });
    socket.connect();
    return () => { alive = false; controller.abort(); socket.removeAllListeners(); socket.disconnect(); socketRef.current = null; activeRef.current = null; };
  }, [enabled, version]);
  const firstId = conversations[0]?.id ?? null;
  const activeId = requestedId ?? firstId;
  useEffect(() => {
    const socket = socketRef.current;
    if (!enabled || !connected || !socket || !activeId || !uuidPattern.test(activeId)) return;
    activeRef.current = activeId;
    const generation = ++threadVersion.current;
    let alive = true;
    async function load() {
      setThreadLoading(true); setThreadFailure(""); setSendError("");
      try {
        await request(socket!, "join_conversation", activeId);
        const result = await request(socket!, "load_messages", { conversationId: activeId, limit: 100 });
        if (!Array.isArray(result.messages)) throw new Error("Invalid history");
        const messages = result.messages.map(item => readChatMessage(item, ownId.current));
        if (messages.some(item => item === null)) throw new Error("Invalid message");
        if (!alive || generation !== threadVersion.current) return;
        setConversations(items => items.map(item => item.id === activeId ? { ...item, messages: mergeMessages(item.messages, messages as ChatMessage[]) } : item));
        await request(socket!, "mark_read", { conversationId: activeId });
        if (alive) setConversations(items => items.map(item => item.id === activeId ? { ...item, unread: 0 } : item));
      } catch { if (alive && generation === threadVersion.current) setThreadFailure("Não foi possível carregar esta conversa ou você não participa dela. Atualize para tentar novamente."); }
      finally { if (alive && generation === threadVersion.current) setThreadLoading(false); }
    }
    void load();
    // leave_conversation removes the participant in the API; it is not room cleanup.
    return () => { alive = false; activeRef.current = null; };
  }, [enabled, activeId, connected, connectionVersion]);
  async function send(id: string, text: string) {
    const socket = socketRef.current;
    if (pendingSend.current || !enabled || !socket?.connected || !text.trim() || text.length > 2000 || !uuidPattern.test(id)) return false;
    pendingSend.current = true; setSending(true); setSendError("");
    try {
      const response = await request(socket, "send_message", { conversationId: id, type: "texto", content: text.trim() });
      if (typeof response.id !== "string" || !uuidPattern.test(response.id)) throw new Error("Send not confirmed");
      const message: ChatMessage = { id: response.id, text: text.trim(), mine: true, at: new Date().toISOString() };
      setConversations(items => items.map(item => item.id === id ? { ...item, messages: item.messages.some(old => old.id === message.id) ? item.messages : mergeMessages(item.messages, [message]), hasHistory: true, lastActivity: message.at } : item));
      return true;
    } catch { setSendError("Não foi possível confirmar o envio. Confira a conversa antes de tentar novamente. Seu rascunho foi mantido."); return false; }
    finally { pendingSend.current = false; setSending(false); }
  }
  return { conversations, loading, failure, connected, threadLoading, threadFailure, sending, sendError, reload, send };
}
