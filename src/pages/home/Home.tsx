import { MapPin, BarChart3 } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

const stats = [
  { value: "2.500+", label: "Toneladas desviadas de aterros" },
  { value: "340+", label: "Empresas parceiras conectadas" },
  { value: "1.200+", label: "Negociações concluídas com sucesso" },
];

const technologies = [
  {
    icon: MapPin,
    title: "Mapa de Empresas",
    description: "Logística reversa simplificada",
  },
  {
    icon: BarChart3,
    title: "Indicadores Verdes",
    description: "Métricas reais de CO2 poupado",
  },
];

export default function Home() {
  // Estilos centralizados aqui dentro da função (sem arquivo .css).
  // Cada chave tem um nome semântico e guarda as classes Tailwind correspondentes.
  const styles = {
    pagina: "min-h-screen bg-[#FAF9F5] text-[#1B4B3A]",

    secaoPrincipal: "mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20",
    principalGrade: "grid items-center gap-12 lg:grid-cols-2",
    principalTexto: "",
    etiquetaDestaque:
      "inline-block rounded-full border border-emerald-500 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-600",
    tituloPrincipal:
      "mt-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-[#1B4B3A] sm:text-6xl",
    descricaoPrincipal: "mt-6 max-w-xl text-lg leading-relaxed text-[#4B5A55]",
    grupoBotoesPrincipal: "mt-8 flex flex-wrap gap-4",
    botaoPublicar:
      "rounded-lg bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-600",
    botaoExplorar:
      "rounded-lg border-2 border-emerald-500 px-7 py-3.5 text-base font-semibold text-emerald-600 transition hover:bg-emerald-50",
    imagemDestaqueContainer: "overflow-hidden rounded-2xl shadow-lg",
    imagemDestaque: "h-full w-full object-cover",

    faixaEstatisticas: "bg-[#0F3D2E]",
    faixaEstatisticasConteudo:
      "mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-center sm:justify-center sm:gap-16 sm:px-10",
    estatisticaItem: "flex items-center gap-4",
    estatisticaDivisor: "hidden h-10 w-px bg-emerald-800 sm:block",
    estatisticaTexto: "flex items-baseline gap-3",
    estatisticaValor: "text-3xl font-extrabold text-emerald-400 sm:text-4xl",
    estatisticaLegenda: "max-w-[10rem] text-sm leading-snug text-emerald-50",

    secaoConteudo: "mx-auto max-w-7xl px-6 py-16 sm:px-10",
    conteudoGrade: "grid gap-12 lg:grid-cols-[1.4fr_1fr]",
    tituloSecao: "text-2xl font-bold text-[#1B4B3A]",
    gradeTecnologias: "mt-6 grid gap-4 sm:grid-cols-3",
    cartaoTecnologia: "rounded-xl border border-[#E7E4DA] bg-white p-5",
    iconeTecnologia: "h-5 w-5 text-emerald-500",
    tituloTecnologia: "mt-3 text-sm font-bold text-[#1B4B3A]",
    descricaoTecnologia: "mt-1 text-sm text-[#6B7670]",

    depoimentoCaixa: "mt-6 rounded-xl border border-orange-300 bg-amber-50 p-6",
    depoimentoTexto: "text-[15px] leading-relaxed text-[#3F4A45]",
    depoimentoAutor: "mt-4 text-sm font-bold text-[#1B4B3A]",
  };

  return (
    <div className={styles.pagina}>
      <Header />

      {/* Hero */}
      <section className={styles.secaoPrincipal}>
        <div className={styles.principalGrade}>
          <div className={styles.principalTexto}>
            <span className={styles.etiquetaDestaque}>
              ECONOMIA CIRCULAR EM FRANCA
            </span>

            <h1 className={styles.tituloPrincipal}>
              Transforme resíduos em oportunidades
            </h1>

            <p className={styles.descricaoPrincipal}>
              Conectamos as grandes indústrias calçadistas de Franca a
              artesãos, cooperativas e microempresas locais. Dê um novo destino
              a retalhos de couro, tecidos, borrachas e muito mais.
            </p>

            <div className={styles.grupoBotoesPrincipal}>
              <button className={styles.botaoPublicar}>
                Publicar Material
              </button>
              <button className={styles.botaoExplorar}>
                Explorar Materiais
              </button>
            </div>
          </div>

          <div className={styles.imagemDestaqueContainer}>
            <img
              src="/hero-leather-scraps.jpg"
              alt="Retalhos de couro reaproveitados formando uma composição sobre madeira"
              className={styles.imagemDestaque}
            />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className={styles.faixaEstatisticas}>
        <div className={styles.faixaEstatisticasConteudo}>
          {stats.map((stat, i) => (
            <div key={stat.value} className={styles.estatisticaItem}>
              {i > 0 && <span className={styles.estatisticaDivisor} />}
              <div className={styles.estatisticaTexto}>
                <span className={styles.estatisticaValor}>{stat.value}</span>
                <span className={styles.estatisticaLegenda}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technologies + Testimonial */}
      <section className={styles.secaoConteudo}>
        <div className={styles.conteudoGrade}>
          <div>
            <h2 className={styles.tituloSecao}>Nossas Tecnologias</h2>
            <div className={styles.gradeTecnologias}>
              {technologies.map(({ icon: Icon, title, description }) => (
                <div key={title} className={styles.cartaoTecnologia}>
                  <Icon className={styles.iconeTecnologia} strokeWidth={2} />
                  <p className={styles.tituloTecnologia}>{title}</p>
                  <p className={styles.descricaoTecnologia}>{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className={styles.tituloSecao}>Depoimento em Destaque</h2>
            <blockquote className={styles.depoimentoCaixa}>
              <p className={styles.depoimentoTexto}>
                &ldquo;Os retalhos de couro que antes iriam para o lixo agora
                viram bolsas e carteiras exclusivas. O Reaproveita Franca
                impulsionou meu ateliê!&rdquo;
              </p>
              <footer className={styles.depoimentoAutor}>
                — Silvana M., Artesã local
              </footer>
            </blockquote>
          </div>
        </div>
      </section>
              <Link to="/dashboardEmpresa" className={styles.botaoPublicar}>dashboard</Link>
      <Footer />
    </div>
  );
}
