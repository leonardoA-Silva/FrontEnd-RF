import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
const Home = lazy(() => import("./pages/home/Home"));
import About from "./pages/about/About";
import RegisterType from "./pages/register/RegisterType";
import RegisterCompany from "./pages/register/RegisterCompany";
import RegisterUser from "./pages/register/RegisterUser";
import Login from "./pages/login/Login";
import PasswordRecovery from "./pages/login/PasswordRecovery";
import ResetPassword from "./pages/login/ResetPassword";
import FirstAccess from "./pages/login/FirstAccess";
import Marketplace from "./pages/marketplace/Marketplace";
import PaginaMaterial from "./pages/marketplace/PaginaMaterial";
import LiveProductDetails from "./pages/marketplace/LiveProductDetails";
import MarketplaceLayout from "./pages/marketplace/MarketplaceLayout";
import LiveReservationRequest from "./pages/marketplace/LiveReservationRequest";
import { FlowUnavailable } from "./pages/marketplace/FlowNotice";
import DashboardUsuario from "./pages/dashboard/DashboardUsuario";
import DashboardEmpresa from "./pages/dashboard/DashboardEmpresa";
import DashboardPreview from "./pages/dashboard/DashboardPreview";
import ProtectedRoute from "./components/ProtectedRoute";

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
          <Route path="/" element={<Suspense fallback={<main className="buyer-panel" role="status">Carregando início...</main>}><Home /></Suspense>} />
          <Route path="/sobre-nos" element={<About />} />
          <Route path="/sobre-nos" element={<About />} />
          <Route path="/marketplace" element={<MarketplaceLayout />}>
            <Route index element={<Marketplace />} />
            <Route path="produto/:productId" element={<LiveProductDetails />} />
            <Route path="material/:produtoId" element={<PaginaMaterial />} />
            <Route path="reserva/:productId" element={<ProtectedRoute allowedRoles={["user"]}><LiveReservationRequest /></ProtectedRoute>} />
            <Route path="minhas-reservas" element={<Navigate to="/dashboardUsuario?aba=reservas" replace />} />
            <Route path=":produtoId" element={<PaginaMaterial />} />
            <Route path=":produtoId/compra" element={<PaginaMaterial compra />} />
            <Route path="*" element={<FlowUnavailable />} />
          </Route>
          <Route path="/cadastro" element={<RegisterType />} />
          <Route path="/cadastro-empresa" element={<RegisterCompany />} />
          <Route path="/cadastro-pessoal" element={<RegisterUser />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<PasswordRecovery />} />
          <Route path="/redefinir-senha" element={<ResetPassword />} />
          <Route path="/primeiro-acesso" element={<ProtectedRoute><FirstAccess /></ProtectedRoute>} />
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
