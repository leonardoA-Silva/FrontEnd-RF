import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Folder,
  LogOut,
  Menu,
  PlusCircle,
  UserRound,
  X,
} from "lucide-react";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import BrandIcon from "../BrandIcon";

type SecaoPainel = "materiais" | "publicar" | "perfil";

interface DashboardShellProps {
  children: ReactNode;
  /** Item marcado no menu lateral. Ignorado quando há `sidebar`. */
  active?: SecaoPainel;
  /** Aviso para telas que ainda serão implementadas. */
  onSoon: (tela: string) => void;
  /** Conteúdo próprio da barra lateral; substitui a lista de seções. */
  sidebar?: ReactNode;
}

interface SecaoNavegacao {
  id: SecaoPainel;
  rotulo: string;
  icone: typeof Folder;
  to?: string;
}

const secoes: SecaoNavegacao[] = [
  { id: "materiais", rotulo: "Meus Materiais", icone: Folder, to: "/dashboardEmpresa" },
  { id: "publicar", rotulo: "Publicar Novo", icone: PlusCircle },
  { id: "perfil", rotulo: "Perfil", icone: UserRound },
];

const navegacao: { rotulo: string; to?: string }[] = [
  { rotulo: "Início", to: "/dashboardEmpresa" },
  { rotulo: "Mapa de Empresas", to: "/mapaEmpresas" },
  { rotulo: "Indicadores Ambientais" },
  { rotulo: "Histórico de Negociações" },
  { rotulo: "Sobre Nós" },
];

function Marca() {
  return (
    <Link
      to="/dashboardEmpresa"
      className="flex shrink-0 items-center gap-3 no-underline"
      aria-label="Reaproveita Franca — painel"
    >
      <BrandIcon className="grid h-11 w-11 place-items-center rounded-lg bg-verde-escuro text-white" iconClassName="h-6 w-6" />
      <span className="leading-none">
        <span className="block text-[19px] font-bold tracking-tight text-verde-escuro">
          Reaproveita
        </span>
        <span className="mt-1 block text-[12px] font-bold tracking-[0.14em] text-laranja">
          FRANCA
        </span>
      </span>
    </Link>
  );
}

