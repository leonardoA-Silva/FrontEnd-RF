import axios from "axios";
import type { ProductBackend } from "../../axios/Axios";

// Único produto fictício: não integra o catálogo nem representa estoque real.
export const COMPRA_EXEMPLO: ProductBackend = {
  id: "compra-exemplo",
  name: "Lote de materiais para reaproveitamento — exemplo",
  description: "Compra demonstrativa para conhecer as etapas e as opções de pagamento. Nenhum material será reservado e nenhum valor será cobrado.",
  price: 45,
  quantity: 10,
  status: "available",
  category: "couro",
  type_negotiation: "sale",
  weight: 2,
  conservation_state: "good",
};

export const IMAGENS_EXEMPLO = [
  "/retalho-couro-nobre.png",
  "/retalho-nobuck-macio.png",
  "/eva-camurca-premium.png",
];

export function imagensMaterial(produto: ProductBackend): string[] {
  if (produto.id === COMPRA_EXEMPLO.id) return IMAGENS_EXEMPLO;
  const nome = `${produto.name} ${produto.category}`.toLocaleLowerCase("pt-BR");
  if (nome.includes("nobuck")) return [IMAGENS_EXEMPLO[1]];
  if (/\beva\b/.test(nome)) return [IMAGENS_EXEMPLO[2]];
  if (nome.includes("couro")) return [IMAGENS_EXEMPLO[0]];
  return [];
}

export function validarCatalogo(data: unknown): ProductBackend[] {
  if (!Array.isArray(data) || !data.every((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const p = item as Record<string, unknown>;
    return typeof p.id === "string" && p.id.length > 0 &&
      typeof p.name === "string" && p.name.trim().length > 0 &&
      typeof p.category === "string" &&
      (p.description === null || typeof p.description === "string") &&
      typeof p.quantity === "number" && Number.isFinite(p.quantity) && p.quantity >= 0 &&
      ["available", "reserved", "unavailable"].includes(String(p.status)) &&
      ["sale", "donation"].includes(String(p.type_negotiation)) &&
      ["new", "good", "regular", "poor"].includes(String(p.conservation_state)) &&
      (typeof p.weight === "number" || typeof p.weight === "string") &&
      (p.price === null || typeof p.price === "number" || typeof p.price === "string");
  })) throw new Error("Catálogo inválido");
  return data as ProductBackend[];
}

export function precoMaterial(produto: ProductBackend): string {
  if (produto.type_negotiation === "donation") return "Doação gratuita";
  const preco = produto.price;
  if (preco === null || preco === "" || !Number.isFinite(Number(preco)) || Number(preco) < 0) return "Preço não informado";
  return Number(preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function estadoMaterial(estado: string): string {
  return ({ new: "Novo", good: "Bom estado", regular: "Regular", poor: "Para reciclagem" } as Record<string, string>)[estado] || "Não informado";
}

export function erroCatalogo(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return "Sua sessão expirou. Entre novamente para consultar os materiais.";
    if (error.response?.status === 403) return "Você não tem permissão para consultar os materiais.";
    if (error.response?.status === 404) return "O catálogo não está disponível no momento.";
    if (!error.response) return "Não foi possível carregar os materiais. Verifique sua conexão e tente novamente.";
  }
  return "Não foi possível carregar os materiais. Tente novamente em instantes.";
}
