import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { atualizarEndereco, criarEndereco, excluirEndereco, listarEnderecos, type AddressInput, type BuyerAddress } from "../../../axios/Axios";
import { apiError, apiStatus } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import ConfirmAction from "./ConfirmAction";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { CepLookupError, consultarCep } from "../../../services/cepService";

export default function BuyerAddresses({ userId }: { userId: string }) {
  const loader = useCallback(async (signal: AbortSignal) => { const response = await listarEnderecos(signal); return { data: requireArray(response.data) }; }, []);
  const resource = useApiResource(loader);
  const [editing, setEditing] = useState<BuyerAddress | "new" | null>(null);
  const [selected, setSelected] = useState<BuyerAddress | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function remove() {
    if (busy || !selected) return;
    setBusy(true); setError("");
    try { await excluirEndereco(selected.id); setSelected(null); setSuccess("Endereço excluído."); resource.reload(); }
    catch (cause) { setError(apiStatus(cause) === 409 ? "Este endereço está vinculado a um anúncio e não pode ser excluído." : apiError(cause, "Não foi possível excluir o endereço.")); }
    finally { setBusy(false); }
  }
  if (editing) return <AddressForm key={editing === "new" ? "new" : editing.id} userId={userId} address={editing === "new" ? null : editing} cancel={() => setEditing(null)} saved={() => { setEditing(null); setSuccess("Endereço salvo com sucesso."); resource.reload(); }} />;
  return <section className="space-y-6"><h1 className={s.title}>Meus endereços</h1><div className="flex flex-wrap gap-3"><button onClick={() => setEditing("new")} className={s.button}>Adicionar endereço</button><button disabled={resource.loading} onClick={resource.reload} className={s.secondary}>Atualizar endereços</button></div>{success && <p role="status" className={s.success}>{success}</p>}<RequestState {...resource} retry={resource.reload} />
    {!resource.loading && !resource.error && (!resource.data?.length ? <p className={s.notice}>Nenhum endereço cadastrado.</p> : <ul className="space-y-4">{resource.data.map(item => <li key={item.id} className={`${s.panel} space-y-4`}><h2 className={s.subtitle}>{item.city} · {item.state}</h2><p className={s.copy}>{item.street}, {item.number} · {item.neighborhood} · CEP {item.zip_code}</p><div className="flex flex-wrap gap-3"><button onClick={() => setEditing(item)} className={s.secondary}>Editar endereço</button><button onClick={() => { setError(""); setSelected(item); }} className={s.secondary}>Excluir endereço</button></div></li>)}</ul>)}
    {selected && <ConfirmAction title="Excluir endereço?" description="O endereço será removido da sua conta. Endereços vinculados a anúncios não podem ser removidos." busy={busy} error={error} confirm={remove} cancel={() => setSelected(null)} />}
  </section>;
}

