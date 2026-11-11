import axios from "axios";
import { apiError } from "../axios/apiError";

export function googleAccessError(cause: unknown, fallback = "Não foi possível continuar com Google. Tente novamente ou use e-mail e senha.") {
  if (axios.isAxiosError(cause) && cause.response?.status === 503) {
    return cause.response.data?.error === "Login Google não configurado."
      ? "O acesso com Google ainda não está habilitado no servidor. Você pode continuar com e-mail e senha."
      : "O serviço de acesso Google está temporariamente indisponível. Tente novamente em instantes ou use e-mail e senha.";
  }
  if (axios.isAxiosError(cause) && cause.response?.status === 401) return "Sua identificação Google não foi aceita. Escolha sua conta novamente para tentar entrar.";
  return apiError(cause, fallback);
}
