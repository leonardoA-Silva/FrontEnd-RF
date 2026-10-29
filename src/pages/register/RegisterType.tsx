import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Check, Sprout } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { AccountSignIn } from "../../components/account/AccountLayout";
import AccountSteps from "../../components/account/AccountSteps";

export default function RegisterType() {
  const navigate = useNavigate();
  const [type, setType] = useState("empresa");
  return (
    <div className="account-page enrollment-page"><Header />
      <main id="conteudo" className="home-container enrollment-main" tabIndex={-1}>
        <div className="enrollment-topline"><Link to="/" className="account-back"><ArrowLeft size={15} /> Voltar ao início</Link><AccountSteps current={1} /></div>
        <div className="enrollment-heading"><div><p className="home-eyebrow">Diferentes pontos de partida. A mesma rede.</p><h1>Qual é o seu<br /><em>próximo passo?</em></h1></div><p>Escolha como você quer participar. Cada perfil tem um papel na transformação dos materiais de Franca.</p></div>
        <form onSubmit={event => { event.preventDefault(); navigate(type === "empresa" ? "/cadastro-empresa" : "/cadastro-pessoal"); }}>
          <fieldset className="enrollment-choices"><legend className="sr-only">Tipo de conta</legend>
            {[{ value: "empresa", title: "Quero disponibilizar.", label: "Sou empresa", description: "Tenho materiais para anunciar para venda ou doação.", icon: Building2, number: "01", image: "/hero-leather-scraps.jpg", alt: "Retalhos de couro para reaproveitamento" }, { value: "pessoal", title: "Quero transformar.", label: "Sou comprador / artesão", description: "Quero fazer parte da rede com novas ideias e possibilidades.", icon: Sprout, number: "02", image: "/retalho-nobuck-macio.png", alt: "Tecidos que podem ganhar novas formas" }].map(({ value, title, label, description, icon: Icon, number, image, alt }) => (
              <label key={value} className={`enrollment-choice ${type === value ? "is-selected" : ""}`}>
                <input type="radio" name="tipo-conta" value={value} checked={type === value} onChange={() => setType(value)} />
                <div className="enrollment-choice-copy"><div className="enrollment-choice-top"><span className="home-eyebrow">{number} / {label}</span><span className="enrollment-choice-check" aria-hidden="true">{type === value && <Check size={15} />}</span></div><Icon size={28} strokeWidth={1.3} aria-hidden="true" /><strong>{title}</strong><p>{description}</p></div>
                <img src={image} alt={alt} width="640" height="320" />
              </label>
            ))}
          </fieldset>
          <div className="enrollment-bottom"><p>Você preenche seus dados e confirma seu e-mail nas próximas etapas.</p><button type="submit" className="home-button">Continuar cadastro <ArrowRight size={17} /></button></div>
        </form>
        <AccountSignIn />
      </main><Footer />
    </div>
  );
}
