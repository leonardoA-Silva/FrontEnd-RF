import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, Check, Eye, EyeOff, LoaderCircle, Scissors } from "lucide-react";
import api, { type LoginResponse } from "../../axios/Axios";
import { apiError, apiStatus } from "../../axios/apiError";
import { saveSession } from "../../auth/session";
import Brand from "../../components/Brand";
import LegalLinks from "../../components/LegalLinks";
import GoogleSignIn from "./GoogleSignIn";

type TipoUsuario = "empresa" | "comprador";
const REMEMBERED_EMAIL_KEY = "rememberedEmail";

function readRememberedEmail() {
  try { return localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? ""; } catch { return ""; }
}

function saveRememberedEmail(remember: boolean, email: string) {
  try {
    if (remember && email.trim()) localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
    else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  } catch { /* Session login must still work when storage is unavailable. */ }
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const origem = location.state?.from;
  const voltarAoMarketplace = typeof origem === "string" && /^\/marketplace(?:\/[A-Za-z0-9_-]+){0,3}$/.test(origem);
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(() => voltarAoMarketplace || location.state?.tipoUsuario === "comprador" ? "comprador" : "empresa");
  const [email, setEmail] = useState(readRememberedEmail);
  const [senha, setSenha] = useState("");
  const [lembrarDeMim, setLembrarDeMim] = useState(() => readRememberedEmail() !== "");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const ehEmpresa = tipoUsuario === "empresa";
  const styles = { field: "account-field", input: "account-input", error: "account-alert account-alert-error" };

  function handleTrocaTipo(tipo: TipoUsuario) {
    setTipoUsuario(tipo);
    setErro("");
  }

  const handleLoginSuccess = useCallback((data: LoginResponse, remember: boolean) => {
    if (!data.token || !data.user?.id) throw new Error("Resposta de login inválida.");
    const expected = tipoUsuario === "empresa" ? "company" : "user";
    if (data.user.role !== expected && data.user.role !== "admin") {
      setErro(expected === "user" ? "Esta conta é de empresa. Selecione Empresa Geradora." : "Esta conta é de comprador. Selecione Comprador / Artesão.");
      return;
    }
    const mustChangePassword = data.mustChangePassword === true || data.user.status === "firstLogin";
    saveSession(data.token, { ...data.user, mustChangePassword }, remember);
    saveRememberedEmail(remember, email);
    navigate(mustChangePassword ? "/primeiro-acesso" : data.user.role === "company" ? "/dashboardEmpresa" : voltarAoMarketplace ? origem : "/dashboardUsuario", { replace: true });
  }, [email, navigate, origem, tipoUsuario, voltarAoMarketplace]);

  const handleGoogleSuccess = useCallback((data: LoginResponse, remember: boolean) => {
    if (!data.token || !data.user?.id) throw new Error("Resposta de login inválida.");
    const mustChangePassword = data.mustChangePassword === true || data.user.status === "firstLogin";
    saveSession(data.token, { ...data.user, mustChangePassword }, remember);
    saveRememberedEmail(remember, email);
    navigate(mustChangePassword ? "/primeiro-acesso" : data.user.role === "company" ? "/dashboardEmpresa" : voltarAoMarketplace ? origem : "/dashboardUsuario", { replace: true });
  }, [email, navigate, origem, voltarAoMarketplace]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (carregando) return;
    setErro("");
    if (!email.trim() || !senha) { setErro("Informe e-mail e senha para continuar."); return; }
    setCarregando(true);
    try {
      const response = await api.post<LoginResponse>("/user/login", { email: email.trim(), password: senha });
      handleLoginSuccess(response.data, lembrarDeMim);
    } catch (error) {
      setErro(apiStatus(error) === 401 ? "E-mail ou senha inválidos. Se você usa login social, entre com o provedor." : apiStatus(error) === 403 ? "Sua conta ainda não está ativa ou não tem acesso. Confira a confirmação por e-mail." : apiError(error, "Não foi possível entrar. Tente novamente."));
    } finally { setCarregando(false); }
  }

  return <div className="login-page login-refined">
    <a href="#conteudo" className="rf-skip">Pular para o conteúdo</a>
    <header className="login-header"><Brand /><Link to="/" className="login-home-link"><ArrowLeft size={16} aria-hidden="true" /> Voltar ao início</Link></header>
    <main id="conteudo" className="login-main" tabIndex={-1}>
      <div className="login-layout">
        <aside className="login-editorial" aria-labelledby="login-editorial-title">
          <div className="login-editorial-heading"><p className="login-kicker">Reaproveita Franca · Economia circular</p><h2 id="login-editorial-title">Boas ideias<br />merecem um<br /><em>novo começo.</em></h2><p>Conectamos quem tem materiais<br />a quem enxerga possibilidades.</p></div>
          <figure className="login-material-art"><img src="/images/home/hero.webp" alt="" width={1536} height={1024} fetchPriority="high" /><figcaption>Couro, tecido e EVA.<br /><span>Outras formas de continuar.</span></figcaption></figure>
          <div className="login-editorial-bottom"><span>Da indústria<br />para a criatividade.</span><Link to="/sobre">Conheça o projeto<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
        </aside>
        <section className="login-card" aria-labelledby="login-title">
          <div className="login-intro"><p className="login-kicker">Seu espaço na rede</p><h1 id="login-title">Bom ter você<br /><em>de volta.</em></h1><p>Entre com os dados da sua conta.</p></div>
          {location.state?.accountDeleted && <p role="status" className="account-alert account-alert-success">Sua conta foi excluída e sua sessão foi encerrada.</p>}
          <form onSubmit={handleSubmit} className="account-login-form" aria-busy={carregando}>
            <fieldset className="account-profile-toggle" disabled={carregando} aria-describedby="login-profile-hint">
              <legend>Como você participa?</legend>
              {[{ value: "empresa" as const, label: "Empresa", Icon: Building2 }, { value: "comprador" as const, label: "Comprador / Artesão", Icon: Scissors }].map(({ value, label, Icon }) => <label key={value} className={tipoUsuario === value ? "is-selected" : ""}>
                <input type="radio" name="perfil-login" checked={tipoUsuario === value} onChange={() => handleTrocaTipo(value)} />
                <Icon size={19} strokeWidth={1.5} aria-hidden="true" /><span>{label}</span>{tipoUsuario === value && <Check className="login-profile-check" size={14} aria-hidden="true" />}
              </label>)}
            </fieldset>
            <p id="login-profile-hint" className="login-profile-hint">{ehEmpresa ? "Acesse o espaço da sua empresa." : "Acesse seu espaço de comprador ou artesão."}</p>
            {erro && <p id="login-error" role="alert" className={styles.error}>{erro}</p>}
            <div className={styles.field}>
              <label htmlFor="email">{ehEmpresa ? "E-mail da empresa" : "E-mail"}</label>
              <input id="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required placeholder="Seu e-mail de cadastro" value={email} onChange={event => setEmail(event.target.value)} disabled={carregando} className={styles.input} aria-describedby={erro ? "login-error" : undefined} />
            </div>
            <div className={styles.field}>
              <label htmlFor="senha">Senha</label>
              <div className="account-password">
                <input id="senha" type={mostrarSenha ? "text" : "password"} autoComplete="current-password" required placeholder="Digite sua senha" value={senha} onChange={event => setSenha(event.target.value)} disabled={carregando} className={styles.input} aria-describedby={erro ? "login-error" : undefined} />
                <button type="button" disabled={carregando} onClick={() => setMostrarSenha(value => !value)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"} aria-pressed={mostrarSenha}>{mostrarSenha ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}</button>
              </div>
            </div>
            <div className="account-login-options">
              <label className="account-remember"><input type="checkbox" checked={lembrarDeMim} onChange={event => setLembrarDeMim(event.target.checked)} disabled={carregando} />Lembrar de mim</label>
              <Link to="/recuperar-senha">Esqueceu a senha?</Link>
            </div>
            <button type="submit" className="home-button account-submit" disabled={carregando}>{carregando ? <><LoaderCircle size={18} className="account-spinner" aria-hidden="true" /> Entrando…</> : <>Entrar na minha conta <ArrowRight size={19} aria-hidden="true" /></>}</button>
          </form>
          {!ehEmpresa && <div className="account-social-login"><p className="login-kicker">Ou entre com</p><GoogleSignIn onSuccess={handleGoogleSuccess} remember={lembrarDeMim} /><p>O acesso com LinkedIn ainda está indisponível. Use e-mail e senha ou Google.</p></div>}
          <div className="account-switch"><p>Ainda não tem uma conta?</p><Link to="/cadastro">Faça parte da rede<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        </section>
      </div>
      {import.meta.env.DEV && <nav aria-label="Prévias locais dos painéis" className="login-preview-links"><span>Prévia sem API</span><Link to="/previa/dashboard/empresa">Empresa<ArrowUpRight size={13} aria-hidden="true" /></Link><Link to="/previa/dashboard/usuario">Comprador<ArrowUpRight size={13} aria-hidden="true" /></Link></nav>}
    </main>
    <footer className="login-footer"><span>© {new Date().getFullYear()} Reaproveita Franca.</span><span>Uma conexão de cada vez. Um novo ciclo a cada encontro.</span><LegalLinks /></footer>
  </div>;
}
