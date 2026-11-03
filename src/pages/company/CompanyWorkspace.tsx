import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { CompanyContext } from "./CompanyContext";
import { readCompanyIdentity, loadCompanyProducts } from "./companyApi";
import { accountError } from "../../components/account/accountError";
import { createDemoProducts } from "./companyDemo";
import CompanyShell from "./CompanyShell";
import CompanyLibrary from "./CompanyLibrary";
import CompanyEditor from "./CompanyEditor";
import CompanyDetails from "./CompanyDetails";
import { CompanyMessage } from "./CompanyUi";
import type { CompanyProduct, CompanyIdentity } from "./companyTypes";

const MapaEmpresas = lazy(() => import("../dashboard/MapaEmpresas"));
const IndicadoresAmbientais = lazy(() => import("../dashboard/IndicadoresAmbientais"));
const HistoricoNegociacoes = lazy(() => import("../dashboard/HistoricoNegociacoes"));
const PerfilEmpresa = lazy(() => import("../dashboard/PerfilEmpresa"));

export default function CompanyWorkspace({ preview = false }: { preview?: boolean }) {
  const [identity, setIdentity] = useState<CompanyIdentity | null>(() => preview ? { id: "demo-company", name: "Empresa demonstrativa", email: "", cellphone: "" } : readCompanyIdentity());
  const [products, setProducts] = useState<CompanyProduct[]>(() => preview ? createDemoProducts() : []);
  const [loading, setLoading] = useState(!preview);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [version, setVersion] = useState(0);
  const base = preview ? "/previa/dashboard/empresa" : "/dashboardEmpresa";
  useEffect(() => {
    if (preview) return;
    const controller = new AbortController();
    if (!identity?.id) return;
    loadCompanyProducts(identity.id, controller.signal)
      .then(result => { if (!controller.signal.aborted) { setProducts(result); setLoading(false); } })
      .catch(failure => { if (!controller.signal.aborted) { setError(accountError(failure, "Não foi possível carregar seus materiais. Tente novamente.")); setLoading(false); } });
    return () => controller.abort();
  }, [preview, identity?.id, version]);
  const saveDemo = (product: CompanyProduct) => {
    if (!preview) return;
    setProducts(previous => previous.some(item => item.id === product.id) ? previous.map(item => item.id === product.id ? product : item) : [product, ...previous]);
    setNotice("Simulação concluída. A alteração é temporária e não foi enviada à API.");
  };
  const deleteDemo = (id: string) => {
    if (!preview) return;
    setProducts(previous => previous.filter(item => item.id !== id));
    setNotice("Material removido da prévia. Nenhum anúncio real foi excluído.");
  };
  return <CompanyContext.Provider value={{ preview, base, identity, products, loading: loading && !!identity, error: !preview && !identity ? "Não foi possível identificar sua conta. Entre novamente para carregar seus materiais." : error, notice, reload: () => { setError(""); setLoading(true); setVersion(value => value + 1); }, saveDemo, deleteDemo, updateIdentity: setIdentity, setNotice }}>
    <Suspense fallback={<div className="company-state" role="status">Carregando tela da empresa…</div>}><Routes>
      {preview && <>
        <Route path="explorar" element={<MapaEmpresas />} />
        <Route path="indicadores" element={<IndicadoresAmbientais preview />} />
        <Route path="negociacoes" element={<HistoricoNegociacoes preview />} />
        <Route path="perfil" element={<PerfilEmpresa preview />} />
      </>}
      <Route element={<CompanyShell><Outlet /></CompanyShell>}>
        <Route index element={<CompanyLibrary />} />
        <Route path="publicar" element={<CompanyEditor />} />
        <Route path="materiais" element={<Navigate to={base} replace />} />
        <Route path="materiais/novo" element={<Navigate to={`${base}/publicar`} replace />} />
        <Route path="materiais/:id" element={<CompanyDetails />} />
        <Route path="materiais/:id/editar" element={<CompanyEditor />} />
        <Route path="conta" element={<Navigate to={`${base}/perfil`} replace />} />
        <Route path="*" element={<CompanyMessage title="Página não encontrada" text="Este endereço não faz parte da área da empresa." />} />
      </Route>
    </Routes></Suspense>
  </CompanyContext.Provider>;
}
