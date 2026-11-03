import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Home from "./pages/home/Home";
import RegisterType from "./pages/register/RegisterType";
import RegisterCompany from "./pages/register/RegisterCompany";
import RegisterUser from "./pages/register/RegisterUser";
import Login from "./pages/login/Login";
import DashboardUsuario from "./pages/dashboard/DashboardUsuario";
import DashboardEmpresa from "./pages/dashboard/DashboardEmpresa";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPreview from "./pages/dashboard/DashboardPreview";

const MapaEmpresas = lazy(() => import("./pages/dashboard/MapaEmpresas"));
const MeusMateriais = lazy(() => import("./pages/dashboard/MeusMateriais"));
const IndicadoresAmbientais = lazy(() => import("./pages/dashboard/IndicadoresAmbientais"));
const HistoricoNegociacoes = lazy(() => import("./pages/dashboard/HistoricoNegociacoes"));
const PerfilEmpresa = lazy(() => import("./pages/dashboard/PerfilEmpresa"));
const SobreNos = lazy(() => import("./pages/home/SobreNos"));
const LegalPage = lazy(() => import("./pages/legal/LegalPage"));

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* rotas publicas */}
          <Route path="/" element={<Home />} />
          <Route path="/cadastro" element={<RegisterType />} />
          <Route path="/cadastro-empresa" element={<RegisterCompany />} />
          <Route path="/cadastro-pessoal" element={<RegisterUser />} />
          <Route path="/login" element={<Login />} />
          {(["termos", "privacidade", "direitos", "contato", "cookies"] as const).map(kind => <Route key={kind} path={`/${kind}`} element={<Suspense fallback={<main role="status" className="p-8">Carregando informações…</main>}><LegalPage kind={kind} /></Suspense>} />)}
          <Route path="/sobre" element={<Suspense fallback={<main role="status" className="p-8">Carregando…</main>}><SobreNos /></Suspense>} />
          {[
            { path: "/dashboardEmpresa/indicadores", element: <IndicadoresAmbientais /> },
            { path: "/dashboardEmpresa/negociacoes", element: <HistoricoNegociacoes /> },
            { path: "/dashboardEmpresa/perfil", element: <PerfilEmpresa /> },
          ].map(({ path, element }) => <Route key={path} path={path} element={<ProtectedRoute allowedRoles={["company"]}><Suspense fallback={<main role="status" className="grid min-h-screen place-items-center bg-bruma text-sm text-tinta-suave">Carregando…</main>}>{element}</Suspense></ProtectedRoute>} />)}


          {/* Prévia visual somente no servidor de desenvolvimento. */}
          {import.meta.env.DEV && <>
            <Route path="/previa/dashboard/empresa/*" element={<DashboardPreview kind="company" />} />
            <Route path="/previa/dashboard/usuario" element={<DashboardPreview kind="user" />} />
          </>}

          {/* rotas privadas */}
          <Route
            path="/dashboardUsuario"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <DashboardUsuario/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboardEmpresa/*"
            element={
              <ProtectedRoute allowedRoles={["company"]}>
                <DashboardEmpresa/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboardEmpresa/materiais"
            element={
              <ProtectedRoute allowedRoles={["company"]}>
                <Suspense fallback={<main role="status" className="grid min-h-screen place-items-center bg-bruma px-6 text-sm text-tinta-suave">Carregando materiais…</main>}>
                  <MeusMateriais />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboardEmpresa/materiais/novo"
            element={
              <ProtectedRoute allowedRoles={["company"]}>
                <Suspense fallback={<main role="status" className="grid min-h-screen place-items-center bg-bruma px-6 text-sm text-tinta-suave">Carregando cadastro…</main>}>
                  <Navigate to="/dashboardEmpresa/publicar" replace />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mapaEmpresas"
            element={
              <ProtectedRoute allowedRoles={["company"]}>
                <Suspense
                  fallback={
                    <main
                      role="status"
                      className="grid min-h-screen place-items-center bg-bruma px-6 text-sm text-tinta-suave"
                    >
                      Carregando mapa...
                    </main>
                  }
                >
                  <MapaEmpresas />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
