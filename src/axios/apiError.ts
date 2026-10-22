import axios from "axios";

export function apiStatus(error: unknown) { return axios.isAxiosError(error) ? error.response?.status : undefined; }
export function apiError(error: unknown, fallback = "Não foi possível concluir. Tente novamente.") {
  if (!axios.isAxiosError(error)) return fallback;
  if (!error.response) return "Não foi possível conectar. Verifique sua conexão e tente novamente.";
  if (error.response.status === 401) return "Não foi possível autenticar. Confira os dados ou entre novamente.";
  if (error.response.status === 403) return "Sua conta não tem permissão para esta ação.";
  if (error.response.status === 404) return "O registro não foi encontrado.";
  if (error.response.status === 429) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (error.response.status === 400 || error.response.status === 422) return "Revise os campos informados e tente novamente.";
  return fallback;
}
