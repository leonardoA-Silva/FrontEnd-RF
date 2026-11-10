import axios from "axios";
import { clearSession, type SessionUser } from "../auth/session";

// ─── Instância base ────────────────────────────────────────────────────────────
// Base da API (hospedada localmente na porta 5000 ou configurada via VITE_API_URL)
const BASE_URL =
  import.meta.env.VITE_API_URL ??
  "/api/reaproveitafranca";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Anexa o token JWT (se existir) em todas as requisições
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ?? sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(response => response, error => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && error.response.data?.auth === false) clearSession();
  return Promise.reject(error);
});

export default api;

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface CadastroEmpresaPayload {
  name: string;
  cnpj: string;
  cpf: string;
  email: string;
  password: string;
  cellphone: string;
  zip_code: string;
  street: string;
  neighborhood: string;
  number: string;
  city: string;
  state: string;
  photo?: File | null;
}

export interface CadastroUsuarioPayload {
  name: string;
  cpf: string;
  email: string;
  password: string;
  cellphone: string;
  birthday: string;
  zip_code: string;
  street: string;
  neighborhood: string;
  number: string;
  city: string;
  state: string;
  photo?: File | null;
}

export interface CadastroResponse {
  message: string;
  id: string;
  emailSent: boolean;
}

export interface OtpResponse {
  message: string;
}

export interface LoginEmpresaPayload {
  email: string;
  password: string;
}

export interface LoginUsuarioPayload {
  email: string;
  password: string;
}

// ─── Tipos de Produtos (Banco de Dados) ────────────────────────────────────────

export type CategoriaProduto =
  | "madeira"
  | "metal"
  | "plastico"
  | "papel/papelao"
  | "vidro"
  | "tecido"
  | "borracha"
  | "eletronicos"
  | string;

export type TipoNegociacao = "sale" | "donation";

export type EstadoConservacao = "new" | "good" | "regular" | "poor";

export type StatusProduto = "available" | "reserved" | "unavailable";

export interface ProductBackend {
  id: string;
  name: string;
  description: string | null;
  price: number | string | null;
  priority?: number;
  quantity: number;
  status: StatusProduto;
  category: CategoriaProduto;
  type_negotiation: TipoNegociacao;
  weight: number | string;
  conservation_state: EstadoConservacao;
  id_user?: string;
  id_localization?: string;
  photos?: { id: string; photo: string | null }[];
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price?: number | string | null;
  priority?: number;
  quantity?: number;
  status?: StatusProduto;
  category: CategoriaProduto;
  type_negotiation: TipoNegociacao;
  weight: number | string;
  conservation_state: EstadoConservacao;
  id_localization?: string;
}

// ─── Utilitário para Montagem de FormData ─────────────────────────────────────

function buildFormData<T extends Record<string, unknown>>(data: T, photoFile?: File | null): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "photo" && value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  const fileToAttach = photoFile || (data.photo as File | undefined | null);
  if (fileToAttach instanceof File) {
    formData.append("photo", fileToAttach);
  }
  return formData;
}

// ─── Serviços de Cadastro ──────────────────────────────────────────────────────

