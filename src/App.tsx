import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home"
// import Login from "./pages/login/Login";
import DashboardUsuario from "./pages/dashboard/DashboardUsuario";


function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* rotas publicas */}
          <Route path="/" element={<Home/>} />
          {/* <Route path="/login" element={<Login/>} /> */}


          <Route path="/dashboard" element={<DashboardUsuario/>} />
        </Routes>
      </BrowserRouter>
    </div>

  )
}

export default App
