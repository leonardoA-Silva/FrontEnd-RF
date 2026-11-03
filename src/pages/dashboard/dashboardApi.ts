import api from "../../axios/Axios";

// Contrato de produto exposto hoje por GET /product (productController + productService).
// DECIMAL chega como string pelo driver MySQL, por isso os campos numéricos aceitam os dois tipos.
export type ProdutoStatus = "available" | "reserved" | "unavailable";
export type ProdutoCategoria =
  | "madeira"
  | "metal"
  | "plastico"
  | "papel/papelao"
  | "vidro"
  | "tecido"
  | "borracha"
  | "eletronicos";
export type EstadoConservacao = "new" | "good" | "regular" | "poor";
export type TipoNegociacao = "sale" | "donation";

export interface ProdutoApi {
  id: string;
  name: string;
  description: string | null;
  price: string | number | null;
  priority: number;
  quantity: number;
  status: ProdutoStatus;
  category: ProdutoCategoria;
  type_negotiation: TipoNegociacao;
  weight: string | number;
  conservation_state: EstadoConservacao;
  id_user: string;
  id_localization: string;
}

export interface CriarLocalizacaoPayload {
  userId: string;
  zipCode: string;
  street: string;
  neighborhood: string;
  number: string;
  city: string;
  state: string;
}

export interface CriarProdutoPayload {
  name: string;
  description: string;
  price: number | null;
  priority: number;
  quantity: number;
  status: ProdutoStatus;
  category: ProdutoCategoria;
  type_negotiation: TipoNegociacao;
  weight: number;
  conservation_state: EstadoConservacao;
  id_localization: string;
}

/**
 * Lista os produtos cadastrados. A API ainda não tem filtro por empresa,
 * então a tela filtra por id_user depois de receber a lista.
 */
export async function listarProdutos(): Promise<ProdutoApi[]> {
  const { data } = await api.get<ProdutoApi[]>("/product");
  return Array.isArray(data) ? data : [];
}

export async function criarLocalizacao(
  payload: CriarLocalizacaoPayload
): Promise<string> {
  const { data } = await api.post<{ id: string }>("/localization/", payload);
  return data.id;
}

export async function criarProduto(payload: CriarProdutoPayload): Promise<string> {
  const { data } = await api.post<{ id: string; message: string }>(
    "/product/create",
    payload
  );
  return data.id;
}