/** POST /api/reaproveitafranca/user/create/empresa */
export const cadastrarEmpresa = (payload: CadastroEmpresaPayload, photoFile?: File | null) => {
  const formData = buildFormData(payload as unknown as Record<string, unknown>, photoFile);
  return api.post<CadastroResponse>("/user/create/empresa", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** POST /api/reaproveitafranca/user/create */
export const cadastrarUsuario = (payload: CadastroUsuarioPayload, photoFile?: File | null) => {
  const formData = buildFormData(payload as unknown as Record<string, unknown>, photoFile);
  return api.post<CadastroResponse>("/user/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ─── Serviços de Confirmação de E-mail (OTP) ──────────────────────────────────

/** POST /api/reaproveitafranca/otp/enviar */
export const enviarCodigoOtp = (id: string) =>
  api.post<OtpResponse>("/otp/enviar", { id });

/** POST /api/reaproveitafranca/otp/verificar */
export const verificarCodigoOtp = (id: string, code: string) =>
  api.post<OtpResponse>("/otp/verificar", { id, code });

// ─── Serviços de Login ────────────────────────────────────────────────────────

/** POST /api/reaproveitafranca/user/login */
export const loginEmpresa = (payload: LoginEmpresaPayload) =>
  api.post<LoginResponse>("/user/login", payload);

/** POST /api/reaproveitafranca/user/login */
export const loginUsuario = (payload: LoginUsuarioPayload) =>
  api.post<LoginResponse>("/user/login", payload);

// ─── Serviços de Perfil de Usuário ────────────────────────────────────────────

export interface UsuarioPerfil {
  id: string;
  role: string;
  name: string;
  email: string;
  cellphone: string;
  status: string;
  birthday?: string | null;
  created_in?: string;
  createdIn?: string;
  photo?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  cargo?: string;
  razaoSocial?: string;
  setor?: string;
  zip_code?: string;
  street?: string;
  neighborhood?: string;
  number?: string;
  city?: string;
  state?: string;
}

/** Rotas autenticadas; a API confere titularidade. */
export const obterPerfilUsuario = (id: string, signal?: AbortSignal) =>
  api.get<UsuarioPerfil>(`/user/${encodeURIComponent(id)}`, { signal });
export const atualizarPerfilUsuario = (id: string, payload: FormData) =>
  api.put<{ message: string; user: UsuarioPerfil }>(`/user/${encodeURIComponent(id)}`, payload);
export const excluirMinhaConta = (id: string) => api.delete<{ message: string }>(`/user/${encodeURIComponent(id)}`);
export const alterarSenha = (currentPassword: string, newPassword: string, firstAccess = false) =>
  api.patch<{ message: string }>(firstAccess ? "/user/password/first-access" : "/user/password", { currentPassword, newPassword });
export const solicitarRedefinicao = (email: string) => api.post<{ message: string }>("/user/password/forgot", { email });
export const redefinirSenha = (token: string, newPassword: string) => api.post<{ message: string }>("/user/password/reset", { token, newPassword });
export interface LoginResponse { token: string; user: SessionUser; mustChangePassword: boolean }
export const entrarComGoogle = (idToken: string) => api.post<LoginResponse>("/user/login/google", { idToken });

// Contratos do comprador verificados na API 6543cd9.
export type ShoppingStatus = "pending" | "accepted" | "refused" | "cancelled" | "completed";
export interface ShoppingItem { id: string; id_product: string; product_name: string; quantity: number; subtotal: number | string; seller_id?: string; type_negotiation?: TipoNegociacao }
export interface Shopping { id: string; value: number | string; status: ShoppingStatus; datetime?: string; id_user?: string; total_items?: number; items?: ShoppingItem[] }
export const criarReserva = (id: string, quantity: number) => api.post<{ shopping: Shopping }>("/shopping/create", { items: [{ id_product: id, quantity }] });
export const listarReservas = (signal?: AbortSignal) => api.get<Shopping[]>("/shopping/", { signal });
export const obterReserva = (id: string, signal?: AbortSignal) => api.get<Shopping>(`/shopping/${encodeURIComponent(id)}`, { signal });
export const cancelarReserva = (id: string) => api.patch<{ shopping: Shopping }>(`/shopping/${encodeURIComponent(id)}/cancel`);

export interface BuyerNotification { id: string; title: string; content: string | null; type: string; read: "sim" | "nao"; created_in: string; reference_table: string | null; reference_id: string | null }
export const listarNotificacoes = (read: string, type: string, signal?: AbortSignal) => api.get<BuyerNotification[]>("/notification/", { signal, params: { read: read || undefined, type: type || undefined } });
export const contarNotificacoes = (signal?: AbortSignal) => api.get<{ total: number }>("/notification/unread/count", { signal });
export const lerNotificacao = (id: string) => api.patch(`/notification/${encodeURIComponent(id)}/read`);
export const lerTodasNotificacoes = () => api.patch("/notification/read-all");
export const excluirNotificacao = (id: string) => api.delete(`/notification/${encodeURIComponent(id)}`);

export interface BuyerAddress { id: string; zip_code: string; street: string; neighborhood: string; number: string; city: string; state: string; latitude: number | string | null; longitude: number | string | null }
export interface AddressInput { zipCode: string; street: string; neighborhood: string; number: string; city: string; state: string; latitude: number | null; longitude: number | null }
export interface ProductLocation { productId: string; city: string; neighborhood: string; addressFull: boolean; street?: string; number?: string; zipCode?: string; state?: string; latitude: number | null; longitude: number | null }
export const listarEnderecos = (signal?: AbortSignal) => api.get<BuyerAddress[]>("/localization/", { signal });
export const criarEndereco = (userId: string, input: AddressInput) => api.post<{ id: string }>("/localization/", { userId, ...input });
export const atualizarEndereco = (id: string, input: AddressInput) => api.put(`/localization/${encodeURIComponent(id)}`, input);
export const excluirEndereco = (id: string) => api.delete(`/localization/${encodeURIComponent(id)}`);
export const obterLocalizacaoProduto = (id: string, signal?: AbortSignal) => api.get<ProductLocation>(`/localization/product/${encodeURIComponent(id)}`, { signal });

export interface BuyerCard { id: string; holder_name: string; brand: string; last_digits: string; type: "credit" | "debit"; expiration_month: number; expiration_year: number }
export const listarCartoes = (signal?: AbortSignal) => api.get<BuyerCard[]>("/card/", { signal });
export const atualizarCartao = (id: string, input: Pick<BuyerCard, "holder_name" | "expiration_month" | "expiration_year">) => api.put(`/card/${encodeURIComponent(id)}`, input);
export const excluirCartao = (id: string) => api.delete(`/card/${encodeURIComponent(id)}`);

export interface BuyerConversation { conversationId: string; otherUserId: string; otherUserName: string; unreadCount: number; updated_in: string }
export interface BuyerMessage { id: string; id_conversation: string; id_user: string; type: string; content: string | null; created_in: string; edited_in?: string | null; deleted_in?: string | null }
export const listarConversas = (signal?: AbortSignal) => api.get<BuyerConversation[]>("/conversation/", { signal });
export const iniciarConversa = (otherUserId: string) => api.post<{ conversationId: string }>("/conversation/", { otherUserId });
export const obterConversa = (id: string, signal?: AbortSignal) => api.get<{ conversationId: string; participants: string[] }>(`/conversation/${encodeURIComponent(id)}`, { signal });
export const sairConversa = (id: string) => api.delete(`/conversation/${encodeURIComponent(id)}`);

// ─── Serviços de Produtos (Banco de Dados) ────────────────────────────────────

/** GET /api/reaproveitafranca/product */
export const listarProdutos = (signal?: AbortSignal) =>
  api.get<ProductBackend[]>("/product", { signal });

/** GET /api/reaproveitafranca/product/:id */
export const obterProdutoPorId = (id: string, signal?: AbortSignal) =>
  api.get<ProductBackend>(`/product/${encodeURIComponent(id)}`, { signal });

/** POST /api/reaproveitafranca/product/create */
export const cadastrarProduto = (payload: CreateProductPayload) =>
  api.post<{ message: string; id: string }>("/product/create", payload);

/** PUT /api/reaproveitafranca/product/:id */
export const atualizarProduto = (id: string, payload: Partial<CreateProductPayload>) =>
  api.put<{ message: string }>(`/product/${id}`, payload);

// ─── Serviços de Logs e Auditoria (Atividades) ────────────────────────────────

export interface LogBackend {
  id: string;
  reference_id: string;
  status: string;
  operation: string;
  table: string;
  datetime: string;
}

/** GET /api/reaproveitafranca/log */
export const listarLogs = (params?: { reference_id?: string; status?: string; operation?: string; table?: string }) =>
  api.get<LogBackend[]>("/log", { params });

/** POST /api/reaproveitafranca/log */
export const criarLog = (payload: { reference_id: string; status: string; operation: string; table: string }) =>
  api.post<{ message: string; id: string }>("/log", payload);

