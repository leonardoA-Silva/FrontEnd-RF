import { Link } from "react-router-dom";
import BrandIcon from "./BrandIcon";

const navegacao = [
  { rotulo: "Início", href: "/" },
  { rotulo: "Como funciona", href: "/#como-funciona" },
  { rotulo: "Materiais", href: "/#materiais" },
];

export default function Header() {
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
        <Link to="/" className={styles.marca}>
          <BrandIcon />
          <span className={styles.marcaTitulo}>Reaproveita Franca</span>
        </Link>

        <nav className={styles.menu} aria-label="Navegação principal">
          {navegacao.map((item) => (
            <a key={item.rotulo} href={item.href} className={styles.menuLink}>
              {item.rotulo}
            </a>
          ))}
        </nav>

        <div className={styles.acoes}>
          <Link to="/login" className={styles.botaoEntrar}>
            Entrar
          </Link>
          <Link to="/cadastro" className={styles.botaoCadastrar}>
            Cadastrar
          </Link>
        </div>
      </div>
    </header>
  );
}
