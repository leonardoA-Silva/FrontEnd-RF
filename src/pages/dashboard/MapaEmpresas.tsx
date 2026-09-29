import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronDown,
  LogOut,
  MapPin,
  Menu,
  Repeat2,
  Search,
  X,
} from "lucide-react";
import Footer from "../../components/Footer";
import { useLoggedUser } from "../../hooks/useLoggedUser";

type Categoria = "Couro" | "Tecido" | "EVA / Borracha" | "Outros";

interface Empresa {
  id: number;
  nome: string;
  nomeCurto: string;
  categoria: Categoria;
  distancia: string;
  residuos: number;
  detalhe: string;
  gratuito: boolean;
  imagem: string;
  pos: { left: string; top: string };
}

const empresas: Empresa[] = [
  {
    id: 1,
    nome: "Curtume Franca Fino S.A.",
    nomeCurto: "Curtume Franca Fino",
    categoria: "Couro",
    distancia: "2.3 km de você",
    residuos: 5,
    detalhe: "150 kg de Couro Bovino",
    gratuito: true,
    imagem: "/retalho-couro-nobre.png",
    pos: { left: "58%", top: "32%" },
  },
  {
    id: 2,
    nome: "Calçados Estilo Franca",
    nomeCurto: "Calçados Estilo Franca",
    categoria: "EVA / Borracha",
    distancia: "4.1 km de você",
    residuos: 12,
    detalhe: "40 kg de Rebarbas de EVA",
    gratuito: true,
    imagem: "/eva-camurca-premium.png",
    pos: { left: "29%", top: "58%" },
  },
  {
    id: 3,
    nome: "Tecidos Francanos Ltda",
    nomeCurto: "Tecidos Francanos Ltda",
    categoria: "Tecido",
    distancia: "1.2 km de você",
    residuos: 3,
    detalhe: "90 kg de Tecido Sintético",
    gratuito: false,
    imagem: "/retalho-nobuck-macio.png",
    pos: { left: "75%", top: "42%" },
  },
  {
    id: 4,
    nome: "Solados Renovação",
    nomeCurto: "Solados Renovação",
    categoria: "Outros",
    distancia: "5.5 km de você",
    residuos: 8,
    detalhe: "200 unid. de Solados",
    gratuito: true,
    imagem: "/hero-leather-scraps.jpg",
    pos: { left: "60%", top: "76%" },
  },
  {
    id: 5,
    nome: "Ateliê Couro & Arte",
    nomeCurto: "Ateliê Couro & Arte",
    categoria: "Couro",
    distancia: "3.0 km de você",
    residuos: 2,
    detalhe: "25 kg de Couro Nobre",
    gratuito: false,
    imagem: "/retalho-couro-nobre.png",
    pos: { left: "44%", top: "18%" },
  },
];

const navegacaoTopo = [
  { rotulo: "Início", href: "/dashboardEmpresa", ativo: false },
  { rotulo: "Mapa de Empresas", href: "/mapaEmpresas", ativo: true },
  { rotulo: "Indicadores Ambientais", href: "#", ativo: false },
  { rotulo: "Histórico de Negociações", href: "#", ativo: false },
  { rotulo: "Sobre Nós", href: "#", ativo: false },
];

function corMarcador(categoria: Categoria) {
  if (categoria === "Couro") return "#10B981";
  if (categoria === "Tecido") return "#3B82F6";
  if (categoria === "EVA / Borracha") return "#D97706";
  return "#8B5CF6";
}

function estiloSelo(categoria: Categoria) {
  if (categoria === "Couro") return "bg-emerald-500 text-white";
  if (categoria === "Tecido") return "bg-blue-500 text-white";
  if (categoria === "EVA / Borracha") return "bg-[#D97706] text-white";
  return "bg-violet-500 text-white";
}

