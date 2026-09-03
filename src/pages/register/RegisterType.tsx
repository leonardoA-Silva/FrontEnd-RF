import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function RegisterType() {
  const navigate = useNavigate();
  const [tipoConta, setTipoConta] = useState<"empresa" | "pessoal">("empresa");

  // Estilos centralizados aqui dentro da função, seguindo o padrão da Home.
  const styles = {
    pagina: "min-h-screen flex flex-col justify-between bg-[#FAF9F5] text-[#1B4B3A]",
    conteudoCentral: "flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8",
    cartao: "w-full max-w-[720px] rounded-3xl border border-[#E7E4DA] bg-white p-8 shadow-sm sm:p-12",

    cabecalhoEtapa: "flex flex-col gap-3",
    topoEtapa: "flex items-center justify-between",
    textoEtapa: "text-xs font-bold tracking-wider text-emerald-600 uppercase",
    textoProximo: "text-xs text-[#9CA3AF]",
    trilhaProgresso: "h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]",
    barraProgresso: "h-full w-1/3 rounded-full bg-emerald-500 transition-all duration-300",

    titulosContainer: "mt-7",
    tituloFormulario: "text-2xl font-bold tracking-tight text-[#1B4B3A] sm:text-3xl",
    subtituloFormulario: "mt-1.5 text-sm leading-relaxed text-[#6B7670]",

    gradeTipos: "mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2",
    cartaoTipo: (selecionado: boolean) =>
      `group relative flex flex-col overflow-hidden rounded-2xl border-4 transition-all duration-200 cursor-pointer ${
        selecionado
          ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20 scale-[1.01]"
          : "border-transparent opacity-80 hover:opacity-100 hover:border-emerald-200 hover:scale-[1.01]"
      }`,
    imagemContainer: "h-44 w-full overflow-hidden bg-gray-100",
    imagem: "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
    rotuloTipo: "bg-[#0F3D2E] py-3.5 text-center text-lg font-bold text-white tracking-wide",

    rodapeBotoes: "mt-10 flex items-center justify-between pt-2",
    botaoCancelar:
      "rounded-lg border border-[#D9D5C8] bg-white px-6 py-2.5 text-sm font-semibold text-[#1B4B3A] transition hover:bg-[#F3F1EA] cursor-pointer",
    botaoSalvar:
      "flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 cursor-pointer",
  };

  const handleSalvarEContinuar = () => {
    if (tipoConta === "empresa") {
      navigate("/cadastro-empresa");
    } else {
      navigate("/cadastro-pessoal");
    }
  };

  const handleCancelar = () => {
    navigate("/");
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.conteudoCentral}>
        <div className={styles.cartao}>
          {/* Indicador de etapa e progresso */}
          <div className={styles.cabecalhoEtapa}>
            <div className={styles.topoEtapa}>
              <span className={styles.textoEtapa}>PASSO 1 DE 3: PERFIL</span>
              <span className={styles.textoProximo}>Próximo: Materiais Frequentes</span>
            </div>
            <div className={styles.trilhaProgresso}>
              <div className={styles.barraProgresso} />
            </div>
          </div>

          {/* Título e descrição */}
          <div className={styles.titulosContainer}>
            <h1 className={styles.tituloFormulario}>
              Escolha seu tipo de conta para cadastrar-se
            </h1>
            <p className={styles.subtituloFormulario}>
              Registre sua fábrica ou uma conta pessoal para publicar resíduos regularmente.
            </p>
          </div>

          {/* Cards de seleção do tipo de conta */}
          <div className={styles.gradeTipos}>
            {/* Opção: Empresa */}
            <div
              onClick={() => setTipoConta("empresa")}
              className={styles.cartaoTipo(tipoConta === "empresa")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setTipoConta("empresa")}
            >
              <div className={styles.imagemContainer}>
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80"
                  alt="Aperto de mãos empresarial"
                  className={styles.imagem}
                />
              </div>
              <div className={styles.rotuloTipo}>Empresa</div>
            </div>

            {/* Opção: Pessoal */}
            <div
              onClick={() => setTipoConta("pessoal")}
              className={styles.cartaoTipo(tipoConta === "pessoal")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setTipoConta("pessoal")}
            >
              <div className={styles.imagemContainer}>
                <img
                  src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=600&q=80"
                  alt="Profissional autônomo trabalhando"
                  className={styles.imagem}
                />
              </div>
              <div className={styles.rotuloTipo}>Pessoal</div>
            </div>
          </div>

          {/* Ações do Rodapé */}
          <div className={styles.rodapeBotoes}>
            <button
              type="button"
              onClick={handleCancelar}
              className={styles.botaoCancelar}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSalvarEContinuar}
              className={styles.botaoSalvar}
            >
              Salvar e Continuar
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
