import { Factory, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const estatisticas = [
  { valor: "2.500 t", rotulo: "de material desviado de aterros" },
  { valor: "340", rotulo: "empresas parceiras conectadas" },
  { valor: "1.200", rotulo: "negociações concluídas" },
];

const passos = [
  {
    numero: "01",
    titulo: "A empresa publica o lote",
    texto:
      "Fotos, quantidade, condição e tipo — venda ou doação. A publicação é imediata, sem fila de aprovação.",
  },
  {
    numero: "02",
    titulo: "Alguém reserva o material",
    texto:
      "Artesãos, cooperativas e escolas pedem o que precisam. Quem publicou aceita ou recusa cada pedido.",
  },
  {
    numero: "03",
    titulo: "Retiram e fecham por aqui",
    texto:
      "Retirada combinada direto entre as partes. Vendas são pagas na plataforma com taxa de 5%; doações são isentas.",
  },
];

const materiais = [
  {
    imagem: "/retalho-couro-nobre.png",
    imagemAlt: "Pilha de retalhos de couro marrom",
    nome: "Couro curtido e nobre",
    uso: "Bolsas, cintos, carteiras e artigos de couro fino",
  },
  {
    imagem: "/retalho-nobuck-macio.png",
    imagemAlt: "Retalhos de tecido nobuck cinza dobrados",
    nome: "Nobuck e tecidos",
    uso: "Forros, acabamentos e peças têxteis",
  },
  {
    imagem: "/eva-camurca-premium.png",
    imagemAlt: "Placas azuis de EVA empilhadas",
    nome: "EVA e borrachas",
    uso: "Palmilhas, entressolas e artesanato em geral",
  },
];

const publicos = [
  {
    icone: Factory,
    titulo: "Gera resíduo na sua fábrica?",
    texto:
      "Publique lotes de retalhos em minutos e dê um destino — venda ou doação — para o que iria para o aterro.",
    cta: "Cadastrar empresa",
    imagem: "/hero-leather-scraps.jpg",
    imagemAlt: "Retalhos de couro sobre mesa de madeira",
  },
  {
    icone: HandHeart,
    titulo: "Procura material bom e barato?",
    texto:
      "Reserve couro, EVA e tecidos de indústrias do polo calçadista de Franca, perto de você.",
    cta: "Criar conta de comprador",
    imagem: "/retalho-couro-nobre.png",
    imagemAlt: "Pilha de retalhos de couro marrom",
  },
];

// Colagem de retalhos: fotos reais dos materiais, cortadas em formas
// orgânicas e contornadas por linha tracejada — como peças traçadas
// a giz numa mesa de corte, antes do corte.
const retalhos = [
  {
    src: "/hero-leather-scraps.jpg",
    alt: "Retalhos de couro sobre mesa de madeira",
    etiqueta: "Couro curtido · lote de 150 kg",
    peca: "left-0 top-0 h-[64%] w-[62%] rotate-1 rounded-[58%_42%_55%_45%/45%_58%_42%_55%]",
  },
  {
    src: "/retalho-couro-nobre.png",
    alt: "Pilha de retalhos de couro marrom",
    etiqueta: "Couro nobre",
    peca: "right-0 top-3 h-[42%] w-[44%] -rotate-2 rounded-[42%_58%_45%_55%/55%_42%_58%_42%]",
  },
  {
    src: "/eva-camurca-premium.png",
    alt: "Placas azuis de EVA empilhadas",
    etiqueta: "EVA camurça premium",
    peca: "bottom-0 right-[13%] h-[36%] w-[40%] rotate-2 rounded-[55%_45%_60%_40%/40%_55%_45%_60%]",
  },
  {
    src: "/retalho-nobuck-macio.png",
    alt: "Retalhos de tecido nobuck cinza dobrados",
    etiqueta: "Nobuck macio",
    peca: "bottom-3 left-[3%] h-[27%] w-[31%] -rotate-1 rounded-[45%_55%_42%_58%/58%_45%_55%_42%]",
  },
];

export default function Home() {
  const styles = {
    pagina: "flex min-h-screen flex-col bg-papel text-carvao",

    hero: "mx-auto w-full max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20",
    heroGrade: "grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]",
    heroEtiqueta: "text-sm font-semibold text-canela-escura",
    heroTitulo:
      "mt-4 font-display text-[2.4rem] font-semibold leading-[1.04] tracking-[-0.01em] text-carvao sm:text-5xl lg:text-[3.4rem]",
    heroDescricao:
      "mt-5 max-w-lg text-[17px] leading-relaxed text-carvao-suave",
    heroBotoes: "mt-8 flex flex-wrap gap-3.5",
    botaoPrimario:
      "rounded-xl bg-canela px-6 py-3.5 text-[15px] font-semibold text-cru no-underline shadow-sm transition hover:bg-canela-escura",
    botaoSecundario:
      "rounded-xl border-2 border-carvao/15 px-6 py-3.5 text-[15px] font-semibold text-carvao no-underline transition hover:border-carvao/40 hover:bg-areia-clara",

    colagem: "relative mx-auto h-[280px] max-w-lg sm:h-[340px] lg:h-[440px]",
    peca: "absolute overflow-hidden shadow-lg outline-2 outline-dashed outline-canela/50 outline-offset-[6px] animate-assentar [animation-delay:150ms]",
    pecaImagem: "h-full w-full object-cover",
    pecaEtiqueta:
      "absolute bottom-3 left-4 flex items-center gap-1.5 rounded-md border border-areia bg-cru/95 px-2.5 py-1.5 text-xs font-semibold text-carvao shadow-sm",
    pecaEtiquetaPonto: "h-2 w-2 shrink-0 rounded-full bg-canela",

    faixa: "bg-carvao text-cru",
    faixaConteudo: "mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-3 sm:px-8",
    faixaItem: "",
    faixaItemComDivisor: "sm:border-l sm:border-dashed sm:border-cru/25 sm:pl-8",
    faixaValor: "font-display text-4xl font-semibold tracking-tight",
    faixaRotulo: "mt-1.5 text-sm leading-snug text-cru/70",

    secao: "mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8",
    secaoTitulo:
      "font-display text-3xl font-semibold tracking-tight text-carvao sm:text-4xl",
    secaoDescricao: "mt-3 max-w-xl text-[15px] leading-relaxed text-carvao-suave",

    passosGrade: "mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8",
    passo: "relative",
    passoConector:
      "absolute -right-8 top-6 hidden w-8 border-t-2 border-dashed border-areia lg:block",
    passoNumero: "font-display text-4xl font-semibold text-canela",
    passoTitulo: "mt-3 text-lg font-bold text-carvao",
    passoTexto: "mt-2 text-[15px] leading-relaxed text-carvao-suave",

    materiaisGrade: "mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
    materialCartao: "overflow-hidden rounded-2xl border border-areia bg-cru",
    materialImagem: "h-44 w-full object-cover",
    materialCorpo: "p-5",
    materialNome: "font-display text-lg font-semibold text-carvao",
    materialUso: "mt-1.5 text-sm leading-relaxed text-carvao-suave",

    publicosGrade: "mt-10 grid gap-6 lg:grid-cols-2",
    publicoCartao: "overflow-hidden rounded-2xl border border-areia bg-cru",
    publicoImagem: "h-40 w-full object-cover",
    publicoCorpo: "p-6 sm:p-8",
    publicoIcone:
      "flex h-11 w-11 items-center justify-center rounded-xl bg-canela/10 text-canela",
    publicoTitulo: "mt-4 font-display text-xl font-semibold text-carvao",
    publicoTexto: "mt-2 text-[15px] leading-relaxed text-carvao-suave",
    publicoCta:
      "mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-canela no-underline transition-all hover:gap-2.5 hover:text-canela-escura",

    depoimento: "mx-auto max-w-3xl px-5 py-16 text-center sm:px-8",
    depoimentoTexto:
      "font-display text-2xl font-medium italic leading-snug tracking-[-0.005em] text-carvao sm:text-[2rem]",
    depoimentoAutor: "mt-5 text-sm font-semibold text-canela-escura",

    faixaCta: "bg-canela",
    faixaCtaInterna: "mx-auto max-w-6xl px-5 py-16 sm:px-8",
    faixaCtaMoldura:
      "rounded-3xl border-2 border-dashed border-cru/50 px-6 py-12 text-center sm:px-12",
    faixaCtaTitulo: "font-display text-3xl font-semibold text-cru sm:text-4xl",
    faixaCtaTexto: "mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-cru/80",
    faixaCtaBotao:
      "mt-8 inline-block rounded-xl bg-carvao px-7 py-3.5 text-[15px] font-semibold text-cru no-underline transition hover:bg-black",
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main>
        {/* Hero — texto à esquerda, retalhos "traçados" à direita */}
        <section className={styles.hero}>
          <div className={styles.heroGrade}>
            <div className="animate-assentar">
              <p className={styles.heroEtiqueta}>
                Economia circular · Polo calçadista de Franca
              </p>
              <h1 className={styles.heroTitulo}>
                O que sobra da fábrica vira matéria-prima de alguém.
              </h1>
              <p className={styles.heroDescricao}>
                Conectamos curtumes e indústrias de calçado a artesãos,
                cooperativas e escolas que procuram couro, EVA, nobuck e
                outros retalhos — por venda ou doação.
              </p>
              <div className={styles.heroBotoes}>
                <Link to="/cadastro" className={styles.botaoPrimario}>
                  Publicar material
                </Link>
                <a href="#materiais" className={styles.botaoSecundario}>
                  Ver materiais
                </a>
              </div>
            </div>

            <div className={styles.colagem}>
              {retalhos.map(({ src, alt, etiqueta, peca }) => (
                <figure key={src} className={`${styles.peca} ${peca}`}>
                  <img src={src} alt={alt} className={styles.pecaImagem} />
                  <figcaption className={styles.pecaEtiqueta}>
                    <span className={styles.pecaEtiquetaPonto} />
                    {etiqueta}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Faixa de números — divisores tracejados, como linha de corte */}
        <section className={styles.faixa} aria-label="Impacto da plataforma">
          <div className={styles.faixaConteudo}>
            {estatisticas.map(({ valor, rotulo }, i) => (
              <div
                key={rotulo}
                className={i > 0 ? styles.faixaItemComDivisor : styles.faixaItem}
              >
                <p className={styles.faixaValor}>{valor}</p>
                <p className={styles.faixaRotulo}>{rotulo}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Como funciona — sequência real, por isso numerada */}
        <section className={styles.secao} id="como-funciona">
          <h2 className={styles.secaoTitulo}>Do lote ao ateliê em três passos</h2>
          <div className={styles.passosGrade}>
            {passos.map(({ numero, titulo, texto }, i) => (
              <div key={numero} className={styles.passo}>
                {i < passos.length - 1 && (
                  <span className={styles.passoConector} aria-hidden="true" />
                )}
                <p className={styles.passoNumero}>{numero}</p>
                <p className={styles.passoTitulo}>{titulo}</p>
                <p className={styles.passoTexto}>{texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Materiais que circulam */}
        <section className={styles.secao} id="materiais">
          <h2 className={styles.secaoTitulo}>O que circula por aqui</h2>
          <p className={styles.secaoDescricao}>
            Categorias que mais aparecem nos lotes publicados pelas indústrias
            de Franca.
          </p>
          <div className={styles.materiaisGrade}>
            {materiais.map(({ imagem, imagemAlt, nome, uso }) => (
              <article key={nome} className={styles.materialCartao}>
                <img src={imagem} alt={imagemAlt} loading="lazy" className={styles.materialImagem} />
                <div className={styles.materialCorpo}>
                  <h3 className={styles.materialNome}>{nome}</h3>
                  <p className={styles.materialUso}>{uso}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Para quem é */}
        <section className={styles.secao} id="para-quem-e">
          <h2 className={styles.secaoTitulo}>Para quem é a plataforma</h2>
          <div className={styles.publicosGrade}>
            {publicos.map(
              ({ icone: Icone, titulo, texto, cta, imagem, imagemAlt }) => (
                <article key={titulo} className={styles.publicoCartao}>
                  <img src={imagem} alt={imagemAlt} loading="lazy" className={styles.publicoImagem} />
                  <div className={styles.publicoCorpo}>
                    <span className={styles.publicoIcone}>
                      <Icone className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h3 className={styles.publicoTitulo}>{titulo}</h3>
                    <p className={styles.publicoTexto}>{texto}</p>
                    <Link to="/cadastro" className={styles.publicoCta}>
                      {cta}
                    </Link>
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        {/* Depoimento */}
        <section className={styles.depoimento} aria-label="Depoimento em destaque">
          <blockquote>
            <p className={styles.depoimentoTexto}>
              &ldquo;Os retalhos que iriam para o lixo viraram bolsas e
              carteiras exclusivas. O Reaproveita Franca impulsionou meu
              ateliê.&rdquo;
            </p>
            <footer className={styles.depoimentoAutor}>
              — Silvana M., artesã de Franca
            </footer>
          </blockquote>
        </section>

        {/* Faixa de chamada final — moldura tracejada "recorte aqui" */}
        <section className={styles.faixaCta} aria-label="Criar conta">
          <div className={styles.faixaCtaInterna}>
            <div className={styles.faixaCtaMoldura}>
              <h2 className={styles.faixaCtaTitulo}>
                Cada retalho merece uma segunda chance.
              </h2>
              <p className={styles.faixaCtaTexto}>
                Crie sua conta hoje e comece a publicar lotes ou reservar
                material de indústrias do polo calçadista.
              </p>
              <Link to="/cadastro" className={styles.faixaCtaBotao}>
                Criar conta grátis
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
