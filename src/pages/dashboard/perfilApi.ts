import { isAxiosError } from "axios";
import api from "../../axios/Axios";

export interface PerfilEmpresa {
  id: string;
  name: string;
  email: string;
  cellphone: string;
}

function readProfile(value: unknown): PerfilEmpresa {
  if (!value || typeof value !== "object") throw new Error("Resposta inválida");
  const data = value as Record<string, unknown>;
  if (!["id", "name", "email", "cellphone"].every(key => typeof data[key] === "string")) {
    throw new Error("Resposta inválida");
  }
  // Não reter documentos ou outros campos da resposta no estado da tela.
  return { id: data.id as string, name: data.name as string, email: data.email as string, cellphone: data.cellphone as string };
}

export async function consultarPerfil(id: string, signal: AbortSignal) {
  const { data } = await api.get<unknown>(`/user/${encodeURIComponent(id)}`, { signal });
  return readProfile(data);
}

export async function salvarPerfil(id: string, fields: Pick<PerfilEmpresa, "name" | "cellphone">) {
  const { data } = await api.put<{ user: unknown }>(`/user/${encodeURIComponent(id)}`, fields);
  const profile = readProfile(data.user);
  // Atualiza somente o nome já usado pela sessão, sem armazenar o contato.
  try {
    const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
    const raw = storage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw) as Record<string, unknown>;
      if (typeof user.id === "string" && user.id.toLowerCase() === id.toLowerCase()) {
        storage.setItem("user", JSON.stringify({ ...user, name: profile.name }));
        window.dispatchEvent(new Event("perfil-atualizado"));
      }
    }
  } catch {
    // A atualização na API continua válida se o armazenamento estiver indisponível.
  }
  return profile;
}

export function erroPerfil(error: unknown): string {
  if (isAxiosError(error)) {
    switch (error.response?.status) {
      case 400: return "Confira o nome e o celular informados e tente novamente.";
      case 401: return "Sua sessão expirou. Entre novamente para acessar sua conta.";
      case 403: return "Você não tem permissão para acessar esta conta.";
      case 404: return "Não encontramos esta conta. Entre novamente para continuar.";
      case 429: return "Muitas tentativas em pouco tempo. Aguarde um momento e tente novamente.";
    }
  }
  return "Não foi possível acessar os dados da conta. Confira sua conexão e tente novamente.";
}
