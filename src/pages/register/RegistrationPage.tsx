import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Building2, UserRound, Check } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { RegistrationSection, AccountSignIn } from "../../components/account/AccountLayout";
import AccountSteps from "../../components/account/AccountSteps";
import EmailVerificationModal from "../../components/EmailVerificationModal";
import RegistrationForm from "./components/RegistrationForm";
import { useRegistrationForm } from "./useRegistrationForm";
import type { RegistrationKind } from "./registrationData";
import GoogleSignIn from "../../components/account/GoogleSignIn";

export default function RegistrationPage({ kind }: { kind: RegistrationKind }) {
  const company = kind === "company";
  const navigate = useNavigate();
  const form = useRegistrationForm(kind);

  return (
    <div className="account-page registration-page">
      <Header />
      <main id="conteudo" className="home-container registration-main" tabIndex={-1}>
        <div className="registration-breadcrumb"><Link to="/cadastro"><ArrowLeft size={14} /> Escolha de perfil</Link><span>/</span><span>{company ? "Empresa" : "Pessoal"}</span></div>
        <div className="registration-title-row"><div><p className="home-eyebrow">Faça parte do Reaproveita Franca</p><h1>{company ? "Cadastre sua empresa." : "Crie seu perfil."}</h1><p>{company ? "Dê um novo destino aos materiais da sua empresa." : "Um espaço para suas ideias encontrarem novas possibilidades."}</p></div><span className="registration-profile-tag">{company ? <Building2 size={17} /> : <UserRound size={17} />}{company ? "Conta de empresa" : "Conta pessoal"}</span></div>
        <div className="registration-workspace">
          <aside className="registration-rail" aria-label="Orientações de cadastro">
            <p className="home-eyebrow">Seu cadastro</p>
            <ol className="registration-rail-steps"><li className="is-complete"><span><Check size={14} /></span><div><strong>Perfil escolhido</strong><p>{company ? "Empresa" : "Comprador / Artesão"}</p></div></li><li aria-current={form.created ? undefined : "step"} className="is-active"><span>02</span><div><strong>Seus dados</strong><p>Informações para criar a conta.</p></div></li><li className={form.created ? "is-active" : ""} aria-current={form.created ? "step" : undefined}><span>03</span><div><strong>Confirmação</strong><p>Um código enviado por e-mail.</p></div></li></ol>
            <div className="registration-rail-note"><p>{company ? "Da sobra à oportunidade." : "Sua ideia merece espaço."}</p><span>{company ? "Contas de empresa podem publicar materiais para venda ou doação." : "Seu perfil é o primeiro passo para fazer parte da rede de reaproveitamento."}</span></div>
            <Link to="/cadastro" className="registration-change-profile">Alterar tipo de conta ↗</Link>
          </aside>
          <RegistrationSection>
            <div className="registration-mobile-progress"><AccountSteps current={form.created ? 3 : 2} /></div>
            <div className="registration-sheet-heading"><h2>Preencha seus dados</h2><span>* Campos obrigatórios</span></div>
            {!form.created && <div className="google-access-section"><GoogleSignIn onCredential={form.selectGoogle} disabled={form.busy} accountType={company ? "company" : "user"} />{form.google ? <p className="account-alert account-alert-success" role="status">Conta Google selecionada. Complete os dados da empresa para criar sua conta. <button type="button" className="google-access-retry" disabled={form.busy} onClick={form.clearGoogle}>Usar e-mail e senha</button></p> : <p className="google-access-help">{company ? "Conecte seu Google e complete os dados da empresa, ou use o formulário com e-mail e senha." : "Com Google, seu perfil é criado e você pode completar os dados depois. Você também pode preencher o formulário abaixo."}</p>}</div>}
            <RegistrationForm kind={kind} form={form} />
            <AccountSignIn />
          </RegistrationSection>
        </div>
        {form.created && <EmailVerificationModal open={form.verificationOpen} userId={form.created.id} email={form.data.email} emailSent={form.created.emailSent} onSuccess={() => navigate("/login")} onClose={() => { form.setVerificationOpen(false); window.requestAnimationFrame(() => document.getElementById("reopen-verification")?.focus()); }} />}
      </main>
      <Footer />
    </div>
  );
}