export default function MapaEmpresas() {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [selecionadaId, setSelecionadaId] = useState<number>(1);

  const { displayName, photoSrc } = useLoggedUser({
    fallbackName: "Minha Empresa",
  });

  function handleLogout() {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem("token");
      storage.removeItem("user");
      storage.removeItem("tipoUsuario");
    }
    navigate("/login");
  }

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return empresas;
    return empresas.filter(
      (e) =>
        e.nome.toLowerCase().includes(termo) ||
        e.categoria.toLowerCase().includes(termo) ||
        e.detalhe.toLowerCase().includes(termo)
    );
  }, [busca]);

  const selecionada =
    empresas.find((e) => e.id === selecionadaId) ?? empresas[0];

  const styles = {
    pagina: "flex min-h-screen w-full flex-col bg-[#FAF9F5] text-[#1B4B3A]",
    cabecalho: "w-full border-b border-[#E7E4DA] bg-white",
    cabecalhoConteudo:
      "flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8",
    marca: "flex min-w-0 shrink-0 items-center gap-2.5",
    marcaIcone:
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white",
    marcaTextos: "leading-tight",
    marcaTitulo: "text-base font-bold text-[#1B4B3A] sm:text-lg",
    marcaSubtitulo: "text-xs font-bold tracking-wide text-orange-500 sm:text-sm",
    menuTopo: "hidden min-w-0 flex-1 items-center justify-center gap-5 xl:gap-7 lg:flex",
    menuTopoLink:
      "whitespace-nowrap text-sm font-medium text-[#4B5A55] transition hover:text-[#1B4B3A] xl:text-[15px]",
    menuTopoLinkAtivo: "font-bold text-emerald-600 hover:text-emerald-700",
    cabecalhoAcoes: "flex shrink-0 items-center gap-2",
    usuarioPilha:
      "flex items-center gap-2 rounded-full bg-emerald-50 py-1.5 pl-1.5 pr-3 sm:pr-4",
    usuarioAvatar:
      "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-300",
    usuarioAvatarIcone: "h-5 w-5 text-gray-500",
    usuarioAvatarImg: "h-7 w-7 shrink-0 rounded-full object-cover",
    usuarioNome:
      "hidden max-w-32 truncate text-sm font-semibold text-[#1B4B3A] min-[420px]:block",
    botaoMenu:
      "flex h-10 w-10 items-center justify-center rounded-lg border border-[#E7E4DA] text-[#1B4B3A] transition hover:bg-[#F3F1EA] lg:hidden",
    menuMovel: "border-t border-[#E7E4DA] bg-white px-4 py-2 lg:hidden",
    menuMovelLink:
      "block rounded-lg px-3 py-2.5 text-sm font-medium text-[#4B5A55] transition hover:bg-[#F3F1EA] hover:text-[#1B4B3A]",
    menuMovelLinkAtivo: "bg-emerald-50 font-bold text-emerald-700",
    conteudo: "flex w-full flex-1 flex-col items-stretch lg:flex-row",
    lateral:
      "w-full shrink-0 border-b border-[#E7E4DA] bg-white px-4 py-5 sm:px-6 lg:w-[380px] lg:border-b-0 lg:border-r xl:w-[400px]",
    lateralSecundario: "flex flex-col gap-4 px-1 text-[15px] text-[#4B5A55]",
    lateralSecundarioLink: "transition hover:text-[#1B4B3A]",
    buscarTitulo: "mt-6 text-xl font-extrabold text-[#0F3D2E]",
    buscarCaixa:
      "mt-3 flex items-center gap-2 rounded-lg border border-[#E7E4DA] bg-white px-3 py-2.5 focus-within:border-emerald-500",
    buscarIcone: "h-4 w-4 shrink-0 text-gray-400",
    buscarInput:
      "w-full bg-transparent text-sm text-[#1B4B3A] outline-none placeholder:text-gray-400",
    localCaixa:
      "mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#FAF9F5] px-3 py-2 text-[13px] font-medium text-[#4B5A55]",
    localIcone: "h-4 w-4 text-emerald-500",
    listaRotulo:
      "mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400",
    lista: "mt-3 flex flex-col gap-3",
    cartaoBase:
      "w-full cursor-pointer rounded-xl border p-4 text-left transition hover:border-emerald-400",
    cartaoAtivo: "border-emerald-500 bg-emerald-50/60 shadow-sm",
    cartaoInativo: "border-[#E7E4DA] bg-white",
    cartaoTopo: "flex items-start justify-between gap-2",
    cartaoNome: "text-[15px] font-bold text-[#0F3D2E]",
    selo: "shrink-0 rounded-md px-2 py-1 text-[11px] font-bold",
    cartaoRodape: "mt-1.5 flex items-center justify-between gap-2",
    cartaoDistancia: "text-[13px] text-[#6B7670]",
    cartaoQtd: "text-[13px] font-semibold text-emerald-600",
    mapaArea: "relative min-h-[560px] flex-1 overflow-hidden bg-[#F0EDE3]",
    legenda:
      "absolute right-4 top-4 z-20 w-44 rounded-xl border border-[#E7E4DA] bg-white p-4 shadow-sm",
    legendaTitulo: "text-sm font-extrabold text-[#0F3D2E]",
    legendaItem: "mt-2 flex items-center gap-2 text-[13px] text-[#4B5A55]",
    legendaPonto: "h-3.5 w-3.5 shrink-0 rounded-full",
    popup:
      "absolute z-20 w-64 -translate-x-1/2 rounded-xl border border-[#E7E4DA] bg-white p-3 shadow-lg",
    popupTopo: "flex items-start gap-2.5",
    popupImg: "h-10 w-10 shrink-0 rounded-lg object-cover",
    popupTitulo: "text-[13px] font-bold leading-tight text-[#0F3D2E]",
    popupSub: "mt-0.5 text-xs text-[#6B7670]",
    popupRodape: "mt-2.5 flex items-center justify-between",
    popupGratis: "text-xs font-bold text-[#D97706]",
    popupBotao:
      "rounded-md bg-emerald-500 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-600",
    marcador:
      "absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-white shadow-md transition hover:scale-110",
  };

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div className={styles.cabecalhoConteudo}>
          <a href="/dashboardEmpresa" className={`${styles.marca} no-underline`}>
            <span className={styles.marcaIcone}>
              <Repeat2 className="h-6 w-6" strokeWidth={2.4} />
            </span>
            <div className={styles.marcaTextos}>
              <p className={styles.marcaTitulo}>Reaproveita</p>
              <p className={styles.marcaSubtitulo}>FRANCA</p>
            </div>
          </a>

          <nav className={styles.menuTopo}>
            {navegacaoTopo.map((item) => (
              <a
                key={item.rotulo}
                href={item.href}
                className={`${styles.menuTopoLink} ${
                  item.ativo ? styles.menuTopoLinkAtivo : ""
                }`}
              >
                {item.rotulo}
              </a>
            ))}
          </nav>

          <div className={styles.cabecalhoAcoes}>
            <div className={styles.usuarioPilha} title={displayName}>
              <span className={styles.usuarioAvatar}>
                {photoSrc ? (
                  <img
                    src={photoSrc}
                    alt={`Logotipo de ${displayName}`}
                    className={styles.usuarioAvatarImg}
                  />
                ) : (
                  <Building2 className={styles.usuarioAvatarIcone} strokeWidth={2} />
                )}
              </span>
              <span className={styles.usuarioNome}>{displayName}</span>
            </div>
            <button
              type="button"
              aria-label="Sair da conta"
              title="Sair da conta"
              onClick={handleLogout}
              className={styles.botaoMenu}
            >
              <LogOut className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuAberto((aberto) => !aberto)}
              className={styles.botaoMenu}
            >
              {menuAberto ? (
                <X className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {menuAberto && (
          <nav className={styles.menuMovel}>
            {navegacaoTopo.map((item) => (
              <a
                key={item.rotulo}
                href={item.href}
                className={`${styles.menuMovelLink} ${
                  item.ativo ? styles.menuMovelLinkAtivo : ""
                }`}
              >
                {item.rotulo}
              </a>
            ))}
          </nav>
        )}
      </header>

      <div className={styles.conteudo}>
        <aside className={styles.lateral}>
          <div className={styles.lateralSecundario}>
            <a href="#" className={styles.lateralSecundarioLink}>
              Indicadores Ambientais
            </a>
            <a href="#" className={styles.lateralSecundarioLink}>
              Histórico de Negociações
            </a>
          </div>

          <h1 className={styles.buscarTitulo}>Buscar Resíduos</h1>
          <label className={styles.buscarCaixa}>
            <Search className={styles.buscarIcone} strokeWidth={2.2} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Ex: Couro, solado, Estação..."
              className={styles.buscarInput}
            />
          </label>
          <div className={styles.localCaixa}>
            <MapPin className={styles.localIcone} strokeWidth={2.2} />
            <span>Franca - SP (Raio: 5km)</span>
            <ChevronDown className="h-4 w-4 text-gray-400" strokeWidth={2.2} />
          </div>

          <p className={styles.listaRotulo}>Empresas próximas</p>
          <div className={styles.lista}>
            {filtradas.map((empresa) => {
              const ativa = empresa.id === selecionadaId;
              return (
                <button
                  key={empresa.id}
                  type="button"
                  onClick={() => setSelecionadaId(empresa.id)}
                  className={`${styles.cartaoBase} ${
                    ativa ? styles.cartaoAtivo : styles.cartaoInativo
                  }`}
                >
                  <div className={styles.cartaoTopo}>
                    <span className={styles.cartaoNome}>{empresa.nome}</span>
                    <span
                      className={`${styles.selo} ${estiloSelo(empresa.categoria)}`}
                    >
                      {empresa.categoria === "EVA / Borracha"
                        ? "EVA/Borracha"
                        : empresa.categoria === "Outros"
                          ? "Outros"
                          : empresa.categoria}
                    </span>
                  </div>
                  <div className={styles.cartaoRodape}>
                    <span className={styles.cartaoDistancia}>
                      {empresa.distancia}
                    </span>
                    <span className={styles.cartaoQtd}>
                      {empresa.residuos} resíduos disp.
                    </span>
                  </div>
                </button>
              );
            })}
            {filtradas.length === 0 && (
              <p className="rounded-xl border border-dashed border-[#E7E4DA] p-4 text-sm text-[#6B7670]">
                Nenhuma empresa encontrada para “{busca}”.
              </p>
            )}
          </div>
        </aside>

        <main className={styles.mapaArea}>
          <svg
            viewBox="0 0 800 560"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <rect width="800" height="560" fill="#F0EDE3" />
            <ellipse cx="180" cy="90" rx="90" ry="60" fill="#D9E8D2" />
            <ellipse cx="380" cy="130" rx="120" ry="90" fill="#D9E8D2" />
            <ellipse cx="680" cy="180" rx="110" ry="90" fill="#D9E8D2" />
            <ellipse cx="120" cy="420" rx="100" ry="80" fill="#D9E8D2" />
            <ellipse cx="470" cy="470" rx="130" ry="90" fill="#D9E8D2" />
            <ellipse cx="700" cy="440" rx="70" ry="50" fill="#D9E8D2" />
            <path
              d="M40 360 C 140 340, 170 300, 250 290 S 380 300, 440 260 S 560 200, 620 210 S 720 180, 800 150"
              fill="none"
              stroke="#A9C9E8"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <g stroke="#FFFFFF" strokeLinecap="round">
              <path d="M0 120 H800" strokeWidth="7" />
              <path d="M0 240 H800" strokeWidth="5" />
              <path d="M0 330 H800" strokeWidth="8" />
              <path d="M0 430 H800" strokeWidth="5" />
              <path d="M120 0 V560" strokeWidth="6" />
              <path d="M260 0 V560" strokeWidth="5" />
              <path d="M400 0 V560" strokeWidth="7" />
              <path d="M540 0 V560" strokeWidth="5" />
              <path d="M660 0 V560" strokeWidth="6" />
              <path d="M60 40 L740 500" strokeWidth="4" />
              <path d="M740 40 L60 500" strokeWidth="4" />
            </g>
            <g stroke="#D8D5C9" strokeWidth="1.2">
              <path d="M0 160 H800" />
              <path d="M0 200 H800" />
              <path d="M0 285 H800" />
              <path d="M0 385 H800" />
              <path d="M0 480 H800" />
              <path d="M190 0 V560" />
              <path d="M330 0 V560" />
              <path d="M470 0 V560" />
              <path d="M600 0 V560" />
              <path d="M720 0 V560" />
            </g>
          </svg>

          {empresas.map((empresa) => (
            <button
              key={empresa.id}
              type="button"
              title={empresa.nome}
              aria-label={empresa.nome}
              onClick={() => setSelecionadaId(empresa.id)}
              className={styles.marcador}
              style={{
                left: empresa.pos.left,
                top: empresa.pos.top,
                backgroundColor: corMarcador(empresa.categoria),
                transform: `translate(-50%, -50%) scale(${empresa.id === selecionadaId ? 1.25 : 1})`,
                zIndex: empresa.id === selecionadaId ? 15 : 10,
              }}
            />
          ))}

          <div
            className={styles.popup}
            style={{
              left: selecionada.pos.left,
              top: `calc(${selecionada.pos.top} - 92px)`,
            }}
          >
            <div className={styles.popupTopo}>
              <img
                src={selecionada.imagem}
                alt={selecionada.detalhe}
                className={styles.popupImg}
              />
              <div className="min-w-0">
                <p className={styles.popupTitulo}>{selecionada.nomeCurto}</p>
                <p className={styles.popupSub}>{selecionada.detalhe}</p>
              </div>
            </div>
            <div className={styles.popupRodape}>
              <span className={styles.popupGratis}>
                {selecionada.gratuito ? "Gratuito" : "A combinar"}
              </span>
              <button type="button" className={styles.popupBotao}>
                Ver Detalhes
              </button>
            </div>
          </div>

          <div className={styles.legenda}>
            <p className={styles.legendaTitulo}>Legenda de Resíduos</p>
            <div className={styles.legendaItem}>
              <span
                className={styles.legendaPonto}
                style={{ backgroundColor: "#10B981" }}
              />
              Couro
            </div>
            <div className={styles.legendaItem}>
              <span
                className={styles.legendaPonto}
                style={{ backgroundColor: "#3B82F6" }}
              />
              Tecido
            </div>
            <div className={styles.legendaItem}>
              <span
                className={styles.legendaPonto}
                style={{ backgroundColor: "#D97706" }}
              />
              EVA / Borracha
            </div>
            <div className={styles.legendaItem}>
              <span
                className={styles.legendaPonto}
                style={{ backgroundColor: "#8B5CF6" }}
              />
              Outros Materiais
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
