import api from "../../api/client";
import type { BuyerNotification, Shopping } from "../../api/services";

// Mesmo contrato do ReservationRequestsScreen do mobile: a notificação identifica a compra.
export async function loadCompanyRequests(signal?: AbortSignal) {
  const { data } = await api.get<BuyerNotification[]>("/notification/", { signal });
  if (!Array.isArray(data)) throw new Error("Resposta de solicitações inválida.");
  return [...new Map(data.filter(item => item.type === "reserva_solicitada" && item.reference_id).map(item => [item.reference_id!, item])).values()];
}

export async function answerCompanyRequest(id: string, status: "accepted" | "refused") {
  const { data } = await api.patch<{ shopping: Shopping }>(`/shopping/${encodeURIComponent(id)}/status`, { status });
  if (data.shopping?.id.toLowerCase() !== id.toLowerCase() || data.shopping.status !== status) throw new Error("Resposta da reserva não confirmada.");
  return data.shopping;
}
