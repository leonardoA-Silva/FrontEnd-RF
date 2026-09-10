import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
export type NotificationType = "success" | "error" | "info" | "warning";

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationItemProps {
  notification: NotificationData;
  onClose: (id: string) => void;
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Entrada com pequeno delay para animar
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Auto-fechar após 5 segundos
    const closeTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onClose(notification.id), 300);
  };

  const colors = {
    success: {
      bg: "#F0FDF4",
      border: "#86EFAC",
      icon: "#16A34A",
      title: "#14532D",
      bar: "#22C55E",
    },
    error: {
      bg: "#FFF1F2",
      border: "#FECDD3",
      icon: "#DC2626",
      title: "#7F1D1D",
      bar: "#EF4444",
    },
    info: {
      bg: "#EFF6FF",
      border: "#BFDBFE",
      icon: "#2563EB",
      title: "#1E3A5F",
      bar: "#3B82F6",
    },
    warning: {
      bg: "#FFFBEB",
      border: "#FDE68A",
      icon: "#D97706",
      title: "#78350F",
      bar: "#F59E0B",
    },
  };

  const c = colors[notification.type];

  const Icon =
    notification.type === "success"
      ? CheckCircle
      : notification.type === "error"
        ? XCircle
        : notification.type === "warning"
          ? AlertTriangle
          : Info;

  return (
    <div
      style={{
        width: 320,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving ? "translateX(0)" : "translateX(-110%)",
        marginBottom: 10,
      }}
    >
      {/* Barra lateral colorida */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: c.bar,
          borderRadius: "10px 0 0 10px",
        }}
      />

      <div
        style={{
          padding: "12px 14px 12px 18px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        {/* Ícone */}
        <div style={{ flexShrink: 0, marginTop: 1 }}>
          <Icon size={20} color={c.icon} />
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: c.title,
              lineHeight: 1.3,
            }}
          >
            {notification.title}
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 12,
              color: "#374151",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {notification.message}
          </p>
        </div>

        {/* Botão fechar */}
        <button
          onClick={handleClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 2,
            flexShrink: 0,
            color: "#9CA3AF",
            display: "flex",
            alignItems: "center",
            borderRadius: 4,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

interface NotificationContainerProps {
  notifications: NotificationData[];
  onClose: (id: string) => void;
}

export function NotificationContainer({
  notifications,
  onClose,
}: NotificationContainerProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column-reverse",
        pointerEvents: "none",
      }}
    >
      {notifications.map((n) => (
        <div key={n.id} style={{ pointerEvents: "auto" }}>
          <NotificationItem notification={n} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
