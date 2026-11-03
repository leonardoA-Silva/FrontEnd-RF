import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, Check, Eye, EyeOff, LoaderCircle, Scissors } from "lucide-react";
import axios from "axios";
import api from "../../axios/Axios";
import Brand from "../../components/Brand";
import LegalLinks from "../../components/LegalLinks";
import { accountError } from "../../components/account/accountError";

type TipoUsuario = "empresa" | "comprador";

const REMEMBERED_EMAIL_KEY = "rememberedEmail";

function readRememberedEmail(): string {
    try {
        return localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
    } catch {
        return "";
    }
}

export default function Login() {
    const navigate = useNavigate();
    const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>("empresa");
    const [email, setEmail] = useState(readRememberedEmail);
    const [senha, setSenha] = useState("");
    const [lembrarDeMim, setLembrarDeMim] = useState(() => readRememberedEmail() !== "");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    const ehEmpresa = tipoUsuario === "empresa";

    const styles = {
        field: "account-field",
        input: "account-input",
        error: "account-alert account-alert-error",
    };

    function handleTrocaTipo(tipo: TipoUsuario) {
        setTipoUsuario(tipo);
        setErro("");
    }

    // Lê a resposta da API aceitando os vários nomes que ela pode usar.
    function lerRespostaLogin(resposta: Record<string, unknown>) {
        const token =
            resposta["token"] ??
            resposta["accessToken"] ??
            resposta["access_token"] ??
            resposta["jwt"];
        const usuario =
            resposta["user"] ??
            resposta["usuario"] ??
            resposta;
        return {
            token: typeof token === "string" ? token : null,
            usuario,
        };
    }

    // Tenta guardar o usuário; se a foto estourar o limite do navegador,
    // guarda de novo sem a foto para não perder o resto.
    function guardarUsuario(storage: Storage, usuario: unknown) {
        try {
            storage.setItem("user", JSON.stringify(usuario));
            return;
        } catch {
            // Cai aqui quando o storage está cheio (foto grande em base64).
        }
        if (usuario !== null && typeof usuario === "object") {
            const copia = { ...(usuario as Record<string, unknown>) };
            delete copia["photo"];
            storage.setItem("user", JSON.stringify(copia));
        }
    }

    // Guarda token + usuário + perfil no lugar certo:
    // "Lembrar de mim" marcado -> localStorage (continua após fechar o navegador).
    // Desmarcado -> sessionStorage (apaga ao fechar a aba).
    function salvarSessao(token: string | null, usuario: unknown) {
        const principal = lembrarDeMim ? localStorage : sessionStorage;
        const outro = lembrarDeMim ? sessionStorage : localStorage;

        if (token) {
            principal.setItem("token", token);
            outro.removeItem("token");
        }
        if (usuario !== null && usuario !== undefined) {
            guardarUsuario(principal, usuario);
            outro.removeItem("user");
        }
        principal.setItem("tipoUsuario", tipoUsuario);
        try {
            if (lembrarDeMim && email.trim()) {
                localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
            } else if (!lembrarDeMim) {
                localStorage.removeItem(REMEMBERED_EMAIL_KEY);
            }
        } catch {
            // storage indisponível: login continua funcionando
        }
    }

    // Leva para o dashboard conforme a aba escolhida na tela.
    function irParaDashboard() {
        if (tipoUsuario === "empresa") {
            navigate("/dashboardEmpresa");
        } else {
            navigate("/dashboardUsuario");
        }
    }

    // Transforma o erro em frase pronta para mostrar na tela.
    function mensagemDeErroLogin(error: unknown): string {
        if (axios.isAxiosError(error) && [400, 401, 404].includes(error.response?.status ?? 0)) {
            return "E-mail ou senha inválidos. Confira os dados e tente novamente.";
        }
        return accountError(error, "Não foi possível entrar agora. Tente novamente em instantes.");
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setErro("");

        // Passo 1: valida os campos antes de chamar a API.
        if (!email.trim() || !senha) {
            setErro("Informe e-mail e senha para continuar.");
            return;
        }

        setCarregando(true);
        try {
            // Passo 2: envia e-mail + senha para a API.
            const { data } = await api.post("/user/login", {
                email: email.trim(),
                password: senha,
            });
            const resposta = data as Record<string, unknown>;

            // Passo 3: confere se o perfil da conta bate com a aba escolhida.
            // O back retorna role "company" | "user" | "admin".
            const { token, usuario } = lerRespostaLogin(resposta);
            const role = (usuario as Record<string, unknown> | null)?.["role"];
            const esperado = tipoUsuario === "empresa" ? "company" : "user";
            if (typeof role === "string" && role !== esperado && role !== "admin") {
                setErro(
                    tipoUsuario === "empresa"
                        ? "Esta conta é de comprador/artesão. Troque para a aba Comprador / Artesão."
                        : "Esta conta é de empresa. Troque para a aba Empresa Geradora."
                );
                return;
            }

            // Passo 4: salva token + usuário no navegador.
            salvarSessao(token, usuario);

            // Passo 5: entra no dashboard do perfil escolhido.
            irParaDashboard();
        } catch (err) {
            // Passo 6: algo deu errado -> mostra a mensagem na tela.
            setErro(mensagemDeErroLogin(err));
        } finally {
            setCarregando(false);
        }
    }
    return (
        <div className="login-page login-refined">
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
                        <form onSubmit={handleSubmit} className="account-login-form" aria-busy={carregando}>
                            <fieldset className="account-profile-toggle" disabled={carregando} aria-describedby="login-profile-hint">
                                <legend>Como você participa?</legend>
                                {[{ value: "empresa" as const, label: "Empresa", Icon: Building2 }, { value: "comprador" as const, label: "Comprador / Artesão", Icon: Scissors }].map(({ value, label, Icon }) => (
                                    <label key={value} className={tipoUsuario === value ? "is-selected" : ""}>
                                        <input type="radio" name="perfil-login" checked={tipoUsuario === value} onChange={() => handleTrocaTipo(value)} />
                                        <Icon size={19} strokeWidth={1.5} aria-hidden="true" /><span>{label}</span>{tipoUsuario === value && <Check className="login-profile-check" size={14} aria-hidden="true" />}
                                    </label>
                                ))}
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
                            <label className="account-remember"><input type="checkbox" checked={lembrarDeMim} onChange={event => setLembrarDeMim(event.target.checked)} disabled={carregando} />Lembrar de mim</label>
                            <button type="submit" className="home-button account-submit" disabled={carregando}>{carregando ? <><LoaderCircle size={18} className="account-spinner" aria-hidden="true" /> Entrando…</> : <>Entrar na minha conta <ArrowRight size={19} aria-hidden="true" /></>}</button>
                        </form>
                        <div className="account-switch"><p>Ainda não tem uma conta?</p><Link to="/cadastro">Faça parte da rede<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
                    </section>
                </div>
                {import.meta.env.DEV && <nav aria-label="Prévias locais dos painéis" className="login-preview-links"><span>Prévia sem API</span><Link to="/previa/dashboard/empresa">Empresa<ArrowUpRight size={13} aria-hidden="true" /></Link><Link to="/previa/dashboard/usuario">Comprador<ArrowUpRight size={13} aria-hidden="true" /></Link></nav>}
            </main>
            <footer className="login-footer"><span>© {new Date().getFullYear()} Reaproveita Franca.</span><span>Uma conexão de cada vez. Um novo ciclo a cada encontro.</span><LegalLinks /></footer>
        </div>
    );
}
