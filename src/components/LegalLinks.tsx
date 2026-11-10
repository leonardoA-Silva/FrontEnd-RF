import { Link } from "react-router-dom";

export default function LegalLinks() {
  return <nav className="legal-links" aria-label="Informações legais e contato">
    <Link to="/termos">Termos de Uso</Link><Link to="/privacidade">Privacidade</Link><Link to="/direitos">Seus direitos</Link><Link to="/cookies">Cookies</Link><Link to="/contato">Contato</Link>
  </nav>;
}
