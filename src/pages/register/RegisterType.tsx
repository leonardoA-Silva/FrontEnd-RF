import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function RegisterType() {
  const navigate = useNavigate();
  const [tipoConta, setTipoConta] = useState<"empresa" | "pessoal">("empresa");

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

  const opcoes = [
    {
      valor: "empresa" as const,
      imagem: "/hero-leather-scraps.jpg",
      imagemAlt: "Retalhos de couro sobre mesa de madeira",
      titulo: "Empresa geradora",
      descricao:
        "Curtumes e fábricas de calçado que publicam lotes de resíduo — por venda ou doação.",
    },
    {
      valor: "pessoal" as const,
      imagem: "/retalho-couro-nobre.png",
      imagemAlt: "Pilha de retalhos de couro marrom",
      titulo: "Comprador / artesão",
      descricao:
        "Pessoas e organizações que procuram materiais para reaproveitar.",
    },
  ];

  const styles = {
    pagina: "screen-enter flex min-h-svh flex-col bg-papel text-carvao",
    area: "flex flex-1 items-center justify-center px-5 py-10 sm:px-8",
    cartao: "w-full max-w-4xl bg-cru p-6 sm:p-10 lg:p-12",

    indicadorEtapa: "flex flex-col gap-3",
    etapaRotulo: "flex items-baseline justify-between gap-3",
    etapaAtual: "text-sm font-semibold text-verde-escuro",
    etapaProxima: "text-xs text-carvao-suave/70",
    etapaBarra: "flex gap-1.5",
    etapaSegmentoPreenchido: "h-1.5 flex-1 rounded-full bg-verde-escuro",
    etapaSegmentoVazio: "h-1.5 flex-1 rounded-full bg-areia",

    cabecalho: "mt-8",
    titulo: "font-display text-2xl font-semibold tracking-tight sm:text-3xl",
    descricao: "mt-3 max-w-[58ch] text-base leading-7 text-carvao-suave",

    gradeOpcoes: "motion-stagger mt-8 grid gap-5 sm:grid-cols-2",
    opcao: "relative block cursor-pointer",
    opcaoInput: "sr-only",
    opcaoCartao:
      "relative overflow-hidden border-2 transition-[border-color,transform] duration-200 ease-out active:scale-[0.99]",
    opcaoSelecionada: "border-verde-escuro",
    opcaoVazia: "border-areia hover:border-carvao-suave/70",
    opcaoImagem: "h-48 w-full object-cover sm:h-56",
    opcaoCorpo: "p-5 sm:p-6",
    opcaoTitulo: "font-display text-lg font-semibold text-carvao",
    opcaoDescricao: "mt-2 text-base leading-7 text-carvao-suave",
    opcaoSelo:
      "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-verde-escuro text-white",

    acoes: "mt-8 flex flex-wrap items-center justify-between gap-3",
    botaoVoltar:
      "rounded-full border border-areia px-5 py-3 text-sm font-semibold text-carvao transition hover:border-carvao-suave hover:bg-areia-clara",
    botaoContinuar:
      "flex items-center gap-2 rounded-full bg-verde-escuro px-6 py-3 text-sm font-bold text-white transition-[transform,background-color] duration-150 hover:bg-verde active:scale-[0.98]",
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.area}>
        <div className={styles.cartao}>
          {/* Indicador de etapa */}
          <div className={styles.indicadorEtapa}>
            <div className={styles.etapaRotulo}>
              <p className={styles.etapaAtual}>Etapa 1 de 3 · Tipo de conta</p>
              <p className={styles.etapaProxima}>Depois: dados e confirmação por e-mail</p>
            </div>
            <div className={styles.etapaBarra}>
              <span className={styles.etapaSegmentoPreenchido} />
              <span className={styles.etapaSegmentoVazio} />
              <span className={styles.etapaSegmentoVazio} />
            </div>
          </div>

          {/* Título */}
          <div className={styles.cabecalho}>
            <h1 className={styles.titulo}>Como você vai usar a plataforma?</h1>
            <p className={styles.descricao}>
              Empresas publicam materiais; pessoas e organizações procuram opções para reaproveitar.
            </p>
          </div>

          {/* Cards de seleção */}
          <div className={styles.gradeOpcoes}>
            {opcoes.map(({ valor, imagem, imagemAlt, titulo, descricao }) => (
              <label key={valor} className={styles.opcao}>
                <input
                  type="radio"
                  name="tipo-conta"
                  value={valor}
                  checked={tipoConta === valor}
                  onChange={() => setTipoConta(valor)}
                  className={styles.opcaoInput}
                />
                <div
                  className={`${styles.opcaoCartao} ${
                    tipoConta === valor ? styles.opcaoSelecionada : styles.opcaoVazia
                  }`}
                >
                  {tipoConta === valor && (
                    <span className={styles.opcaoSelo}>
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  )}
                  <img src={imagem} alt={imagemAlt} className={styles.opcaoImagem} />
                  <div className={styles.opcaoCorpo}>
                    <p className={styles.opcaoTitulo}>{titulo}</p>
                    <p className={styles.opcaoDescricao}>{descricao}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Ações */}
          <div className={styles.acoes}>
            <button type="button" onClick={handleCancelar} className={styles.botaoVoltar}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvarEContinuar}
              className={styles.botaoContinuar}
            >
              Salvar e continuar
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
