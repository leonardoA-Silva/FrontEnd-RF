import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Repeat2, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import api from "../../axios/Axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

type TipoUsuario = "empresa" | "comprador";

export default function Login() {
    const navigate = useNavigate();
    const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>("empresa");
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
    function mensagemDeErroLogin(err: unknown): string {
        if (!axios.isAxiosError(err)) {
            return "Erro inesperado ao fazer login. Tente novamente.";
        }
        if (!err.response) {
            return "Não foi possível conectar à API. Verifique sua conexão e se a API está rodando.";
        }
        const resposta = err.response.data as Record<string, unknown> | undefined;
        console.error("[login] erro da API", err.response.status, resposta);
        // A API pode chamar o texto de 4 jeitos: procura em todos.
        for (const chave of ["error", "message", "msg", "erros"]) {
            const valor = resposta?.[chave];
            if (valor) {
                return Array.isArray(valor) ? valor.join(" ") : String(valor);
            }
        }
        if (err.response.status === 401 || err.response.status === 404) {
            return "E-mail ou senha inválidos.";
        }
        return "Erro ao fazer login. Tente novamente.";
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

                    <div className={`${styles.divisor} mt-7`}>
                        <span className={styles.divisorLinha} />
                        <span className={styles.divisorTexto}>OU ENTRAR COM</span>
                        <span className={styles.divisorLinha} />
                    </div>

                    <div className={`${styles.sociais} mt-6`}>
                        <button type="button" className={styles.botaoSocial}>
                            <svg viewBox="0 0 24 24" className={styles.iconeSocial} aria-hidden="true">
                                <path
                                    fill="#4285F4"
                                    d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24Z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1Z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.42-3.42A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1c.95-2.84 3.6-4.95 6.73-4.95Z"
                                />
                            </svg>
                            Google
                        </button>
                        <button type="button" className={styles.botaoSocial}>
                            <svg viewBox="0 0 24 24" className={styles.iconeSocial} aria-hidden="true">
                                <rect width="24" height="24" rx="4" fill="#2B2BEB" />
                                <path
                                    fill="#fff"
                                    d="M6.94 8.5H4.06V20h2.88V8.5ZM5.5 7.3a1.67 1.67 0 1 0 0-3.34 1.67 1.67 0 0 0 0 3.34Zm6.14 6.13c0-1.06.57-1.92 1.9-1.92 1.27 0 1.8.86 1.8 1.92V20h2.88v-7.04c0-2.68-1.43-3.93-3.34-3.93-1.54 0-2.23.85-2.62 1.45V8.5H8.78c.04.82 0 11.5 0 11.5h2.86v-6.57Z"
                                />
                            </svg>
                            LinkedIn
                        </button>
                    </div>

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
