import { useEffect, useRef, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowLeft, ChartNoAxesCombined, Compass, History, Layers3, LogOut, MapPin, Plus, UserRound } from "lucide-react";
import LegalLinks from "../LegalLinks";

interface Props {
  children: ReactNode;
  name: string;
  section: string;
  preview?: boolean;
  base?: string;
  navigation?: ReactNode;
  sidePanel?: ReactNode;
  accountTo?: string;
  user?: boolean;
}

export default function WorkspaceFrame({ children, name, section, preview = false, base = "/dashboardEmpresa", navigation, sidePanel, accountTo, user = false }: Props) {
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (nav && active) nav.scrollLeft = active.offsetLeft - nav.offsetLeft - (nav.clientWidth - active.clientWidth) / 2;
  }, [section]);
  function exit() {
    if (!preview) for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem("token"); storage.removeItem("user"); storage.removeItem("tipoUsuario");
    }
    navigate("/login");
  }
  const items = [
    { to: base, label: "Materiais", Icon: Layers3, end: true },
    { to: `${base}/publicar`, label: "Publicar", Icon: Plus },
    { to: preview ? `${base}/explorar` : "/mapaEmpresas", label: "Explorar", Icon: MapPin },
    { to: `${base}/indicadores`, label: "Impacto", Icon: ChartNoAxesCombined },
    { to: `${base}/negociacoes`, label: "Negociações", Icon: History },
    { to: `${base}/perfil`, label: "Conta", Icon: UserRound },
  ];
  return <div className={`company-app workspace-frame ${user ? "workspace-user" : ""}`}>
    <a href="#conteudo" className="rf-skip">Pular para o conteúdo</a>
    <aside className="company-rail">
      <Link to={user ? (preview ? "/previa/dashboard/usuario" : "/dashboardUsuario") : base} className="company-monogram" aria-label="Reaproveita Franca — painel">r<span>.</span></Link>
      <nav ref={navRef} aria-label={user ? "Área do usuário" : "Área da empresa"}>{navigation ?? items.map(({ to, label, Icon, end }) => <NavLink key={to} to={to} end={end}><Icon size={23} strokeWidth={1.5} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
      <button type="button" className="company-exit" onClick={exit}><LogOut size={21} strokeWidth={1.5} aria-hidden="true" /><span>{preview ? "Sair da prévia" : "Sair"}</span></button>
    </aside>
    <div className="company-workspace">
      <header className="company-topbar"><Link to="/" className="company-wordmark">reaproveita<span>.</span><small>FRANCA</small></Link><div className="company-breadcrumb"><span>{user ? "Meu espaço" : "Minha empresa"}</span><span>/</span><span>{section}</span></div><div className="workspace-account"><Link to="/sobre" className="workspace-about">Sobre o projeto</Link>{accountTo ? <Link to={accountTo} className="company-user" aria-label={`Conta de ${name}`}><span><UserRound size={17} aria-hidden="true" /></span><span>{name}</span></Link> : <span className="company-user"><span><Compass size={17} aria-hidden="true" /></span><span>{name}</span></span>}<button type="button" className="workspace-mobile-exit" onClick={exit} aria-label={preview ? "Sair da prévia" : "Sair"}><LogOut size={20} strokeWidth={1.5} aria-hidden="true" /></button></div></header>
      <main id="conteudo" tabIndex={-1} className={sidePanel ? "workspace-map-layout" : "company-main"}>{sidePanel ? <><aside className="workspace-map-panel">{sidePanel}</aside><div className="workspace-map-canvas">{children}</div></> : children}</main>
      <footer className="company-footer"><span>© {new Date().getFullYear()} Reaproveita Franca.</span><Link to="/" className="company-inline-link"><ArrowLeft size={12} aria-hidden="true" /> Voltar ao site</Link><LegalLinks /></footer>
    </div>
  </div>;
}
