import { useState } from "react";
import { ArrowDownRight, ArrowRight, Factory, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const materiais = [
  {
    nome: "Couro",
    imagem: "/retalho-couro-nobre.png",
    alt: "Pilha de retalhos de couro marrom",
    uso: "Recortes que podem seguir para bolsas, cintos e pequenos artigos.",
  },
  {
    nome: "Nobuck e tecidos",
    imagem: "/retalho-nobuck-macio.png",
    alt: "Retalhos de material escuro empilhados",
    uso: "Tecidos e materiais para forros, acabamentos e novas peças.",
  },
  {
    nome: "EVA e borracha",
    imagem: "/eva-camurca-premium.png",
    alt: "Placas azuis de EVA empilhadas",
    uso: "Sobras que podem servir a componentes, protótipos e artesanato.",
  },
  {
    nome: "Recortes variados",
    imagem: "/hero-leather-scraps.jpg",
    alt: "Recortes variados de couro organizados sobre uma mesa de corte",
    uso: "O destino de cada recorte depende do material e das possibilidades de uso.",
  },
];

const etapas = [
  {
    titulo: "A empresa publica",
    texto: "Descreva o material, a quantidade, o estado e o local de retirada.",
  },
  {
    titulo: "O material é encontrado",
    texto: "Quem procura reaproveitar pode descobrir os lotes disponíveis.",
  },
  {
    titulo: "As partes combinam os próximos passos",
    texto: "Venda ou doação. Valores e retirada são combinados entre as partes.",
  },
];

const estilos = {
  pagina: "screen-enter min-h-svh overflow-hidden bg-papel text-carvao",
  margem: "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12",
  hero: "relative grid min-h-[calc(100svh-76px)] items-center gap-10 py-12 sm:py-16 lg:min-h-[760px] lg:grid-cols-[0.94fr_1.06fr] lg:gap-14 lg:py-20",
  heroTexto: "relative z-10 max-w-[650px]",
  titulo:
    "max-w-[13ch] text-balance font-display text-[clamp(3rem,6.5vw,6rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-carvao",
  descricao:
    "mt-7 max-w-[42ch] text-pretty text-base leading-7 text-carvao sm:text-lg sm:leading-8",
  acoes: "mt-8 flex flex-wrap items-center gap-x-6 gap-y-4",
  principal:
    "inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-verde-escuro px-6 py-3 text-[15px] font-semibold text-white no-underline transition-[transform,background-color] duration-150 ease-out hover:bg-verde active:scale-[0.97]",
  secundario:
    "inline-flex min-h-12 items-center gap-2 text-[15px] font-semibold text-verde-escuro underline-offset-4 transition-colors hover:text-canela-escura hover:underline",
  fotoPalco:
    "relative mx-auto aspect-[1.02] w-full max-w-[680px] overflow-hidden bg-verde-escuro lg:aspect-[0.98]",
  foto:
    "h-full w-full object-cover transition-transform duration-[900ms] ease-out motion-safe:scale-[1.03] motion-reduce:transform-none",
  fotoFaixa:
    "absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-carvao/80 px-5 py-4 text-white sm:py-5 sm:pl-32 sm:pr-7",
  fotoLegenda: "max-w-[28ch] text-sm font-medium leading-6 sm:text-base",
  indiceImagem: "text-sm font-semibold tabular-nums text-white/80",
  assinatura:
    "absolute -bottom-5 -left-4 hidden h-24 w-24 items-center justify-center rounded-full bg-canela text-center text-xs font-bold leading-4 text-white sm:flex lg:-left-8 lg:h-28 lg:w-28",

  secao: "py-20 sm:py-28 lg:py-36",
  cabecalhoSecao:
    "grid gap-5 lg:grid-cols-[1fr_0.65fr] lg:items-end lg:gap-12",
  tituloSecao:
    "max-w-[13ch] text-balance font-display text-[clamp(2.2rem,4.4vw,4rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-carvao",
  introSecao: "max-w-[52ch] text-pretty text-base leading-7 text-carvao sm:text-lg sm:leading-8",
  processo: "flex flex-col gap-6",
  etapa: "max-w-[44ch] py-2",
  etapaNome:
    "font-display text-xl font-semibold leading-tight tracking-[-0.025em] text-verde-escuro sm:text-2xl",
  etapaTexto: "mt-3 max-w-[34ch] text-base leading-7 text-carvao",

  materiais: "bg-verde-escuro text-white",
  materiaisInterno: "py-20 sm:py-28 lg:py-32",
  materiaisIntro:
    "grid gap-5 lg:grid-cols-[1fr_0.65fr] lg:items-end lg:gap-12",
  materiaisTitulo:
    "max-w-[24ch] text-balance font-display text-[clamp(2rem,4.2vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.04em]",
  materiaisDescricao: "max-w-[49ch] text-base leading-7 text-white/90 sm:text-lg sm:leading-8",
  explorador:
    "mt-12 grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch lg:gap-12",
  listaMateriais: "flex flex-col",
  materialLink:
    "group flex min-h-[82px] items-center justify-between gap-4 py-5 text-left text-lg font-semibold text-white/75 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-[100px] sm:text-2xl",
  materialLinkAtivo: "text-white",
  materialSeta: "shrink-0 transition-transform duration-200 group-hover:translate-x-1",
  imagemMaterial:
    "relative min-h-[270px] overflow-hidden bg-white/10 sm:min-h-[360px] lg:min-h-[500px]",
  imagemMaterialImg: "absolute inset-0 h-full w-full object-cover",
  legendaMaterial:
    "absolute inset-x-0 bottom-0 bg-carvao/75 px-5 py-4 text-sm leading-6 text-white sm:px-6 sm:py-5 sm:text-base",

  publicos: "motion-stagger grid gap-10 sm:grid-cols-2 sm:gap-8 lg:gap-16",
  publico: "border-t-2 border-canela pt-6",
  publicoIcone: "h-7 w-7 text-canela-escura",
  publicoTitulo:
    "mt-8 max-w-[18ch] font-display text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl",
  publicoTexto: "mt-3 max-w-[43ch] text-base leading-7 text-carvao",
  publicoLink:
    "mt-6 inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-verde-escuro underline-offset-4 hover:underline",

  chamada: "bg-canela",
  chamadaInterna:
    "mx-auto grid max-w-5xl gap-8 py-14 text-white sm:py-20 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:gap-12 lg:py-24",
  chamadaTitulo:
    "max-w-[12ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.5rem)] font-semibold leading-[1] tracking-[-0.05em]",
  chamadaTexto: "mt-4 max-w-[48ch] text-base leading-7 text-white/90 sm:text-lg",
  chamadaLink:
    "inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-verde-escuro px-6 py-3 text-[15px] font-semibold text-white no-underline transition-[transform,background-color] duration-150 ease-out hover:bg-carvao active:scale-[0.97]",
};

export default function Home() {
  const [materialAtivo, setMaterialAtivo] = useState(0);
  const material = materiais[materialAtivo];

  return (
    <div className={estilos.pagina}>
      <Header />
      <main>
        <section className={`${estilos.margem} ${estilos.hero}`} aria-labelledby="titulo-principal">
          <div className={estilos.heroTexto}>
            <h1 id="titulo-principal" className={estilos.titulo}>
              Retalhos em novo ciclo
            </h1>
            <p className={estilos.descricao}>
              Uma rede local que aproxima indústrias de Franca de quem pode dar novo uso a couro, EVA e tecidos.
            </p>
            <div className={estilos.acoes}>
              <Link to="/cadastro" className={estilos.principal}>
                Quero participar <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a href="#materiais" className={estilos.secundario}>
                Explorar materiais <ArrowDownRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>

          <figure className={`${estilos.fotoPalco} home-hero-shutter`}>
            <img
              src="/hero-leather-scraps.jpg"
              alt="Recortes de couro aproveitáveis sobre uma mesa de trabalho"
              className={`${estilos.foto} home-hero-photo`}
              width="1300"
              height="800"
              fetchPriority="high"
            />
            <figcaption className={estilos.fotoFaixa}>
              <span className={estilos.fotoLegenda}>O que sobra de um processo pode ser o começo de outro.</span>
              <span className={estilos.indiceImagem}>Franca, SP</span>
            </figcaption>
            <span className={estilos.assinatura} aria-hidden="true">MATÉRIA<br />EM NOVO<br />CICLO</span>
          </figure>
        </section>

        <section id="como-funciona" className={estilos.margem + " " + estilos.secao} aria-labelledby="titulo-caminho">
          <div className={estilos.cabecalhoSecao}>
            <h2 id="titulo-caminho" className={estilos.tituloSecao}>Do lote a um novo uso</h2>
            <p className={estilos.introSecao}>
              Empresas publicam materiais para venda ou doação. Pessoas e organizações encontram opções e combinam a retirada com quem publicou.
            </p>
          </div>
          <div className="mt-14 grid items-start gap-9 lg:grid-cols-[1fr_0.9fr] lg:gap-14">
            <ol className={estilos.processo}>
              {etapas.map((etapa) => (
                <li key={etapa.titulo} className={estilos.etapa}>
                  <h3 className={estilos.etapaNome}>{etapa.titulo}</h3>
                  <p className={estilos.etapaTexto}>{etapa.texto}</p>
                </li>
              ))}
            </ol>
            <figure className="relative min-h-64 overflow-hidden sm:min-h-80 lg:min-h-[440px]">
              <img
                src="/retalho-nobuck-macio.png"
                alt="Retalhos de nobuck macio separados para reaproveitamento"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </figure>
          </div>
        </section>

        <section id="materiais" className={estilos.materiais} aria-labelledby="titulo-materiais">
          <div className={`${estilos.margem} ${estilos.materiaisInterno}`}>
            <div className={estilos.materiaisIntro}>
              <h2 id="titulo-materiais" className={estilos.materiaisTitulo}>Matéria-prima à espera de outro destino</h2>
              <p className={estilos.materiaisDescricao}>
                Explore alguns materiais do universo calçadista e veja possibilidades de reaproveitamento.
              </p>
            </div>

            <div className={estilos.explorador}>
              <div className={estilos.listaMateriais} role="group" aria-label="Escolha um material para visualizar">
                {materiais.map((item, index) => (
                  <button
                    key={item.nome}
                    type="button"
                    className={`${estilos.materialLink} ${index === materialAtivo ? estilos.materialLinkAtivo : ""}`}
                    aria-pressed={index === materialAtivo}
                    onMouseEnter={() => setMaterialAtivo(index)}
                    onFocus={() => setMaterialAtivo(index)}
                    onClick={() => setMaterialAtivo(index)}
                  >
                    <span className="flex items-center gap-4">
                      <img src={item.imagem} alt="" className="h-14 w-16 shrink-0 object-cover sm:h-16 sm:w-20" />
                      {item.nome}
                    </span>
                    <ArrowRight size={20} className={estilos.materialSeta} aria-hidden="true" />
                  </button>
                ))}
                <p className="max-w-[36ch] py-5 text-sm leading-6 text-white/80 sm:text-base">
                  A disponibilidade de cada lote depende das publicações das empresas.
                </p>
              </div>
              <figure className={estilos.imagemMaterial} aria-live="polite" aria-atomic="true">
                <img
                  key={material.imagem}
                  src={material.imagem}
                  alt={material.alt}
                  className={`${estilos.imagemMaterialImg} material-image-transition`}
                />
                <figcaption className={estilos.legendaMaterial}>{material.uso}</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="para-quem-e" className={`${estilos.margem} ${estilos.secao}`} aria-labelledby="titulo-publicos">
          <div className={estilos.cabecalhoSecao}>
            <h2 id="titulo-publicos" className={estilos.tituloSecao}>Duas pontas, um circuito local</h2>
            <p className={estilos.introSecao}>
              Cada conta tem um papel claro na circulação de materiais reaproveitáveis.
            </p>
          </div>
          <div className={`${estilos.publicos} mt-14`}>
            <article className={estilos.publico}>
              <Factory className={estilos.publicoIcone} strokeWidth={1.7} aria-hidden="true" />
              <h3 className={estilos.publicoTitulo}>Publicar materiais</h3>
              <p className={estilos.publicoTexto}>
                Cadastre uma conta empresarial para publicar lotes de materiais por venda ou doação.
              </p>
              <Link to="/cadastro-empresa" className={estilos.publicoLink}>
                Cadastrar empresa <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </article>
            <article className={estilos.publico}>
              <HandHeart className={estilos.publicoIcone} strokeWidth={1.7} aria-hidden="true" />
              <h3 className={estilos.publicoTitulo}>Encontrar materiais</h3>
              <p className={estilos.publicoTexto}>
                Crie uma conta pessoal para conhecer materiais publicados por empresas da região.
              </p>
              <Link to="/cadastro-pessoal" className={estilos.publicoLink}>
                Criar conta pessoal <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </section>

        <section className={estilos.chamada} aria-labelledby="titulo-chamada">
          <div className={`${estilos.margem} ${estilos.chamadaInterna}`}>
            <div>
              <h2 id="titulo-chamada" className={estilos.chamadaTitulo}>Um próximo uso começa aqui</h2>
              <p className={estilos.chamadaTexto}>
                Faça parte da rede local de reaproveitamento de materiais.
              </p>
              <Link to="/cadastro" className={`${estilos.chamadaLink} mt-6`}>
                Escolher tipo de conta <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <figure className="relative min-h-56 overflow-hidden sm:min-h-72">
              <img
                src="/retalho-couro-nobre.png"
                alt="Retalhos de couro que podem seguir para novos usos"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </figure>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
