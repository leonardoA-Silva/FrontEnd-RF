import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import Brand from "./Brand";

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="home-header">
      <a href="#conteudo" className="rf-skip">Pular para o conteúdo</a>
      <div className="home-container home-header-inner">
        <Brand />
        <nav aria-label="Navegação principal" className="home-desktop-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "is-active" : ""}>Início</NavLink>
          <a href="/#sobre">Nossa proposta</a>
          <a href="/#materiais">Materiais</a>
        </nav>
        <div className="home-header-actions">
          <Link to="/login" className="home-login">Entrar</Link>
          <Link to="/cadastro" className="home-button home-button-small">Criar conta <ArrowUpRight size={16} /></Link>
          <button type="button" className="home-menu-toggle" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="home-mobile-nav" onClick={() => setOpen(value => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
      </div>
      {open && <nav id="home-mobile-nav" aria-label="Navegação no celular" className="home-mobile-nav" onKeyDown={event => { if (event.key === "Escape") { close(); document.querySelector<HTMLButtonElement>(".home-menu-toggle")?.focus(); } }}><Link to="/" onClick={close}>Início</Link><a href="/#sobre" onClick={close}>Nossa proposta</a><a href="/#materiais" onClick={close}>Materiais</a><Link to="/login" onClick={close}>Entrar na minha conta</Link></nav>}
    </header>
  );
}
