import type { ShoppingStatus } from "../../../axios/Axios";

export const money = (value: number | string) => Number.isFinite(Number(value)) ? Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Não informado";
export const shoppingLabel = (status: ShoppingStatus) => ({ pending: "Aguardando aceite", accepted: "Aceita", refused: "Recusada", cancelled: "Cancelada", completed: "Concluída" })[status] ?? "Estado não informado";
export const dateLabel = (value?: string) => {
  if (!value) return "Data não informada";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data não informada" : date.toLocaleString("pt-BR");
};
