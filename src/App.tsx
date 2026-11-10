import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Home from "./pages/home/Home";
import RegisterType from "./pages/register/RegisterType";
import RegisterCompany from "./pages/register/RegisterCompany";
import RegisterUser from "./pages/register/RegisterUser";
import Login from "./pages/login/Login";
import DashboardUsuario from "./pages/dashboard/DashboardUsuario";
import DashboardEmpresa from "./pages/dashboard/DashboardEmpresa";
import ProtectedRoute from "./components/ProtectedRoute";

const MapaEmpresas = lazy(() => import("./pages/dashboard/MapaEmpresas"));
const MeusMateriais = lazy(() => import("./pages/dashboard/MeusMateriais"));
const NovoMaterial = lazy(() => import("./pages/dashboard/NovoMaterial"));
const Recebimentos = lazy(() => import("./pages/dashboard/Recebimentos"));
const EditarMaterial = lazy(() => import("./pages/dashboard/EditarMaterial"));
const Notificacoes = lazy(() => import("./pages/dashboard/Notificacoes"));
const Indicadores = lazy(() => import("./pages/dashboard/Indicadores"));
const Disputas = lazy(() => import("./pages/dashboard/Disputas"));
const Avaliacoes = lazy(() => import("./pages/dashboard/Avaliacoes"));
const PerfilEmpresa = lazy(() => import("./pages/dashboard/PerfilEmpresa"));
const Negociacoes = lazy(() => import("./pages/dashboard/Negociacoes"));

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


          {/* rotas privadas */}
          <Route path="/dashboardEmpresa/materiais/:id/editar" element={<ProtectedRoute allowedRoles={["company"]}><Suspense fallback={<main role="status">Carregando material…</main>}><EditarMaterial /></Suspense></ProtectedRoute>} />
          {[
            { path: "notificacoes", Page: Notificacoes }, { path: "indicadores", Page: Indicadores },
            { path: "disputas", Page: Disputas }, { path: "avaliacoes", Page: Avaliacoes },
            { path: "perfil", Page: PerfilEmpresa }, { path: "negociacoes", Page: Negociacoes },
          ].map(({ path, Page }) => <Route key={path} path={`/dashboardEmpresa/${path}`} element={<ProtectedRoute allowedRoles={["company"]}><Suspense fallback={<main role="status">Carregando informações…</main>}><Page /></Suspense></ProtectedRoute>} />)}
          <Route path="/dashboardEmpresa/recebimentos" element={<ProtectedRoute allowedRoles={["company"]}><Suspense fallback={<main role="status">Carregando recebimentos…</main>}><Recebimentos /></Suspense></ProtectedRoute>} />
          <Route
            path="/dashboardUsuario"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <DashboardUsuario/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboardEmpresa"
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
                <Suspense fallback={<main role="status" className="screen-enter grid min-h-screen place-items-center bg-bruma px-6 text-sm text-tinta-suave">Carregando materiais…</main>}>
                  <MeusMateriais />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboardEmpresa/materiais/novo"
            element={
              <ProtectedRoute allowedRoles={["company"]}>
                <Suspense fallback={<main role="status" className="screen-enter grid min-h-screen place-items-center bg-bruma px-6 text-sm text-tinta-suave">Carregando cadastro…</main>}>
                  <NovoMaterial />
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
                      className="screen-enter grid min-h-screen place-items-center bg-bruma px-6 text-sm text-tinta-suave"
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
