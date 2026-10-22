import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, MapPin, Search, X } from "lucide-react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import AvisoEmBreve from "../../components/dashboard/AvisoEmBreve";
import DashboardShell from "../../components/dashboard/DashboardShell";
import {
  empresasMapaDemo,
  legendaMateriais,
  type CategoriaMaterial,
  type EmpresaMapa,
} from "./mapaApi";

// Cor de cada tipo de resíduo (tokens em index.css).
const MATERIAL: Record<CategoriaMaterial, { classe: string; token: string }> = {
  Couro: { classe: "bg-material-couro", token: "--color-material-couro" },
  Tecido: { classe: "bg-material-tecido", token: "--color-material-tecido" },
  "EVA / Borracha": { classe: "bg-material-eva", token: "--color-material-eva" },
  Outros: { classe: "bg-material-outros", token: "--color-material-outros" },
};

const CENTRO_FRANCA: [number, number] = [-20.5386, -47.4008];

const ROTULO_CATEGORIA: Record<CategoriaMaterial, string> = {
  Couro: "Couro",
  Tecido: "Tecido",
  "EVA / Borracha": "EVA/Borracha",
  Outros: "Outros",
};

const CLASSES_POPUP = {
  card: "rounded-xl border border-linha bg-white p-3",
  topo: "flex items-start gap-2.5",
  imagem: "h-11 w-11 shrink-0 rounded-lg object-cover",
  textos: "min-w-0",
  titulo: "truncate text-[13px] font-bold leading-snug text-verde-escuro",
  detalhe: "mt-1 text-[12px] leading-snug text-tinta-suave",
  rodape: "mt-3 flex items-center justify-between gap-2",
  gratuito: "text-[12px] font-bold text-ambar",
  combinar: "text-[12px] font-semibold text-tinta-suave",
  botao:
    "shrink-0 rounded-full bg-verde px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-verde-escuro",
};

function construirPopupEmpresa(
  empresa: EmpresaMapa,
  aoVerDetalhes: () => void
): HTMLElement {
  const card = document.createElement("div");
  card.className = CLASSES_POPUP.card;

  const topo = document.createElement("div");
  topo.className = CLASSES_POPUP.topo;
  const imagem = document.createElement("img");
  imagem.src = empresa.imagem;
  imagem.alt = "";
  imagem.width = 44;
  imagem.height = 44;
  imagem.loading = "lazy";
  imagem.className = CLASSES_POPUP.imagem;

  const textos = document.createElement("div");
  textos.className = CLASSES_POPUP.textos;
  const titulo = document.createElement("p");
  titulo.className = CLASSES_POPUP.titulo;
  titulo.textContent = empresa.nomeCurto;
  const detalhe = document.createElement("p");
  detalhe.className = CLASSES_POPUP.detalhe;
  detalhe.textContent = empresa.detalhe;
  textos.append(titulo, detalhe);
  topo.append(imagem, textos);

  const rodape = document.createElement("div");
  rodape.className = CLASSES_POPUP.rodape;
  const condicao = document.createElement("span");
  condicao.className = empresa.gratuito
    ? CLASSES_POPUP.gratuito
    : CLASSES_POPUP.combinar;
  condicao.textContent = empresa.gratuito ? "Gratuito" : "A combinar";
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = CLASSES_POPUP.botao;
  botao.setAttribute("aria-label", `Ver detalhes de ${empresa.nomeCurto}`);
  botao.textContent = "Ver Detalhes";
  botao.addEventListener("click", aoVerDetalhes);
  rodape.append(condicao, botao);

  card.append(topo, rodape);
  return card;
}

