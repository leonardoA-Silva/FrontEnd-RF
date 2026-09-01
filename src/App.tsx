import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home"


function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* rotas publicas */}
          <Route path="/" element={<Home/>} />


          
        </Routes>
      </BrowserRouter>
    </div>

  )
}

export default App
