import { isAxiosError } from "axios";
import api from "../../api/client";
import { uuidPattern } from "./companyTypes";

export const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
export const string = (value: unknown) => typeof value === "string" ? value : "";
export function resourceError(error: unknown) {
  if (isAxiosError(error)) switch (error.response?.status) {
    case 400: case 422: return "Confira os campos preenchidos e tente novamente.";
    case 401: return "Sua sessão expirou. Entre novamente para continuar.";
    case 403: return "Você não tem permissão para realizar esta ação.";
    case 404: return "Este registro não foi encontrado. Atualize a página.";
    case 409: return "Este registro possui vínculos ou mudou de situação. Atualize os dados antes de tentar novamente.";
    case 413: return "O arquivo é muito grande. Selecione uma imagem de até 5 MB.";
    case 415: return "Formato não suportado. Selecione uma imagem PNG, JPEG, GIF ou WebP.";
    case 429: return "Aguarde um momento antes de tentar novamente.";
  }
  return "Não foi possível concluir a solicitação. Confira sua conexão e tente novamente.";
}
export interface CompanyLocation { id: string; zipCode: string; street: string; neighborhood: string; number: string; city: string; state: string }
export type LocationFields = Omit<CompanyLocation, "id">;
function readLocation(value: unknown): CompanyLocation {
  const row = object(value);
  if (!uuidPattern.test(string(row.id)) || !["zip_code", "street", "neighborhood", "number", "city", "state"].every(key => typeof row[key] === "string")) throw new Error("Invalid location response");
  return { id: string(row.id), zipCode: string(row.zip_code), street: string(row.street), neighborhood: string(row.neighborhood), number: string(row.number), city: string(row.city), state: string(row.state) };
}
export async function loadLocations(signal: AbortSignal) {
  const { data } = await api.get<unknown>("/localization/", { signal });
  if (!Array.isArray(data)) throw new Error("Invalid locations");
  return data.map(readLocation);
}
export async function saveLocation(fields: LocationFields, userId: string, id?: string) {
  if (id) {
    const { data } = await api.put<unknown>(`/localization/${encodeURIComponent(id)}`, fields);
    const result = readLocation(object(data).localization);
    if (result.id.toLowerCase() !== id.toLowerCase()) throw new Error("Invalid location response");
    return result;
  }
  const { data } = await api.post<unknown>("/localization/", { ...fields, userId });
  const createdId = string(object(data).id);
  if (!uuidPattern.test(createdId)) throw new Error("Invalid location response");
  return { ...fields, id: createdId };
}
export interface Impact { id: string; weight: number; co2: number; water: number; energy: number; method: string; at: string }
export async function loadImpacts(signal: AbortSignal): Promise<Impact[]> {
  const { data } = await api.get<unknown>("/environmental-impact/", { signal });
  if (!Array.isArray(data)) throw new Error("Invalid impacts");
  return data.map(value => {
    const row = object(value);
    const values = [row.estimated_weight_kg, row.co2_saved_kg, row.water_saved_liters, row.energy_saved_kwh];
    if (!uuidPattern.test(string(row.id)) || values.some(v => v === null || v === "" || !["number", "string"].includes(typeof v) || !Number.isFinite(Number(v)) || Number(v) < 0) || !Number.isFinite(Date.parse(string(row.calculated_in)))) throw new Error("Invalid impact");
    return { id: string(row.id), weight: Number(values[0]), co2: Number(values[1]), water: Number(values[2]), energy: Number(values[3]), method: string(row.calculation_method), at: string(row.calculated_in) };
  });
}
