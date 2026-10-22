import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Package, Search, X } from "lucide-react";
import { categorias, materiais, numero } from "./marketplaceData";
import MaterialImage from "./MaterialImage";
import { styles } from "./marketplaceStyles";
import ProductCatalog from "./ProductCatalog";

export default function Marketplace() {
  const [params, setParams] = useSearchParams();
  const demo = params.get("origem") === "exemplo";
  return <><nav aria-label="Origem dos materiais" className="flex flex-wrap gap-3 border-b border-gray-200 bg-white px-5 py-3"><button onClick={() => setParams({})} aria-pressed={!demo} className={!demo ? styles.botao : styles.secundario}>Catálogo real</button><button onClick={() => setParams({ origem: "exemplo" })} aria-pressed={demo} className={demo ? styles.botao : styles.secundario}>Ver exemplo</button></nav>{demo ? <DemoMarketplace /> : <ProductCatalog />}</>;
}

function DemoMarketplace() {
  const [params, setParams] = useSearchParams();
  const busca = params.get("busca") ?? "";
  const categoria = params.get("categoria") ?? "todos";
  const distancia = Math.min(25, Math.max(1, Number(params.get("distancia")) || 5));
  const imediata = params.get("imediata") !== "nao";
  const encomenda = params.get("encomenda") === "sim";
  const doacao = params.get("doacao") === "sim";
  const ordenacao = params.get("ordem") ?? "recentes";
  const atualizar = (chave: string, valor: string) => setParams(anterior => {
    const proximo = new URLSearchParams(anterior);
    if (valor) proximo.set(chave, valor); else proximo.delete(chave);
    proximo.delete("pagina");
    return proximo;
  }, { replace: true });
  const filtrados = useMemo(() => materiais.filter(item => {
    const texto = `${item.nome} ${item.empresa} ${item.descricao}`.toLocaleLowerCase("pt-BR");
    return texto.includes(busca.trim().toLocaleLowerCase("pt-BR"))
      && (categoria === "todos" || item.grupo === categoria)
      && item.distancia <= distancia
      && (!doacao || item.modalidade === "doacao")
      && (!(imediata || encomenda) || (imediata && item.disponibilidade === "imediata") || (encomenda && item.disponibilidade === "encomenda"));
  }).sort((a, b) => ordenacao === "distancia" ? a.distancia - b.distancia : ordenacao === "quantidade" ? b.quantidade - a.quantidade : 0), [busca, categoria, distancia, imediata, encomenda, doacao, ordenacao]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / 4));
  const pagina = Math.min(totalPaginas, Math.max(1, Math.trunc(Number(params.get("pagina")) || 1)));
  const inicio = (pagina - 1) * 4;
  const visiveis = filtrados.slice(inicio, inicio + 4);
  const mudarPagina = (valor: number) => setParams(anterior => { const proximo = new URLSearchParams(anterior); proximo.set("pagina", String(valor)); return proximo; });
  return <>
    <section aria-label="Buscar materiais" className="flex flex-col justify-between gap-4 border-b border-[var(--mkt-line)] bg-white px-5 py-4 md:flex-row md:items-center lg:px-[clamp(24px,4vw,64px)]">
      <label className="flex h-[42px] w-full items-center gap-3 rounded-lg bg-[#fbfbf9] px-4 md:max-w-[400px]">
        <Search size={16} className="shrink-0 text-gray-500" aria-hidden="true" /><span className="sr-only">Buscar materiais</span>
        <input type="search" value={busca} onChange={e => atualizar("busca", e.target.value)} placeholder="Buscar retalhos, EVA, pallets..." className="w-full min-w-0 bg-transparent text-sm placeholder:text-gray-500" />
      </label>
      <nav aria-label="Categorias de materiais" className="flex flex-wrap gap-2">
        {categorias.map(item => <button key={item.id} type="button" aria-pressed={categoria === item.id} onClick={() => atualizar("categoria", item.id)} className={`min-h-9 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${categoria === item.id ? "border-[var(--mkt-primary)] bg-[var(--mkt-primary)] text-white hover:bg-[var(--mkt-payment)]" : "border-gray-300 bg-white text-[var(--mkt-muted)] hover:bg-[var(--mkt-soft)]"}`}>{item.nome}</button>)}
      </nav>
    </section>
    <main className="flex flex-1 flex-col md:flex-row">
      <aside aria-label="Filtros de materiais" className="shrink-0 border-b border-[var(--mkt-line)] bg-white p-5 md:w-[clamp(178px,17.5vw,280px)] md:border-r md:border-b-0 lg:p-6">
        <details open>
          <summary className="cursor-pointer text-base font-bold text-[var(--mkt-dark)] md:pointer-events-none md:list-none">Filtros Ativos</summary>
          <div className="mt-3 flex min-h-7 flex-wrap gap-2">
            {categoria !== "todos" && <button className="flex items-center gap-1 rounded-md border border-[var(--mkt-primary)] bg-[var(--mkt-soft)] px-2 py-1 text-[11px] text-[var(--mkt-dark)]" onClick={() => atualizar("categoria", "todos")} aria-label="Remover filtro de categoria">{categorias.find(c => c.id === categoria)?.nome}<X size={10} /></button>}
            <span className="rounded-md border border-[var(--mkt-primary)] bg-[var(--mkt-soft)] px-2 py-1 text-[11px] text-[var(--mkt-dark)]">Franca - SP</span>
          </div>
          <fieldset className="mt-6 space-y-2 border-t border-[var(--mkt-line)] pt-6 text-[13px] text-[var(--mkt-muted)]">
            <legend className="sr-only">Disponibilidade</legend><h2 className="mb-3 text-sm font-bold text-[#1f2937]">Disponibilidade</h2>
            {([{ label: "Retirada Imediata", checked: imediata, chave: "imediata" }, { label: "Sob Encomenda", checked: encomenda, chave: "encomenda" }, { label: "Doação Voluntária", checked: doacao, chave: "doacao" }]).map(f => <label key={f.chave} className="flex min-h-6 cursor-pointer items-center gap-2"><input type="checkbox" checked={f.checked} onChange={e => atualizar(f.chave, e.target.checked ? "sim" : "nao")} className="accent-[var(--mkt-payment)]" />{f.label}</label>)}
          </fieldset>
          <div className="mt-6 border-t border-[var(--mkt-line)] pt-6">
            <label htmlFor="distancia" className="block text-sm font-bold">Distância Máxima</label><p className="mt-3 text-[13px] text-[var(--mkt-muted)]">Até {distancia} km (Franca/SP)</p>
            <input id="distancia" type="range" min={1} max={25} value={distancia} onChange={e => atualizar("distancia", e.target.value)} className="mt-2 h-4 w-full accent-[var(--mkt-primary)]" />
          </div>
        </details>
      </aside>
      <section aria-labelledby="titulo-marketplace" className="min-w-0 flex-1 p-[clamp(20px,2vw,32px)]">
        <h1 id="titulo-marketplace" className="sr-only">Marketplace de materiais</h1>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--mkt-muted)]">
          <p aria-live="polite">{filtrados.length ? `Mostrando ${inicio + 1}-${Math.min(inicio + 4, filtrados.length)} de ${filtrados.length} ${filtrados.length === 1 ? "material disponível" : "materiais disponíveis"}` : "Nenhum material encontrado"}<span className="ml-2 text-[11px]">• Demonstração</span></p>
          <label className="flex items-center gap-2 text-xs">Ordenar por:<select value={ordenacao} onChange={e => atualizar("ordem", e.target.value)} className="max-w-full bg-transparent font-bold text-[#1f2937]"><option value="recentes">Mais Recentes</option><option value="distancia">Menor Distância</option><option value="quantidade">Maior Quantidade</option></select></label>
        </div>
        {visiveis.length ? <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visiveis.map((item, index) => <article key={item.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--mkt-line)] bg-white shadow-[0_4px_16px_rgba(31,41,55,0.04)]">
            <Link to={`material/${item.id}`} className="block aspect-[1.87] shrink-0 overflow-hidden" aria-label={`Ver detalhes de ${item.nome}`}><MaterialImage src={item.fotos[0]} nome={item.nome} prioridade={index === 0} /></Link>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-2"><span className={styles.badge}>{item.categoria}</span><span className="text-xs text-gray-500">{numero(item.distancia)} km</span></div>
              <div><h2 className="text-base leading-tight font-bold"><Link to={`material/${item.id}`} className="hover:text-[var(--mkt-payment)]">{item.nome}</Link></h2><p className="mt-1 text-xs text-[var(--mkt-muted)]">{item.empresa}</p></div>
              <dl className="mt-auto flex justify-between gap-2 border-y border-[var(--mkt-line)] py-1 text-xs"><div><dt className="text-[10px] text-gray-500">Disponível</dt><dd className="mt-0.5 font-bold text-[var(--mkt-dark)]">{numero(item.quantidade)} {item.unidade}</dd></div><div className="text-right"><dt className="text-[10px] text-gray-500">Estado</dt><dd className="mt-0.5 font-semibold text-amber-700">{item.estado}</dd></div></dl>
              <Link to={`material/${item.id}`} className={`${styles.botao} min-h-9 px-2 py-2 text-[13px]`}>Reservar Material</Link>
            </div>
          </article>)}
        </div> : <div className="py-16 text-center"><Package className="mx-auto mb-4 text-gray-500" size={36} aria-hidden="true" /><h2 className={styles.subtitulo}>Nenhum material encontrado</h2><p className={`${styles.texto} my-3`}>Altere a busca ou os filtros para encontrar outros materiais.</p><button onClick={() => setParams({ origem: "exemplo" })} className={styles.secundario}>Limpar filtros</button></div>}
        {filtrados.length > 0 && <nav aria-label="Paginação de materiais" className="mt-10 flex justify-center gap-2"><button aria-label="Página anterior" disabled={pagina === 1} onClick={() => mudarPagina(pagina - 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-white"><ChevronLeft size={14} /></button>{Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => <button key={p} aria-current={p === pagina ? "page" : undefined} aria-label={`Página ${p}`} onClick={() => mudarPagina(p)} className={`h-8 w-8 rounded-md border text-[13px] ${p === pagina ? "border-[var(--mkt-primary)] bg-[var(--mkt-primary)] font-bold text-white" : "border-[var(--mkt-line)] hover:bg-white"}`}>{p}</button>)}<button aria-label="Próxima página" disabled={pagina === totalPaginas} onClick={() => mudarPagina(pagina + 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-white"><ChevronRight size={14} /></button></nav>}
      </section>
    </main>
  </>;
}
