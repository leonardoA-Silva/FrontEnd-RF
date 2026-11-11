import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { listarConversas, listarNotificacoes, type BuyerConversation, type BuyerNotification } from "../../../api/services";
import { CommunicationContext } from "./CommunicationContext";

export default function CommunicationProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation(); const [version, setVersion] = useState(0);
  const [conversations, setConversations] = useState<BuyerConversation[]>([]), [notifications, setNotifications] = useState<BuyerNotification[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([listarConversas(controller.signal), listarNotificacoes("", "", controller.signal)]).then(([chat, notices]) => {
      if (controller.signal.aborted) return;
      if (chat.status === "fulfilled" && Array.isArray(chat.value.data)) setConversations(chat.value.data);
      if (notices.status === "fulfilled" && Array.isArray(notices.value.data)) setNotifications(notices.value.data);
    });
    return () => controller.abort();
  }, [pathname, version]);
  return <CommunicationContext.Provider value={{ conversations, notifications, reload: () => setVersion(value => value + 1) }}>{children}</CommunicationContext.Provider>;
}
