import { Droplets, Leaf, Recycle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import CompanyPage, { WorkspaceHeading } from "../dashboard/CompanyPage";
import { number } from "./companyTypes";
import { loadImpacts } from "./companyResourceApi";
import { useCompanyResource } from "./useCompanyResource";

export default function CompanyImpact() {
  const { rows, loading, error, reload } = useCompanyResource(loadImpacts);
  const totals = rows.reduce((sum, row) => ({ weight: sum.weight + row.weight, co2: sum.co2 + row.co2, water: sum.water + row.water, energy: sum.energy + row.energy }), { weight: 0, co2: 0, water: 0, energy: 0 });
  return <CompanyPage className="company-impact-page"><WorkspaceHeading eyebrow="Indicadores ambientais" title={<>O impacto <em>de cada ciclo.</em></>} description="Estimativas das negociações vinculadas à sua conta." />
    <div className="my-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-tinta-suave">Confira o método de cálculo informado em cada registro.</p><button type="button" className="company-button is-secondary" disabled={loading} onClick={reload}>Atualizar dados</button></div>
    {loading ? <p role="status">Carregando indicadores…</p> : error ? <div role="alert" className="company-notice"><p>{error}</p><button type="button" onClick={reload}>Tentar novamente</button><Link to="/login">Entrar novamente</Link></div> : <>
      <div className="impact-metrics">{[{ label: "Peso estimado", value: totals.weight, unit: "kg", Icon: Recycle }, { label: "CO₂ evitado estimado", value: totals.co2, unit: "kg", Icon: Leaf }, { label: "Água preservada estimada", value: totals.water, unit: "L", Icon: Droplets }, { label: "Energia poupada estimada", value: totals.energy, unit: "kWh", Icon: Zap }].map(({ label, value, unit, Icon }) => <section key={label} className="impact-metric" aria-label={label}><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium text-tinta-suave">{label}</h2><span className="rounded-lg bg-verde-claro p-2 text-verde"><Icon size={19} aria-hidden="true" /></span></div><p className="impact-value">{rows.length ? `${number(value)} ${unit}` : "—"}</p><p className="mt-2 text-xs text-tinta-suave">{rows.length ? "Estimativa registrada" : "Sem registros"}</p></section>)}</div>
      {rows.length ? <section className="mt-7 rounded-2xl border border-linha bg-white/60 p-5"><h2 className="text-xl font-semibold">Registros de impacto</h2><p className="mt-2 text-sm text-tinta-suave">Cada linha corresponde a uma negociação. Os totais refletem os registros retornados para sua conta.</p><ul className="mt-5 divide-y divide-linha">{rows.map(row => <li key={row.id} className="grid gap-3 py-5 md:grid-cols-2"><div><time className="font-semibold" dateTime={row.at}>{new Date(row.at).toLocaleDateString("pt-BR")}</time><p className="mt-1 text-sm text-tinta-suave">Método: {row.method || "Não informado"}</p></div><dl className="grid grid-cols-2 gap-3 text-sm">{[["Peso", `${number(row.weight)} kg`], ["CO₂", `${number(row.co2)} kg`], ["Água", `${number(row.water)} L`], ["Energia", `${number(row.energy)} kWh`]].map(([label, value]) => <div key={label}><dt className="text-tinta-suave">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl></li>)}</ul></section> : <div className="company-empty"><Leaf size={30} /><h2>Ainda não há impacto registrado</h2><p>Os indicadores aparecerão quando houver estimativas registradas para suas negociações.</p></div>}
    </>}
  </CompanyPage>;
}
