import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";

export default function About() {
  const { isLoggedIn } = useLoggedUser();
  return <div className="flex min-h-screen flex-col bg-canvas font-app text-ink"><Header /><main className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-5 py-12 sm:px-8 lg:py-20">
    <header className="max-w-3xl space-y-5"><p className="text-sm font-bold uppercase tracking-wider text-accent">Sobre nós</p><h1 className={s.title}>Novos ciclos para os materiais de Franca.</h1><p className="text-lg leading-relaxed text-muted">O Reaproveita Franca conecta empresas geradoras de excedentes industriais a compradores e artesãos que podem dar um novo destino a esses materiais.</p></header>
    <section className="grid gap-5 md:grid-cols-3">{[["Conectar", "Aproximamos quem tem materiais disponíveis de quem busca matéria-prima para criar."], ["Reaproveitar", "Materiais publicados para venda ou doação podem continuar em uso em novos projetos."], ["Fortalecer o circuito local", "Valorizamos a indústria e o trabalho criativo da comunidade de Franca."]].map(([title, copy]) => <article className={`${s.panel} space-y-3`} key={title}><h2 className={s.subtitle}>{title}</h2><p className={s.copy}>{copy}</p></article>)}</section>
    <section className="rounded-2xl bg-primary p-7 text-white sm:p-10"><h2 className="font-display text-2xl font-bold">Sua próxima criação pode começar aqui.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">Explore os materiais disponíveis e conheça as possibilidades de reaproveitamento.</p><div className="mt-6 flex flex-wrap gap-3"><Link to="/marketplace" className="rounded-full bg-surface px-6 py-3 text-sm font-bold text-primary">Explorar marketplace</Link>{!isLoggedIn && <Link to="/cadastro" className="rounded-full border border-white/40 px-6 py-3 text-sm font-bold">Cadastrar-se gratuitamente</Link>}</div></section>
  </main><Footer /></div>;
}
