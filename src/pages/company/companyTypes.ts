export const categories = {
  madeira: "Madeira", metal: "Metal", plastico: "Plástico / EVA", "papel/papelao": "Papel / Papelão",
  vidro: "Vidro", tecido: "Tecido", borracha: "Borracha", eletronicos: "Eletrônicos",
};
export const conditions = { new: "Novo", good: "Bom", regular: "Regular", poor: "Desgastado" };
export const statuses = { available: "Disponível", reserved: "Reservado", unavailable: "Indisponível" };
export type Negotiation = "sale" | "donation";
export interface CompanyProduct {
  id: string; name: string; description: string; category: string; type: Negotiation;
  quantity: number; weight: number; price: number | null; condition: string; status: string; images: string[];
}
export interface CompanyIdentity { id: string; name: string; email: string; cellphone: string }
export const categoryLabel = (key: string) => categories[key as keyof typeof categories] ?? "Categoria não informada";
export const conditionLabel = (key: string) => conditions[key as keyof typeof conditions] ?? "Não informado";
export const statusLabel = (key: string) => statuses[key as keyof typeof statuses] ?? "Não informado";
export const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const number = (value: number) => value.toLocaleString("pt-BR");
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
