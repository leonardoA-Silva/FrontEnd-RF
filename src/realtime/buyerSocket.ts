import api from "../axios/Axios";

type Listener = (payload?: unknown) => void;
export interface BuyerSocket {
  connected: boolean;
  on: (event: string, listener: Listener) => void;
  off: (event: string, listener: Listener) => void;
  connect: () => void;
  disconnect: () => void;
  timeout: (milliseconds: number) => { emit: (event: string, payload: unknown, callback: (error: Error | null, response: unknown) => void) => void };
}
type SocketFactory = (origin: string, options: { auth: { token: string }; transports: string[]; autoConnect: boolean; reconnection: boolean; forceNew: boolean }) => BuyerSocket;
declare global { interface Window { io?: SocketFactory } }
let sdk: Promise<SocketFactory> | null = null;

export function socketOrigin() { return new URL(api.defaults.baseURL ?? "/api/reaproveitafranca", window.location.origin).origin; }

export function loadSocketClient() {
  if (window.io) return Promise.resolve(window.io);
  if (!sdk) sdk = new Promise<SocketFactory>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${socketOrigin()}/socket.io/socket.io.min.js`;
    script.async = true;
    const fail = () => { window.clearTimeout(timer); script.remove(); sdk = null; reject(new Error("Conexão em tempo real indisponível.")); };
    const timer = window.setTimeout(fail, 12000);
    script.onerror = fail;
    script.onload = () => { if (!window.io) { fail(); return; } window.clearTimeout(timer); resolve(window.io); };
    document.head.append(script);
  });
  return sdk;
}

export function socketRequest<T>(socket: BuyerSocket, event: string, payload: unknown): Promise<T> {
  if (!socket.connected) return Promise.reject(new Error("A conexão foi interrompida. Reconecte antes de continuar."));
  return new Promise((resolve, reject) => {
    socket.timeout(10000).emit(event, payload, (error, response) => {
      if (error) { reject(new Error("Não recebemos confirmação. Atualize a conversa antes de repetir a ação.")); return; }
      if (!response || typeof response !== "object" || "error" in response) { reject(new Error("Não foi possível concluir a ação nesta conversa. Verifique seu acesso e tente novamente.")); return; }
      resolve(response as T);
    });
  });
}
