import axios from "axios";

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
  cnpj: string;
  cpfResponsavel: string;
  senha: string;
}

export interface LoginUsuarioPayload {
  cpf: string;
  senha: string;
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

/** POST /api/reaproveitafranca/login/empresa */
export const loginEmpresa = (payload: LoginEmpresaPayload) =>
  api.post("/login/empresa", payload);

/** POST /api/reaproveitafranca/login */
export const loginUsuario = (payload: LoginUsuarioPayload) =>
  api.post("/login", payload);
