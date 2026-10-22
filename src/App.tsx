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
