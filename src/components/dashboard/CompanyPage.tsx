import { useState, type ReactNode } from "react";
import DashboardShell from "./DashboardShell";
import AvisoEmBreve from "./AvisoEmBreve";

import { companyStyles } from "./companyStyles";

export default function CompanyPage({ title, description, loading, error, reload, children }: {
  title: string; description: string; loading?: boolean; error?: string; reload?: () => void; children: ReactNode;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  return <DashboardShell onSoon={setNotice}>
    {notice && <AvisoEmBreve texto={notice} onFechar={() => setNotice(null)} />}
    <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
    <p className="mt-2 max-w-3xl text-tinta-suave">{description}</p>
    {reload && <button type="button" className={`${companyStyles.secondary} mt-4`} disabled={loading} onClick={reload}>Atualizar dados</button>}
    {loading && <p role="status" className={companyStyles.panel}>Carregando informações…</p>}
    {error && <p role="alert" className={companyStyles.panel}>{error}</p>}
    {!loading && !error && children}
  </DashboardShell>;
}
