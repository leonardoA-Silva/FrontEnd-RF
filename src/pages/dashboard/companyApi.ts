import axios from "axios";
import api from "../../axios/Axios";

export interface CompanyNotification {
  id: string; title: string; content: string | null; read: "sim" | "nao";
  created_in: string; reference_table: string | null; reference_id: string | null;
}
export interface Impact {
  id: string; id_shopping: string; estimated_weight_kg: string | number | null;
  co2_saved_kg: string | number | null; water_saved_liters: string | number | null;
  energy_saved_kwh: string | number | null; calculated_in: string; calculation_method: string;
}
export interface Dispute {
  id: string; type: string; description: string; status: string;
  resolution: string | null; created_in: string; id_shopping: string; id_opened_by: string;
}
export interface Review {
  id: string; rating: number; comment: string | null; created_in: string;
  id_reviewer: string; id_reviewed: string;
}
export const listNotifications = (signal?: AbortSignal) => api.get<CompanyNotification[]>("/notification", { signal }).then(r => r.data);
export const listImpacts = (signal?: AbortSignal) => api.get<Impact[]>("/environmental-impact", { signal }).then(r => r.data);
export const listDisputes = (signal?: AbortSignal) => api.get<Dispute[]>("/dispute", { signal }).then(r => r.data);
export const listReviews = (signal?: AbortSignal) => api.get<Review[]>("/review", { signal }).then(r => r.data);

export function companyError(error: unknown) {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  if (status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
  if (status === 403) return "Sua conta não tem permissão para acessar estas informações.";
  if (status === 404) return "As informações solicitadas não foram encontradas.";
  if (status === 409) return "A situação mudou. Atualize os dados antes de tentar novamente.";
  if (status === 400 || status === 422) return "Não foi possível salvar. Confira os campos informados e tente novamente.";
  return "Não foi possível carregar ou atualizar os dados. Tente novamente.";
}
export function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data não informada" : date.toLocaleDateString("pt-BR");
}
export function displayMetric(value: string | number | null, unit: string) {
  if (value === null || value === "" || !Number.isFinite(Number(value))) return "Não informado";
  return `${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unit}`;
}
