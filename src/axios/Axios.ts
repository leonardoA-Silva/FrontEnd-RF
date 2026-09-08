import axios from "axios";

// ─── Instância base ────────────────────────────────────────────────────────────
// Usa URL relativa no Vite para aproveitar o proxy e evitar bloqueios de CORS / rede
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface CadastroEmpresaPayload {
  cpf: string;
  name: string;
  email: string;
  birthday?: string;
  zip_code: string;
  street: string;
  neighborhood: string;
  number: string;
  city: string;
  state: string;
  password: string;
  cellphone: string;
}

export interface CadastroUsuarioPayload {
  cpf: string;
  name: string;
  email: string;
  cnpj: string;
  password: string;
  cellphone: string;
  zip_code: string;
  street: string;
  neighborhood: string;
  number: string;
  city: string;
  state: string;
}

export interface LoginEmpresaPayload {
  cnpj: string;
  cpfResponsavel: string;
  senha: string;
}

export interface LoginUsuarioPayload {
  cpf: string;
  senha: string;
}

// ─── Serviços ──────────────────────────────────────────────────────────────────

/** POST /api/reaproveitafranca/user/create/empresa */
export const cadastrarEmpresa = (payload: CadastroEmpresaPayload) =>
  api.post("/api/reaproveitafranca/user/create/empresa", payload);

/** POST /api/reaproveitafranca/user/create */
export const cadastrarUsuario = (payload: CadastroUsuarioPayload) =>
  api.post("/api/reaproveitafranca/user/create", payload);

/** POST /api/reaproveitafranca/login/empresa */
export const loginEmpresa = (payload: LoginEmpresaPayload) =>
  api.post("/api/reaproveitafranca/login/empresa", payload);

/** POST /api/reaproveitafranca/login */
export const loginUsuario = (payload: LoginUsuarioPayload) =>
  api.post("/api/reaproveitafranca/login", payload);
