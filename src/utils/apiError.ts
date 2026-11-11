// Lê a mensagem de erro que a API pode devolver em { error | message },
// devolvendo um fallback quando nada útil chega na resposta.
export function mensagemDeErroApi(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (
      err as {
        response?: { data?: { error?: string; message?: string } };
      }
    ).response;
    const data = response?.data;
    if (data && (data.error || data.message)) {
      return data.error || data.message || fallback;
    }
  }
  return fallback;
}
