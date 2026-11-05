export interface ChatMessage { id: string; text: string; mine: boolean; at: string }
export interface Conversation {
  id: string; name: string; initials: string; unread: number; productId: string; productName: string;
  productImage: string; materialSummary: string; messages: ChatMessage[];
  lastActivity?: string; hasHistory?: boolean;
}
export interface CompanyNotification {
  id: string; type: string; title: string; content: string; read: boolean; at: string;
  image?: string; conversationId?: string; disputeId?: string; action?: string;
}
export const notificationCategories = { all: "Todos os tipos", reservation: "Reservas", message: "Mensagens", system: "Sistema", other: "Outros avisos" };
export type NotificationCategory = keyof typeof notificationCategories;
export function notificationCategory(type: string): Exclude<NotificationCategory, "all"> {
  if (type.startsWith("reserva_")) return "reservation";
  if (type === "nova_mensagem") return "message";
  return type === "sistema" ? "system" : "other";
}
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
export function messageTime(at: string) { return timeFormatter.format(new Date(at)); }
export function conversationTime(at: string) {
  const group = dateGroup(at);
  if (group === "Hoje") return messageTime(at);
  if (group === "Ontem") return group;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(at));
}
export function notificationTime(at: string) { return at && !Number.isNaN(Date.parse(at)) ? dateFormatter.format(new Date(at)) : "Data não informada"; }
export function dateGroup(at: string) {
  if (!at || Number.isNaN(Date.parse(at))) return "Sem data";
  const date = new Date(at), today = new Date(), yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}
