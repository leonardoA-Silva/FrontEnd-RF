import { useCallback, useEffect, useState } from "react";
import { loadSocketClient, socketOrigin, type BuyerSocket } from "../realtime/buyerSocket";

function tokenExpiry(token: string): number | null {
  try { const body = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); return typeof body.exp === "number" ? body.exp * 1000 : null; }
  catch { return null; }
}

export function useBuyerSocket(token: string | null) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ token: string | null; socket: BuyerSocket | null; connected: boolean; error: string }>({ token: null, socket: null, connected: false, error: "" });
  useEffect(() => {
    if (!token) return;
    let active = true;
    let socket: BuyerSocket | null = null;
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;
    loadSocketClient().then(io => {
      if (!active) return;
      const expiry = tokenExpiry(token);
      if (expiry && expiry <= Date.now()) { setState({ token, socket: null, connected: false, error: "Sua sessão expirou. Entre novamente para receber atualizações." }); return; }
      socket = io(socketOrigin(), { auth: { token }, transports: ["websocket"], autoConnect: false, reconnection: false, forceNew: true });
      const current = socket;
      const update = (connected: boolean, error: string) => { if (active) setState({ token, socket: current, connected, error }); };
      current.on("connect", () => update(true, ""));
      current.on("connect_error", () => update(false, "Não foi possível conectar às mensagens e atualizações em tempo real."));
      current.on("disconnect", () => update(false, "A conexão em tempo real foi interrompida. Você pode continuar usando as outras telas."));
      if (expiry) expiryTimer = setTimeout(() => { current.disconnect(); update(false, "Sua sessão expirou. Entre novamente para continuar."); }, Math.min(expiry - Date.now(), 2_147_483_647));
      current.connect();
    }).catch(() => { if (active) setState({ token, socket: null, connected: false, error: "Não foi possível carregar a conexão de mensagens. Tente novamente." }); });
    return () => { active = false; clearTimeout(expiryTimer); socket?.disconnect(); };
  }, [token, attempt]);
  const reconnect = useCallback(() => { setState(current => ({ ...current, connected: false, error: "" })); setAttempt(value => value + 1); }, []);
  return { socket: state.token === token ? state.socket : null, connected: state.token === token && state.connected, error: state.token === token ? state.error : "", reconnect };
}
