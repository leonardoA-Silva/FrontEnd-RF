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
import LiveProductDetails from "./pages/marketplace/LiveProductDetails";
import MarketplaceLayout from "./pages/marketplace/MarketplaceLayout";
import LiveReservationRequest from "./pages/marketplace/LiveReservationRequest";
import { FlowUnavailable } from "./pages/marketplace/FlowNotice";
import DashboardUsuario from "./pages/dashboard/DashboardUsuario";
import DashboardEmpresa from "./pages/dashboard/DashboardEmpresa";
import ProtectedRoute from "./components/ProtectedRoute";

const MapaEmpresas = lazy(() => import("./pages/dashboard/CompanyMap"));
const MeusMateriais = lazy(() => import("./pages/dashboard/MeusMateriais"));
const IndicadoresAmbientais = lazy(() => import("./pages/dashboard/IndicadoresAmbientais"));
const PerfilEmpresa = lazy(() => import("./pages/dashboard/PerfilEmpresa"));
const SobreNos = lazy(() => import("./pages/home/SobreNos"));
const LegalPage = lazy(() => import("./pages/legal/LegalPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminAdvertisementsPage = lazy(() => import("./pages/admin/AdminAdvertisementsPage"));
const RegisterAdminPage = lazy(() => import("./pages/admin/RegisterAdminPage"));

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* rotas publicas */}
          <Route path="/" element={<Suspense fallback={<main className="buyer-panel" role="status">Carregando início...</main>}><Home /></Suspense>} />
          <Route path="/sobre-nos" element={<About />} />
          <Route path="/marketplace" element={<MarketplaceLayout />}>
            <Route index element={<Marketplace />} />
            <Route path="produto/:productId" element={<LiveProductDetails />} />
            <Route path="reserva/:productId" element={<ProtectedRoute allowedRoles={["user"]}><LiveReservationRequest /></ProtectedRoute>} />
            <Route path="minhas-reservas" element={<Navigate to="/dashboardUsuario?aba=reservas" replace />} />
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
            { path: "/dashboardEmpresa/perfil", element: <PerfilEmpresa /> },
          ].map(({ path, element }) => <Route key={path} path={path} element={<ProtectedRoute allowedRoles={["company"]}><Suspense fallback={<main role="status" className="grid min-h-screen place-items-center bg-bruma text-sm text-tinta-suave">Carregando…</main>}>{element}</Suspense></ProtectedRoute>} />)}


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

          {/* Rotas administrativas */}
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<main role="status" className="p-8">Carregando usuários...</main>}>
                  <AdminUsersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/anuncios"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<main role="status" className="p-8">Carregando anúncios...</main>}>
                  <AdminAdvertisementsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/novo-admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<main role="status" className="p-8">Carregando formulário...</main>}>
                  <RegisterAdminPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<main className="buyer-panel"><h1 className="buyer-title">Página não encontrada</h1><p>Confira o endereço ou volte ao início.</p><a href="/" className="home-button">Voltar ao início</a></main>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
