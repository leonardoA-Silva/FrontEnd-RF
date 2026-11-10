import { ArrowDown, ArrowUpRight, Handshake, Leaf, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CompanyPage from "../dashboard/CompanyPage";

function isCompanySession() {
  try {
    const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
    const role = raw ? (JSON.parse(raw) as { role?: string }).role : undefined;
    return Boolean(localStorage.getItem("token") ?? sessionStorage.getItem("token")) && (role === "company" || role === "admin");
  } catch { return false; }
}

function Story() {
  return <div className="about-story">
    <section className="about-intro" aria-labelledby="sobre-titulo"><div><p className="company-eyebrow">De Franca. Para novos começos.</p><h1 id="sobre-titulo">O que sobra<br />também pode<br /><em>aproximar.</em></h1></div><div className="about-intro-aside"><span className="about-edition">Nossa proposta · 01</span><p>Uma rede que conecta a indústria de Franca a quem encontra novas possibilidades em cada material.</p><a href="#nossa-proposta" className="about-down"><ArrowDown size={18} aria-hidden="true" />Conheça o projeto</a></div></section>
    <figure className="about-photo"><img src="/hero-leather-scraps.jpg" width={1440} height={800} alt="Retalhos de couro marrom, com diferentes tamanhos e texturas" fetchPriority="high" /><figcaption><span>Matéria que ainda tem muito a oferecer.</span><span><MapPin size={14} aria-hidden="true" />Franca, São Paulo</span></figcaption></figure>
    <section id="nossa-proposta" className="about-manifesto"><p className="company-eyebrow">Uma ideia que circula</p><div><h2>Entre o descarte<br />e a criação,<br /><em>existe uma conexão.</em></h2><div className="about-prose"><p>Franca tem uma história feita de trabalho, indústria e saber fazer. Dessa produção também surgem retalhos, aparas e sobras que ainda carregam valor.</p><p>O Reaproveita Franca nasce para aproximar empresas, artesãos, cooperativas e iniciativas locais. Um espaço para disponibilizar materiais e descobrir o que eles podem se tornar.</p><p>Acreditamos que transformar começa assim: enxergando possibilidades e conectando pessoas.</p></div></div></section>
    <section className="about-cycle" aria-label="Como a rede funciona">{[{ n: "01", Icon: Leaf, title: "Disponibilizar", text: "Empresas apresentam os materiais que sobram da produção para venda ou doação." }, { n: "02", Icon: Handshake, title: "Conectar", text: "Pessoas e iniciativas locais encontram materiais que podem fazer parte de uma nova criação." }, { n: "03", Icon: MapPin, title: "Transformar", text: "Novos encontros dão continuidade à história de cada material e fortalecem a rede local." }].map(({ n, Icon, title, text }) => <article key={n}><div><span>{n}</span><Icon size={24} strokeWidth={1.3} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></article>)}</section>
    <section className="about-invitation"><p className="company-eyebrow">O próximo ciclo pode começar com você</p><h2>Faça parte<br /><em>dessa história.</em></h2><Link to="/cadastro" className="about-cta">Encontrar meu lugar na rede<ArrowUpRight size={19} aria-hidden="true" /></Link><span>Da indústria para a criatividade.</span></section>
  </div>;
}

export default function SobreNos() {
  if (isCompanySession()) return <CompanyPage><Story /></CompanyPage>;
  return <div className="about-page"><a href="#sobre-conteudo" className="rf-skip">Pular para o conteúdo</a><Header /><main id="sobre-conteudo"><Story /></main><Footer /></div>;
}
