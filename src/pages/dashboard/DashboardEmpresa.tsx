import { useCallback, useEffect, useState } from "react";
import {
  AlarmClock,
  Bookmark,
  CheckCircle2,
  Coins,
  Leaf,
  Package,
  Plus,
  Star,
} from "lucide-react";
import AvisoEmBreve from "../../components/dashboard/AvisoEmBreve";
import DashboardShell from "../../components/dashboard/DashboardShell";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { mensagemDeErroApi } from "../../utils/apiError";
import { listarProdutos, type ProdutoApi } from "./dashboardApi";

type EstadoCarga = "carregando" | "pronto" | "erro";

const CATEGORIAS: Record<string, string> = {
  madeira: "Madeira",
  metal: "Metal",
  plastico: "Plástico",
  "papel/papelao": "Papel e papelão",
  vidro: "Vidro",
  tecido: "Tecido",
  borracha: "Borracha",
  eletronicos: "Eletrônicos",
};

const CONSERVACAO: Record<string, string> = {
  new: "Novo",
  good: "Bom estado",
  regular: "Estado regular",
  poor: "Com desgaste",
};

const SELOS: Record<string, { rotulo: string; classe: string }> = {
  available: { rotulo: "Ativo", classe: "bg-verde-claro text-verde-escuro" },
  reserved: { rotulo: "Reservado", classe: "bg-ambar-fundo text-ambar" },
  unavailable: { rotulo: "Indisponível", classe: "bg-[#f1f4f2] text-tinta-suave" },
};

// Atividade ainda não tem rota na API. São exemplos de demonstração,
// no mesmo formato que a futura resposta de /notification deve entregar.
const ATIVIDADES_DEMO = [
  {
    icone: Bookmark,
    destaque: "Silvana M. (Artesã)",
    resto: " reservou os Retalhos de Couro",
    tempo: "Há 10 min",
  },
  {
    icone: CheckCircle2,
    destaque: "Ateliê Reutiliza",
    resto: " coletou 120 kg de Pallets",
    tempo: "Ontem",
  },
  {
    icone: Star,
    destaque: "Assoc. Tecendo Franca",
    resto: " avaliou seu curtume com 5 estrelas",
    tempo: "Há 3 dias",
  },
];

const formatadorPeso = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

function formatarPeso(produto: ProdutoApi) {
  const peso = Number(produto.weight);
  return `${formatadorPeso.format(Number.isFinite(peso) ? peso : 0)} kg`;
}

