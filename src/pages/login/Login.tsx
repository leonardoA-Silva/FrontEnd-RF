import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import api, { loginGoogle, type LoginResponse } from "../../api/services";
import { apiError, apiStatus } from "../../axios/apiError";
import { saveSession } from "../../auth/session";
import { accountDestination } from "../../auth/accountDestination";
import Brand from "../../components/Brand";
import GoogleSignIn from "../../components/account/GoogleSignIn";


type TipoUsuario = "empresa" | "comprador";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const origem = location.state?.from;
    const voltarAoMarketplace = accountDestination("user", origem).startsWith("/marketplace");
    const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(() => voltarAoMarketplace || location.state?.tipoUsuario === "comprador" || new URLSearchParams(location.search).get("perfil") === "comprador" ? "comprador" : "empresa");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [lembrarDeMim, setLembrarDeMim] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    useEffect(() => {
        if (!erro) return;
        const t = setTimeout(() => setErro(""), 6000);
        return () => clearTimeout(t);
    }, [erro]);

    const ehEmpresa = tipoUsuario === "empresa";

    const styles = { erroBox: "mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" };

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
        const trocarSenha = data.mustChangePassword === true || data.user.status === "firstLogin";
        saveSession(data.token, { ...data.user, mustChangePassword: trocarSenha }, remember);
        const destination = accountDestination(data.user.role, origem);
        if (trocarSenha) navigate("/primeiro-acesso", { replace: true, state: { from: destination } });
        else navigate(destination, { replace: true });
    }, [navigate, tipoUsuario, origem]);

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
            setErro(apiStatus(error) === 401 ? "E-mail ou senha inválidos." : apiStatus(error) === 403 ? "Sua conta ainda não está ativa ou não tem acesso. Confira a confirmação recebida por e-mail." : apiError(error, "Não foi possível entrar. Tente novamente."));
        } finally { setCarregando(false); }
    }

    async function handleGoogle(credential: string) {
        setCarregando(true); setErro("");
        try {
            const response = await loginGoogle(credential, ehEmpresa ? "company" : "user");
            handleLoginSuccess(response.data, lembrarDeMim);
        } catch (cause) {
            if (apiStatus(cause) === 404 && ehEmpresa) {
                navigate("/cadastro-empresa", { state: { googleCredential: credential } });
                return;
            }
            throw cause;
        } finally { setCarregando(false); }
    }

    return <div className="login-page login-refined">
      <header className="login-header"><Brand /><Link to="/" className="login-home-link">Voltar ao site</Link></header>
      <main className="login-main"><div className="login-layout">
        <aside className="login-editorial" aria-label="Materiais que ganham novos começos"><div className="login-editorial-heading"><p className="login-kicker">Reaproveita Franca · Economia circular</p><h2>Boas ideias<br />merecem um<br /><em>novo começo.</em></h2><p>Conectamos quem tem materiais<br />a quem enxerga possibilidades.</p></div><figure className="login-material-art"><img src="/images/home/hero.webp" alt="Fitas de couro, tecido e EVA entrelaçadas em um ciclo" width={1536} height={1024} /><figcaption>Couro, tecido e EVA.<br /><span>Outras formas de continuar.</span></figcaption></figure></aside>
        <section className="login-card"><header className="login-intro"><h1>Bom ter você<br /><em>de volta.</em></h1></header>
        <form className="account-login-form" onSubmit={handleSubmit}>
          {erro && <p role="alert" className={styles.erroBox}>{erro}</p>}
          <div className="account-field"><label htmlFor="login-profile">Entrar como</label><select id="login-profile" className="account-input" value={tipoUsuario} disabled={carregando} onChange={e => handleTrocaTipo(e.target.value as TipoUsuario)}><option value="empresa">Empresa</option><option value="comprador">Comprador / Artesão</option></select></div>
          <div className="account-field"><label htmlFor="email">{ehEmpresa ? "E-mail da empresa" : "E-mail"}</label><input id="email" className="account-input" type="email" autoComplete="email" required value={email} onChange={e => { setEmail(e.target.value); setErro(""); }} disabled={carregando} /></div>
          <div className="account-field"><label htmlFor="senha">Senha</label><div className="account-password"><input id="senha" className="account-input" type={mostrarSenha ? "text" : "password"} autoComplete="current-password" required value={senha} onChange={e => { setSenha(e.target.value); setErro(""); }} disabled={carregando} /><button type="button" aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"} onClick={() => setMostrarSenha(v => !v)}>{mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
          <div className="account-login-options"><label className="account-remember"><input type="checkbox" checked={lembrarDeMim} onChange={e => setLembrarDeMim(e.target.checked)} disabled={carregando} />Lembrar de mim</label><Link to="/recuperar-senha">Esqueceu a senha?</Link></div>
          <button type="submit" className="home-button account-submit" disabled={carregando}>{carregando ? "Entrando…" : "Entrar na minha conta"}<ArrowRight size={18} aria-hidden="true" /></button>
          <p className="account-switch"><span>Ainda não tem conta?</span><Link to="/cadastro">Crie sua conta</Link></p>
        </form><div className="google-access-section"><p className="google-access-divider">ou continue com</p><GoogleSignIn onCredential={handleGoogle} disabled={carregando} accountType={ehEmpresa ? "company" : "user"} />{ehEmpresa && <Link className="google-access-retry" to="/cadastro-empresa">Cadastrar empresa com Google</Link>}</div></section>
      </div></main><footer className="login-footer">© {new Date().getFullYear()} Reaproveita Franca.</footer>
    </div>;
}
