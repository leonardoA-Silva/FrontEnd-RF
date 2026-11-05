import axios from "axios";
import api from "../../../axios/Axios";
import { uuidPattern } from "../companyTypes";
import type { CompanyNotification } from "./communicationTypes";

function readNotification(value: unknown): CompanyNotification {
  if (!value || typeof value !== "object") throw new Error("Invalid notification");
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !uuidPattern.test(row.id) || typeof row.title !== "string" || typeof row.type !== "string" || !["sim", "nao"].includes(String(row.read))) throw new Error("Invalid notification");
  return { id: row.id, type: row.type, title: row.title, content: typeof row.content === "string" ? row.content : "", read: row.read === "sim", at: typeof row.created_in === "string" ? row.created_in : "", ...(row.reference_table === "conversation" && typeof row.reference_id === "string" && uuidPattern.test(row.reference_id) ? { conversationId: row.reference_id, action: "Abrir conversa" } : {}) };
}
export async function loadNotifications(signal: AbortSignal) {
  const { data } = await api.get<unknown>("/notification/", { signal });
  if (!Array.isArray(data)) throw new Error("Invalid notification list");
  return data.map(readNotification);
}
export async function markNotificationRead(id: string) {
  const { data } = await api.patch<{ notification?: unknown }>(`/notification/${encodeURIComponent(id)}/read`);
  const notification = readNotification(data.notification);
  if (notification.id !== id || !notification.read) throw new Error("Read not confirmed");
  return notification;
}
export async function markNotificationsRead() {
  const { data } = await api.patch<{ updated?: unknown }>("/notification/read-all");
  if (typeof data.updated !== "number" || !Number.isFinite(data.updated) || data.updated < 0) throw new Error("Read not confirmed");
}
export function notificationFailure(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return { message: "Sua sessão expirou. Entre novamente para consultar as notificações.", login: true };
    if (error.response?.status === 403) return { message: "Sua conta não tem permissão para esta ação.", login: false };
    if (error.response?.status === 404) return { message: "Esta notificação ou o serviço de notificações não está disponível. Atualize e tente novamente.", login: false };
    if (!error.response) return { message: "Não foi possível conectar. Verifique sua conexão e tente novamente.", login: false };
    if (error.response.status === 429) return { message: "Muitas tentativas. Aguarde um instante antes de tentar novamente.", login: false };
  }
  return { message: "Não foi possível concluir a solicitação. Tente novamente.", login: false };
}
