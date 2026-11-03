import { useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Leaf, Pause, PencilLine, Play, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import HeroSculpture from "./components/HeroSculpture";
import { useHomeMotion } from "./useHomeMotion";

const materials = [
  { number: "01", name: "Couro", description: "Resistente, versátil e cheio de novas possibilidades.", swatch: "leather" },
  { number: "02", name: "Tecidos", description: "Texturas que se reinventam em cada criação.", swatch: "fabric" },
  { number: "03", name: "EVA", description: "Leveza e novas formas para múltiplos usos.", swatch: "foam" },
];
const steps = [
  { icon: UserRound, title: "Escolha seu perfil", description: "Uma conta de empresa ou pessoal, de acordo com a sua participação." },
  { icon: PencilLine, title: "Crie sua conta", description: "Preencha seus dados e confirme seu e-mail para começar." },
  { icon: Leaf, title: "Faça parte da rede", description: "Aproxime sua empresa ou suas ideias de novas possibilidades." },
];

export default function Home() {
  const [paused, setPaused] = useState(false);
  const root = useHomeMotion(paused);
  return (
    <div ref={root} className={`home-page ${paused ? "home-motion-paused" : ""}`}>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <section className="home-hero home-container" aria-labelledby="hero-title">
          <div className="home-hero-copy">
            <p className="home-eyebrow">Economia circular em Franca</p>
            <h1 id="hero-title">O fim de<br />um ciclo.<br /><em>O começo</em><br />de outro.</h1>
            <p className="home-hero-description">O que sobra na indústria pode ser o início da sua próxima criação.</p>
            <Link to="/cadastro" className="home-button">Quero fazer parte <ArrowUpRight size={17} /></Link>
          </div>
          <HeroSculpture paused={paused} />
          <a href="#sobre" className="home-scroll-cue" aria-label="Conhecer a proposta"><ArrowDown size={19} /></a>
        </section>

        <div className="home-container home-material-strip" aria-label="Materiais reaproveitáveis">
          <span className="home-strip-rule" />
          {[...materials, { name: "Madeira", swatch: "wood" }].map(item => <span key={item.name} className="home-strip-item"><span className={`home-swatch home-swatch-${item.swatch}`} aria-hidden="true" />{item.name === "EVA" ? "EVA e borracha" : item.name}</span>)}
          <span className="home-strip-rule" />
        </div>

        <section id="sobre" className="home-story" aria-labelledby="story-title">
          <div className="home-container home-story-heading" data-reveal>
            <p className="home-eyebrow">Uma ideia que circula</p>
            <h2 id="story-title">Tudo pode<br />ganhar outra forma.</h2>
            <p>Conectamos empresas de Franca, artesãos e cooperativas para transformar sobras da indústria em novas possibilidades.</p>
          </div>
          <div className="home-container home-story-art"><img src="/images/home/transformation.webp" alt="Possibilidade ilustrativa: retalhos de couro, peças em criação e uma bolsa pronta" width="1800" height="744" loading="lazy" /></div>
          <div className="home-container home-story-stages">
            {[{ title: "Matéria", text: "O que seria descartado ganha um novo destino." }, { title: "Ideia", text: "A criatividade conecta materiais e pessoas." }, { title: "Nova história", text: "Novas criações, mais possibilidades e menos desperdício." }].map((item, index) => <div key={item.title} data-reveal><span className="home-stage-number">0{index + 1}</span><h3 className="home-serif">{item.title}</h3><p>{item.text}</p></div>)}
          </div>
          <p className="home-container home-illustration-note">Possibilidade ilustrativa de reaproveitamento.</p>
        </section>

        <section id="materiais" className="home-materials" aria-labelledby="materials-title">
          <div className="home-container">
            <div className="home-materials-heading" data-reveal><div><p className="home-eyebrow">Materiais</p><h2 id="materials-title">Sinta as possibilidades.</h2></div><p>Sobras da indústria podem ganhar novas histórias nas mãos de quem transforma.</p></div>
            <div className="home-gallery-art"><img src="/images/home/materials.webp" alt="Composições de couro, tecido e placas de EVA sobre um fundo verde" width="1800" height="600" loading="lazy" /></div>
            <div className="home-material-descriptions">{materials.map(item => <article key={item.name} data-reveal><span className="home-eyebrow">{item.number}</span><h3 className="home-serif">{item.name}</h3><p>{item.description}</p></article>)}</div>
            <p className="home-illustration-note">Composições ilustrativas. Não representam anúncios ou estoque disponível.</p>
          </div>
        </section>

        <section className="home-container home-steps" aria-labelledby="steps-title">
          <div data-reveal><p className="home-eyebrow">Como fazer parte</p><h2 id="steps-title">Seu próximo ciclo<br />começa aqui.</h2></div>
          <ol>{steps.map(({ icon: Icon, title, description }, index) => <li key={title} data-reveal><div className="home-step-icon"><Icon size={26} strokeWidth={1.3} />{index < steps.length - 1 && <ArrowRight size={21} className="home-step-arrow" strokeWidth={1} />}</div><span className="home-step-number">0{index + 1}</span><h3 className="home-serif">{title}</h3><p>{description}</p></li>)}</ol>
        </section>

        <section className="home-closing" aria-labelledby="closing-title"><div className="home-container home-closing-inner"><div className="home-closing-copy" data-reveal><p className="home-eyebrow">Economia circular em ação</p><h2 id="closing-title">O futuro não<br />se descarta.<br /><em>Se transforma.</em></h2><Link to="/cadastro" className="home-button">Criar minha conta <ArrowUpRight size={17} /></Link></div><img className="home-closing-art" src="/images/home/hero.webp" alt="" width="1600" height="1067" loading="lazy" /></div></section>
      </main>
      <Footer />
      <button type="button" className="home-motion-control" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? <Play size={13} /> : <Pause size={13} />}<span>{paused ? "Retomar movimentos" : "Pausar movimentos"}</span></button>
    </div>
  );
}
