import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api, { type LoginResponse } from "../../axios/Axios";
import { apiError, apiStatus } from "../../axios/apiError";
import { saveSession } from "../../auth/session";
import GoogleSignIn from "./GoogleSignIn";
import BrandIcon from "../../components/BrandIcon";
import axios from "axios";
import EmailVerificationModal from "../../components/EmailVerificationModal";


type TipoUsuario = "empresa" | "comprador";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const origem = location.state?.from;
    const voltarAoMarketplace = typeof origem === "string" && /^\/marketplace(?:\/[A-Za-z0-9_-]+){0,3}$/.test(origem);
    const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(() => voltarAoMarketplace || location.state?.tipoUsuario === "comprador" ? "comprador" : "empresa");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [lembrarDeMim, setLembrarDeMim] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [verification, setVerification] = useState<{ id: string; email: string } | null>(null);
    const [verificationOpen, setVerificationOpen] = useState(false);
    useEffect(() => {
        if (!erro || verification) return;
        const t = setTimeout(() => setErro(""), 6000);
        return () => clearTimeout(t);
    }, [erro, verification]);

    const ehEmpresa = tipoUsuario === "empresa";

    const styles = {
        pagina: "screen-enter flex min-h-svh bg-papel text-carvao",

        painelFoto: "relative hidden w-[44%] shrink-0 lg:block",
        painelImagem: "absolute inset-0 h-full w-full object-cover",
        painelVeu: "absolute inset-0 bg-carvao/60",
        painelConteudo: "relative flex h-full flex-col justify-between p-10",
        painelMarca: "flex items-center gap-3 no-underline",
        painelMarcaTitulo: "font-display text-lg font-semibold text-cru",
        painelFrase:
            "mt-auto font-display text-4xl font-medium italic leading-tight tracking-[-0.01em] text-cru",
        painelAssinatura: "mt-5 text-sm text-cru/80",

        areaFormulario: "flex flex-1 flex-col px-5 py-6 sm:px-10",
        barraTopo: "flex items-center justify-between lg:hidden",
        barraMarca: "flex items-center gap-3 no-underline",
        barraMarcaTitulo: "font-display text-lg font-semibold text-carvao",
        barraVoltar:
            "text-sm font-semibold text-carvao-suave no-underline transition hover:text-carvao",

        formularioArea: "flex flex-1 items-center justify-center py-10",
        cartao: "w-full max-w-md",

        titulo: "font-display text-3xl font-semibold tracking-tight",
        descricao: "mt-2 text-base leading-7 text-carvao-suave",

        abas: "mt-8 grid grid-cols-2 gap-1 rounded-full bg-papel p-1",
        abaAtiva: "rounded-full bg-verde-escuro px-4 py-2.5 text-sm font-semibold text-white",
        abaInativa:
            "rounded-full px-4 py-2.5 text-sm font-medium text-carvao-suave transition hover:text-carvao",

        formulario: "mt-7 flex flex-col gap-5",
        campoGrupo: "flex flex-col gap-2",
        rotulo: "text-[15px] font-medium text-carvao-suave",
        input:
            "w-full rounded-xl border border-areia bg-cru px-4 py-3.5 text-base text-carvao outline-none transition placeholder:text-carvao-suave/70 focus:border-verde-escuro focus:ring-4 focus:ring-verde-escuro/15 disabled:opacity-60",
        inputSenhaWrapper: "relative",
        inputSenha: "pr-12",
        botaoOlho:
            "absolute right-4 top-1/2 -translate-y-1/2 text-carvao-suave/70 transition hover:text-carvao",

        linhaOpcoes: "flex items-center justify-between text-sm",
        lembrarLabel: "flex cursor-pointer items-center gap-2 text-carvao-suave",
        checkbox: "h-[18px] w-[18px] cursor-pointer rounded accent-canela",
        botaoEntrar:
            "rounded-full bg-verde-escuro px-6 py-4 text-base font-bold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-verde active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-verde-escuro/25 disabled:cursor-not-allowed disabled:opacity-70",

        erroBox:
            "rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700",

        rodapeCartao: "mt-7 text-center text-sm text-carvao-suave",
        linkCadastro:
            "font-bold text-canela no-underline transition hover:text-canela-escura",
    };    function handleTrocaTipo(tipo: TipoUsuario) {
        setTipoUsuario(tipo);
        setErro("");
        setVerification(null);
    }

    const handleLoginSuccess = useCallback((data: LoginResponse, remember: boolean) => {
        if (!data.token || !data.user?.id) throw new Error("Resposta de login inválida.");
        const expected = tipoUsuario === "empresa" ? "company" : "user";
        if (data.user.role !== expected && data.user.role !== "admin") {
            setErro(expected === "user" ? "Esta conta é de empresa. Selecione Empresa Geradora." : "Esta conta é de comprador. Selecione Comprador / Artesão.");
            return;
        }
        // Login social não informa mustChangePassword; firstLogin continua obrigatório nos dois fluxos.
        const trocarSenha = data.mustChangePassword === true || data.user.status === "firstLogin";
        saveSession(data.token, { ...data.user, mustChangePassword: trocarSenha }, remember);
        navigate(trocarSenha ? "/primeiro-acesso" : data.user.role === "company" ? "/dashboardEmpresa" : voltarAoMarketplace ? origem : "/dashboardUsuario", { replace: true });
    }, [navigate, tipoUsuario, voltarAoMarketplace, origem]);

    const handleGoogleSuccess = useCallback((data: LoginResponse, remember: boolean) => {
        if (!data.token || !data.user?.id) throw new Error("Resposta de login inválida.");
        const trocarSenha = data.mustChangePassword === true || data.user.status === "firstLogin";
        saveSession(data.token, { ...data.user, mustChangePassword: trocarSenha }, remember);
        navigate(trocarSenha ? "/primeiro-acesso" : data.user.role === "company" ? "/dashboardEmpresa" : voltarAoMarketplace ? origem : "/dashboardUsuario", { replace: true });
    }, [navigate, voltarAoMarketplace, origem]);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (carregando) return;
        setErro("");
        setVerification(null);
        if (!email.trim() || !senha) { setErro("Informe e-mail e senha para continuar."); return; }
        setCarregando(true);
        try {
            const response = await api.post<LoginResponse>("/user/login", { email: email.trim(), password: senha });
            handleLoginSuccess(response.data, lembrarDeMim);
        } catch (error) {
            const response = axios.isAxiosError(error) ? error.response : undefined;
            const pending = response?.data?.verification;
            const canVerify = response?.status === 403 && response.data?.code === "EMAIL_VERIFICATION_REQUIRED" && typeof pending?.id === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(pending.id) && typeof pending?.email === "string";
            if (canVerify) {
                setVerification({ id: pending.id, email: pending.email });
            }
            setErro(canVerify ? "Sua conta já foi criada. Confirme seu e-mail pelo código para liberar o acesso." : apiStatus(error) === 401 ? "E-mail ou senha inválidos. Se você usa login social, entre com o provedor." : apiStatus(error) === 403 ? "Sua conta está inativa ou não tem acesso. Entre em contato com o suporte." : apiError(error, "Não foi possível entrar. Tente novamente."));
        } finally { setCarregando(false); }
    }

    return (
        <div className={styles.pagina}>
            {/* Painel fotográfico (apenas desktop) */}
            <aside className={styles.painelFoto} aria-hidden="true">
                <img
                    src="/hero-leather-scraps.jpg"
                    alt=""
                    className={styles.painelImagem}
                />
                <div className={styles.painelVeu} />
                <div className={styles.painelConteudo}>
                    <Link to="/" className={styles.painelMarca}>
                        <BrandIcon />
                        <span className={styles.painelMarcaTitulo}>
                            Reaproveita Franca
                        </span>
                    </Link>

                    <div>
                        <p className={styles.painelFrase}>
                            &ldquo;O retalho de hoje é a carteira de amanhã.&rdquo;
                        </p>
                        <p className={styles.painelAssinatura}>
                            Economia circular para o polo calçadista de Franca · SP
                        </p>
                    </div>
                </div>
            </aside>

            {/* Área do formulário */}
            <main className={styles.areaFormulario}>
                <div className={styles.barraTopo}>
                    <Link to="/" className={styles.barraMarca}>
                        <BrandIcon />
                        <span className={styles.barraMarcaTitulo}>
                            Reaproveita Franca
                        </span>
                    </Link>
                    <Link to="/" className={styles.barraVoltar}>
                        Início
                    </Link>
                </div>

                <div className={styles.formularioArea}>
                    <div className={styles.cartao}>
                        <h1 className={styles.titulo}>Acesse sua conta</h1>
                        {location.state?.accountDeleted && <p role="status" className="mt-4 rounded-xl bg-success/10 p-4 text-sm text-primary">Sua conta foi excluída e sua sessão foi encerrada.</p>}
                        <p className={styles.descricao}>
                            Entre para publicar materiais ou conhecer os lotes disponíveis.
                        </p>

                        {/* Alternador de perfil */}
                        <div className={styles.abas} role="tablist">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tipoUsuario === "empresa"}
                                onClick={() => handleTrocaTipo("empresa")}
                                className={
                                    tipoUsuario === "empresa"
                                        ? styles.abaAtiva
                                        : styles.abaInativa
                                }
                            >
                                Empresa Geradora
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tipoUsuario === "comprador"}
                                onClick={() => handleTrocaTipo("comprador")}
                                className={
                                    tipoUsuario === "comprador"
                                        ? styles.abaAtiva
                                        : styles.abaInativa
                                }
                            >
                                Comprador / Artesão
                            </button>
                        </div>

                        <form className={styles.formulario} onSubmit={handleSubmit}>
                            {erro && (
                                <p role="alert" className={styles.erroBox}>
                                    {erro}{verification && <button id="resume-verification" type="button" className="mt-3 block cursor-pointer font-bold underline" onClick={() => setVerificationOpen(true)}>Confirmar conta com código</button>}
                                </p>
                            )}

                            <div className={styles.campoGrupo}>
                                <label htmlFor="email" className={styles.rotulo}>
                                    {ehEmpresa ? "E-mail da empresa" : "E-mail"}
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="voce@exemplo.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setVerification(null); setErro(""); }}
                                    disabled={carregando}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.campoGrupo}>
                                <label htmlFor="senha" className={styles.rotulo}>
                                    Senha de acesso
                                </label>
                                <div className={styles.inputSenhaWrapper}>
                                    <input
                                        id="senha"
                                        type={mostrarSenha ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        placeholder="Sua senha secreta"
                                        value={senha}
                                        onChange={(e) => { setSenha(e.target.value); setVerification(null); setErro(""); }}
                                        disabled={carregando}
                                        className={`${styles.input} ${styles.inputSenha}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarSenha((v) => !v)}
                                        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                                        className={styles.botaoOlho}
                                    >
                                        {mostrarSenha ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.linhaOpcoes}>
                                <label className={styles.lembrarLabel}>
                                    <input
                                        type="checkbox"
                                        checked={lembrarDeMim}
                                        onChange={(e) => setLembrarDeMim(e.target.checked)}
                                        disabled={carregando}
                                        className={styles.checkbox}
                                    />
                                    Lembrar de mim
                                </label>
                                <Link to="/recuperar-senha" className="font-semibold text-primary underline">Esqueci minha senha</Link>
                            </div>

                            <button
                                type="submit"
                                disabled={carregando}
                                className={styles.botaoEntrar}
                            >
                                {carregando ? "Entrando…" : "Entrar na plataforma"}
                            </button>
                        </form>

                        <div className="mt-6"><GoogleSignIn key={tipoUsuario} onSuccess={handleGoogleSuccess} remember={lembrarDeMim} accountType={ehEmpresa ? "company" : undefined} /></div>
                        <p className={styles.rodapeCartao}>
                            Ainda não tem conta?{" "}
                            <Link to="/cadastro" className={styles.linkCadastro}>
                                Cadastre-se agora
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
            {verification && <EmailVerificationModal open={verificationOpen} userId={verification.id} email={verification.email} resuming onClose={() => setVerificationOpen(false)} onSuccess={() => { setVerificationOpen(false); setVerification(null); setErro(""); setSenha(""); }} />}
        </div>
    );
}
