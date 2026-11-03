import type { ReactNode } from "react";
import DashboardShell from "../../components/dashboard/DashboardShell";
import { ArrowUpRight } from "lucide-react";
import { companyStyles } from "./companyStyles";

export default function CompanyPage({ children }: { children: ReactNode; profile?: boolean }) {
  return <DashboardShell onSoon={() => undefined}><div className="workspace-editorial">{children}</div></DashboardShell>;
}

export function WorkspaceHeading({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description: string; children?: ReactNode }) {
  return <header className="workspace-heading"><div><p className="company-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="workspace-description">{description}</p></div>{children}</header>;
}

export function DemoNotice({ active, onToggle, children }: { active: boolean; onToggle: () => void; children: ReactNode }) {
  return <div className="workspace-demo"><div><span className="workspace-demo-dot" aria-hidden="true" /><div><p>{active ? "Você está explorando um exemplo" : "Uma visão do que vem pela frente"}</p><span>{children}</span></div></div><button type="button" className={companyStyles.secondary} aria-pressed={active} onClick={onToggle}>{active ? "Fechar exemplo" : "Visualizar exemplo"}<ArrowUpRight size={16} aria-hidden="true" /></button></div>;
}
