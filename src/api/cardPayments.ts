import api from "./client";
import type { BuyerCard, BuyerPaymentResult } from "./services";

export interface PaymentConfiguration { public_key: string | null; environment: "test" | "production"; split_payment: boolean }
export interface CardMethod { id: string; name: string; payment_type_id: "credit_card" | "debit_card" | "prepaid_card" }
export interface CardInput { number: string; holder: string; month: number; year: number; cvv: string; cpf: string }
const providerOrigin = "https://api.mercadopago.com";

export const paymentConfiguration = (signal?: AbortSignal) => api.get<PaymentConfiguration>("/payment/configuration", { signal });
export async function cardMethods(publicKey: string, bin: string, signal?: AbortSignal): Promise<CardMethod[]> {
  if (!/^\d{6,8}$/.test(bin)) return [];
  const params = new URLSearchParams({ public_key: publicKey, bins: bin, marketplace: "NONE", status: "active" });
  // Cliente externo separado: nunca leva o JWT da API local.
  const response = await fetch(`${providerOrigin}/v1/payment_methods/search?${params}`, { credentials: "omit", referrerPolicy: "no-referrer", signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Não foi possível identificar a bandeira do cartão.");
  const data: unknown = await response.json();
  const results = data && typeof data === "object" && "results" in data && Array.isArray(data.results) ? data.results : [];
  return results.filter((item): item is CardMethod => item && typeof item.id === "string" && typeof item.name === "string" && ["credit_card", "debit_card", "prepaid_card"].includes(item.payment_type_id));
}
export async function tokenizeCard(publicKey: string, card: CardInput) {
  const response = await fetch(`${providerOrigin}/v1/card_tokens?${new URLSearchParams({ public_key: publicKey })}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, credentials: "omit", referrerPolicy: "no-referrer", signal: AbortSignal.timeout(20000),
    body: JSON.stringify({ card_number: card.number, expiration_month: card.month, expiration_year: card.year, security_code: card.cvv, cardholder: { name: card.holder, identification: { type: "CPF", number: card.cpf } } }),
  });
  if (!response.ok) throw new Error("O Mercado Pago não confirmou os dados do cartão. Confira os campos ou use Pix.");
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("id" in data) || typeof data.id !== "string" || !data.id) throw new Error("A tokenização não foi confirmada.");
  return data.id;
}
export const payCard = (shoppingId: string, token: string, method: CardMethod, cpf: string) => api.post<BuyerPaymentResult>("/payment/create", {
  id_shopping: shoppingId, method: method.payment_type_id === "debit_card" ? "debit_card" : "credit_card", token,
  payment_method_id: method.id, installments: 1, payer: { identification: { type: "CPF", number: cpf } },
}, { timeout: 30000 });
export const saveCard = (card: Omit<BuyerCard, "id">, token: string) => api.post("/card/create", { ...card, payment_token: token });
