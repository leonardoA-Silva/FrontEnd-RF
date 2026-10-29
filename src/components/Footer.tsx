import Brand from "./Brand";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="home-footer">
      <div className="home-container">
        <div className="home-footer-top">
          <div><Brand footer /><p className="home-serif">Da indústria para a criatividade.</p></div>
          <nav aria-label="Links do rodapé"><a href="/#sobre">Nossa proposta</a><a href="/#materiais">Materiais</a><Link to="/cadastro">Criar conta</Link></nav>
          <a href="/#conteudo" className="home-back-top">Voltar ao topo ↑</a>
        </div>
        <div className="home-footer-bottom"><span>© {new Date().getFullYear()} Reaproveita Franca.</span><span>Feito para transformar. Pensado para circular.</span></div>
      </div>
    </footer>
  );
}
