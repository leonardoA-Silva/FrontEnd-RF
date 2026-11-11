import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { CommunicationContext } from "./CommunicationContext";
import { createConversations, createNotifications } from "./communicationDemo";
import { loadNotifications, markNotificationRead, markNotificationsRead, notificationFailure } from "./notificationApi";
import type { Conversation, CompanyNotification } from "./communicationTypes";
import { useLiveChat } from "./useLiveChat";

export default function CommunicationProvider({ preview, children }: { preview: boolean; children: ReactNode }) {
  const { pathname, search } = useLocation();
  const liveChat = useLiveChat(!preview && pathname.endsWith("/mensagens"), new URLSearchParams(search).get("conversa"));
  const [conversations, setConversations] = useState<Conversation[]>(() => preview ? createConversations() : []);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [notifications, setNotifications] = useState<CompanyNotification[]>(() => preview ? createNotifications() : []);
  const [loading, setLoading] = useState(!preview);
  const [failure, setFailure] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const actionLock = useRef(false);
  const [version, setVersion] = useState(0);
  const viewingNotifications = pathname.endsWith("/notificacoes");
  useEffect(() => {
    if (preview || !viewingNotifications) return;
    const controller = new AbortController();
    loadNotifications(controller.signal).then(items => {
      if (!controller.signal.aborted) { setNotifications(items); setFailure(""); setNeedsLogin(false); setLoading(false); }
    }).catch(error => {
      if (!controller.signal.aborted) { const result = notificationFailure(error); setFailure(result.message); setNeedsLogin(result.login); setLoading(false); }
    });
    return () => controller.abort();
  }, [preview, viewingNotifications, version]);
  function reload() { setLoading(true); setFailure(""); setActionError(""); setVersion(value => value + 1); }
  function openConversation(id: string) {
    if (!preview) return;
    setConversations(items => items.map(item => item.id === id ? { ...item, unread: 0 } : item));
  }
  async function sendMessage(id: string) {
    const text = drafts[id]?.trim();
    if (!text || text.length > 2000) return false;
    if (!preview) {
      const success = await liveChat.send(id, text);
      if (success) setDrafts(values => values[id]?.trim() === text ? { ...values, [id]: "" } : values);
      return success;
    }
    if (!conversations.some(item => item.id === id)) return false;
    const message = { id: crypto.randomUUID(), text, mine: true, at: new Date().toISOString() };
    setConversations(items => items.map(item => item.id === id ? { ...item, messages: [...item.messages, message] } : item));
    setDrafts(values => ({ ...values, [id]: "" }));
    return true;
  }
  async function markRead(id: string) {
    if (actionLock.current) return false;
    const item = notifications.find(value => value.id === id);
    if (!item) return false;
    if (item.read) return true;
    actionLock.current = true; setBusy(id); setActionError("");
    try {
      const updated = preview ? { ...item, read: true } : await markNotificationRead(id);
      setNotifications(items => items.map(value => value.id === id ? updated : value));
      return true;
    } catch (error) { const result = notificationFailure(error); setActionError(result.message); setNeedsLogin(result.login); return false; }
    finally { actionLock.current = false; setBusy(null); }
  }
  async function markAllRead() {
    if (actionLock.current) return;
    actionLock.current = true; setBusy("all"); setActionError("");
    try {
      if (!preview) await markNotificationsRead();
      setNotifications(items => items.map(item => ({ ...item, read: true })));
    } catch (error) { const result = notificationFailure(error); setActionError(result.message); setNeedsLogin(result.login); }
    finally { actionLock.current = false; setBusy(null); }
  }
  return <CommunicationContext.Provider value={{ conversations: preview ? conversations : liveChat.conversations, drafts, setDraft: (id, text) => setDrafts(values => ({ ...values, [id]: text })), openConversation, sendMessage, chatLoading: !preview && liveChat.loading, chatFailure: preview ? "" : liveChat.failure, threadLoading: !preview && liveChat.threadLoading, threadFailure: preview ? "" : liveChat.threadFailure, chatConnected: preview || liveChat.connected, sending: !preview && liveChat.sending, sendError: preview ? "" : liveChat.sendError, reloadChat: liveChat.reload, notifications, loading, failure, needsLogin, actionError, busy, reload, markRead, markAllRead }}>{children}</CommunicationContext.Provider>;
}