export default function DashboardEmpresa() {
  const { displayName, userId } = useLoggedUser({ fallbackName: "Minha Empresa" });
  const [produtos, setProdutos] = useState<ProdutoApi[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>("carregando");
  const [erro, setErro] = useState("");
  const [expandido, setExpandido] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const avisar = useCallback((tela: string) => setAviso(tela), []);
  const fecharAviso = useCallback(() => setAviso(null), []);

  const buscarProdutosDaEmpresa = useCallback(async () => {
    const lista = await listarProdutos();
    const id = (userId ?? "").toLowerCase();
    return lista.filter((produto) => produto.id_user?.toLowerCase() === id);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let ativo = true;

    buscarProdutosDaEmpresa()
      .then((meus) => {
        if (!ativo) return;
        setProdutos(meus);
        setEstado("pronto");
      })
      .catch((error: unknown) => {
        if (!ativo) return;
        setErro(
          mensagemDeErroApi(error, "Não foi possível carregar seus materiais agora.")
        );
        setEstado("erro");
      });

    return () => {
      ativo = false;
    };
  }, [buscarProdutosDaEmpresa, userId]);

  const tentarNovamente = useCallback(async () => {
    setEstado("carregando");
    setErro("");

    try {
      setProdutos(await buscarProdutosDaEmpresa());
      setEstado("pronto");
    } catch (error) {
      setErro(mensagemDeErroApi(error, "Não foi possível carregar seus materiais agora."));
      setEstado("erro");
    }
  }, [buscarProdutosDaEmpresa]);

  const semUsuario = !userId;
  const estadoVisivel: EstadoCarga = semUsuario ? "erro" : estado;
  const erroVisivel = semUsuario
    ? "Não conseguimos identificar sua empresa nesta sessão. Saia e entre novamente."
    : erro;

  const carregando = estadoVisivel === "carregando";
  const indisponiveis = produtos.filter(
    (produto) => produto.status === "unavailable"
  ).length;

  const kpis = [
    {
      icone: Package,
      rotulo: "Materiais Publicados",
      valor: carregando || estadoVisivel === "erro" ? "—" : String(produtos.length),
      detalhe: carregando
        ? "Carregando seus materiais…"
        : estadoVisivel === "erro"
          ? "Não disponível"
          : `${indisponiveis} indisponíveis`,
    },
    {
      icone: AlarmClock,
      rotulo: "Reservas Ativas",
      valor: "8",
      detalhe: "Aguardando retirada",
    },
    {
      icone: Leaf,
      rotulo: "Resíduos Desviados",
      valor: "1.450 kg",
      detalhe: "Desviados do aterro local",
    },
    {
      icone: Coins,
      rotulo: "Valor Social Gerado",
      valor: "R$ 12.300",
      detalhe: "Economia para artesãos",
    },
  ];

  const visiveis = expandido ? produtos : produtos.slice(0, 4);

  const styles = {
    topo: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
    titulo:
      "text-[26px] font-bold leading-tight tracking-tight text-verde-escuro sm:text-[30px] xl:text-[34px]",
    subtitulo: "mt-2 max-w-2xl text-[14px] leading-relaxed text-tinta-suave sm:text-[15px]",
    botaoPrincipal:
      "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-verde px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-verde-escuro",
    gradeKpis: "mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
    cartaoKpi:
      "flex items-center gap-4 rounded-xl border border-linha bg-white px-5 py-4",
    iconeKpi:
      "grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-verde-claro text-verde",
    rotuloKpi: "truncate text-[13px] font-medium text-tinta-suave",
    valorKpi:
      "mt-1 text-[24px] font-bold leading-none tracking-tight text-verde-escuro",
    detalheKpi: "mt-1.5 text-[12px] leading-snug text-tinta-clara",
    notaDemo: "mt-3 text-[12px] leading-relaxed text-tinta-clara",

    gradePaineis: "mt-6 grid gap-5 xl:grid-cols-[1.9fr_1fr]",
    painel: "flex flex-col rounded-xl border border-linha bg-white px-6 py-5",
    painelTopo: "flex items-start justify-between gap-3",
    painelTitulo: "text-[19px] font-bold tracking-tight text-verde-escuro",
    painelLink:
      "mt-1 shrink-0 text-[13px] font-semibold text-verde transition-colors hover:text-verde-escuro",
    seloDemo: "mt-1 block text-[11px] text-tinta-clara",

    lista: "mt-2",
    linha: "flex items-center justify-between gap-4 border-b border-linha py-4 first:pt-3 last:border-0 last:pb-0",
    linhaTitulo: "truncate text-[15px] font-semibold text-tinta",
    linhaDetalhe: "mt-1 truncate text-[12px] text-tinta-clara",
    linhaDireita: "flex shrink-0 items-center gap-4",
    linhaPeso: "text-right text-[14px] font-semibold tabular-nums text-tinta",
    selo: "rounded-md px-2.5 py-1 text-[11px] font-semibold",

    esqueletoLinha: "border-b border-linha py-4 last:border-0",
    esqueletoBarra: "h-4 animate-pulse rounded bg-linha",
    esqueletoBarraCurta: "mt-2 h-3 w-1/3 animate-pulse rounded bg-linha",

    estadoVazio: "py-10 text-center",
    estadoVazioTitulo: "text-[15px] font-semibold text-tinta",
    estadoVazioTexto: "mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-tinta-suave",
    estadoErro: "flex flex-col items-start gap-3 py-8",
    estadoErroTexto: "text-[13px] leading-relaxed text-tinta-suave",
    botaoContorno:
      "rounded-lg border border-linha px-4 py-2 text-[13px] font-semibold text-verde-escuro transition-colors hover:bg-bruma",

    atividades: "mt-4 flex flex-col gap-4",
    atividade: "flex items-start gap-3",
    atividadeIcone:
      "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-verde-claro text-verde",
    atividadeTexto: "min-w-0 text-[13px] leading-relaxed text-tinta-suave",
    atividadeDestaque: "font-semibold text-tinta",
    atividadeTempo: "mt-1 text-[11px] text-tinta-clara",
    atividadesLink:
      "mt-auto pt-6 text-left text-[13px] font-semibold text-verde transition-colors hover:text-verde-escuro",
  };

  return (
    <DashboardShell active="materiais" onSoon={avisar}>
      {aviso && <AvisoEmBreve texto={aviso} onFechar={fecharAviso} />}

      <div className={styles.topo}>
        <div className="min-w-0">
          <h1 className={styles.titulo}>Olá, {displayName}!</h1>
          <p className={styles.subtitulo}>
            Acompanhe o impacto da sua fábrica e gerencie seus anúncios de resíduos.
          </p>
        </div>

        <button
          type="button"
          className={styles.botaoPrincipal}
          onClick={() => avisar("Publicar Novo Material")}
        >
          <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
          Publicar Novo Material
        </button>
      </div>

      <section aria-label="Resumo da conta" aria-busy={carregando}>
        <div className={styles.gradeKpis}>
          {kpis.map(({ icone: Icone, rotulo, valor, detalhe }) => (
            <article key={rotulo} className={styles.cartaoKpi}>
              <span className={styles.iconeKpi}>
                <Icone size={23} strokeWidth={1.9} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className={styles.rotuloKpi}>{rotulo}</p>
                <p className={styles.valorKpi}>{valor}</p>
                <p className={styles.detalheKpi}>{detalhe}</p>
              </div>
            </article>
          ))}
        </div>

        <p className={styles.notaDemo}>
          Reservas, resíduos desviados e valor social são valores ilustrativos até a
          integração desses indicadores à API.
        </p>
      </section>

      <div className={styles.gradePaineis}>
        <section className={styles.painel} aria-labelledby="titulo-residuos">
          <div className={styles.painelTopo}>
            <h2 id="titulo-residuos" className={styles.painelTitulo}>
              Últimos Resíduos Publicados
            </h2>
            {estadoVisivel === "pronto" && produtos.length > 4 && (
              <button
                type="button"
                className={styles.painelLink}
                onClick={() => setExpandido((aberto) => !aberto)}
              >
                {expandido ? "Mostrar menos" : `Ver todos (${produtos.length})`}
              </button>
            )}
          </div>

          {carregando && (
            <>
              <span className="sr-only">Carregando seus materiais…</span>
              <ul className={styles.lista} aria-hidden="true">
                {[0, 1, 2, 3].map((linha) => (
                  <li key={linha} className={styles.esqueletoLinha}>
                    <div className={`${styles.esqueletoBarra} w-2/3`} />
                    <div className={styles.esqueletoBarraCurta} />
                  </li>
                ))}
              </ul>
            </>
          )}

          {estadoVisivel === "erro" && (
            <div className={styles.estadoErro}>
              <p className={styles.estadoErroTexto}>{erroVisivel}</p>
              <button
                type="button"
                className={styles.botaoContorno}
                onClick={() => void tentarNovamente()}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {estadoVisivel === "pronto" && produtos.length === 0 && (
            <div className={styles.estadoVazio}>
              <p className={styles.estadoVazioTitulo}>
                Nenhum material publicado ainda
              </p>
              <p className={styles.estadoVazioTexto}>
                Publique o primeiro lote para acompanhar reservas e retiradas por aqui.
              </p>
              <button
                type="button"
                className={`${styles.botaoPrincipal} mt-5`}
                onClick={() => avisar("Publicar Novo Material")}
              >
                <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
                Publicar primeiro material
              </button>
            </div>
          )}

          {estadoVisivel === "pronto" && produtos.length > 0 && (
            <ul className={styles.lista}>
              {visiveis.map((produto) => {
                const selo = SELOS[produto.status] ?? {
                  rotulo: produto.status,
                  classe: "bg-[#f1f4f2] text-tinta-suave",
                };

                return (
                  <li key={produto.id} className={styles.linha}>
                    <div className="min-w-0">
                      <p className={styles.linhaTitulo}>{produto.name}</p>
                      <p className={styles.linhaDetalhe}>
                        {CATEGORIAS[produto.category] ?? produto.category} ·{" "}
                        {CONSERVACAO[produto.conservation_state] ??
                          produto.conservation_state}
                      </p>
                    </div>
                    <div className={styles.linhaDireita}>
                      <span className={styles.linhaPeso}>{formatarPeso(produto)}</span>
                      <span className={`${styles.selo} ${selo.classe}`}>
                        {selo.rotulo}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={styles.painel} aria-labelledby="titulo-atividades">
          <div className={styles.painelTopo}>
            <div>
              <h2 id="titulo-atividades" className={styles.painelTitulo}>
                Atividade Circular Recente
              </h2>
              <span className={styles.seloDemo}>Demonstração — dados ilustrativos</span>
            </div>
          </div>

          <ul className={styles.atividades}>
            {ATIVIDADES_DEMO.map(({ icone: Icone, destaque, resto, tempo }) => (
              <li key={`${destaque}-${tempo}`} className={styles.atividade}>
                <span className={styles.atividadeIcone}>
                  <Icone size={18} strokeWidth={2} aria-hidden="true" />
                </span>
                <div className={styles.atividadeTexto}>
                  <p>
                    <span className={styles.atividadeDestaque}>{destaque}</span>
                    {resto}
                  </p>
                  <p className={styles.atividadeTempo}>{tempo}</p>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={styles.atividadesLink}
            onClick={() => avisar("Histórico de Atividades")}
          >
            Ver todas as atividades
          </button>
        </section>
      </div>
    </DashboardShell>
  );
}