function AddressForm({ userId, address, cancel, saved }: { userId: string; address: BuyerAddress | null; cancel: () => void; saved: () => void }) {
  const [fields, setFields] = useState({ zipCode: address?.zip_code ?? "", street: address?.street ?? "", neighborhood: address?.neighborhood ?? "", number: address?.number ?? "", city: address?.city ?? "", state: address?.state ?? "", latitude: String(address?.latitude ?? ""), longitude: String(address?.longitude ?? "") });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cepBusy, setCepBusy] = useState(false);
  const [cepError, setCepError] = useState("");
  const [cepStatus, setCepStatus] = useState("");
  const cepRequest = useRef<AbortController | null>(null);
  const cepSequence = useRef(0);
  const resolvedCep = useRef(address?.zip_code ?? "");
  useEffect(() => () => { cepSequence.current++; cepRequest.current?.abort(); }, []);
  const definitions = [
    ["zipCode", "CEP", 9], ["street", "Rua", 150], ["number", "Número", 6], ["neighborhood", "Bairro", 80], ["city", "Cidade", 100], ["state", "UF", 2],
  ] as const;
  function changeField(key: keyof typeof fields, value: string) {
    if (key === "zipCode") {
      cepSequence.current++;
      cepRequest.current?.abort();
      setCepBusy(false);
      setCepError("");
      setCepStatus("");
      const clean = value.replace(/\D/g, "");
      if (clean.length === 8) {
        setTimeout(() => lookupCep(), 0);
      }
    }
    setFields(current => ({ ...current, [key]: value }));
  }
  async function lookupCep(force = false) {
    const cep = fields.zipCode.replace(/\D/g, "");
    if (busy || cepBusy || (!force && cep === resolvedCep.current)) return;
    if (cep.length !== 8) { setCepError("Informe um CEP com 8 dígitos para consultar."); setCepStatus(""); return; }
    const sequence = ++cepSequence.current;
    cepRequest.current?.abort();
    const controller = new AbortController(); cepRequest.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    const previous = fields;
    setCepBusy(true); setCepError(""); setCepStatus("");
    try {
      const result = await consultarCep(cep, controller.signal);
      if (sequence !== cepSequence.current) return;
      const changedCep = cep !== (address?.zip_code ?? "");
      setFields(current => ({ ...current, ...Object.fromEntries(Object.entries(result).filter(([key]) => current[key as keyof typeof fields] === previous[key as keyof typeof fields])), latitude: changedCep && current.latitude === previous.latitude ? "" : current.latitude, longitude: changedCep && current.longitude === previous.longitude ? "" : current.longitude }));
      resolvedCep.current = cep;
      setCepStatus(result.street && result.neighborhood ? "Endereço encontrado. Confira os dados e informe o número." : "CEP encontrado. Complete a rua, o bairro e o número que não estiverem preenchidos.");
    } catch (cause) {
      if (sequence === cepSequence.current) setCepError(cause instanceof CepLookupError ? cause.message : "A consulta do CEP está indisponível. Tente novamente ou preencha o endereço manualmente.");
    } finally { window.clearTimeout(timeout); if (sequence === cepSequence.current) setCepBusy(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy || cepBusy) return;
    const input: AddressInput = { ...fields, zipCode: fields.zipCode.replace(/\D/g, ""), state: fields.state.trim().toUpperCase(), latitude: fields.latitude.trim() ? Number(fields.latitude) : null, longitude: fields.longitude.trim() ? Number(fields.longitude) : null };
    if (!/^\d{8}$/.test(input.zipCode) || !/^[A-Z]{2}$/.test(input.state) || definitions.some(([key]) => !fields[key].trim()) || (input.latitude !== null && (!Number.isFinite(input.latitude) || Math.abs(input.latitude) > 90)) || (input.longitude !== null && (!Number.isFinite(input.longitude) || Math.abs(input.longitude) > 180))) { setError("Confira os campos obrigatórios, o CEP com 8 dígitos, a UF e as coordenadas opcionais."); return; }
    input.street = input.street.trim(); input.number = input.number.trim(); input.neighborhood = input.neighborhood.trim(); input.city = input.city.trim();
    setBusy(true); setError("");
    try { if (address) await atualizarEndereco(address.id, input); else await criarEndereco(userId, input); saved(); }
    catch (cause) { setError(apiError(cause, "Não foi possível salvar o endereço. Seus campos foram preservados.")); }
    finally { setBusy(false); }
  }
  return <section className="max-w-3xl space-y-6"><h1 className={s.title}>{address ? "Editar endereço" : "Adicionar endereço"}</h1>
    <form onSubmit={submit} className={`${s.panel} space-y-6`}>
      <p id="cep-help" className={s.copy}>Ao sair do campo CEP, consultamos o ViaCEP para preencher o endereço. Somente o CEP é enviado ao serviço; você pode ajustar os dados manualmente.</p>
      <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2"><legend className="sr-only">Dados do endereço</legend>
        {definitions.map(([key, label, limit]) => <label key={key} className={s.label}>{label} *<input required maxLength={limit} autoComplete={key === "zipCode" ? "postal-code" : key === "street" ? "address-line1" : "off"} value={fields[key]} onChange={e => changeField(key, e.target.value)} onBlur={key === "zipCode" ? () => lookupCep() : undefined} aria-describedby={key === "zipCode" ? "cep-help cep-feedback" : undefined} className={s.input} /></label>)}
        {(["latitude", "longitude"] as const).map(key => <label key={key} className={s.label}>{key === "latitude" ? "Latitude" : "Longitude"} (opcional)<input type="number" step="any" min={key === "latitude" ? -90 : -180} max={key === "latitude" ? 90 : 180} value={fields[key]} onChange={e => changeField(key, e.target.value)} className={s.input} /></label>)}
      </fieldset>
      <div id="cep-feedback" className="space-y-3" aria-busy={cepBusy}>{cepBusy && <p role="status" className={s.copy}>Buscando endereço pelo CEP...</p>}{cepError && <p role="alert" className={s.error}>{cepError}</p>}{cepStatus && <p role="status" className={s.success}>{cepStatus}</p>}</div>
      <p className={s.copy}>Deixe as coordenadas vazias se não souber informá-las. Nenhuma localização é coletada automaticamente.</p>
      {error && <p role="alert" className={s.error}>{error}</p>}
      <div className="flex flex-wrap gap-3"><button disabled={busy || cepBusy} className={s.button}>{busy ? "Salvando..." : "Salvar endereço"}</button><button type="button" disabled={busy} onClick={cancel} className={s.secondary}>Voltar aos endereços</button></div>
    </form>
  </section>;
}
