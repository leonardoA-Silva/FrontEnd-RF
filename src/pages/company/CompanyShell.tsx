import type { ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Layers3, LogOut, Plus, UserRound, X } from "lucide-react";
import { useCompany } from "./CompanyContext";

export default function CompanyShell({ children }: { children: ReactNode }) {
  const { preview, base, identity, notice, setNotice } = useCompany();
  const location = useLocation();
  const navigate = useNavigate();
  const section = location.pathname.includes("/conta") ? "Conta" : location.pathname.includes("/editar") ? "Editar material" : location.pathname.includes("/publicar") ? "Publicar material" : location.pathname.includes("/materiais/") ? "Detalhes" : "Materiais";
  function exit() {
    if (!preview) for (const storage of [localStorage, sessionStorage]) { storage.removeItem("token"); storage.removeItem("user"); storage.removeItem("tipoUsuario"); }
    navigate("/login");
  }
  return <div className="company-app">
    <a href="#conteudo" className="rf-skip">Pular para o conteúdo</a>
    <aside className="company-rail"><Link to={base} className="company-monogram" aria-label="Reaproveita Franca — materiais">r<span>.</span></Link><nav aria-label="Área da empresa">
      <NavLink to={base} end><Layers3 size={23} strokeWidth={1.5} /><span>Materiais</span></NavLink>
      <NavLink to={`${base}/publicar`}><Plus size={25} strokeWidth={1.5} /><span>Publicar</span></NavLink>
      <NavLink to={`${base}/conta`}><UserRound size={23} strokeWidth={1.5} /><span>Conta</span></NavLink>
    </nav><button type="button" className="company-exit" onClick={exit}><LogOut size={21} strokeWidth={1.5} /><span>{preview ? "Sair da prévia" : "Sair"}</span></button></aside>
    <div className="company-workspace"><header className="company-topbar"><Link to="/" className="company-wordmark">reaproveita<span>.</span><small>FRANCA</small></Link><div className="company-breadcrumb"><span>Minha empresa</span><span>/</span><span>{section}</span></div><Link to={`${base}/conta`} className="company-user"><span><UserRound size={17} /></span><span>{identity?.name || "Minha empresa"}</span></Link></header>
      <main id="conteudo" tabIndex={-1} className="company-main"><p className="company-mode">{preview ? "Prévia interativa · Alterações temporárias, sem API" : "Área da empresa"}</p>
        {notice && <div className="company-notice" role="status"><span>{notice}</span><button type="button" aria-label="Fechar aviso" onClick={() => setNotice("")}><X size={16} /></button></div>}{children}
      </main><footer className="company-footer"><span>© {new Date().getFullYear()} Reaproveita Franca.</span><Link to="/" className="company-inline-link"><ArrowLeft size={12} /> Voltar ao site</Link></footer></div>
  </div>;
}
