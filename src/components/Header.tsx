import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, X, UserRound, LogOut } from "lucide-react";
import Brand from "./Brand";
import { useLoggedUser } from "../hooks/useLoggedUser";

export default function Header({ variant = "default" }: { variant?: "default" | "marketplace" | "about" }) {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, role, displayName, logout } = useLoggedUser();
  const navigate = useNavigate();
  const dashboard = role === "company" ? "/dashboardEmpresa" : "/dashboardUsuario";
  const close = () => setOpen(false);
  const exit = () => { logout(); close(); navigate("/login"); };
  const links = [{ to: "/", label: "Início" }, { to: "/marketplace", label: "Marketplace" }, { to: "/sobre-nos", label: "Sobre nós" }];
  return <header className="home-header" data-variant={variant}>
    <div className="home-container home-header-inner"><Brand />
      <nav aria-label="Navegação principal" className="home-desktop-nav">{links.map(link => <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? "is-active" : ""}>{link.label}</NavLink>)}</nav>
      <div className="home-header-actions">{isLoggedIn ? <><Link to={dashboard} className="buyer-account-link"><UserRound size={18} aria-hidden="true" /><span>{displayName || "Minha conta"}</span></Link><button type="button" onClick={exit} className="buyer-header-exit" aria-label="Sair da conta"><LogOut size={18} /></button></> : <><Link to="/login" className="home-login">Entrar</Link><Link to="/cadastro" className="home-button home-button-small">Criar conta <ArrowUpRight size={16} aria-hidden="true" /></Link></>}
      <button type="button" className="home-menu-toggle" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="home-mobile-nav" onClick={() => setOpen(value => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div>{open && <nav id="home-mobile-nav" aria-label="Navegação no celular" className="home-mobile-nav" onKeyDown={event => { if (event.key === "Escape") { close(); document.querySelector<HTMLButtonElement>(".home-menu-toggle")?.focus(); } }}>{links.map(link => <Link key={link.to} to={link.to} onClick={close}>{link.label}</Link>)}<Link to={isLoggedIn ? dashboard : "/login"} onClick={close}>{isLoggedIn ? "Minha conta" : "Entrar na minha conta"}</Link></nav>}
  </header>;
}
