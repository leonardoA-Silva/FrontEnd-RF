import Brand from "./Brand";
import { Link } from "react-router-dom";
import { useLoggedUser } from "../hooks/useLoggedUser";
export default function Footer({ variant = "default" }: { variant?: "default" | "marketplace" | "about" }) {
  const { isLoggedIn, role } = useLoggedUser();
  return <footer className="home-footer" data-variant={variant}><div className="home-container"><div className="home-footer-top"><div><Brand footer /><p className="home-serif">Da indústria para a criatividade.</p></div><nav aria-label="Links do rodapé"><Link to="/sobre-nos">Nossa proposta</Link><Link to="/marketplace">Materiais</Link><Link to={isLoggedIn ? (role === "company" ? "/dashboardEmpresa" : "/dashboardUsuario") : "/cadastro"}>{isLoggedIn ? "Minha conta" : "Criar conta"}</Link></nav></div><div className="home-footer-bottom"><span>© {new Date().getFullYear()} Reaproveita Franca.</span><span>Feito para transformar. Pensado para circular.</span></div></div></footer>;
}
