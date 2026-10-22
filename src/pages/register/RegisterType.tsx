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
        "Artesãos, cooperativas, escolas e pequenos negócios que reservam material.",
    },
  ];

  const styles = {
    pagina: "flex min-h-screen flex-col bg-papel text-carvao",
    area: "flex flex-1 items-center justify-center px-5 py-10 sm:px-8",
    cartao: "w-full max-w-3xl rounded-2xl border border-areia bg-cru p-6 sm:p-10",

    indicadorEtapa: "flex flex-col gap-3",
    etapaRotulo: "flex items-baseline justify-between gap-3",
    etapaAtual: "text-sm font-semibold text-canela-escura",
    etapaProxima: "text-xs text-carvao-suave/70",
    etapaBarra: "flex gap-1.5",
    etapaSegmentoPreenchido: "h-1.5 flex-1 rounded-full bg-canela",
    etapaSegmentoVazio: "h-1.5 flex-1 rounded-full bg-areia",

    cabecalho: "mt-8",
    titulo: "font-display text-2xl font-semibold tracking-tight sm:text-3xl",
    descricao: "mt-2 text-[15px] text-carvao-suave",

    gradeOpcoes: "mt-8 grid gap-5 sm:grid-cols-2",
    opcao: "relative block cursor-pointer",
    opcaoInput: "sr-only",
    opcaoCartao:
      "relative overflow-hidden rounded-2xl border-2 transition",
    opcaoSelecionada: "border-canela outline-2 outline-dashed outline-canela/50 outline-offset-4",
    opcaoVazia: "border-areia hover:border-carvao-suave/50",
    opcaoImagem: "h-40 w-full object-cover sm:h-44",
    opcaoCorpo: "p-5",
    opcaoTitulo: "font-display text-lg font-semibold text-carvao",
    opcaoDescricao: "mt-1 text-sm leading-relaxed text-carvao-suave",
    opcaoSelo:
      "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-canela text-cru shadow-sm",

    acoes: "mt-8 flex flex-wrap items-center justify-between gap-3",
    botaoVoltar:
      "rounded-xl border border-areia px-5 py-3 text-sm font-semibold text-carvao transition hover:border-carvao-suave hover:bg-areia-clara",
    botaoContinuar:
      "flex items-center gap-2 rounded-xl bg-canela px-6 py-3 text-sm font-bold text-cru transition hover:bg-canela-escura",
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
              Escolha o tipo de conta: empresas publicam resíduos; compradores
              reservam.
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
