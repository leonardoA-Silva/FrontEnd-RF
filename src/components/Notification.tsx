import { useCallback, useEffect, useState } from "react";
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

  const handleClose = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onClose(notification.id), 300);
  }, [notification.id, onClose]);

  useEffect(() => {
    // Entrada com pequeno delay para animar
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Auto-fechar após 5 segundos
    const closeTimer = setTimeout(handleClose, 5000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(closeTimer);
    };
  }, [handleClose]);

  // Paleta "mesa de corte": musgo = sucesso, canela = aviso, carvão = informativo.
  const colors = {
    success: {
      bg: "#EDF1E1",
      border: "#C4D3AC",
      icon: "#44603A",
      title: "#2E4427",
      bar: "#44603A",
    },
    error: {
      bg: "#FDF2F0",
      border: "#F0C6BD",
      icon: "#B3361D",
      title: "#7C2214",
      bar: "#C2402A",
    },
    info: {
      bg: "#F1EFE7",
      border: "#DCD2BC",
      icon: "#4A4239",
      title: "#33291F",
      bar: "#6B5F4E",
    },
    warning: {
      bg: "#F9EAD9",
      border: "#E8C79B",
      icon: "#A6511E",
      title: "#7C3D14",
      bar: "#C46A2E",
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
              color: "#3E372E",
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
