import { useCallback } from "react";
import { listarImpactos } from "../../../api/services";
import { useApiResource, requireArray } from "../../../hooks/useApiResource";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { dateLabel } from "./buyerPresentation";
const metrics = [["estimated_weight_kg", "Material reaproveitado", "kg"], ["co2_saved_kg", "CO₂ evitado estimado", "kg"], ["water_saved_liters", "Água poupada estimada", "L"], ["energy_saved_kwh", "Energia poupada estimada", "kWh"]] as const;
export default function BuyerImpact() {
  const loader = useCallback(async (signal: AbortSignal) => ({ data: requireArray((await listarImpactos(signal)).data) }), []);
  const resource = useApiResource(loader);
  return <section className="space-y-6"><h1 className={s.title}>Meu impacto ambiental</h1><p className={s.copy}>Estimativas registradas pela API para as compras da sua conta.</p><button className={s.secondary} disabled={resource.loading} onClick={resource.reload}>Atualizar impacto</button><RequestState {...resource} retry={resource.reload} />{resource.data && <><dl className="grid gap-4 sm:grid-cols-2">{metrics.map(([key, label, unit]) => <div key={key} className={s.panel}><dt>{label}</dt><dd className="mt-3 text-2xl font-semibold">{resource.data!.reduce((sum, item) => sum + Number(item[key] || 0), 0).toLocaleString("pt-BR")} {unit}</dd></div>)}</dl>{!resource.data.length ? <p className={s.notice}>Quando uma compra tiver impacto registrado, ele aparecerá aqui.</p> : <ul className="space-y-4">{resource.data.map(item => <li key={item.id} className={s.panel}><h2 className={s.subtitle}>Impacto da compra</h2><p>{dateLabel(item.calculated_in)}</p><p>{Number(item.estimated_weight_kg).toLocaleString("pt-BR")} kg reaproveitados · {Number(item.co2_saved_kg).toLocaleString("pt-BR")} kg de CO₂ evitado estimado</p></li>)}</ul>}</>}</section>;
}
