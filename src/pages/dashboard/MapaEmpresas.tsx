import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { ChevronDown, MapPin, Search, X } from "lucide-react";
import AvisoEmBreve from "../../components/dashboard/AvisoEmBreve";
import DashboardShell from "../../components/dashboard/DashboardShell";
import {
  empresasMapaDemo,
  legendaMateriais,
  type CategoriaMaterial,
} from "./mapaApi";

// Cor de cada tipo de resíduo (tokens em index.css).
const COR_MATERIAL: Record<CategoriaMaterial, string> = {
  Couro: "bg-material-couro",
  Tecido: "bg-material-tecido",
  "EVA / Borracha": "bg-material-eva",
  Outros: "bg-material-outros",
};

const ROTULO_CATEGORIA: Record<CategoriaMaterial, string> = {
  Couro: "Couro",
  Tecido: "Tecido",
  "EVA / Borracha": "EVA/Borracha",
  Outros: "Outros",
};

export default function MapaEmpresas() {
  const [busca, setBusca] = useState("");
  const [selecionadaId, setSelecionadaId] = useState(empresasMapaDemo[0].id);
  const [aviso, setAviso] = useState<string | null>(null);

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

  // o balão abre abaixo do marcador quando ele está no terço superior do mapa
  const topoSelecionado = selecionada?.pos.top ?? "50%";
  const popupAbaixo = Number.parseFloat(topoSelecionado) < 50;

  const estiloPopup = {
    "--popup-x": selecionada?.pos.left ?? "50%",
    "--popup-y": `calc(${topoSelecionado} ${
      popupAbaixo ? "+ 28px" : "- 124px"
    })`,
  } as CSSProperties;

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
    marcador:
      "group absolute z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full",
    marcadorPonto:
      "block h-4 w-4 rounded-full border-2 border-white shadow transition-transform duration-200 group-hover:scale-110",

    regiaoPopup:
      "absolute bottom-3 left-3 right-3 z-30 lg:bottom-auto lg:left-[var(--popup-x)] lg:right-auto lg:top-[var(--popup-y)] lg:w-64 lg:-translate-x-1/2",
    popup: "rounded-xl border border-linha bg-white p-3 shadow-lg",
    popupTopo: "flex items-start gap-2.5",
    popupImagem: "h-11 w-11 shrink-0 rounded-lg object-cover",
    popupTextos: "min-w-0",
    popupTitulo: "truncate text-[13px] font-bold leading-snug text-verde-escuro",
    popupSub: "mt-1 text-[12px] leading-snug text-tinta-suave",
    popupRodape: "mt-3 flex items-center justify-between gap-2",
    popupGratis: "text-[12px] font-bold text-ambar",
    popupCombinar: "text-[12px] font-semibold text-tinta-suave",
    popupBotao:
      "shrink-0 rounded-full bg-verde px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-verde-escuro",

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
          <span className="text-[12px] tabular-nums text-tinta-suave" aria-live="polite" aria-atomic="true">
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
                      className={`${styles.seloPonto} ${COR_MATERIAL[empresa.categoria]}`}
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
        Empresas, distâncias e lotes são exemplos ilustrativos enquanto a API não
        fornecer nome, endereço e localização das empresas.
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

        <svg
          viewBox="0 0 800 560"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          {/* fundo bege da cidade */}
          <rect width="800" height="560" fill="#F0EDE3" />

          {/* quarteirões */}
          <g fill="#E6E1D2">
            <rect x="262" y="16" width="270" height="176" rx="2" />
            <rect x="16" y="222" width="228" height="200" rx="2" />
            <rect x="556" y="24" width="230" height="160" rx="2" />
            <rect x="588" y="404" width="200" height="120" rx="2" />
            <rect x="286" y="452" width="250" height="92" rx="2" />
          </g>

          {/* parques */}
          <g fill="#DDE8CF">
            <path d="M28 34 C 66 12, 148 18, 172 58 C 194 96, 164 142, 112 148 C 62 154, 22 126, 22 88 C 22 62, 24 44, 28 34 Z" />
            <path d="M604 228 C 646 206, 706 216, 736 252 C 764 288, 742 350, 692 366 C 640 382, 596 348, 592 300 C 590 268, 590 240, 604 228 Z" />
          </g>
          <g fill="#D9E8D2">
            <path d="M58 442 C 94 420, 158 430, 174 466 C 190 502, 150 532, 104 528 C 64 524, 40 500, 42 470 C 44 456, 50 448, 58 442 Z" />
            <path d="M418 24 C 456 10, 502 20, 512 48 C 522 76, 494 100, 460 96 C 428 92, 406 70, 408 46 C 410 36, 412 28, 418 24 Z" />
          </g>

          {/* vegetação dentro dos parques */}
          <g fill="#C6DAB2">
            <circle cx="60" cy="70" r="3.5" />
            <circle cx="94" cy="56" r="3" />
            <circle cx="128" cy="92" r="3.5" />
            <circle cx="86" cy="118" r="2.5" />
            <circle cx="640" cy="270" r="3.5" />
            <circle cx="684" cy="300" r="3" />
            <circle cx="670" cy="342" r="3.5" />
            <circle cx="120" cy="478" r="3" />
            <circle cx="82" cy="502" r="3.5" />
            <circle cx="446" cy="50" r="3" />
            <circle cx="480" cy="70" r="2.5" />
          </g>

          {/* rio principal e braço secundário */}
          <g fill="none" stroke="#A9C9E8" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M-20 468 C 110 452, 168 404, 252 382 C 336 360, 372 330, 456 300 C 540 270, 584 232, 648 192 C 712 152, 764 128, 820 112"
              strokeWidth="16"
            />
            <path
              d="M456 300 C 428 342, 412 384, 396 430 C 380 476, 348 520, 332 580"
              strokeWidth="10"
            />
          </g>

          {/* ruas secundárias */}
          <g stroke="#DCD7C7" strokeWidth="2.5">
            <path d="M46 0 V560" />
            <path d="M176 0 V560" />
            <path d="M214 0 V560" />
            <path d="M322 0 V560" />
            <path d="M386 0 V560" />
            <path d="M448 0 V560" />
            <path d="M512 0 V560" />
            <path d="M610 0 V560" />
            <path d="M730 0 V560" />
            <path d="M0 40 H800" />
            <path d="M0 148 H800" />
            <path d="M0 262 H800" />
            <path d="M0 292 H800" />
            <path d="M0 336 H800" />
            <path d="M0 440 H800" />
            <path d="M0 532 H800" />
          </g>

          {/* avenidas */}
          <g stroke="#FFFFFF" strokeLinecap="square">
            <path d="M0 96 H800" strokeWidth="6" />
            <path d="M100 0 V560" strokeWidth="6" />
            <path d="M764 0 V560" strokeWidth="6" />
            <path d="M0 500 H800" strokeWidth="6" />
            <path d="M0 208 H800" strokeWidth="9" />
            <path d="M0 396 H800" strokeWidth="9" />
            <path d="M262 0 V560" strokeWidth="9" />
            <path d="M556 0 V560" strokeWidth="9" />
            <path d="M-20 118 L820 466" strokeWidth="7" />
            <path d="M820 52 L40 560" strokeWidth="5" />
          </g>
        </svg>

        {filtradas.map((empresa) => {
              const ativa = empresa.id === empresaSelecionadaId;

          return (
            <button
              key={empresa.id}
              type="button"
              aria-label={empresa.nome}
              aria-pressed={ativa}
              onClick={() => setSelecionadaId(empresa.id)}
              className={styles.marcador}
              style={{ left: empresa.pos.left, top: empresa.pos.top, zIndex: ativa ? 20 : 10 }}
            >
              <span
                className={`${styles.marcadorPonto} ${COR_MATERIAL[empresa.categoria]}`}
                style={ativa ? { transform: "scale(1.35)" } : undefined}
              />
            </button>
          );
        })}

        <div className={styles.regiaoPopup} style={estiloPopup} aria-live="polite">
          {selecionada && (
            <div className={styles.popup}>
              <div className={styles.popupTopo}>
                <img
                  src={selecionada.imagem}
                  alt=""
                  width={44}
                  height={44}
                  loading="lazy"
                  className={styles.popupImagem}
                />
                <div className={styles.popupTextos}>
                  <p className={styles.popupTitulo}>{selecionada.nomeCurto}</p>
                  <p className={styles.popupSub}>{selecionada.detalhe}</p>
                </div>
              </div>
              <div className={styles.popupRodape}>
                <span
                  className={
                    selecionada.gratuito ? styles.popupGratis : styles.popupCombinar
                  }
                >
                  {selecionada.gratuito ? "Gratuito" : "A combinar"}
                </span>
                <button
                  type="button"
                  className={styles.popupBotao}
                  aria-label={`Ver detalhes de ${selecionada.nomeCurto}`}
                  onClick={() => avisar("Detalhes do resíduo")}
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.legenda}>
          <h3 className={styles.legendaTitulo}>Legenda de Resíduos</h3>
          <ul className={styles.legendaLista}>
            {legendaMateriais.map(({ categoria, rotulo }) => (
              <li key={categoria} className={styles.legendaItem}>
                <span
                  className={`${styles.legendaPonto} ${COR_MATERIAL[categoria]}`}
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
