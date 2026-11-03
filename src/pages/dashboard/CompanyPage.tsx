import { useState, type ReactNode } from "react";
import DashboardShell from "../../components/dashboard/DashboardShell";
import AvisoEmBreve from "../../components/dashboard/AvisoEmBreve";
import { Info } from "lucide-react";
import { companyStyles } from "./companyStyles";

export default function CompanyPage({ children, profile = false }: { children: ReactNode; profile?: boolean }) {
  const [notice, setNotice] = useState<string | null>(null);
  return <DashboardShell active={profile ? "perfil" : undefined} showSidebar={profile} onSoon={setNotice}>
    {notice && <AvisoEmBreve texto={notice} onFechar={() => setNotice(null)} />}
    <div className="mx-auto w-full max-w-7xl">{children}</div>
  </DashboardShell>;
}

export function DemoNotice({ active, onToggle, children }: { active: boolean; onToggle: () => void; children: ReactNode }) {
  return <div className="my-6 flex flex-col gap-4 rounded-xl border border-linha bg-verde-claro/60 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
      <Info className="mt-0.5 shrink-0 text-verde" size={20} aria-hidden="true" />
      <div className="text-sm leading-relaxed text-verde-escuro"><p className="font-bold">{active ? "Demonstração · dados fictícios" : "Dados ainda não disponíveis"}</p><p className="mt-1">{children}</p></div>
    </div>
    <button type="button" className={`${companyStyles.secondary} shrink-0`} aria-pressed={active} onClick={onToggle}>{active ? "Sair da demonstração" : "Visualizar exemplo"}</button>
  </div>;
}
