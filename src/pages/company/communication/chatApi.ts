import api from "../../../axios/Axios";
import { uuidPattern } from "../companyTypes";
import type { Conversation, ChatMessage } from "./communicationTypes";

export function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
}
export function chatIdentity() {
  try {
    const user = record(JSON.parse(localStorage.getItem("user") ?? sessionStorage.getItem("user") ?? "null"));
    return typeof user.id === "string" && uuidPattern.test(user.id) ? user.id.toLowerCase() : "";
  } catch { return ""; }
}
export function readChatMessage(value: unknown, ownId: string): ChatMessage | null {
  const row = record(value);
  if (typeof row.id !== "string" || !uuidPattern.test(row.id) || typeof row.id_user !== "string" || typeof row.id_conversation !== "string" || !uuidPattern.test(row.id_conversation)) return null;
  const at = typeof row.created_in === "string" && !Number.isNaN(Date.parse(row.created_in)) ? row.created_in : new Date().toISOString();
  return { id: row.id, text: row.isDeleted || row.deleted_in ? "Mensagem excluída" : row.type !== "texto" ? "Mensagem com anexo. A visualização de anexos ainda não está disponível." : typeof row.content === "string" ? row.content : "", mine: row.id_user.toLowerCase() === ownId, at };
}
export async function loadConversations(signal?: AbortSignal): Promise<Conversation[]> {
  const { data } = await api.get<unknown>("/conversation/", { signal });
  if (!Array.isArray(data)) throw new Error("Invalid conversation list");
  return data.map(value => {
    const row = record(value);
    if (typeof row.conversationId !== "string" || !uuidPattern.test(row.conversationId) || typeof row.otherUserName !== "string") throw new Error("Invalid conversation");
    const name = row.otherUserName.trim() || "Participante";
    const unread = Number(row.unreadCount);
    return { id: row.conversationId, name, initials: name.split(/\s+/).slice(0, 2).map(word => word[0]).join("").toLocaleUpperCase("pt-BR"), unread: Number.isFinite(unread) ? Math.max(0, unread) : 0, productId: "", productName: "", productImage: "", materialSummary: "", messages: [], hasHistory: !!row.id_last_message, lastActivity: typeof row.updated_in === "string" && !Number.isNaN(Date.parse(row.updated_in)) ? row.updated_in : "" };
  });
}
