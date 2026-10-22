export default function Footer({ compacto = false }: { compacto?: boolean }) {
  const styles = compacto ? {
    rodape: "bg-[#005846] text-emerald-50",
    rodapeConteudo: "mx-auto grid w-full gap-5 px-4 py-5 md:min-h-[90px] md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-7 md:px-[4.1vw] md:py-4",
    rodapeMarca: "max-w-[280px]",
    rodapeMarcaTitulo: "text-[13px] font-semibold text-white",
    rodapeMarcaTexto: "mt-1 text-[10px] leading-[1.45] text-emerald-100/65",
    rodapeLinks: "flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-emerald-100/65",
    rodapeLink: "hover:text-white",
    rodapeDireitos: "text-[10px] leading-relaxed text-emerald-100/65 md:text-right",
  } : {
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
