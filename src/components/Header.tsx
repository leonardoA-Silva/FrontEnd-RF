import { Repeat2 } from "lucide-react";
import { Link } from "react-router-dom";

const navegacao = [
  { rotulo: "Início", href: "/" },
  { rotulo: "Como funciona", href: "/#como-funciona" },
  { rotulo: "Materiais", href: "/#materiais" },
];

export default function Header() {
  const styles = {
    cabecalho: "sticky top-0 z-40 border-b border-areia bg-cru/95 backdrop-blur-sm",
    conteudo: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8",
    marca: "flex shrink-0 items-center gap-3 no-underline",
    marcaIcone: "flex h-10 w-10 items-center justify-center rounded-lg bg-carvao text-cru",
    marcaIconeSvg: "h-5 w-5",
    marcaTitulo: "font-display text-lg font-semibold leading-none text-carvao",
    menu: "hidden items-center gap-7 md:flex",
    menuLink: "text-sm font-medium text-carvao-suave no-underline transition hover:text-carvao",
    acoes: "flex items-center gap-2.5",
    botaoEntrar:
      "rounded-lg border border-areia px-4 py-2 text-sm font-semibold text-carvao no-underline transition hover:border-carvao-suave hover:bg-areia-clara",
    botaoCadastrar:
      "rounded-lg bg-canela px-4 py-2 text-sm font-semibold text-cru no-underline transition hover:bg-canela-escura",
  };

  return (
    <header className={styles.cabecalho}>
      <div className={styles.conteudo}>
        <Link to="/" className={styles.marca}>
          <span className={styles.marcaIcone}>
            <Repeat2 className={styles.marcaIconeSvg} strokeWidth={2.4} />
          </span>
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
