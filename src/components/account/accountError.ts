import axios from "axios";

export function accountError(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;
  if (!error.response) return "Não foi possível conectar. Verifique sua conexão e tente novamente.";
  switch (error.response.status) {
    case 400: case 422: return "Confira os dados informados e tente novamente.";
    case 401: return "Não foi possível autenticar. Confira seus dados de acesso.";
    case 403: return "A solicitação não foi autorizada. Confira se sua conta está confirmada.";
    case 404: return "Não foi possível encontrar o recurso solicitado. Tente novamente mais tarde.";
    case 409: return "Já existe um cadastro com os dados informados. Confira ou entre na sua conta.";
    case 413: return "O arquivo enviado é muito grande. Escolha uma imagem menor.";
    case 429: return "Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.";
    default: return fallback;
  }
}
