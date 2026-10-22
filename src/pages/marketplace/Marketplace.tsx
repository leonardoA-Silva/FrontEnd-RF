import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Package, CreditCard, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { listarProdutos, type ProductBackend } from "../../axios/Axios";
import { COMPRA_EXEMPLO, erroCatalogo, estadoMaterial, imagensMaterial, validarCatalogo } from "./catalogo";

const CATEGORIAS = [
  { id: "todos", label: "Todos" },
  { id: "couro", label: "Couros" },
  { id: "tecido", label: "Têxteis" },
  { id: "eva-borracha", label: "EVA & Borracha" },
  { id: "madeira", label: "Pallets & Madeira" },
];
const POR_PAGINA = 4;
const styles = {
  filtro: "flex items-center gap-2 text-xs leading-4 text-[#657169]",
  checkbox: "h-3.5 w-3.5 shrink-0 rounded-sm accent-[#10B981]",
  chip: "inline-flex items-center gap-1 rounded border border-[#B9E4D5] bg-[#EFFAF5] px-1.5 py-0.5 text-[10px] text-[#00875B]",
  botao: "inline-flex items-center justify-center rounded-md bg-[#10B981] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#079C70] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700",
};

function categoriaMaterial(produto: ProductBackend) {
  const texto = `${produto.category} ${produto.name}`.toLocaleLowerCase("pt-BR");
  if (/\beva\b/.test(texto)) return "EVA";
  if (texto.includes("pallet")) return "Pallets";
  const nomes: Record<string, string> = {
    couro: "Couro", tecido: "Têxtil", plastico: "Plástico", madeira: "Madeira",
    metal: "Metal", borracha: "Borracha", vidro: "Vidro", "papel/papelao": "Papel / papelão",
  };
  return nomes[produto.category] || produto.category;
}

