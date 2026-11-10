import CompanyPage from "../../components/dashboard/CompanyPage";
import { companyStyles as styles } from "../../components/dashboard/companyStyles";
import { useRemoteData } from "../../hooks/useRemoteData";
import { displayDate, displayMetric, listImpacts } from "./companyApi";

export default function Indicadores() {
  const { data, loading, error, reload } = useRemoteData(listImpacts);
  return <CompanyPage title="Indicadores ambientais" description="Estimativas registradas pela API para negociações vinculadas à sua conta. Os valores são por negociação e podem envolver mais de um vendedor; não representam exclusivamente a produção da sua empresa." loading={loading} error={error} reload={reload}>
    {data?.length === 0 && <p className={styles.panel}>Nenhuma estimativa ambiental registrada para suas negociações.</p>}
    <ul className="mt-5 space-y-4">{data?.map(item => <li key={item.id} className={styles.panel}>
      <h2 className="text-lg font-semibold">Estimativa de {displayDate(item.calculated_in)}</h2>
      <p className="mt-2 text-sm text-tinta-suave">Método: {item.calculation_method === "regra_fixa" ? "Regra fixa" : "Método informado pelo serviço"}</p>
      <dl className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{([
        ["Peso estimado", item.estimated_weight_kg, "kg"], ["CO₂ evitado estimado", item.co2_saved_kg, "kg"],
        ["Água economizada estimada", item.water_saved_liters, "L"], ["Energia economizada estimada", item.energy_saved_kwh, "kWh"],
      ] as const).map(([label, value, unit]) => <div key={label}><dt className="text-sm text-tinta-suave">{label}</dt><dd className="mt-2 text-xl font-semibold tabular-nums">{displayMetric(value, unit)}</dd></div>)}</dl>
    </li>)}</ul>
  </CompanyPage>;
}
