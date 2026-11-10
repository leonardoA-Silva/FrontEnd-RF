import { Link } from "react-router-dom";
import BrandIcon from "./BrandIcon";
import AccountAvatar from "./AccountAvatar";
import { useLoggedUser } from "../hooks/useLoggedUser";

const navegacao = [
  { rotulo: "Início", href: "/" },
  { rotulo: "Como funciona", href: "/#como-funciona" },
  { rotulo: "Marketplace", href: "/marketplace" },
  { rotulo: "Sobre nós", href: "/sobre-nos" },
];

export default function Header() {
  const { isLoggedIn, role, displayName } = useLoggedUser();
  const styles = {
    cabecalho: "sticky top-0 z-40 bg-cru",
    conteudo: "mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-5 py-3 sm:gap-4 sm:px-8 lg:px-12",
    marca: "flex shrink-0 items-center gap-2 no-underline sm:gap-3",
    marcaTitulo: "font-display text-base font-semibold leading-none text-carvao sm:text-lg",
    menu: "hidden items-center gap-7 md:flex",
    menuLink: "text-sm font-medium text-carvao-suave no-underline transition hover:text-carvao",
    acoes: "flex items-center gap-2.5",
    botaoEntrar:
      "rounded-lg border border-areia px-3 py-2 text-xs font-semibold text-carvao no-underline transition hover:border-carvao-suave hover:bg-areia-clara sm:px-4 sm:text-sm",
    botaoCadastrar:
      "rounded-full bg-verde-escuro px-3 py-2 text-xs font-semibold text-white no-underline transition hover:bg-verde sm:px-4 sm:text-sm",
  };

  return (
    <header className={styles.cabecalho}>
      <div className={styles.conteudo}>
        <Link to="/" className={styles.marca} aria-label="Reaproveita Franca — início">
          <BrandIcon />
          <span className={`hidden sm:inline ${styles.marcaTitulo}`}>Reaproveita Franca</span>
        </Link>

        <nav className={styles.menu} aria-label="Navegação principal">
          {navegacao.map((item) => (
            <a key={item.rotulo} href={item.href} className={styles.menuLink}>
              {item.rotulo}
            </a>
          ))}
        </nav>

        <div className={styles.acoes}>
          {isLoggedIn ? <Link to={role === "company" ? "/dashboardEmpresa" : "/dashboardUsuario"} className="flex max-w-48 items-center gap-2 rounded-full border border-line px-2 py-1 text-sm font-semibold"><AccountAvatar /><span className="hidden truncate sm:block">{displayName || "Minha conta"}</span></Link> : <>
          <Link to="/login" className={styles.botaoEntrar}>
            Entrar
          </Link>
          <Link to="/cadastro" className={styles.botaoCadastrar}>Cadastrar</Link></>}
          <details className="relative md:hidden"><summary className="cursor-pointer rounded-full border border-line px-3 py-2 text-xs font-semibold">Menu</summary><nav aria-label="Navegação no celular" className="absolute top-full right-0 mt-2 w-48 rounded-xl border border-line bg-surface p-2 shadow-lg">{navegacao.map(item => <Link key={item.href} to={item.href} className="block rounded-lg p-3 text-sm hover:bg-canvas">{item.rotulo}</Link>)}</nav></details>
        </div>
      </div>
    </header>
  );
}
