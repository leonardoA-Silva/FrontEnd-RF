import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import { useProducts } from "../../hooks/useProducts";
import { productCondition, productPhotos, productPrice, productStatus } from "./productPresentation";
import MaterialImage from "./MaterialImage";
import { marketplaceTheme, styles } from "./marketplaceStyles";

export default function ProductCatalog() {
  const { products, loading, error, reload } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("available");
  const [sort, setSort] = useState("api");
  const [page, setPage] = useState(1);
  const categories = [...new Set(products.map(p => p.category))].sort();
  const filtered = useMemo(() => products.filter(p => `${p.name} ${p.description ?? ""} ${p.category}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")) && (!category || p.category === category) && (!type || p.type_negotiation === type) && (!status || p.status === status)).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "pt-BR") : sort === "quantity" ? Number(b.quantity) - Number(a.quantity) : 0), [products, search, category, type, status, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, pages);
  const reset = () => { setSearch(""); setCategory(""); setType(""); setStatus("available"); setPage(1); };

  return <section className={`flex flex-1 flex-col md:flex-row ${marketplaceTheme}`} aria-labelledby="catalog-title">
    <aside className="w-full shrink-0 space-y-5 border-r border-[#e5e7eb] bg-white p-5 md:w-60">
      <h2 className="font-bold text-[#064e3b]">Filtros de materiais</h2>
      <label className="block text-sm">Categoria<select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className={styles.campo}><option value="">Todas</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="block text-sm">Modalidade<select value={type} onChange={e => { setType(e.target.value); setPage(1); }} className={styles.campo}><option value="">Venda e doação</option><option value="sale">Venda</option><option value="donation">Doação</option></select></label>
      <label className="block text-sm">Disponibilidade<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className={styles.campo}><option value="available">Disponíveis</option><option value="">Todos os estados</option><option value="reserved">Reservados</option><option value="unavailable">Indisponíveis</option></select></label>
      <button type="button" onClick={reset} className={styles.secundario}>Limpar filtros</button>
    </aside>
    <div className="min-w-0 flex-1 space-y-6 p-5 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4"><h1 id="catalog-title" className="text-2xl font-bold text-[#064e3b]">Materiais do marketplace</h1><button type="button" disabled={loading} onClick={reload} className={styles.secundario}><RefreshCw size={16} />Atualizar</button></div>
      <div className="flex flex-wrap items-center gap-4"><label className="flex min-w-0 flex-1 basis-full items-center gap-2 rounded-lg sm:basis-0 border border-gray-300 bg-white px-3"><Search size={18} /><span className="sr-only">Buscar materiais</span><input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar materiais..." className="min-h-12 w-full min-w-0 bg-transparent text-sm" /></label><label className="text-sm">Ordenar por<select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="ml-2 rounded-lg bg-white p-2"><option value="api">Ordem do catálogo</option><option value="name">Nome</option><option value="quantity">Maior quantidade</option></select></label></div>
      {loading ? <p role="status" className={styles.texto}>Carregando materiais...</p> : error ? <div role="alert" className={styles.aviso}><p>{error}</p><button onClick={reload} className={`${styles.secundario} mt-4`}>Tentar novamente</button></div> : !filtered.length ? <div className={`${styles.painel} text-center`}><h2 className={styles.subtitulo}>{products.length ? "Nenhum material encontrado" : "Nenhum material publicado"}</h2><p className={`${styles.texto} my-4`}>{products.length ? "Altere os filtros para encontrar outros materiais." : "Quando houver materiais publicados, eles aparecerão aqui."}</p>{products.length > 0 && <button onClick={reset} className={styles.secundario}>Restaurar filtros</button>}</div> : <>
        <p role="status" className={styles.texto}>{filtered.length} {filtered.length === 1 ? "material encontrado" : "materiais encontrados"}</p>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{filtered.slice((current - 1) * 8, current * 8).map(product => <article key={product.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
          <Link to={`/marketplace/produto/${product.id}`} className="block aspect-[1.87] overflow-hidden" aria-label={`Ver ${product.name}`}><MaterialImage src={productPhotos(product)[0]} nome={product.name} /></Link>
          <div className="flex flex-1 flex-col gap-3 p-4"><span className={`${styles.badge} self-start`}>{product.category}</span><h2 className="font-bold">{product.name}</h2><p className="text-sm font-semibold text-[#064e3b]">{productPrice(product)}</p><dl className="mt-auto space-y-1 text-xs text-gray-600"><div className="flex justify-between gap-2"><dt>Quantidade</dt><dd>{product.quantity} unidades</dd></div><div className="flex justify-between gap-2"><dt>Estado</dt><dd>{productCondition(product)}</dd></div><div className="flex justify-between gap-2"><dt>Disponibilidade</dt><dd>{productStatus(product)}</dd></div></dl><Link to={`/marketplace/produto/${product.id}`} className={styles.botao}>Ver material</Link></div>
        </article>)}</div>
        {pages > 1 && <nav aria-label="Paginação do catálogo" className="flex flex-wrap items-center justify-center gap-4"><button disabled={current === 1} onClick={() => setPage(current - 1)} className={styles.secundario}>Anterior</button><span className="text-sm">Página {current} de {pages}</span><button disabled={current === pages} onClick={() => setPage(current + 1)} className={styles.secundario}>Próxima</button></nav>}
      </>}
    </div>
  </section>;
}