export default function Marketplace() {
  const navigate = useNavigate();
  const { token, role } = useLoggedUser();
  const [produtos, setProdutos] = useState<ProductBackend[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [doacao, setDoacao] = useState(false);
  const [ordenacao, setOrdenacao] = useState("padrao");
  const [pagina, setPagina] = useState(1);
  const [aviso, setAviso] = useState<string | null>(null);
  const [imagemComFalha, setImagemComFalha] = useState<Record<string, boolean>>({});

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  useEffect(() => {
    let ativo = true;
    listarProdutos()
      .then(({ data }) => validarCatalogo(data))
      .then((lista) => { if (ativo) setProdutos(lista); })
      .catch((error: unknown) => {
        if (ativo) { setProdutos([]); setErro(erroCatalogo(error)); }
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativa]);

  const disponiveis = useMemo(
    () => produtos.filter((produto) => produto.status === "available" && produto.quantity > 0), [produtos],
  );
  const filtrados = useMemo(() => disponiveis.filter((produto) => {
    const texto = `${produto.name} ${produto.description || ""} ${produto.category}`.toLocaleLowerCase("pt-BR");
    const cat = produto.category.toLocaleLowerCase("pt-BR");
    const categoriaCorreta = categoria === "todos" || (categoria === "eva-borracha"
      ? ["eva", "plastico", "borracha"].some((valor) => cat.includes(valor) || texto.includes(valor))
      : cat.includes(categoria));
    return texto.includes(buscaAplicada.trim().toLocaleLowerCase("pt-BR")) && categoriaCorreta &&
      (!doacao || produto.type_negotiation === "donation");
  }).sort((a, b) => ordenacao === "quantidade" ? b.quantity - a.quantity : 0),
  [disponiveis, buscaAplicada, categoria, doacao, ordenacao]);

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, paginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const visiveis = filtrados.slice(inicio, inicio + POR_PAGINA);
  const primeiraPagina = Math.max(1, Math.min(paginaAtual - 2, paginas - 4));
  const numerosPaginas = Array.from({ length: Math.min(5, paginas) }, (_, index) => primeiraPagina + index);
  const filtroAtivo = categoria !== "todos" || Boolean(buscaAplicada) || doacao;

  function recarregar() {
    setCarregando(true); setErro(null); setProdutos([]); setTentativa((n) => n + 1);
  }
  function limpar() {
    setBusca(""); setBuscaAplicada(""); setCategoria("todos"); setDoacao(false); setPagina(1);
  }
  function detalhes(produto: ProductBackend) {
    navigate(`/marketplace/${encodeURIComponent(produto.id)}`);
  }
  function iniciarReserva(produto: ProductBackend) {
    if (produto.id !== COMPRA_EXEMPLO.id && !token) {
      navigate("/login", { state: { from: `/marketplace/${encodeURIComponent(produto.id)}`, tipoUsuario: "comprador" } });
      return;
    }
    if (produto.id !== COMPRA_EXEMPLO.id && role === "company") {
      setAviso("Use uma conta de comprador para solicitar materiais.");
      return;
    }
    navigate(`/marketplace/${encodeURIComponent(produto.id)}/compra`);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#FAFBFA] font-sans text-[#1A2D24]">
      <Header compacto />
      <section aria-label="Busca e categorias" className="border-b border-[#E9EEEB] bg-white px-4 py-3 md:flex md:min-h-16 md:items-center md:justify-between md:gap-6 md:px-[4.1vw] md:py-2">
        <form role="search" onSubmit={(event) => { event.preventDefault(); setBuscaAplicada(busca); setPagina(1); }} className="flex h-10 w-full items-center rounded-md bg-[#F8FAF9] px-3 md:w-[360px] md:shrink-0">
          <button type="submit" aria-label="Buscar" className="mr-2 rounded p-1 text-[#95A39B] hover:text-[#00875B]"><Search className="h-4 w-4" /></button>
          <input aria-label="Buscar materiais" type="search" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar retalhos, EVA, pallets..." className="min-w-0 flex-1 border-0 bg-transparent py-2 text-xs text-[#3D5146] outline-none placeholder:text-[#A1ABA5]" />
          {busca && <button type="button" aria-label="Limpar busca" onClick={() => { setBusca(""); setBuscaAplicada(""); setPagina(1); }} className="ml-1 p-1 text-[#95A39B]"><X className="h-3.5 w-3.5" /></button>}
        </form>
        <nav aria-label="Categorias" className="mt-3 flex max-w-full items-center gap-2 overflow-x-auto pb-1 md:mt-0 md:pb-0">
          {CATEGORIAS.map((cat) => <button key={cat.id} type="button" aria-pressed={categoria === cat.id} onClick={() => { setCategoria(cat.id); setPagina(1); }} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] leading-4 transition ${categoria === cat.id ? "border-[#10B981] bg-[#10B981] text-white" : "border-[#E0E6E2] bg-white text-[#58675E] hover:border-[#10B981]"}`}>{cat.label}</button>)}
        </nav>
      </section>

      <div className="flex flex-1 flex-col md:flex-row">
        <aside aria-label="Filtros de materiais" className="w-full shrink-0 border-b border-[#E9EEEB] bg-white px-5 py-6 md:w-52 md:border-r md:border-b-0 min-[62.5rem]:w-[17.6vw] xl:px-6">
          <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-[#005F46]">Filtros Ativos</h2>{filtroAtivo && <button type="button" onClick={limpar} className="text-[10px] text-[#00875B] hover:underline">Limpar</button>}</div>
          <div className="mt-4 flex min-h-5 flex-wrap items-start gap-2">
            {categoria !== "todos" && <button type="button" aria-label="Remover filtro de categoria" onClick={() => setCategoria("todos")} className={styles.chip}>{CATEGORIAS.find((cat) => cat.id === categoria)?.label}<X className="h-2.5 w-2.5" /></button>}
            {buscaAplicada && <button type="button" aria-label="Remover filtro de busca" onClick={() => { setBusca(""); setBuscaAplicada(""); }} className={`${styles.chip} max-w-full`}><span className="truncate">{buscaAplicada}</span><X className="h-2.5 w-2.5 shrink-0" /></button>}
            {doacao && <button type="button" aria-label="Remover filtro de doação" onClick={() => setDoacao(false)} className={styles.chip}>Doação<X className="h-2.5 w-2.5" /></button>}
            {!filtroAtivo && <span className="text-[10px] text-[#A0AAA4]">Nenhum filtro aplicado</span>}
          </div>
          <fieldset aria-describedby="agendamento-indisponivel" className="mt-6 space-y-2 border-t border-[#ECF0ED] pt-5">
            <legend className="float-left mb-2 w-full text-xs font-medium text-[#34463C]">Disponibilidade</legend>
            <label className={`${styles.filtro} clear-both text-[#A0AAA4]`}><input type="checkbox" disabled className={styles.checkbox} />Retirada Imediata</label>
            <label className={`${styles.filtro} text-[#A0AAA4]`}><input type="checkbox" disabled className={styles.checkbox} />Sob Encomenda</label>
            <label className={styles.filtro}><input type="checkbox" checked={doacao} onChange={(event) => { setDoacao(event.target.checked); setPagina(1); }} className={styles.checkbox} />Doação Voluntária</label>
            <p id="agendamento-indisponivel" className="sr-only">Agendamento não informado.</p>
          </fieldset>
          <div className="mt-6 border-t border-[#ECF0ED] pt-5">
            <label htmlFor="distancia-marketplace" className="block text-xs font-medium text-[#34463C]">Distância Máxima</label>
            <p className="mt-3 text-[10px] text-[#9AA69E]">Distâncias não disponíveis</p>
            <input id="distancia-marketplace" type="range" min={0} max={25} value={0} disabled className="mt-3 h-1 w-full accent-[#10B981] opacity-40" />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-7 lg:py-7">
          <h1 className="sr-only">Marketplace de materiais</h1>
          {aviso && <div role="status" className="mb-5 flex items-start justify-between gap-3 rounded border border-[#D4E9DD] bg-[#F0F8F3] p-3 text-xs text-[#426452]"><p>{aviso}</p><button type="button" aria-label="Fechar aviso" onClick={() => setAviso(null)}><X className="h-4 w-4" /></button></div>}
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p role="status" className="text-xs leading-5 text-[#8A958E]">{carregando ? "Carregando materiais..." : `Mostrando ${filtrados.length ? inicio + 1 : 0}–${Math.min(inicio + POR_PAGINA, filtrados.length)} de ${filtrados.length} materiais disponíveis`}</p>
            <label className="flex shrink-0 items-center gap-2 text-[10px] text-[#ADB5AF]">Ordenar por:
              <select value={ordenacao} onChange={(event) => { setOrdenacao(event.target.value); setPagina(1); }} className="max-w-full border-0 bg-transparent text-[11px] font-semibold text-[#56645C] outline-offset-4"><option value="padrao">Padrão</option><option value="quantidade">Maior Quantidade</option></select>
            </label>
          </div>

          {carregando ? <div role="status" aria-label="Carregando catálogo" className="grid grid-cols-1 gap-5 sm:grid-cols-2 min-[62.5rem]:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-xl bg-[#EDF1EE]" />)}</div>
            : erro ? <section role="alert" className="rounded-lg border border-[#E6ECE8] bg-white px-6 py-12 text-center"><Package className="mx-auto h-10 w-10 text-[#BDC8C0]" /><h2 className="mt-4 text-sm font-semibold">Materiais indisponíveis no momento</h2><p className="mt-2 text-xs text-[#8A958E]">{erro}</p><button type="button" onClick={recarregar} className={`${styles.botao} mt-5 gap-2`}><RefreshCw className="h-3.5 w-3.5" />Tentar novamente</button></section>
            : !filtrados.length ? <section className="rounded-lg border border-[#E6ECE8] bg-white px-6 py-12 text-center"><Package className="mx-auto h-10 w-10 text-[#BDC8C0]" /><h2 className="mt-4 text-sm font-semibold">{disponiveis.length ? "Nenhum material encontrado" : "Nenhum material disponível no momento"}</h2><p className="mt-2 text-xs text-[#8A958E]">{disponiveis.length ? "Tente alterar os termos de busca ou os filtros." : "Novos materiais aparecerão aqui quando estiverem disponíveis."}</p><button type="button" onClick={disponiveis.length ? limpar : recarregar} className={`${styles.botao} mt-5`}>{disponiveis.length ? "Restaurar filtros" : "Atualizar catálogo"}</button></section>
            : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 min-[62.5rem]:grid-cols-4">
              {visiveis.map((item) => {
                const imagem = imagensMaterial(item)[0];
                return <article key={item.id} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#EDF0EE] bg-white shadow-[0_2px_12px_rgba(22,48,37,0.045)]">
                  <button type="button" onClick={() => detalhes(item)} aria-label={`Ver detalhes de ${item.name}`} className="block aspect-[1.88] w-full shrink-0 overflow-hidden bg-[#F0F3F1]">
                    {imagem && !imagemComFalha[item.id] ? <img src={imagem} alt={`Imagem ilustrativa de ${item.name}`} onError={() => setImagemComFalha((prev) => ({ ...prev, [item.id]: true }))} className="h-full w-full object-cover" loading="lazy" /> : <span className="flex h-full flex-col items-center justify-center gap-2 text-[10px] text-[#9AA69E]"><Package className="h-8 w-8" />Sem imagem disponível</span>}
                  </button>
                  <div className="flex flex-1 flex-col px-3.5 pt-3 pb-3.5">
                    <div className="mb-2 flex items-center justify-between gap-2 text-[10px]"><span className="max-w-[55%] truncate rounded bg-[#EBF9F2] px-1.5 py-0.5 text-[#05845D]">{categoriaMaterial(item)}</span><span className="shrink-0 text-[#B0B9B3]"><span className="sr-only">Distância: </span>Não informada</span></div>
                    <h2 className="text-[13px] font-semibold leading-5 text-[#26382E]"><button type="button" onClick={() => detalhes(item)} className="block w-full text-left [overflow-wrap:anywhere] hover:text-[#00875B]">{item.name}</button></h2>
                    <p className="mt-1 text-[11px] text-[#929D95]">Fornecedor não informado</p>
                    <div className="mt-auto pt-3">
                      <div className="grid grid-cols-2 gap-2 border-t border-[#EEF2EF] pt-2.5 text-[10px] leading-4"><div><span className="block text-[#A0ABA3]">Disponível:</span><strong className="font-medium text-[#087B54]">{item.quantity} unidades</strong></div><div className="text-right"><span className="block text-[#A0ABA3]">Estado:</span><span className="font-medium text-[#DA8A30]">{estadoMaterial(item.conservation_state)}</span></div></div>
                      <button type="button" onClick={() => iniciarReserva(item)} className={`${styles.botao} mt-3 w-full py-2 text-[11px]`}>Reservar Material</button>
                    </div>
                  </div>
                </article>;
              })}
            </div>}

          {!carregando && !erro && filtrados.length > 0 && <nav aria-label="Paginação dos materiais" className="mt-9 flex items-center justify-center gap-2">
            <button type="button" aria-label="Anterior" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)} className="flex h-7 w-7 items-center justify-center rounded border border-[#E2E8E3] text-[#839389] disabled:text-[#CAD2CD]"><ChevronLeft className="h-3 w-3" /></button>
            {numerosPaginas.map((numero) => <button key={numero} type="button" aria-label={`Ir para a página ${numero}`} aria-current={numero === paginaAtual ? "page" : undefined} onClick={() => setPagina(numero)} className={`h-7 w-7 rounded border text-[11px] ${numero === paginaAtual ? "border-[#10B981] bg-[#10B981] text-white" : "border-[#E2E8E3] text-[#839389] hover:border-[#10B981]"}`}>{numero}</button>)}
            <button type="button" aria-label="Próxima" disabled={paginaAtual === paginas} onClick={() => setPagina(paginaAtual + 1)} className="flex h-7 w-7 items-center justify-center rounded border border-[#E2E8E3] text-[#839389] disabled:text-[#CAD2CD]"><ChevronRight className="h-3 w-3" /></button>
          </nav>}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] leading-5 text-[#9BA69E]">
            <span>Imagens ilustrativas de materiais.</span>
            <button type="button" aria-label="Ver detalhes do exemplo" onClick={() => detalhes(COMPRA_EXEMPLO)} className="text-[#00875B] hover:underline">Compra de exemplo</button>
            <button type="button" aria-label="Simular pagamento" onClick={() => iniciarReserva(COMPRA_EXEMPLO)} className="inline-flex items-center gap-1.5 text-[#00875B] hover:underline"><CreditCard className="h-3 w-3" />Simular pagamento<span className="text-[#9BA69E]">(sem cobrança)</span></button>
          </div>
        </main>
      </div>
      <Footer compacto />
    </div>
  );
}
