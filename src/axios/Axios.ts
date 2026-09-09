import axios from "axios";

// ─── Instância base ────────────────────────────────────────────────────────────
// Usa URL relativa no Vite para aproveitar o proxy (localhost:5000) e evitar bloqueios de CORS
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
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
  return api.post<CadastroResponse>("/api/reaproveitafranca/user/create/empresa", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** POST /api/reaproveitafranca/user/create */
export const cadastrarUsuario = (payload: CadastroUsuarioPayload, photoFile?: File | null) => {
  const formData = buildFormData(payload as unknown as Record<string, unknown>, photoFile);
  return api.post<CadastroResponse>("/api/reaproveitafranca/user/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ─── Serviços de Confirmação de E-mail (OTP) ──────────────────────────────────

/** POST /api/reaproveitafranca/otp/enviar */
export const enviarCodigoOtp = (id: string) =>
  api.post<OtpResponse>("/api/reaproveitafranca/otp/enviar", { id });

/** POST /api/reaproveitafranca/otp/verificar */
export const verificarCodigoOtp = (id: string, code: string) =>
  api.post<OtpResponse>("/api/reaproveitafranca/otp/verificar", { id, code });

// ─── Serviços de Login ────────────────────────────────────────────────────────

/** POST /api/reaproveitafranca/login/empresa */
export const loginEmpresa = (payload: LoginEmpresaPayload) =>
  api.post("/api/reaproveitafranca/login/empresa", payload);

/** POST /api/reaproveitafranca/login */
export const loginUsuario = (payload: LoginUsuarioPayload) =>
  api.post("/api/reaproveitafranca/login", payload);
