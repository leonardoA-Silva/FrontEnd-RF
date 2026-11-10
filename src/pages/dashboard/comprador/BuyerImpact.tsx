import { useCallback, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listarImpactos, listarReservas, registrarImpacto } from "../../../axios/Axios";
import { apiError, apiStatus } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { dateLabel } from "./buyerPresentation";

const metrics = [["estimated_weight_kg", "Material reaproveitado", "kg"], ["co2_saved_kg", "CO₂ evitado estimado", "kg"], ["water_saved_liters", "Água poupada estimada", "L"], ["energy_saved_kwh", "Energia poupada estimada", "kWh"]] as const;
const decimal = (value: number | string) => Number.isFinite(Number(value)) ? Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "Não informado";

export default function BuyerImpact() {
  const [params] = useSearchParams();
  const [shoppingId, setShoppingId] = useState(params.get("reserva") ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const loader = useCallback(async (signal: AbortSignal) => {
    const [impacts, shoppings] = await Promise.all([listarImpactos(signal), listarReservas(signal)]);
    const owned = requireArray(shoppings.data);
    const ids = new Set(owned.map(item => item.id));
    const unique = [...new Map(requireArray(impacts.data).filter(item => ids.has(item.id_shopping)).map(item => [item.id, item])).values()];
    return { data: { impacts: unique, eligible: owned.filter(item => item.status === "completed" && !unique.some(impact => impact.id_shopping === item.id)) } };
  }, []);
  const resource = useApiResource(loader);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy || !resource.data?.eligible.some(item => item.id === shoppingId)) return;
    setBusy(true); setError(""); setSuccess("");
    try { await registrarImpacto(shoppingId); setShoppingId(""); setSuccess("Estimativa registrada."); resource.reload(); }
    catch (cause) { setError(apiStatus(cause) === 409 ? "A compra já tem uma estimativa ou ainda não está concluída. Atualize os dados." : apiError(cause, "Não foi possível calcular o impacto. O material pode não ter peso informado.")); }
    finally { setBusy(false); }
  }
  return <section className="space-y-6"><h1 className={s.title}>Meu impacto ambiental</h1><p className={s.copy}>Estimativas para suas compras concluídas, calculadas por categoria e peso dos materiais. Estes valores não são uma certificação ambiental.</p>
    <RequestState {...resource} retry={resource.reload} />
    <button type="button" disabled={busy || resource.loading} onClick={resource.reload} className={s.secondary}>Atualizar estimativas</button>
    {error && <p role="alert" className={s.error}>{error}</p>}{success && <p role="status" className={s.success}>{success}</p>}
    {!resource.loading && !resource.error && <>
      {!!resource.data?.eligible.length && <form onSubmit={submit} className={`${s.panel} space-y-4`}><label className={s.label}>Compra concluída<select required disabled={busy} value={shoppingId} onChange={event => setShoppingId(event.target.value)} className={s.input}><option value="">Selecione uma compra sem estimativa</option>{resource.data.eligible.map(item => <option key={item.id} value={item.id}>{dateLabel(item.datetime)} · {item.id.slice(0, 8)}</option>)}</select></label><button disabled={busy || !shoppingId} className={s.button}>{busy ? "Calculando..." : "Calcular estimativa"}</button></form>}
      {!resource.data?.impacts.length ? <p className={s.notice}>Nenhuma estimativa registrada. Conclua uma compra para calcular o impacto.</p> : <ul className="space-y-4">{resource.data.impacts.map(item => <li key={item.id} className={`${s.panel} space-y-5`}><h2 className={s.subtitle}>Estimativa da compra</h2><dl className="grid gap-5 sm:grid-cols-2">{metrics.map(([key, label, unit]) => <div key={key}><dt className={s.copy}>{label}</dt><dd className="text-2xl font-semibold">{decimal(item[key])} {unit}</dd></div>)}</dl><p className={s.copy}>{dateLabel(item.calculated_in)} · {item.calculation_method === "regra_fixa" ? "Cálculo por categoria e peso" : "Método registrado na API"}</p><Link className={s.secondary} to={`/dashboardUsuario?aba=reservas&reserva=${encodeURIComponent(item.id_shopping)}`}>Abrir reserva</Link></li>)}</ul>}
    </>}
  </section>;
}
