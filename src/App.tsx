import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Home from "./pages/home/Home"
import Login from "./pages/login/Login";
import DashboardUsuario from "./pages/dashboard/DashboardUsuario";


function temToken(): boolean {
  return Boolean(
    localStorage.getItem("token") ?? sessionStorage.getItem("token")
  );
}

// Bloqueia o acesso ao dashboard sem login (sem token -> volta para /login)
function RotaProtegida({ children }: { children: ReactNode }) {
  if (!temToken()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}


function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* rotas publicas */}
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />


          {/* rotas privadas */}
          <Route
            path="/dashboard"
            element={
              <RotaProtegida>
                <DashboardUsuario/>
              </RotaProtegida>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>

  )
}

export default App
