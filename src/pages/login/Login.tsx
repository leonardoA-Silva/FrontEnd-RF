import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Repeat2, Eye, EyeOff } from "lucide-react";
import api, { type LoginResponse } from "../../axios/Axios";
import { apiError, apiStatus } from "../../axios/apiError";
import { saveSession } from "../../auth/session";
import GoogleSignIn from "./GoogleSignIn";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

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

    const ehEmpresa = tipoUsuario === "empresa";

    const styles = {
        pagina: "min-h-screen bg-[#FAF9F5] text-[#1B4B3A] flex flex-col",

        conteudo: "flex flex-1 items-center justify-center px-4 py-12 sm:px-6",
        cartao:
            "w-full max-w-[560px] rounded-[24px] border border-[#E7E4DA] bg-white px-6 py-10 shadow-[0_2px_16px_rgba(27,75,58,0.06)] sm:px-12",

        marca: "flex items-center justify-center gap-2.5",
        marcaIcone:
            "flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white",
        marcaTextos: "leading-tight text-left",
        marcaTitulo: "text-lg font-extrabold text-[#1B4B3A]",
        marcaSubtitulo: "text-[13px] font-extrabold tracking-wide text-[#D97706]",

        titulo: "mt-4 text-center text-[26px] font-extrabold text-[#0F3D2E]",

        abasContainer:
            "mt-6 grid grid-cols-2 rounded-xl bg-[#F7F5EF] p-1.5 text-sm font-medium",
        abaAtiva:
            "cursor-pointer rounded-lg bg-white px-4 py-2.5 text-center font-bold text-[#0F3D2E] shadow-sm",
        abaInativa:
            "cursor-pointer rounded-lg px-4 py-2.5 text-center text-[#6B7670] transition hover:text-[#0F3D2E]",

        formulario: "mt-7 flex flex-col gap-5",
        campoGrupo: "flex flex-col gap-2",
        rotulo: "text-[15px] font-medium text-[#2F3D38]",
        input:
            "w-full rounded-xl border border-[#D9D5C8] bg-white px-4 py-3.5 text-[15px] text-[#1B4B3A] placeholder:text-[#A8B0AB] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60",
        inputSenhaWrapper: "relative",
        inputSenha: "pr-12",
        botaoOlho:
            "absolute right-4 top-1/2 -translate-y-1/2 text-[#A8B0AB] transition hover:text-[#1B4B3A]",

        linhaOpcoes: "flex items-center justify-between text-sm",
        lembrarLabel: "flex cursor-pointer items-center gap-2 text-[#4B5A55]",
        checkbox:
            "h-[18px] w-[18px] cursor-pointer rounded accent-emerald-600",
        linkEsqueceu: "font-semibold text-emerald-600 transition hover:text-emerald-700",

        botaoEntrar:
            "mt-1 w-full rounded-xl bg-emerald-500 px-6 py-4 text-base font-bold text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70",

        erroBox:
            "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700",

        divisor: "flex items-center gap-4 text-xs text-[#A8B0AB]",
        divisorLinha: "h-px flex-1 bg-[#E7E4DA]",
        divisorTexto: "tracking-wide",

        sociais: "grid grid-cols-2 gap-4",
        botaoSocial:
            "flex items-center justify-center gap-2.5 rounded-xl border border-[#E7E4DA] bg-white px-4 py-3 text-[15px] font-medium text-[#2F3D38] transition hover:bg-[#FAF9F5]",
        iconeSocial: "h-5 w-5",

        rodapeCartao: "mt-6 text-center text-sm text-[#6B7670]",
        linkCadastro: "font-bold text-emerald-600 transition hover:text-emerald-700",
    };

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
        saveSession(data.token, { ...data.user, mustChangePassword: data.mustChangePassword === true }, remember);
        navigate(data.mustChangePassword ? "/primeiro-acesso" : data.user.role === "company" ? "/dashboardEmpresa" : voltarAoMarketplace ? origem : "/dashboardUsuario", { replace: true });
    }, [navigate, tipoUsuario, voltarAoMarketplace, origem]);

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

    return (
        <div className={styles.pagina}>
            <Header />

            <main className={styles.conteudo}>
                <div className={styles.cartao}>
                    {/* Logo centralizada */}
                    <div className={styles.marca}>
                        <span className={styles.marcaIcone}>
                            <Repeat2 className="h-5 w-5" strokeWidth={2.4} />
                        </span>
                        <div className={styles.marcaTextos}>
                            <p className={styles.marcaTitulo}>Reaproveita</p>
                            <p className={styles.marcaSubtitulo}>FRANCA</p>
                        </div>
                    </div>

                    <h1 className={styles.titulo}>Acesse sua conta</h1>
                    {location.state?.accountDeleted && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">Sua conta foi excluída e sua sessão foi encerrada.</p>}

                    {/* Alternador de perfil */}
                    <div className={styles.abasContainer} role="tablist">
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
                                {erro}
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
                                onChange={(e) => setEmail(e.target.value)}
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
                                    onChange={(e) => setSenha(e.target.value)}
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
                            <Link to="/recuperar-senha" className={styles.linkEsqueceu}>
                                Esqueceu a senha?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={carregando}
                            className={styles.botaoEntrar}
                        >
                            {carregando ? "Entrando..." : "Entrar na Plataforma"}
                        </button>
                    </form>

                    {!ehEmpresa && <div className="mt-7 space-y-5">
                        <div className={styles.divisor}><span className={styles.divisorLinha} /><span>OU ENTRAR COM</span><span className={styles.divisorLinha} /></div>
                        <GoogleSignIn onSuccess={handleLoginSuccess} remember={lembrarDeMim} />
                        <p className="text-xs text-gray-600">A entrada com LinkedIn ainda está indisponível. Use e-mail e senha ou Google.</p>
                    </div>}

                    <p className={styles.rodapeCartao}>
                        Ainda não tem conta?{" "}
                        <Link to="/cadastro" className={styles.linkCadastro}>
                            Cadastre-se agora
                        </Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
