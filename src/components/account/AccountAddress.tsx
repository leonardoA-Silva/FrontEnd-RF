import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { atualizarEndereco, criarEndereco, listarEnderecos, type AddressInput, type BuyerAddress } from "../../api/services";
import { apiError } from "../../axios/apiError";
import { requireArray, useApiResource } from "../../hooks/useApiResource";
import { consultarCep } from "../../services/cepService";
import RequestState from "../../pages/dashboard/comprador/RequestState";
import { buyerStyles as s } from "../../pages/dashboard/comprador/buyerStyles";

const empty: AddressInput = { zipCode: "", street: "", number: "", neighborhood: "", city: "", state: "" };
export default function AccountAddress({ userId }: { userId: string }) {
  const loader = useCallback(async (signal: AbortSignal) => { const response = await listarEnderecos(signal); return { data: requireArray(response.data)[0] ?? null }; }, []);
  const resource = useApiResource(loader);
  return <section className="space-y-6"><h1 className={s.title}>Meu endereço</h1><RequestState {...resource} retry={resource.reload} />{!resource.loading && !resource.error && <AddressForm key={resource.data?.id ?? "new"} userId={userId} address={resource.data ?? null} />}</section>;
}
function AddressForm({ userId, address }: { userId: string; address: BuyerAddress | null }) {
  const [id, setId] = useState(address?.id ?? "");
  const [fields, setFields] = useState<AddressInput>(address ? { zipCode: address.zip_code, street: address.street, number: address.number, neighborhood: address.neighborhood, city: address.city, state: address.state } : empty);
  const [busy, setBusy] = useState(false), [zipBusy, setZipBusy] = useState(false);
  const [error, setError] = useState(""), [notice, setNotice] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function lookup() {
    if (!/^\d{8}$/.test(fields.zipCode)) return;
    controller.current?.abort(); const request = new AbortController(); controller.current = request;
    const zip = fields.zipCode; setZipBusy(true); setNotice("");
    try { const result = await consultarCep(zip, request.signal); if (!request.signal.aborted) { setFields(previous => previous.zipCode === zip ? { ...previous, street: result.street || previous.street, neighborhood: result.neighborhood || previous.neighborhood, city: result.city, state: result.state } : previous); setNotice("Endereço consultado. Confira e complete o número."); } }
    catch { if (!request.signal.aborted) setNotice("Não foi possível consultar o CEP. Você pode preencher o endereço manualmente."); }
    finally { if (!request.signal.aborted) setZipBusy(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    if (!/^\d{8}$/.test(fields.zipCode) || !/^[A-Za-z]{2}$/.test(fields.state) || ![fields.street, fields.number, fields.neighborhood, fields.city].every(value => value.trim())) { setError("Preencha CEP, logradouro, número, bairro, cidade e UF."); return; }
    setBusy(true); setError(""); setNotice("");
    const input = { ...fields, street: fields.street.trim(), number: fields.number.trim(), neighborhood: fields.neighborhood.trim(), city: fields.city.trim(), state: fields.state.toUpperCase() };
    try { if (id) await atualizarEndereco(id, input); else { const response = await criarEndereco(userId, input); if (!response.data.id) throw new Error("Endereço não confirmado."); setId(response.data.id); } setNotice("Endereço salvo com sucesso."); }
    catch (cause) { setError(apiError(cause, "Não foi possível salvar seu endereço. Os campos foram preservados.")); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className={`${s.panel} max-w-3xl space-y-5`}><fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2"><legend className="sr-only">Endereço da conta</legend>{([["zipCode", "CEP", 8], ["number", "Número", 6], ["street", "Rua / Logradouro", 150], ["neighborhood", "Bairro", 80], ["city", "Cidade", 100], ["state", "Estado (UF)", 2]] as const).map(([key, label, max]) => <label key={key} className={s.label}>{label} *<input required maxLength={max} inputMode={key === "zipCode" ? "numeric" : "text"} value={fields[key]} onBlur={key === "zipCode" ? lookup : undefined} onChange={event => { const value = event.target.value; setFields(previous => ({ ...previous, [key]: key === "zipCode" ? value.replace(/\D/g, "") : key === "state" ? value.replace(/[^a-z]/gi, "").toUpperCase() : value })); setError(""); }} className={s.input} /></label>)}</fieldset>{zipBusy && <p role="status">Consultando CEP…</p>}{error && <p role="alert" className={s.error}>{error}</p>}{notice && <p role="status" className={s.notice}>{notice}</p>}<button type="submit" disabled={busy || zipBusy} className={s.button}>{busy ? "Salvando…" : "Salvar endereço"}</button></form>;
}
