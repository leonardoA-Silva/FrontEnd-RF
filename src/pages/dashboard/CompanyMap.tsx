import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { iniciarConversa, listarEmpresasMapa } from "../../api/services";
import { useApiResource, requireArray } from "../../hooks/useApiResource";
import { apiError } from "../../axios/apiError";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { categoryLabel } from "../company/companyTypes";
import RequestState from "./comprador/RequestState";
import { buyerStyles as s } from "./comprador/buyerStyles";

export default function CompanyMap() {
  const { user } = useLoggedUser(); const navigate = useNavigate();
  const loader = useCallback(async (signal: AbortSignal) => { const response = await listarEmpresasMapa(signal); return { data: requireArray(response.data) }; }, []);
  const resource = useApiResource(loader);
  const [search, setSearch] = useState(""), [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [tileError, setTileError] = useState(false);
  const [locating, setLocating] = useState(false);
  const ownLocation = useRef<L.CircleMarker | null>(null);
  const container = useRef<HTMLDivElement>(null), map = useRef<L.Map | null>(null), markers = useRef<L.LayerGroup | null>(null);
  const rows = useMemo(() => (resource.data ?? []).filter(item => `${item.name} ${item.city} ${item.neighborhood} ${item.categories.map(categoryLabel).join(" ")}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))), [resource.data, search]);
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current).setView([-20.538, -47.401], 12);
    const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(instance);
    tiles.on("tileerror", () => setTileError(true));
    map.current = instance; markers.current = L.layerGroup().addTo(instance);
    const observer = new ResizeObserver(() => instance.invalidateSize()); observer.observe(container.current);
    return () => { observer.disconnect(); instance.remove(); map.current = null; markers.current = null; };
  }, []);
  useEffect(() => {
    markers.current?.clearLayers();
    const points: L.LatLngTuple[] = [];
    for (const company of rows) {
      if (company.latitude == null || company.longitude == null) continue;
      const lat = Number(company.latitude), lng = Number(company.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
      const point: L.LatLngTuple = [lat, lng]; points.push(point);
      const icon = L.divIcon({ className: "mapa-marker-icon", html: `<span class="mapa-marker-dot${selected === company.id ? " is-selected" : ""}" style="--marker-color:var(--color-verde)"></span>`, iconSize: [36, 36], iconAnchor: [18, 18] });
      const marker = L.marker(point, { icon, title: company.name, alt: `Localização aproximada de ${company.name}` });
      const title = document.createElement("strong"); title.textContent = company.name; marker.bindPopup(title);
      marker.on("click", () => setSelected(company.id)); if (markers.current) marker.addTo(markers.current);
    }
    if (points.length && !selected) map.current?.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 13 });
  }, [rows, selected]);
  async function chat(companyId: string) {
    if (busy) return; setBusy(true); setError("");
    try { const response = await iniciarConversa(companyId); if (!response.data.conversationId) throw new Error("Conversa não confirmada."); navigate(user?.role === "company" ? `/dashboardEmpresa/mensagens?conversa=${encodeURIComponent(response.data.conversationId)}` : `/dashboardUsuario?aba=mensagens&conversa=${encodeURIComponent(response.data.conversationId)}`); }
    catch (cause) { setError(apiError(cause, "Não foi possível abrir a conversa.")); } finally { setBusy(false); }
  }
  function locate() {
    if (!navigator.geolocation) { setError("Seu navegador não oferece localização. Use a busca por cidade."); return; }
    setLocating(true); setError("");
    navigator.geolocation.getCurrentPosition(position => {
      const instance = map.current;
      if (!instance) return;
      const point: L.LatLngTuple = [position.coords.latitude, position.coords.longitude];
      ownLocation.current?.remove(); ownLocation.current = L.circleMarker(point, { radius: 8, color: "#1d4ed8", fillOpacity: 1 }).addTo(instance).bindTooltip("Sua localização");
      instance.setView(point, 13); setLocating(false);
    }, () => { setLocating(false); setError("Não foi possível obter sua localização. Você pode continuar pela busca de empresas."); }, { timeout: 10000, maximumAge: 60000 });
  }
  return <section className="space-y-6"><h1 className={s.title}>Mapa de empresas</h1><p className={s.copy}>Encontre empresas e materiais. Os pontos indicam localizações aproximadas.</p><label className={s.label}>Buscar empresa, categoria ou cidade<input type="search" className={s.input} value={search} onChange={event => setSearch(event.target.value)} /></label><button className={s.secondary} onClick={resource.reload} disabled={resource.loading}>Atualizar empresas</button><button type="button" className={s.secondary} disabled={locating} onClick={locate}>{locating ? "Localizando…" : "Minha localização"}</button><RequestState {...resource} retry={resource.reload} />{error && <p role="alert" className={s.error}>{error}</p>}
    <div ref={container} className="relative z-0 h-[400px] w-full overflow-hidden rounded-2xl" role="region" aria-label="Mapa interativo de empresas" />{tileError && <p role="status" className={s.notice}>Parte do mapa não carregou. A lista de empresas continua disponível.</p>}
    {!resource.loading && !resource.error && (!rows.length ? <p className={s.notice}>Nenhuma empresa encontrada.</p> : <ul className="grid gap-4 lg:grid-cols-2">{rows.map(item => <li key={item.id} className={`${s.panel} space-y-3`}><button className="text-left font-semibold underline" onClick={() => { setSelected(item.id); const lat = Number(item.latitude), lng = Number(item.longitude); if (item.latitude != null && item.longitude != null && Number.isFinite(lat) && Number.isFinite(lng)) map.current?.setView([lat, lng], 14); }}>{item.name}</button><p>{item.neighborhood} · {item.city}/{item.state}</p><p>{item.categories.map(categoryLabel).join(", ")} · {item.availableProducts} anúncios</p><div className="flex flex-wrap gap-3"><button type="button" disabled={busy || item.companyId === user?.id} onClick={() => void chat(item.companyId)} className={s.secondary}>Conversar</button></div></li>)}</ul>)}
  </section>;
}
