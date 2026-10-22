import { Link } from "react-router-dom";

export default function Footer() {
  const styles = {
    rodape: "border-t border-areia/60 bg-carvao text-cru",
    conteudo:
      "mx-auto flex max-w-6xl flex-col gap-10 px-5 py-12 sm:px-8 lg:flex-row lg:justify-between",
    marca: "max-w-sm",
    marcaTitulo: "font-display text-xl font-semibold",
    marcaTexto: "mt-3 text-sm leading-relaxed text-cru/70",
    colunas: "flex flex-col gap-10 sm:flex-row sm:gap-16",
    colunaTitulo: "text-sm font-bold text-cru",
    colunaLista: "mt-4 flex flex-col gap-2.5 text-sm",
    colunaLink: "text-cru/70 no-underline transition hover:text-cru",
    base: "border-t border-cru/15 py-5 text-center text-xs text-cru/50",
  };

  return (
    <footer className={styles.rodape}>
      <div className={styles.conteudo}>
        <div className={styles.marca}>
          <p className={styles.marcaTitulo}>Reaproveita Franca</p>
          <p className={styles.marcaTexto}>
            Economia circular para o polo calçadista de Franca · SP. Empresas
            publicam o que sobra da produção; artesãos, cooperativas e escolas
            transformam em matéria-prima.
          </p>
        </div>

        <div className={styles.colunas}>
          <div>
            <p className={styles.colunaTitulo}>Plataforma</p>
            <div className={styles.colunaLista}>
              <a className={styles.colunaLink} href="/#como-funciona">
                Como funciona
              </a>
              <a className={styles.colunaLink} href="/#materiais">
                Materiais
              </a>
              <a className={styles.colunaLink} href="/#para-quem-e">
                Para quem é
              </a>
            </div>
          </div>

          <div>
            <p className={styles.colunaTitulo}>Conta</p>
            <div className={styles.colunaLista}>
              <Link className={styles.colunaLink} to="/login">
                Entrar
              </Link>
              <Link className={styles.colunaLink} to="/cadastro">
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.base}>
        © 2026 Reaproveita Franca — projeto de TCC, SENAI Franca/SP.
      </div>
    </footer>
  );
}
