import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import { MapPin, Package, RefreshCw, Search, X } from "lucide-react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import DashboardShell from "../../components/dashboard/DashboardShell";
import { loadMaterialMap, type MaterialMapData, type MapListing } from "./materialMapApi";
import { resourceError } from "../company/companyResourceApi";
import { categoryLabel, conditionLabel, money, number } from "../company/companyTypes";
import { MaterialImage, TypeBadge } from "../company/CompanyUi";

export default function LiveMaterialMap() {
  const [data, setData] = useState<MaterialMapData>({ listings: [], withoutCoordinates: 0, unavailable: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MapListing | null>(null);
  const [tileState, setTileState] = useState<"loading" | "ready" | "error">("loading");
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const tiles = useRef<L.TileLayer | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    const controller = new AbortController();
    loadMaterialMap(controller.signal).then(result => { if (!controller.signal.aborted) { setData(result); setLoading(false); } }).catch(cause => { if (!controller.signal.aborted) { setError(resourceError(cause)); setLoading(false); } });
    return () => controller.abort();
  }, [attempt]);
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return data.listings.filter(item => `${item.product.name} ${categoryLabel(item.product.category)} ${item.city} ${item.neighborhood}`.toLocaleLowerCase("pt-BR").includes(term));
  }, [data.listings, search]);
  const selected = filtered.find(row => row.product.id === selectedId) ?? filtered[0];
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, { center: [-20.5386, -47.4008], zoom: 12, maxZoom: 18, scrollWheelZoom: true });
    instance.zoomControl.setPosition("topright");
    const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' });
    let failed = false;
    tileLayer.on("loading", () => { failed = false; setTileState("loading"); });
    tileLayer.on("tileerror", () => { failed = true; setTileState("error"); });
    tileLayer.on("load", () => setTileState(failed ? "error" : "ready"));
    tileLayer.addTo(instance);
    map.current = instance; layer.current = L.layerGroup().addTo(instance); tiles.current = tileLayer;
    const resize = new ResizeObserver(() => instance.invalidateSize()); resize.observe(container.current);
    return () => { resize.disconnect(); instance.remove(); map.current = null; layer.current = null; tiles.current = null; };
  }, []);
  useEffect(() => {
    const group = layer.current;
    if (!group) return;
    group.clearLayers();
    if (loading || error) return;
    filtered.forEach(item => {
      const active = item.product.id === selected?.product.id;
      const icon = L.divIcon({ className: "mapa-marker-icon", html: `<span class="mapa-marker-dot${active ? " is-selected" : ""}" style="--marker-color: var(--color-verde)"></span>`, iconSize: [36, 36], iconAnchor: [18, 18] });
      const marker = L.marker([item.lat, item.lng], { icon, title: `${item.product.name} · localização aproximada`, alt: `Localização aproximada de ${item.product.name}`, keyboard: true }).addTo(group);
      const popup = document.createElement("div");
      const title = document.createElement("strong"); title.textContent = item.product.name;
      const area = document.createElement("p"); area.textContent = [item.neighborhood, item.city].filter(Boolean).join(" · ");
      const button = document.createElement("button"); button.type = "button"; button.className = "company-inline-link mt-3"; button.textContent = "Ver detalhes do material"; button.onclick = () => setDetail(item);
      popup.append(title, area, button); marker.bindPopup(popup);
      marker.on("click", () => setSelectedId(item.product.id));
      if (active) marker.openPopup();
    });
  }, [filtered, selected?.product.id, loading, error]);
  useEffect(() => {
    if (!map.current || !data.listings.length) return;
    map.current.fitBounds(L.latLngBounds(data.listings.map(item => [item.lat, item.lng])), { padding: [45, 45], maxZoom: 13, animate: false });
  }, [data.listings]);
  function select(item: MapListing) { setSelectedId(item.product.id); map.current?.panTo([item.lat, item.lng], { animate: !reducedMotion }); }
  function reload() { setLoading(true); setError(""); setAttempt(value => value + 1); }
  const panel = <div className="map-search-panel"><p className="company-eyebrow">Materiais da rede</p><div className="map-search-heading"><h1 className="map-title">Perto de você.<br /><em>Longe do fim.</em></h1><p className="workspace-description">Explore os anúncios com localização disponível.</p><label className="map-search-field" htmlFor="map-material-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Buscar por material, categoria, cidade ou bairro</span><input id="map-material-search" className="min-w-0 w-full bg-transparent py-2 text-sm outline-none" value={search} onChange={e => setSearch(e.target.value)} placeholder="Material, categoria ou cidade" /></label><p className="map-local"><MapPin size={15} aria-hidden="true" />Localizações aproximadas</p></div><div className="my-5 flex items-center justify-between gap-3"><span className="company-eyebrow" role="status">{loading ? "Carregando anúncios…" : `${filtered.length} ${filtered.length === 1 ? "anúncio no mapa" : "anúncios no mapa"}`}</span><button type="button" className="company-inline-link" disabled={loading} onClick={reload} aria-label="Atualizar anúncios do mapa"><RefreshCw size={17} /></button></div>
    {loading ? <p role="status">Consultando materiais e localizações…</p> : error ? <div role="alert" className="map-no-results"><p>{error}</p><button type="button" className="company-inline-link mt-3" onClick={reload}>Tentar novamente</button><Link to="/login" className="company-inline-link mt-3">Entrar novamente</Link></div> : <>
      {data.unavailable > 0 && <div role="alert" className="company-notice"><p>Não foi possível consultar a localização de {data.unavailable} anúncio(s). A lista está incompleta.</p><button type="button" className="company-inline-link" onClick={reload}>Tentar novamente</button></div>}
      {data.withoutCoordinates > 0 && <p className="mb-4 text-xs leading-relaxed text-tinta-suave">{data.withoutCoordinates} anúncio(s) sem coordenadas disponíveis não aparecem no mapa.</p>}
      {filtered.length ? <ul className="map-company-list">{filtered.map(item => <li key={item.product.id}><button type="button" className={`map-company-card w-full ${selected?.product.id === item.product.id ? "is-selected" : ""}`} aria-pressed={selected?.product.id === item.product.id} onClick={() => select(item)}><span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-verde-claro text-verde"><Package size={23} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="map-company-name block">{item.product.name}</span><span className="mt-1 block text-xs text-tinta-suave">{categoryLabel(item.product.category)} · {[item.neighborhood, item.city].filter(Boolean).join(" · ") || "Região não informada"}</span><span className="mt-2 block text-xs font-semibold text-verde">{item.product.type === "donation" ? "Doação" : item.product.price !== null ? money(item.product.price) : "Valor não informado"}</span></span></button></li>)}</ul> : <div className="map-no-results"><p>{search ? "Nenhum anúncio encontrado nesta busca." : "Nenhum anúncio disponível com coordenadas no momento."}</p>{search && <button type="button" className="company-inline-link mt-3" onClick={() => setSearch("")}>Limpar busca</button>}</div>}
    </>}
    <p className="map-footnote">Os pontos são aproximados e podem representar vários materiais na mesma região. Não indicam endereço exato nem distância até você.</p>
  </div>;
  return <DashboardShell onSoon={() => undefined} sidebar={panel}><section className="map-stage" aria-label="Mapa de materiais"><div ref={container} className="mapa-real absolute inset-0 z-0 h-full w-full" role="region" aria-label="Mapa interativo de materiais com localizações aproximadas" />{tileState !== "ready" && <div className="map-connection-status" role="status"><p>{tileState === "loading" ? "Carregando o mapa…" : "Não foi possível carregar parte do mapa. A lista continua disponível."}</p>{tileState === "error" && <button type="button" className="company-inline-link" onClick={() => tiles.current?.redraw()}>Tentar carregar o mapa novamente</button>}</div>}{selected && !loading && !error && <div className="absolute bottom-5 left-3 right-3 z-[1000] flex items-center justify-between gap-3 rounded-xl border border-linha bg-white p-4 lg:left-auto lg:max-w-sm"><div className="min-w-0"><p className="truncate font-semibold">{selected.product.name}</p><small className="text-tinta-suave">Localização aproximada</small></div><button type="button" className="company-button" onClick={() => setDetail(selected)}>Ver detalhes</button></div>}</section>
    <Dialog transitionDuration={reducedMotion ? 0 : { enter: 180, exit: 120 }} open={!!detail} onClose={() => setDetail(null)} fullWidth maxWidth="sm" aria-labelledby="map-detail-title"><DialogTitle className="activity-dialog-heading"><span id="map-detail-title">Detalhes do material</span><button type="button" className="company-icon-button" aria-label="Fechar detalhes do material" onClick={() => setDetail(null)}><X size={20} /></button></DialogTitle><DialogContent>{detail && <><MaterialImage key={detail.product.id} product={detail.product} large /><div className="my-4"><TypeBadge type={detail.product.type} /><h2 className="mt-3 text-xl font-semibold">{detail.product.name}</h2><p className="mt-2 text-sm text-tinta-suave">{categoryLabel(detail.product.category)} · {conditionLabel(detail.product.condition)}</p><p className="mt-3 whitespace-pre-wrap break-words">{detail.product.description || "Descrição não informada."}</p><p className="mt-3 font-semibold">{detail.product.type === "donation" ? "Doação" : detail.product.price !== null ? money(detail.product.price) : "Valor não informado"}</p><p className="mt-2 text-sm">{number(detail.product.quantity)} un. · {number(detail.product.weight)} kg</p><p className="mt-4 text-sm text-tinta-suave">{[detail.neighborhood, detail.city].filter(Boolean).join(" · ")} · Localização aproximada</p></div></>}</DialogContent></Dialog>
  </DashboardShell>;
}
