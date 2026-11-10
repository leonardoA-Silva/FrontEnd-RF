import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { listarEmpresasMapa } from "../../../axios/Axios";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";

export default function BuyerCompanies() {
  const [search, setSearch] = useState("");
  const loader = useCallback(async (signal: AbortSignal) => { const response = await listarEmpresasMapa(signal); return { data: requireArray(response.data) }; }, []);
  const resource = useApiResource(loader);
  const rows = resource.data?.filter(item => `${item.name} ${item.city} ${item.neighborhood} ${item.categories.join(" ")}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))) ?? [];
  return <section className="space-y-6"><h1 className={s.title}>Encontrar empresas</h1><p className={s.copy}>Empresas ativas com localização aproximada. O endereço de retirada do material segue a autorização da reserva.</p>
    <label className={s.label}>Buscar por empresa, cidade, bairro ou categoria<input type="search" value={search} onChange={event => setSearch(event.target.value)} className={s.input} /></label>
    <button type="button" disabled={resource.loading} onClick={resource.reload} className={s.secondary}>Atualizar empresas</button>
    <RequestState {...resource} retry={resource.reload} />
    {!resource.loading && !resource.error && (!rows.length ? <p className={s.notice}>Nenhuma empresa encontrada com localização disponível.</p> : <ul className="grid gap-5 lg:grid-cols-2">{rows.map(item => {
      const lat = Number(item.latitude), lon = Number(item.longitude);
      const coordinates = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
      return <li key={item.id} className={`${s.panel} space-y-4`}><h2 className={s.subtitle}>{item.name}</h2><p className={s.copy}>{item.neighborhood} · {item.city}/{item.state}</p><p className={s.copy}>{item.availableProducts} anúncios disponíveis · {item.categories.join(", ") || "Sem categoria informada"}</p><div className="flex flex-wrap gap-3"><Link to={`/dashboardUsuario?aba=explorar&empresa=${encodeURIComponent(item.companyId)}`} className={s.secondary}>Ver materiais da empresa</Link>{coordinates && <a href={`https://www.openstreetmap.org/?mlat=${lat.toFixed(2)}&mlon=${lon.toFixed(2)}#map=13/${lat.toFixed(2)}/${lon.toFixed(2)}`} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className={s.secondary}>Abrir mapa aproximado (nova aba)</a>}</div></li>;
    })}</ul>)}
  </section>;
}
