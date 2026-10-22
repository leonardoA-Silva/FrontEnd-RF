import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import DashboardShell from "../../components/dashboard/DashboardShell";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { mensagemDeErroApi } from "../../utils/apiError";
import { listarProdutos, type ProdutoApi } from "./dashboardApi";

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

const STATUS: Record<string, string> = {
  available: "Disponível",
  reserved: "Reservado",
  unavailable: "Indisponível",
};

const formatador = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type FiltroNegociacao = "todos" | "sale" | "donation";

export default function MeusMateriais() {
  const { userId } = useLoggedUser({ fallbackName: "Minha Empresa" });
  const [produtos, setProdutos] = useState<ProdutoApi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [negociacao, setNegociacao] = useState<FiltroNegociacao>("todos");

  useEffect(() => {
    if (!userId) return;
    let ativo = true;

    listarProdutos()
      .then((todos) => {
        if (ativo) {
          setProdutos(todos.filter((produto) => produto.id_user?.toLowerCase() === userId.toLowerCase()));
        }
      })
      .catch((error: unknown) => {
        if (ativo) {
          setErro(mensagemDeErroApi(error, "Não foi possível carregar seus materiais agora."));
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [userId]);

  const tentarNovamente = useCallback(async () => {
    if (!userId) return;
    setCarregando(true);
    setErro("");
    try {
      const todos = await listarProdutos();
      setProdutos(todos.filter((produto) => produto.id_user?.toLowerCase() === userId.toLowerCase()));
    } catch (error) {
      setErro(mensagemDeErroApi(error, "Não foi possível carregar seus materiais agora."));
    } finally {
      setCarregando(false);
    }
  }, [userId]);

  const erroVisivel = userId
    ? erro
    : "Não foi possível identificar sua empresa nesta sessão. Entre novamente.";

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return produtos.filter((produto) => {
      const correspondeBusca =
        !termo ||
        produto.name.toLocaleLowerCase("pt-BR").includes(termo) ||
        (CATEGORIAS[produto.category] ?? produto.category)
          .toLocaleLowerCase("pt-BR")
          .includes(termo);
      return correspondeBusca && (negociacao === "todos" || produto.type_negotiation === negociacao);
    });
  }, [busca, negociacao, produtos]);

  const styles = {
    cabecalho: "flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
    titulo: "text-[26px] font-bold leading-tight tracking-tight text-verde-escuro sm:text-[30px]",
    descricao: "mt-2 max-w-2xl text-[14px] leading-relaxed text-tinta-suave",
    botao: "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-verde px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-verde-escuro",
    resumo: "mt-7 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-tinta-suave",
    quantidade: "text-2xl font-bold tabular-nums text-tinta",
    filtros: "mt-5 flex flex-col gap-3 sm:flex-row sm:items-center",
    campoBusca: "relative min-w-0 flex-1",
    inputBusca: "h-11 w-full rounded-lg border border-linha bg-white py-2 pl-10 pr-10 text-sm text-tinta placeholder:text-tinta-clara focus:border-verde focus:outline-none focus:ring-2 focus:ring-verde/20",
    select: "h-11 w-full rounded-lg border border-linha bg-white px-3 text-sm text-tinta focus:border-verde focus:outline-none focus:ring-2 focus:ring-verde/20 sm:w-52",
    tabelaWrap: "mt-5 overflow-hidden rounded-xl border border-linha bg-white",
    tabela: "w-full border-collapse text-left",
    th: "h-11 border-b border-linha px-5 text-xs font-medium text-tinta-suave",
    td: "border-b border-linha px-5 py-4 text-sm last:border-0",
    vazio: "px-5 py-16 text-center",
    tituloVazio: "text-base font-semibold text-tinta",
    descricaoVazio: "mx-auto mt-2 max-w-md text-sm leading-relaxed text-tinta-suave",
    estado: "rounded-xl border border-linha bg-white px-5 py-12 text-center text-sm text-tinta-suave",
  };

  return (
    <DashboardShell active="materiais" onSoon={() => undefined}>
      <div className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Meus Materiais</h1>
          <p className={styles.descricao}>
            Gerencie os materiais que sua empresa disponibiliza para reaproveitamento.
          </p>
        </div>
        <Link to="/dashboardEmpresa/materiais/novo" className={styles.botao}>
          <Plus size={18} aria-hidden="true" />
          Cadastrar material
        </Link>
      </div>

      {!carregando && !erroVisivel && (
        <div className={styles.resumo} aria-live="polite">
          <span className={styles.quantidade}>{produtos.length}</span>
          <span>{produtos.length === 1 ? "material cadastrado" : "materiais cadastrados"}</span>
        </div>
      )}

      <div className={styles.filtros}>
        <div className={styles.campoBusca}>
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-clara" aria-hidden="true" />
          <label className="sr-only" htmlFor="buscar-material">Buscar materiais</label>
          <input
            id="buscar-material"
            className={styles.inputBusca}
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por nome ou categoria"
          />
          {busca && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-tinta-suave hover:bg-bruma"
              onClick={() => setBusca("")}
              aria-label="Limpar busca"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <label className="sr-only" htmlFor="filtrar-negociacao">Filtrar por tipo de anúncio</label>
        <select
          id="filtrar-negociacao"
          className={styles.select}
          value={negociacao}
          onChange={(event) => setNegociacao(event.target.value as FiltroNegociacao)}
        >
          <option value="todos">Todos os anúncios</option>
          <option value="sale">À venda</option>
          <option value="donation">Para doação</option>
        </select>
      </div>

      {carregando && userId ? (
        <div className={styles.estado} role="status">Carregando seus materiais…</div>
      ) : erroVisivel ? (
        <div className={styles.estado} role="alert">
          <p>{erroVisivel}</p>
          {userId && <button type="button" className="mt-4 rounded-lg border border-linha px-4 py-2 font-semibold text-verde-escuro hover:bg-bruma" onClick={() => void tentarNovamente()}>
            Tentar novamente
          </button>}
        </div>
      ) : produtos.length === 0 ? (
        <div className={`${styles.tabelaWrap} ${styles.vazio}`}>
          <h2 className={styles.tituloVazio}>Sua lista está pronta para começar</h2>
          <p className={styles.descricaoVazio}>
            Cadastre o primeiro material para que outras pessoas possam encontrar e solicitar uma reserva.
          </p>
          <Link to="/dashboardEmpresa/materiais/novo" className={`${styles.botao} mt-5`}>
            <Plus size={18} aria-hidden="true" />
            Cadastrar primeiro material
          </Link>
        </div>
      ) : filtrados.length === 0 ? (
        <div className={`${styles.tabelaWrap} ${styles.vazio}`}>
          <h2 className={styles.tituloVazio}>Nenhum material encontrado</h2>
          <p className={styles.descricaoVazio}>Altere a busca ou o tipo de anúncio para ver outros resultados.</p>
        </div>
      ) : (
        <div className={styles.tabelaWrap}>
          <div className="overflow-x-auto">
            <table className={styles.tabela}>
              <caption className="sr-only">Materiais cadastrados pela sua empresa</caption>
              <thead>
                <tr>
                  <th scope="col" className={styles.th}>Material</th>
                  <th scope="col" className={styles.th}>Categoria</th>
                  <th scope="col" className={`${styles.th} text-right`}>Quantidade</th>
                  <th scope="col" className={`${styles.th} text-right`}>Peso</th>
                  <th scope="col" className={styles.th}>Anúncio</th>
                  <th scope="col" className={`${styles.th} text-right`}>Valor</th>
                  <th scope="col" className={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((produto) => (
                  <tr key={produto.id} className="hover:bg-bruma/70">
                    <th scope="row" className={`${styles.td} min-w-52 font-semibold text-tinta`}>{produto.name}</th>
                    <td className={`${styles.td} whitespace-nowrap text-tinta-suave`}>{CATEGORIAS[produto.category] ?? produto.category}</td>
                    <td className={`${styles.td} text-right tabular-nums text-tinta`}>{produto.quantity}</td>
                    <td className={`${styles.td} whitespace-nowrap text-right tabular-nums text-tinta`}>{formatador.format(Number(produto.weight) || 0)} kg</td>
                    <td className={`${styles.td} whitespace-nowrap text-tinta-suave`}>{produto.type_negotiation === "donation" ? "Doação" : "Venda"}</td>
                    <td className={`${styles.td} whitespace-nowrap text-right tabular-nums text-tinta`}>
                      {produto.type_negotiation === "donation" || produto.price == null ? "—" : moeda.format(Number(produto.price) || 0)}
                    </td>
                    <td className={styles.td}>
                      <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${produto.status === "available" ? "bg-verde-claro text-verde-escuro" : produto.status === "reserved" ? "bg-ambar-fundo text-ambar" : "bg-bruma text-tinta-suave"}`}>
                        {STATUS[produto.status] ?? "Status indisponível"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
