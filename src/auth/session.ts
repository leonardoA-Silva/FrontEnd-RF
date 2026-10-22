export interface SessionUser {
  id: string;
  role: string;
  name: string;
  status?: string;
  mustChangePassword?: boolean;
}

const eventName = "rf-session-change";
export const sessionEvent = eventName;

export function readSession() {
  try {
    const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");
    const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
    const candidate: unknown = raw ? JSON.parse(raw) : null;
    const data = candidate && typeof candidate === "object" ? candidate as Record<string, unknown> : null;
    const user: SessionUser | null = data && typeof data.id === "string" && typeof data.role === "string" && typeof data.name === "string"
      ? { id: data.id, role: data.role, name: data.name, status: typeof data.status === "string" ? data.status : undefined, mustChangePassword: data.mustChangePassword === true }
      : null;
    return { token, user };
  } catch { return { token: null, user: null }; }
}

export function clearSession() {
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of ["token", "user", "tipoUsuario", "rememberedEmail"]) storage.removeItem(key);
    for (const key of Object.keys(storage)) if (key.startsWith("rf_comprador_reservas")) storage.removeItem(key);
  }
  window.dispatchEvent(new Event(eventName));
}

export function saveSession(token: string, user: SessionUser, remember: boolean) {
  if (!token || !user.id || !["user", "company", "admin"].includes(user.role)) throw new Error("Sessão inválida.");
  clearSession();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("token", token);
  storage.setItem("user", JSON.stringify({ id: user.id, role: user.role, name: user.name, status: user.status, mustChangePassword: user.mustChangePassword === true }));
  window.dispatchEvent(new Event(eventName));
}

export function updateSessionUser(changes: Partial<Pick<SessionUser, "name" | "status" | "mustChangePassword">>) {
  const { user } = readSession();
  if (!user) return;
  const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
  storage.setItem("user", JSON.stringify({ ...user, ...changes }));
  window.dispatchEvent(new Event(eventName));
}
