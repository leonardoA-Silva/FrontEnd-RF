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
  razaoSocial: string;
  cnpj: string;
  setorIndustrial: string;
  estado: string;
  cidade: string;
  endereco: string;
  responsavel: string;
  cpfResponsavel: string;
  telefone: string;
  senha: string;
  foto?: string;
}

export interface CadastroUsuarioPayload {
  nomeOuRazao: string;
  cpf: string;
  tipoEntidade: string;
  estado: string;
  cidade: string;
  localizacao: string;
  senha: string;
  foto?: string;
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
