export default function Footer() {
  const styles = {
    rodape: "bg-[#0F3D2E] text-emerald-50",
    rodapeConteudo:
      "mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-10",
    rodapeMarca: "max-w-xs",
    rodapeMarcaTitulo: "text-base font-bold text-white",
    rodapeMarcaTexto: "mt-2 text-sm leading-relaxed text-emerald-200",
    rodapeLinks: "flex gap-8 text-sm text-emerald-100",
    rodapeLink: "hover:text-white",
    rodapeDireitos: "text-sm text-emerald-300",
  };

  return (
    <footer className={styles.rodape}>
      <div className={styles.rodapeConteudo}>
        <div className={styles.rodapeMarca}>
          <p className={styles.rodapeMarcaTitulo}>Reaproveita Franca</p>
          <p className={styles.rodapeMarcaTexto}>
            Conectando a indústria calçadista de Franca à economia circular e
            ao artesanato local.
          </p>
        </div>

        <nav className={styles.rodapeLinks}>
          <a href="#" className={styles.rodapeLink}>
            Políticas de Privacidade
          </a>
          <a href="#" className={styles.rodapeLink}>
            Termos de Uso
          </a>
          <a href="#" className={styles.rodapeLink}>
            Suporte
          </a>
        </nav>

        <p className={styles.rodapeDireitos}>
          © 2026 Reaproveita Franca. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
