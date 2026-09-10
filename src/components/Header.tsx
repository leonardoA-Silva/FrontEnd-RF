import { Repeat2 } from "lucide-react";
import { Link } from "@mui/material";

export default function Header() {
  const styles = {
    cabecalho: "border-b border-[#E7E4DA] bg-white",
    cabecalhoConteudo:
      "mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10",
    marca: "flex items-center gap-3",
    marcaIcone:
      "flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white",
    marcaIconeSvg: "h-6 w-6",
    marcaTextos: "leading-tight",
    marcaTitulo: "text-lg font-bold text-[#1B4B3A]",
    marcaSubtitulo: "text-sm font-bold tracking-wide text-orange-500",
    menuNavegacao: "flex items-center gap-3",
    botaoEntrar:
      "rounded-lg border border-[#D9D5C8] px-5 py-2.5 text-sm font-semibold text-[#1B4B3A] transition hover:bg-[#F3F1EA]",
    botaoCadastrar:
      "rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600",
  };

  return (
    <header className={styles.cabecalho}>
      <div className={styles.cabecalhoConteudo}>
        <a href="/" className={`${styles.marca} no-underline`}>
          <span className={styles.marcaIcone}>
            <Repeat2 className={styles.marcaIconeSvg} strokeWidth={2.4} />
          </span>
          <div className={styles.marcaTextos}>
            <p className={styles.marcaTitulo}>Reaproveita</p>
            <p className={styles.marcaSubtitulo}>FRANCA</p>
          </div>
        </a>

        <div className="hidden sm:flex items-center gap-6">
          <a
            href="/"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition"
          >
            Início
          </a>
          <a
            href="/#sobre"
            className="text-sm font-medium text-[#6B7670] hover:text-[#1B4B3A] transition"
          >
            Sobre Nós
          </a>
        </div>

        <nav className={styles.menuNavegacao}>
          <Link
            className={styles.botaoEntrar}
            style={{ textDecoration: "none", color: "black" }}
            href="/login"
          >
            Entrar
          </Link>
          <Link
            className={styles.botaoCadastrar}
            style={{ textDecoration: "none", color: "white" }}
            href="/register"
          >
            Cadastrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
