import { ArrowRight, Handshake, Leaf, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CompanyPage from "../dashboard/CompanyPage";

function isCompanySession() {
  try {
    const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
    const role = raw ? (JSON.parse(raw) as { role?: string }).role : undefined;
    return Boolean(localStorage.getItem("token") ?? sessionStorage.getItem("token")) && (role === "company" || role === "admin");
  } catch {
    return false;
  }
}

function Conteudo() {
  const styles = {
    section: "mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16",
    eyebrow: "text-xs font-bold uppercase tracking-[0.18em] text-canela",
    title: "mt-4 text-4xl font-bold leading-tight tracking-tight text-verde-escuro sm:text-5xl",
    text: "mt-5 max-w-xl text-base leading-relaxed text-tinta-suave",
    button: "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-verde px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-verde-escuro",
    secondary: "inline-flex min-h-11 items-center justify-center rounded-lg border border-linha px-5 py-3 text-sm font-semibold text-verde-escuro transition-colors hover:bg-verde-claro",
  };
  return <>
    <section className={styles.section} aria-labelledby="missao-titulo"><div><p className={styles.eyebrow}>Sobre nós · Franca, SP</p><h1 id="missao-titulo" className={styles.title}>Nossa Missão</h1><p className={styles.text}>Conectar empresas que têm materiais disponíveis a pessoas que enxergam novas possibilidades. O Reaproveita Franca nasce para aproximar a indústria local de artesãos, cooperativas e iniciativas de reaproveitamento.</p><p className={styles.text}>Um retalho pode ser o começo de uma nova peça. Uma sobra pode encontrar outra utilidade. Acreditamos na força dessas conexões para construir uma economia mais circular em Franca.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/mapaEmpresas" className={styles.button}>Explorar materiais<ArrowRight size={17} aria-hidden="true" /></Link><a href="#como-participar" className={styles.secondary}>Como participar</a></div></div><figure className="relative"><img src="/hero-leather-scraps.jpg" alt="Retalhos de couro de diferentes cores e texturas, materiais com potencial de reaproveitamento" width={640} height={560} className="aspect-[6/5] w-full rounded-2xl object-cover" /><figcaption className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl bg-cru/95 px-4 py-3 text-sm font-semibold text-verde-escuro"><MapPin size={18} aria-hidden="true" />Da indústria de Franca para novas possibilidades.</figcaption></figure></section>
    <section id="como-participar" aria-labelledby="participar-titulo" className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-20"><p className={styles.eyebrow}>Conexões que transformam</p><h2 id="participar-titulo" className="mt-3 text-2xl font-bold tracking-tight text-verde-escuro sm:text-3xl">Cada pessoa faz parte desse ciclo</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{[{ icon: Leaf, title: "Empresas disponibilizam", text: "Empresas podem cadastrar materiais para venda ou doação e apresentar suas características." }, { icon: Handshake, title: "A comunidade descobre", text: "Artesãos, cooperativas e outras iniciativas encontram possibilidades de reaproveitamento." }, { icon: MapPin, title: "Franca se conecta", text: "Um projeto pensado a partir da realidade da indústria local e do valor de seus materiais." }].map(({ icon: Icon, title, text }) => <article key={title} className="rounded-xl border border-linha bg-white p-6"><Icon size={26} className="text-verde" aria-hidden="true" /><h3 className="mt-5 font-bold text-verde-escuro">{title}</h3><p className="mt-3 text-sm leading-relaxed text-tinta-suave">{text}</p></article>)}</div></section>
    <section className="rounded-2xl bg-mata px-5 py-12 text-center text-white sm:px-8 sm:py-16"><Leaf size={30} className="mx-auto text-white/70" aria-hidden="true" /><h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Faça parte da economia circular de Franca</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/80">Junte-se a essa rede e ajude materiais com potencial a encontrar um novo destino.</p><Link to="/cadastro" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-cru px-6 py-3 text-sm font-bold text-verde-escuro transition-colors hover:bg-verde-claro">Cadastre-se na plataforma<ArrowRight size={17} aria-hidden="true" /></Link></section>
  </>;
}

export default function SobreNos() {
  if (isCompanySession()) return <CompanyPage><Conteudo /></CompanyPage>;
  return <div className="flex min-h-screen flex-col bg-bruma"><Header /><main className="flex-1"><Conteudo /></main><Footer /></div>;
}
