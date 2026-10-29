export interface CepAddress { street: string; neighborhood: string; city: string; state: string }

export class CepLookupError extends Error {}

// Cliente separado: o JWT da API nunca é enviado para o ViaCEP.
export async function consultarCep(cep: string, signal: AbortSignal): Promise<CepAddress> {
  if (!/^\d{8}$/.test(cep)) throw new CepLookupError("Informe um CEP com 8 dígitos.");
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal, credentials: "omit", referrerPolicy: "no-referrer" });
  if (!response.ok) throw new CepLookupError("Não foi possível consultar o CEP. Tente novamente ou preencha o endereço manualmente.");
  const data: unknown = await response.json();
  if (!data || typeof data !== "object") throw new CepLookupError("A consulta retornou dados inválidos. Preencha o endereço manualmente.");
  const address = data as Record<string, unknown>;
  if (address.erro === true || address.erro === "true") throw new CepLookupError("CEP não encontrado. Confira o número ou preencha o endereço manualmente.");
  if (typeof address.localidade !== "string" || !address.localidade.trim() || typeof address.uf !== "string" || !/^[A-Za-z]{2}$/.test(address.uf)) throw new CepLookupError("A consulta retornou dados incompletos. Preencha o endereço manualmente.");
  return { street: typeof address.logradouro === "string" ? address.logradouro : "", neighborhood: typeof address.bairro === "string" ? address.bairro : "", city: address.localidade, state: address.uf.toUpperCase() };
}
