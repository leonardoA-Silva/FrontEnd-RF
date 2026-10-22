import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Repeat2 } from "lucide-react";
import axios from "axios";
import api from "../../axios/Axios";

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
        pagina: "flex min-h-screen bg-papel text-carvao",

        painelFoto: "relative hidden w-[44%] shrink-0 lg:block",
        painelImagem: "absolute inset-0 h-full w-full object-cover",
        painelVeu: "absolute inset-0 bg-carvao/60",
        painelConteudo: "relative flex h-full flex-col justify-between p-10",
        painelMarca: "flex items-center gap-3 no-underline",
        painelMarcaIcone: "flex h-10 w-10 items-center justify-center rounded-lg bg-cru text-carvao",
        painelMarcaTitulo: "font-display text-lg font-semibold text-cru",
        painelFrase:
            "mt-auto font-display text-4xl font-medium italic leading-tight tracking-[-0.01em] text-cru",
        painelAssinatura: "mt-5 text-sm text-cru/80",

        areaFormulario: "flex flex-1 flex-col px-5 py-6 sm:px-10",
        barraTopo: "flex items-center justify-between lg:hidden",
        barraMarca: "flex items-center gap-3 no-underline",
        barraMarcaIcone: "flex h-10 w-10 items-center justify-center rounded-lg bg-carvao text-cru",
        barraMarcaTitulo: "font-display text-lg font-semibold text-carvao",
        barraVoltar:
            "text-sm font-semibold text-carvao-suave no-underline transition hover:text-carvao",

        formularioArea: "flex flex-1 items-center justify-center py-10",
        cartao: "w-full max-w-md",

        titulo: "font-display text-3xl font-semibold tracking-tight",
        descricao: "mt-2 text-[15px] text-carvao-suave",

        abas: "mt-8 grid grid-cols-2 gap-1 rounded-xl border border-areia bg-papel p-1",
        abaAtiva: "rounded-lg bg-carvao px-4 py-2.5 text-sm font-semibold text-cru",
        abaInativa:
            "rounded-lg px-4 py-2.5 text-sm font-medium text-carvao-suave transition hover:text-carvao",

        formulario: "mt-7 flex flex-col gap-5",
        campoGrupo: "flex flex-col gap-2",
        rotulo: "text-[15px] font-medium text-carvao-suave",
        input:
            "w-full rounded-xl border border-areia bg-cru px-4 py-3.5 text-[15px] text-carvao outline-none transition placeholder:text-carvao-suave/50 focus:border-canela focus:outline-none focus:ring-4 focus:ring-canela/15 disabled:opacity-60",
        inputSenhaWrapper: "relative",
        inputSenha: "pr-12",
        botaoOlho:
            "absolute right-4 top-1/2 -translate-y-1/2 text-carvao-suave/70 transition hover:text-carvao",

        linhaOpcoes: "flex items-center justify-between text-sm",
        lembrarLabel: "flex cursor-pointer items-center gap-2 text-carvao-suave",
        checkbox: "h-[18px] w-[18px] cursor-pointer rounded accent-canela",
        linkEsqueceu:
            "font-semibold text-canela no-underline transition hover:text-canela-escura",

        botaoEntrar:
            "rounded-xl bg-canela px-6 py-4 text-base font-bold text-cru transition hover:bg-canela-escura focus:outline-none focus:ring-4 focus:ring-canela/25 disabled:cursor-not-allowed disabled:opacity-70",

        erroBox:
            "rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700",

        divisor: "mt-7 flex items-center gap-4 text-xs text-carvao-suave/70",
        divisorLinha: "h-px flex-1 bg-areia",

        sociais: "mt-6 grid grid-cols-2 gap-4",
        botaoSocial:
            "flex items-center justify-center gap-2.5 rounded-xl border border-areia bg-cru px-4 py-3 text-[15px] font-medium text-carvao transition hover:bg-papel",
        iconeSocial: "h-5 w-5",

        rodapeCartao: "mt-7 text-center text-sm text-carvao-suave",
        linkCadastro:
            "font-bold text-canela no-underline transition hover:text-canela-escura",
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
                        <span className={styles.painelMarcaIcone}>
                            <Repeat2 className="h-5 w-5" strokeWidth={2.4} />
                        </span>
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
                        <span className={styles.barraMarcaIcone}>
                            <Repeat2 className="h-5 w-5" strokeWidth={2.4} />
                        </span>
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
                        <p className={styles.descricao}>
                            Entre para publicar lotes ou reservar material.
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
                                {carregando ? "Entrando…" : "Entrar na plataforma"}
                            </button>
                        </form>

                        <div className={styles.divisor}>
                            <span className={styles.divisorLinha} />
                            <span>ou entre com</span>
                            <span className={styles.divisorLinha} />
                        </div>

                        <div className={styles.sociais}>
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
                                    <rect width="24" height="24" rx="4" fill="#0A66C2" />
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
                </div>
            </main>
        </div>
    );
}
