import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import RegisterType from "./pages/register/RegisterType";
import RegisterCompany from "./pages/register/RegisterCompany";
import RegisterUser from "./pages/register/RegisterUser";
import Login from "./pages/login/Login";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* rotas publicas */}
          <Route path="/" element={<Home />} />
          <Route path="/cadastro" element={<RegisterType />} />
          <Route path="/cadastrar" element={<RegisterType />} />
          <Route path="/register" element={<RegisterType />} />
          <Route path="/cadastro-empresa" element={<RegisterCompany />} />
          <Route path="/cadastro/empresa" element={<RegisterCompany />} />
          <Route path="/cadastro-pessoal" element={<RegisterUser />} />
          <Route path="/cadastro/pessoal" element={<RegisterUser />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
