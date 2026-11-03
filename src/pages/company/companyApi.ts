import api from "../../axios/Axios";
import { uuidPattern } from "./companyTypes";
import type { CompanyIdentity, CompanyProduct } from "./companyTypes";

const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === "string" ? value : "";
const numeric = (value: unknown) => typeof value === "number" || typeof value === "string" && value.trim() ? Number(value) : NaN;

export function readCompanyIdentity(): CompanyIdentity | null {
  try {
    const user = record(JSON.parse(localStorage.getItem("user") ?? sessionStorage.getItem("user") ?? "null"));
    if (!uuidPattern.test(text(user.id))) return null;
    return { id: text(user.id), name: text(user.name), email: text(user.email), cellphone: text(user.cellphone) };
  } catch { return null; }
}

function parseProduct(value: unknown): CompanyProduct | null {
  const row = record(value);
  const quantity = numeric(row.quantity), weight = numeric(row.weight), price = numeric(row.price);
  if (!uuidPattern.test(text(row.id)) || !text(row.name) || !["sale", "donation"].includes(text(row.type_negotiation)) || !Number.isFinite(quantity) || !Number.isFinite(weight)) return null;
  const photos = Array.isArray(row.photos) ? row.photos : [];
  const images = photos.flatMap(value => {
    const photo = text(record(value).photo);
    if (!photo || !/^[A-Za-z0-9+/\r\n]*={0,2}$/.test(photo)) return [];
    const mime = photo.startsWith("iVBOR") ? "image/png" : photo.startsWith("/9j/") ? "image/jpeg" : photo.startsWith("UklGR") ? "image/webp" : photo.startsWith("R0lGOD") ? "image/gif" : null;
    return mime ? [`data:${mime};base64,${photo}`] : [];
  });
  return { id: text(row.id), name: text(row.name), description: text(row.description), category: text(row.category), type: row.type_negotiation as CompanyProduct["type"], quantity, weight, price: row.type_negotiation === "donation" || !Number.isFinite(price) ? null : price, condition: text(row.conservation_state), status: text(row.status), images };
}

export async function loadCompanyProducts(ownerId: string, signal: AbortSignal) {
  const { data } = await api.get<unknown>("/product/", { signal });
  if (!Array.isArray(data)) throw new Error("Invalid product response");
  return data.filter(row => text(record(row).id_user).toLowerCase() === ownerId.toLowerCase()).map(parseProduct).filter((row): row is CompanyProduct => row !== null);
}

export async function loadCompanyAccount(id: string, signal: AbortSignal): Promise<CompanyIdentity> {
  const { data } = await api.get<unknown>(`/user/${id}`, { signal });
  const row = record(data);
  if (text(row.id).toLowerCase() !== id.toLowerCase() || !text(row.name)) throw new Error("Invalid account response");
  return { id, name: text(row.name), email: text(row.email), cellphone: text(row.cellphone) };
}

export async function saveCompanyAccount(id: string, name: string, cellphone: string): Promise<CompanyIdentity> {
  const { data } = await api.put<unknown>(`/user/${id}`, { name, cellphone });
  const user = record(record(data).user);
  if (text(user.id).toLowerCase() !== id.toLowerCase() || !text(user.name)) throw new Error("Invalid account response");
  return { id, name: text(user.name), email: text(user.email), cellphone: text(user.cellphone) };
}
