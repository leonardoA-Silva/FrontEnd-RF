import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { CompanyContext } from "./CompanyContext";
import { readCompanyIdentity, loadCompanyProducts } from "./companyApi";
import { accountError } from "../../components/account/accountError";
import CompanyShell from "./CompanyShell";
import CompanyLibrary from "./CompanyLibrary";
import CompanyEditor from "./CompanyEditor";
import CompanyDetails from "./CompanyDetails";
import { CompanyMessage } from "./CompanyUi";
import type { CompanyProduct } from "./companyTypes";
import CommunicationProvider from "./communication/CommunicationProvider";

const DashboardOverview = lazy(() => import("../dashboard/DashboardOverview"));
const CompanyAddresses = lazy(() => import("./CompanyAddresses"));
const CompanyRequests = lazy(() => import("./CompanyRequests"));

const BuyerSecurity = lazy(() => import("../dashboard/comprador/BuyerSecurity"));
const CompanyMap = lazy(() => import("../dashboard/CompanyMap"));
const CompanyPayments = lazy(() => import("./CompanyPayments"));
const CompanyMessages = lazy(() => import("./communication/CompanyMessages"));
const CompanyNotifications = lazy(() => import("./communication/CompanyNotifications"));

export default function CompanyWorkspace() {
  const [identity, setIdentity] = useState(readCompanyIdentity);
  const [products, setProducts] = useState<CompanyProduct[]>([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [version, setVersion] = useState(0);
  const base = "/dashboardEmpresa";
  useEffect(() => {
    const controller = new AbortController();
    if (!identity?.id) return;
    loadCompanyProducts(identity.id, controller.signal).then(result => { if (!controller.signal.aborted) { setProducts(result); setLoading(false); } }).catch(cause => { if (!controller.signal.aborted) { setError(accountError(cause, "Não foi possível carregar seus materiais.")); setLoading(false); } });
    return () => controller.abort();
  }, [identity?.id, version]);
  return <CompanyContext.Provider value={{ preview: false, base, identity, products, loading: loading && !!identity, error: !identity ? "Não foi possível identificar sua conta. Entre novamente." : error, notice, reload: () => { setLoading(true); setError(""); setVersion(value => value + 1); }, saveDemo: () => {}, deleteDemo: () => {}, updateIdentity: setIdentity, setNotice }}>
    <CommunicationProvider><Suspense fallback={<p role="status">Carregando tela da empresa…</p>}><Routes><Route element={<CompanyShell><Outlet /></CompanyShell>}>
      <Route index element={<CompanyLibrary />} /><Route path="resumo" element={<DashboardOverview company />} />
      <Route path="enderecos" element={<CompanyAddresses />} /><Route path="reservas" element={<CompanyRequests />} />
      <Route path="seguranca" element={<BuyerSecurity />} /><Route path="explorar" element={<CompanyMap />} />
      <Route path="pagamentos" element={<CompanyPayments />} /><Route path="publicar" element={<CompanyEditor />} />
      <Route path="mensagens" element={<CompanyMessages />} /><Route path="notificacoes" element={<CompanyNotifications />} />
      <Route path="materiais" element={<CompanyLibrary />} /><Route path="materiais/novo" element={<Navigate to={`${base}/publicar`} replace />} />
      <Route path="materiais/:id" element={<CompanyDetails />} /><Route path="materiais/:id/editar" element={<CompanyEditor />} />
      <Route path="conta" element={<Navigate to={`${base}/perfil`} replace />} />
      <Route path="*" element={<CompanyMessage title="Página não encontrada" text="Este endereço não faz parte da área da empresa." />} />
    </Route></Routes></Suspense></CommunicationProvider>
  </CompanyContext.Provider>;
}