export default function MapaEmpresas() {
  const [busca, setBusca] = useState("");
  const [selecionadaId, setSelecionadaId] = useState(empresasMapaDemo[0].id);
  const [aviso, setAviso] = useState<string | null>(null);
  const elementoMapaRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const marcadoresRef = useRef<L.LayerGroup | null>(null);

  const avisar = useCallback((tela: string) => setAviso(tela), []);
  const fecharAviso = useCallback(() => setAviso(null), []);

  // filtro local: nome da empresa, tipo de material ou descrição do lote
  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return empresasMapaDemo;
    return empresasMapaDemo.filter((empresa) =>
      `${empresa.nome} ${empresa.categoria} ${empresa.detalhe}`
        .toLowerCase()
        .includes(termo)
    );
  }, [busca]);

  const selecionada =
    filtradas.find((empresa) => empresa.id === selecionadaId) ?? filtradas[0] ?? null;
  const empresaSelecionadaId = selecionada?.id;

  useEffect(() => {
    if (!elementoMapaRef.current) return;

    const mapa = L.map(elementoMapaRef.current, {
      center: CENTRO_FRANCA,
      zoom: 14,
      minZoom: 11,
      maxZoom: 19,
      scrollWheelZoom: true,
      zoomControl: false,
    });

    L.control
      .zoom({
        zoomInText: "+",
        zoomInTitle: "Aumentar zoom",
        zoomOutText: "−",
        zoomOutTitle: "Diminuir zoom",
      })
      .addTo(mapa);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapa);

    mapaRef.current = mapa;
    marcadoresRef.current = L.layerGroup().addTo(mapa);

    return () => {
      mapaRef.current = null;
      marcadoresRef.current = null;
      mapa.remove();
    };
  }, []);

  useEffect(() => {
    const camada = marcadoresRef.current;
    if (!camada) return;

    mapaRef.current?.closePopup();
    camada.clearLayers();

    filtradas.forEach((empresa) => {
      const ativa = empresa.id === empresaSelecionadaId;
      const icone = L.divIcon({
        className: "mapa-marker-icon",
        html: `<span class="mapa-marker-dot${ativa ? " is-selected" : ""}" style="--marker-color: var(${MATERIAL[empresa.categoria].token})"></span>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -16],
      });

      const marcador = L.marker([empresa.pos.lat, empresa.pos.lng], {
        icon: icone,
        title: `${empresa.nome} — localização demonstrativa`,
        alt: `${empresa.nome}, marcador demonstrativo`,
        keyboard: true,
      }).addTo(camada);

      marcador.on("click", () => setSelecionadaId(empresa.id));
      marcador.bindPopup(
        construirPopupEmpresa(empresa, () => avisar("Detalhes do resíduo")),
        { className: "mapa-popup", maxWidth: 280 }
      );

      if (ativa) marcador.openPopup();
    });
  }, [avisar, empresaSelecionadaId, filtradas]);

  const styles = {
    /* painel esquerdo */
    painel: "flex flex-1 flex-col px-5 pb-6 pt-6 lg:px-6 lg:pb-7",
    atalhos: "flex flex-col items-start gap-3",
    atalho:
      "text-[14px] font-medium text-tinta-suave transition-colors hover:text-verde-escuro",

    blocoBusca: "mt-7",
    titulo: "text-[21px] font-bold leading-tight tracking-tight text-verde-escuro",
    campo:
      "mt-3 flex items-center gap-2.5 rounded-lg border border-linha bg-white px-3 py-2.5 transition-colors focus-within:border-verde",
    campoIcone: "shrink-0 text-tinta-clara",
    campoInput:
      "w-full min-w-0 bg-transparent text-[14px] text-tinta outline-none placeholder:text-tinta-clara",
    campoLimpar:
      "grid h-6 w-6 shrink-0 place-items-center rounded text-tinta-clara transition-colors hover:bg-bruma hover:text-tinta",
    local:
      "mt-3 inline-flex items-center gap-1.5 rounded-lg bg-bruma px-3 py-2 text-[13px] font-medium text-tinta-suave",
    localIcone: "shrink-0 text-verde",
    localSeta: "shrink-0 text-tinta-clara",

    rotuloLista:
      "text-[11px] font-semibold uppercase tracking-[0.14em] text-tinta-clara",
    lista: "mt-3 flex flex-col gap-2.5",
    cartao:
      "w-full rounded-xl border px-4 py-3 text-left transition-colors duration-150",
    cartaoAtivo: "border-verde bg-verde-claro/60",
    cartaoInativo: "border-linha bg-white hover:border-verde/50",
    cartaoTopo: "flex items-start justify-between gap-2",
    cartaoNome: "min-w-0 text-[15px] font-bold leading-snug text-verde-escuro",
    selo: "flex shrink-0 items-center gap-1.5 rounded-md border border-linha bg-white px-2 py-1 text-[11px] font-semibold text-tinta-suave",
    seloPonto: "h-1.5 w-1.5 shrink-0 rounded-full",
    cartaoRodape: "mt-2 flex items-center justify-between gap-2",
    cartaoDistancia: "text-[13px] text-tinta-suave",
    cartaoQtd: "shrink-0 text-[13px] font-semibold text-verde",

    vazio:
      "mt-3 rounded-xl border border-dashed border-linha px-4 py-6 text-[13px] leading-relaxed text-tinta-suave",
    vazioBotao:
      "mt-3 text-[13px] font-semibold text-verde transition-colors hover:text-verde-escuro",
    nota: "mt-auto pt-6 text-[12px] leading-relaxed text-tinta-clara",

    /* mapa */
    mapa: "relative flex min-h-[560px] flex-1 flex-col overflow-hidden bg-areia-clara",
    legenda:
      "absolute right-3 top-3 z-20 w-[168px] rounded-xl border border-linha bg-white p-3.5 shadow-sm lg:right-5 lg:top-5 lg:w-[176px]",
    legendaTitulo: "text-[13px] font-bold leading-snug text-verde-escuro",
    legendaLista: "mt-2.5 flex flex-col gap-2",
    legendaItem: "flex items-center gap-2 text-[12px] text-tinta-suave",
    legendaPonto: "h-2.5 w-2.5 shrink-0 rounded-full",
  };

  const painel = (
    <div className={styles.painel}>
      <div className={styles.atalhos}>
        <button
          type="button"
          className={styles.atalho}
          onClick={() => avisar("Indicadores Ambientais")}
        >
          Indicadores Ambientais
        </button>
        <button
          type="button"
          className={styles.atalho}
          onClick={() => avisar("Histórico de Negociações")}
        >
          Histórico de Negociações
        </button>
      </div>

      <div className={styles.blocoBusca}>
        <h1 className={styles.titulo}>Buscar Resíduos</h1>

        <label htmlFor="busca-residuos" className="sr-only">
          Buscar resíduos por empresa, material ou lote
        </label>
        <div className={styles.campo}>
          <Search size={17} strokeWidth={2.2} className={styles.campoIcone} aria-hidden="true" />
          <input
            id="busca-residuos"
            type="text"
            autoComplete="off"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Ex: Couro, solado, Estação..."
            className={styles.campoInput}
          />
          {busca !== "" && (
            <button
              type="button"
              className={styles.campoLimpar}
              onClick={() => setBusca("")}
              aria-label="Limpar busca"
            >
              <X size={14} strokeWidth={2.4} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className={styles.local}>
          <MapPin size={15} strokeWidth={2.2} className={styles.localIcone} aria-hidden="true" />
          <span>Franca - SP (Raio: 5km)</span>
          <ChevronDown size={15} strokeWidth={2.2} className={styles.localSeta} aria-hidden="true" />
        </div>
      </div>

      <div className="mt-7 flex items-baseline justify-between gap-3">
        <p className={styles.rotuloLista}>Empresas próximas</p>
        <span
          className="text-[12px] tabular-nums text-tinta-suave"
          aria-live="polite"
          aria-atomic="true"
        >
            {filtradas.length} {filtradas.length === 1 ? "empresa" : "empresas"}
        </span>
      </div>

      {filtradas.length === 0 ? (
        <div className={styles.vazio}>
          <p>Nenhuma empresa encontrada para “{busca.trim()}”.</p>
          <button type="button" className={styles.vazioBotao} onClick={() => setBusca("")}>
            Limpar busca
          </button>
        </div>
      ) : (
        <div className={styles.lista}>
          {filtradas.map((empresa) => {
            const ativa = empresa.id === empresaSelecionadaId;

            return (
              <button
                key={empresa.id}
                type="button"
                aria-pressed={ativa}
                onClick={() => setSelecionadaId(empresa.id)}
                className={`${styles.cartao} ${
                  ativa ? styles.cartaoAtivo : styles.cartaoInativo
                }`}
              >
                <div className={styles.cartaoTopo}>
                  <span className={styles.cartaoNome}>{empresa.nome}</span>
                  <span className={styles.selo}>
                    <span
                      className={`${styles.seloPonto} ${MATERIAL[empresa.categoria].classe}`}
                      aria-hidden="true"
                    />
                    {ROTULO_CATEGORIA[empresa.categoria]}
                  </span>
                </div>
                <div className={styles.cartaoRodape}>
                  <span className={styles.cartaoDistancia}>{empresa.distancia}</span>
                  <span className={styles.cartaoQtd}>
                    {empresa.residuos} resíduos disp.
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <p className={styles.nota}>
        Empresas, distâncias, lotes e pontos no mapa são demonstrativos. O mapa
        mostra as ruas reais de Franca, mas os marcadores não indicam endereços
        reais.
      </p>
    </div>
  );

  return (
    <DashboardShell onSoon={avisar} sidebar={painel}>
      {aviso && <AvisoEmBreve texto={aviso} onFechar={fecharAviso} />}

      <section className={styles.mapa} aria-labelledby="titulo-mapa">
        <h2 id="titulo-mapa" className="sr-only">
          Mapa das empresas próximas
        </h2>

        <div
          ref={elementoMapaRef}
          className="mapa-real absolute inset-0 z-0 h-full w-full"
          role="region"
          aria-label="Mapa interativo de Franca, São Paulo"
        />

        {selecionada && (
          <div
            className="absolute bottom-4 left-3 right-3 z-[1000] lg:hidden"
            aria-live="polite"
          >
            <div className="flex items-center gap-3 rounded-xl border border-linha bg-white p-3 shadow-lg">
              <img
                src={selecionada.imagem}
                alt=""
                width={44}
                height={44}
                loading="lazy"
                className="h-11 w-11 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold leading-snug text-verde-escuro">
                  {selecionada.nomeCurto}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-tinta-suave">
                  {selecionada.detalhe}
                </p>
                <p className="mt-1 text-[12px] font-semibold text-ambar">
                  {selecionada.gratuito ? "Gratuito" : "A combinar"}
                </p>
              </div>
              <button
                type="button"
                className="min-h-11 shrink-0 rounded-full bg-verde px-3.5 text-[12px] font-semibold text-white transition-colors hover:bg-verde-escuro"
                aria-label={`Ver detalhes de ${selecionada.nomeCurto}`}
                onClick={() => avisar("Detalhes do resíduo")}
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        )}

        <p className="pointer-events-none absolute bottom-3 left-3 z-[1000] hidden max-w-[min(28rem,calc(100%-1.5rem))] rounded-lg bg-white/95 px-3 py-2 text-[11px] leading-relaxed text-tinta-suave lg:block">
          Mapa real de Franca · pontos e informações de empresas são demonstrativos
        </p>

        <div className={styles.legenda}>
          <h3 className={styles.legendaTitulo}>Legenda de Resíduos</h3>
          <ul className={styles.legendaLista}>
            {legendaMateriais.map(({ categoria, rotulo }) => (
              <li key={categoria} className={styles.legendaItem}>
                <span
                  className={`${styles.legendaPonto} ${MATERIAL[categoria].classe}`}
                  aria-hidden="true"
                />
                {rotulo}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </DashboardShell>
  );
}
