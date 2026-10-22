export default function Footer({ variant = "default" }: { variant?: "default" | "marketplace" | "about" }) {
  const styles = {
    rodape: variant !== "default" ? "bg-[#064e3b] text-emerald-50" : "bg-[#0F3D2E] text-emerald-50",
    rodapeConteudo:
      variant === "about" ? "flex min-h-[181px] w-full flex-col justify-between gap-8 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:px-16 lg:py-10" : variant === "marketplace" ? "mx-auto flex min-h-[100px] w-full flex-col justify-between gap-5 px-5 py-5 lg:flex-row lg:items-center lg:gap-8 lg:px-[clamp(24px,4vw,64px)]" : "mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-10",
    rodapeMarca: variant === "about" ? "max-w-[340px]" : "max-w-xs",
    rodapeMarcaTitulo: variant === "about" ? "font-['RF_About_Gabarito',sans-serif] text-lg font-bold text-white" : "text-base font-bold text-white",
    rodapeMarcaTexto: variant === "about" ? "mt-2 text-sm leading-[1.5] text-emerald-100/70" : variant === "marketplace" ? "mt-1 max-w-[300px] text-xs leading-4 text-emerald-100" : "mt-2 text-sm leading-relaxed text-emerald-200",
    rodapeLinks: variant === "about" ? "flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/80" : variant === "marketplace" ? "flex flex-wrap gap-6 text-xs text-emerald-100" : "flex gap-8 text-sm text-emerald-100",
    rodapeLink: "hover:text-white",
    rodapeDireitos: variant === "about" ? "text-sm text-white/70" : variant === "marketplace" ? "text-xs text-emerald-100" : "text-sm text-emerald-300",
  };

  return (
    <footer className={styles.rodape}>
      <div className={styles.rodapeConteudo}>
        <div className={styles.rodapeMarca}>
          <p className={styles.rodapeMarcaTitulo}>Reaproveita Franca</p>
          <p className={styles.rodapeMarcaTexto}>
            Conectando a indústria calçadista de Franca à economia circular e
            ao artesanato local.
            {variant === "about" && " Reduzindo desperdício com impacto social real."}
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
