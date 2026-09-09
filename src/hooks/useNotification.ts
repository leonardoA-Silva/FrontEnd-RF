import { useState, useCallback } from "react";
import type { NotificationData, NotificationType } from "../components/Notification";

let idCounter = 0;

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback(
    (type: NotificationType, title: string, message: string) => {
      const id = `notif-${++idCounter}`;
      setNotifications((prev) => [...prev, { id, type, title, message }]);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = {
    success: (title: string, message: string) =>
      addNotification("success", title, message),
    error: (title: string, message: string) =>
      addNotification("error", title, message),
    info: (title: string, message: string) =>
      addNotification("info", title, message),
  };

  return { notifications, removeNotification, notify };
}
