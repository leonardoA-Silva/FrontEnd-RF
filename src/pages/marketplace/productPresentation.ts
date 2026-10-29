import type { ProductBackend } from "../../axios/Axios";
import { money as moeda } from "../dashboard/comprador/buyerPresentation";

export function productPhotos(product: ProductBackend): string[] {
  return (product.photos ?? []).flatMap(({ photo }) => {
    if (typeof photo !== "string" || photo.length > 14_000_000) return [];
    const base64 = photo.replace(/\s/g, "");
    if (!/^[a-zA-Z0-9+/]*={0,2}$/.test(base64)) return [];
    const mime = base64.startsWith("/9j/") ? "image/jpeg" : base64.startsWith("iVBORw0KGgo") ? "image/png" : base64.startsWith("R0lGOD") ? "image/gif" : base64.startsWith("UklGR") ? "image/webp" : null;
    return mime ? [`data:${mime};base64,${base64}`] : [];
  });
}
export const productPrice = (product: ProductBackend) => product.type_negotiation === "donation" ? "Doação gratuita" : product.price !== null && product.price !== "" && Number.isFinite(Number(product.price)) ? moeda(Number(product.price)) : "Preço não informado";
export const productCondition = (product: ProductBackend) => ({ new: "Novo", good: "Bom estado", regular: "Regular", poor: "Para reciclagem" })[product.conservation_state] ?? "Não informado";
export const productStatus = (product: ProductBackend) => ({ available: "Disponível", reserved: "Reservado", unavailable: "Indisponível" })[product.status] ?? "Não informado";
