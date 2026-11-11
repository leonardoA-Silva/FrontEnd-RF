import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import WorkspaceFrame from "../../components/dashboard/WorkspaceFrame";
import { useCompany } from "./CompanyContext";

export default function CompanyShell({ children }: { children: ReactNode }) {
  const { preview, base, identity, notice, setNotice } = useCompany();
  const { pathname } = useLocation();
  const section = pathname.includes("/pagamentos") ? "Recebimentos" : pathname.includes("/enderecos") ? "Endereços" : pathname.includes("/reservas") ? "Reservas" : pathname.includes("/seguranca") ? "Segurança" : pathname.includes("/explorar") ? "Mapa" : pathname.includes("/mensagens") ? "Mensagens" : pathname.includes("/notificacoes") ? "Notificações" : pathname.includes("/conta") ? "Conta" : pathname.includes("/editar") ? "Editar material" : pathname.includes("/publicar") ? "Publicar material" : pathname.includes("/materiais/") ? "Detalhes" : pathname.endsWith("/materiais") ? "Anúncios" : "Início";
  return <WorkspaceFrame name={identity?.name || "Minha empresa"} section={section} preview={preview} base={base} accountTo={`${base}/perfil`}>
    <p className="company-mode">{preview ? "Prévia interativa · Alterações temporárias, sem API" : "Área da empresa"}</p>
    {notice && <div className="company-notice" role="status"><span>{notice}</span><button type="button" aria-label="Fechar aviso" onClick={() => setNotice("")}><X size={16} /></button></div>}{children}
  </WorkspaceFrame>;
}
