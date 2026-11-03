import { useContext, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import WorkspaceFrame from "./WorkspaceFrame";
import { CompanyContext } from "../../pages/company/CompanyContext";

interface Props {
  children: ReactNode;
  active?: "materiais" | "publicar" | "perfil";
  onSoon: (tela: string) => void;
  sidebar?: ReactNode;
  showSidebar?: boolean;
}
export default function DashboardShell({ children, sidebar }: Props) {
  const company = useContext(CompanyContext);
  const preview = company?.preview ?? false;
  const base = company?.base ?? "/dashboardEmpresa";
  const { displayName } = useLoggedUser({ fallbackName: "Minha empresa", previewName: preview ? "Empresa demonstrativa" : undefined });
  const { pathname } = useLocation();
  const section = pathname === "/sobre" ? "Sobre o projeto" : pathname.includes("indicadores") ? "Impacto coletivo" : pathname.includes("negociacoes") ? "Negociações" : pathname.includes("perfil") ? "Minha conta" : pathname.includes("mapa") || pathname.includes("explorar") ? "Explorar Franca" : "Materiais";
  return <WorkspaceFrame name={company?.identity?.name ?? displayName} section={section} preview={preview} base={base} accountTo={`${base}/perfil`} sidePanel={sidebar}><div className={sidebar ? "workspace-map-content" : "workspace-page"}>{children}</div></WorkspaceFrame>;
}