export default function DashboardShell({
  children,
  active,
  onSoon,
  sidebar,
}: DashboardShellProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const { displayName, photoSrc } = useLoggedUser({ fallbackName: "Minha Empresa" });

  const inicial = displayName.trim().charAt(0).toUpperCase() || "E";

  function sair() {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem("token");
      storage.removeItem("user");
      storage.removeItem("tipoUsuario");
    }
    navigate("/login");
  }

  function abrirTela(rotulo: string) {
    setMenuAberto(false);
    onSoon(rotulo);
  }

  const styles = {
    pagina: "flex min-h-screen flex-col bg-bruma font-app text-tinta",
    pular:
      "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-verde-escuro focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white",

    cabecalho: "border-b border-linha bg-white",
    cabecalhoConteudo:
      "flex h-[76px] items-center justify-between gap-4 px-5 sm:px-8 lg:h-[84px] lg:px-10",
    menuTopo: "hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-9",
    menuTopoLink:
      "whitespace-nowrap text-[15px] font-medium text-tinta-suave transition-colors hover:text-verde-escuro",
    menuTopoLinkAtivo:
      "whitespace-nowrap text-[15px] font-semibold text-verde-escuro",
    acoes: "flex shrink-0 items-center gap-2",
    usuarioDetalhes: "relative",
    usuarioPilha:
      "flex cursor-pointer list-none items-center gap-2.5 rounded-full bg-verde-claro py-1.5 pl-1.5 pr-3 transition-colors hover:bg-musgo-claro [&::-webkit-details-marker]:hidden",
    avatar:
      "grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-[13px] font-bold text-verde-escuro",
    avatarImg: "h-8 w-8 rounded-full object-cover",
    usuarioNome:
      "hidden max-w-[150px] truncate text-[14px] font-semibold text-verde-escuro sm:block",
    usuarioSeta: "text-verde-escuro/70",
    usuarioMenu:
      "absolute right-0 z-50 mt-2 w-52 rounded-xl border border-linha bg-white p-1.5 shadow-lg",
    usuarioMenuItem:
      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-tinta transition-colors hover:bg-bruma",
    botaoMenu:
      "grid h-10 w-10 place-items-center rounded-lg border border-linha text-tinta transition-colors hover:bg-bruma lg:hidden",
    menuMovel: "border-t border-linha px-5 py-3 lg:hidden",
    menuMovelLink:
      "block w-full rounded-lg px-2 py-2.5 text-left text-sm font-medium text-tinta-suave transition-colors hover:bg-bruma hover:text-tinta",
    menuMovelLinkAtivo:
      "block w-full rounded-lg px-2 py-2.5 text-left text-sm font-semibold text-verde-escuro transition-colors hover:bg-verde-claro",

    navegacaoMovel: "border-b border-linha bg-white px-4 py-3 lg:hidden",
    navegacaoMovelLista: "flex flex-wrap gap-2",
    itemMovel:
      "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
    itemMovelAtivo: "bg-verde-claro text-verde-escuro",
    itemMovelInativo: "text-tinta-suave hover:bg-bruma",

    corpo: "flex flex-1 flex-col lg:flex-row",
    barraLateral:
      "hidden w-[260px] shrink-0 border-r border-linha bg-white px-4 py-6 lg:flex lg:flex-col xl:w-[286px]",
    /** Barra lateral com conteúdo próprio: também aparece no mobile. */
    barraLateralPainel:
      "flex w-full shrink-0 flex-col border-b border-linha bg-white lg:w-[380px] lg:border-b-0 lg:border-r xl:w-[400px]",
    menuLateral: "flex flex-col gap-1.5",
    itemLateral:
      "flex items-center gap-3 rounded-[10px] px-4 py-3 text-[15px] transition-colors",
    itemLateralAtivo: "bg-verde-claro font-semibold text-verde-escuro",
    itemLateralInativo:
      "font-medium text-tinta-suave hover:bg-bruma hover:text-tinta",

    principal: "min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-8",
    /** Área cheia (mapa) — sem o respiro padrão do conteúdo. */
    principalCheio: "flex min-w-0 flex-1 flex-col",

    rodape: "bg-mata text-white",
    rodapeConteudo:
      "mx-auto flex max-w-[1700px] flex-col gap-6 px-5 py-9 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:px-10",
    rodapeMarca: "max-w-sm",
    rodapeMarcaCabecalho: "flex items-center gap-3",
    rodapeTitulo: "text-[17px] font-bold",
    rodapeTexto: "mt-2 text-[13px] leading-relaxed text-white/70",
    rodapeLinks: "flex flex-wrap gap-x-8 gap-y-2 text-[14px]",
    rodapeLink: "text-white/85 transition-colors hover:text-white",
    rodapeBase: "text-[12px] text-white/60",
  };

  const classeBarraLateral = sidebar ? styles.barraLateralPainel : styles.barraLateral;
  const classePrincipal = sidebar ? styles.principalCheio : styles.principal;

  return (
    <div className={`${styles.pagina} app-circular`}>
      <a href="#conteudo-principal" className={styles.pular}>
        Pular para o conteúdo
      </a>

      <header className={styles.cabecalho}>
        <div className={styles.cabecalhoConteudo}>
          <Marca />

          <nav className={styles.menuTopo} aria-label="Navegação principal">
            {navegacao.map((item) =>
              item.to ? (
                <Link
                  key={item.rotulo}
                  to={item.to}
                  aria-current={item.to === pathname ? "page" : undefined}
                  className={
                    item.to === pathname
                      ? styles.menuTopoLinkAtivo
                      : styles.menuTopoLink
                  }
                >
                  {item.rotulo}
                </Link>
              ) : (
                <button
                  key={item.rotulo}
                  type="button"
                  className={styles.menuTopoLink}
                  onClick={() => abrirTela(item.rotulo)}
                >
                  {item.rotulo}
                </button>
              )
            )}
          </nav>

          <div className={styles.acoes}>
            <details className={styles.usuarioDetalhes}>
              <summary className={styles.usuarioPilha} title={displayName}>
                <span className={styles.avatar}>
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt={`Foto de ${displayName}`}
                      className={styles.avatarImg}
                    />
                  ) : (
                    inicial
                  )}
                </span>
                <span className={styles.usuarioNome}>{displayName}</span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.2}
                  className={styles.usuarioSeta}
                  aria-hidden="true"
                />
              </summary>
              <div className={styles.usuarioMenu}>
                <button
                  type="button"
                  className={styles.usuarioMenuItem}
                  onClick={() => abrirTela("Perfil")}
                >
                  <UserRound size={16} aria-hidden="true" />
                  Perfil
                </button>
                <button
                  type="button"
                  className={styles.usuarioMenuItem}
                  onClick={sair}
                >
                  <LogOut size={16} aria-hidden="true" />
                  Sair da conta
                </button>
              </div>
            </details>

            <button
              type="button"
              className={styles.botaoMenu}
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto((aberto) => !aberto)}
            >
              {menuAberto ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {menuAberto && (
          <nav className={styles.menuMovel} aria-label="Navegação principal">
            {navegacao.map((item) =>
              item.to ? (
                <Link
                  key={item.rotulo}
                  to={item.to}
                  aria-current={item.to === pathname ? "page" : undefined}
                  className={
                    item.to === pathname
                      ? styles.menuMovelLinkAtivo
                      : styles.menuMovelLink
                  }
                  onClick={() => setMenuAberto(false)}
                >
                  {item.rotulo}
                </Link>
              ) : (
                <button
                  key={item.rotulo}
                  type="button"
                  className={styles.menuMovelLink}
                  onClick={() => abrirTela(item.rotulo)}
                >
                  {item.rotulo}
                </button>
              )
            )}
          </nav>
        )}
      </header>

      {!sidebar && (
        <nav className={styles.navegacaoMovel} aria-label="Seções do painel">
          <div className={styles.navegacaoMovelLista}>
            {secoes.map(({ id, rotulo, icone: Icone, to }) =>
              to ? (
                <Link
                  key={id}
                  to={to}
                  aria-current={active === id ? "page" : undefined}
                  className={`${styles.itemMovel} ${
                    active === id ? styles.itemMovelAtivo : styles.itemMovelInativo
                  }`}
                >
                  <Icone size={18} aria-hidden="true" />
                  {rotulo}
                </Link>
              ) : (
                <button
                  key={id}
                  type="button"
                  className={`${styles.itemMovel} ${styles.itemMovelInativo}`}
                  onClick={() => abrirTela(rotulo)}
                >
                  <Icone size={18} aria-hidden="true" />
                  {rotulo}
                </button>
              )
            )}
          </div>
        </nav>
      )}

      <div className={styles.corpo}>
        <aside className={classeBarraLateral}>
          {sidebar ?? (
            <nav className={styles.menuLateral} aria-label="Seções da conta">
              {secoes.map(({ id, rotulo, icone: Icone, to }) =>
                to ? (
                  <Link
                    key={id}
                    to={to}
                    aria-current={active === id ? "page" : undefined}
                    className={`${styles.itemLateral} ${
                      active === id
                        ? styles.itemLateralAtivo
                        : styles.itemLateralInativo
                    }`}
                  >
                    <Icone
                      size={19}
                      strokeWidth={2}
                      className={active === id ? "text-verde" : "text-tinta-clara"}
                      aria-hidden="true"
                    />
                    {rotulo}
                  </Link>
                ) : (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.itemLateral} ${styles.itemLateralInativo} text-left`}
                    onClick={() => abrirTela(rotulo)}
                  >
                    <Icone
                      size={19}
                      strokeWidth={2}
                      className="text-tinta-clara"
                      aria-hidden="true"
                    />
                    {rotulo}
                  </button>
                )
              )}
            </nav>
          )}
        </aside>

        <main id="conteudo-principal" className={classePrincipal}>
          {children}
        </main>
      </div>

      <footer className={styles.rodape}>
        <div className={styles.rodapeConteudo}>
          <div className={styles.rodapeMarca}>
            <div className={styles.rodapeMarcaCabecalho}>
              <BrandIcon className="grid h-9 w-9 place-items-center rounded-lg bg-white text-verde-escuro" iconClassName="h-5 w-5" />
              <p className={styles.rodapeTitulo}>Reaproveita Franca</p>
            </div>
            <p className={styles.rodapeTexto}>
              Conectando a indústria calçadista de Franca à economia circular e ao
              artesanato local.
            </p>
          </div>

          <nav className={styles.rodapeLinks} aria-label="Links do rodapé">
            {["Políticas de Privacidade", "Termos de Uso", "Suporte"].map((rotulo) => (
              <button
                key={rotulo}
                type="button"
                className={styles.rodapeLink}
                onClick={() => abrirTela(rotulo)}
              >
                {rotulo}
              </button>
            ))}
          </nav>

          <p className={styles.rodapeBase}>
            © 2026 Reaproveita Franca. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
