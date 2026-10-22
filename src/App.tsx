import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
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
import MaterialDetails from "./pages/marketplace/MaterialDetails";
import ReservationRequest from "./pages/marketplace/ReservationRequest";
import ReservationCheckout from "./pages/marketplace/ReservationCheckout";
import ReservationPayment from "./pages/marketplace/ReservationPayment";
import ReservationConfirmation, { DemoReservations } from "./pages/marketplace/ReservationConfirmation";
import { FlowUnavailable } from "./pages/marketplace/FlowNotice";
import DashboardUsuario from "./pages/dashboard/DashboardUsuario";
import DashboardEmpresa from "./pages/dashboard/DashboardEmpresa";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* rotas publicas */}
          <Route path="/" element={<Home />} />
          <Route path="/sobre-nos" element={<About />} />
          <Route path="/marketplace" element={<MarketplaceLayout />}>
            <Route index element={<Marketplace />} />
            <Route path="produto/:productId" element={<LiveProductDetails />} />
            <Route path="material/:materialId" element={<MaterialDetails />} />
            <Route path="reserva/:materialId" element={<ReservationRequest />} />
            <Route path="finalizar/:materialId" element={<ReservationCheckout />} />
            <Route path="pagamento/:materialId/:metodo" element={<ReservationPayment />} />
            <Route path="confirmacao/:materialId" element={<ReservationConfirmation />} />
            <Route path="minhas-reservas" element={<DemoReservations />} />
            <Route path="*" element={<FlowUnavailable />} />
          </Route>
          <Route path="/cadastro" element={<RegisterType />} />
          <Route path="/cadastro-empresa" element={<RegisterCompany />} />
          <Route path="/cadastro-pessoal" element={<RegisterUser />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<PasswordRecovery />} />
          <Route path="/redefinir-senha" element={<ResetPassword />} />
          <Route path="/primeiro-acesso" element={<ProtectedRoute><FirstAccess /></ProtectedRoute>} />


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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
