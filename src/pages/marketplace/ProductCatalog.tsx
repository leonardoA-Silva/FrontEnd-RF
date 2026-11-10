import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import { useProducts } from "../../hooks/useProducts";
import { productCondition, productPhotos, productPrice, productStatus } from "./productPresentation";
import MaterialImage from "./MaterialImage";
import { marketplaceTheme, styles } from "./marketplaceStyles";

export default function ProductCatalog({ embedded = false, companyId }: { embedded?: boolean; companyId?: string }) {
  const { products, loading, error, reload } = useProducts();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("available");
  const [sort, setSort] = useState("api");
  const [page, setPage] = useState(1);
  const categories = [...new Set(products.map(p => p.category))].sort();
  const filtered = useMemo(() => products.filter(p => (!companyId || p.id_user?.toLowerCase() === companyId.toLowerCase()) && `${p.name} ${p.description ?? ""} ${p.category}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")) && (!category || p.category === category) && (!type || p.type_negotiation === type) && (!status || p.status === status)).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "pt-BR") : sort === "quantity" ? Number(b.quantity) - Number(a.quantity) : 0), [products, companyId, search, category, type, status, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, pages);
  const reset = () => { setSearch(""); setCategory(""); setType(""); setStatus("available"); setPage(1); };

  return <section className={`grid w-full gap-6 lg:grid-cols-[220px_minmax(0,1fr)] ${embedded ? "" : "mx-auto max-w-[1440px] px-5 py-10 sm:px-8"} ${marketplaceTheme}`} aria-labelledby="catalog-title">
    {!embedded && <header className="space-y-4 lg:col-span-2"><p className="text-xs font-bold uppercase tracking-wider text-accent">Marketplace</p><h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl [&_em]:font-normal [&_em]:not-italic">Novos começos,<br /><em>com os mesmos materiais.</em></h1><p className="text-sm leading-relaxed text-muted">Explore materiais publicados por empresas e encontre possibilidades para a sua próxima criação.</p></header>}
    <aside className="rounded-2xl border border-line bg-surface p-5 lg:self-start"><button type="button" className="flex w-full items-center justify-between gap-3 text-sm font-bold lg:hidden" aria-expanded={filtersOpen} aria-controls={embedded ? "buyer-embedded-filters" : "buyer-public-filters"} onClick={() => setFiltersOpen(open => !open)}>{filtersOpen ? "Fechar filtros" : "Filtrar materiais"}<span aria-hidden="true">{filtersOpen ? "−" : "+"}</span></button><div id={embedded ? "buyer-embedded-filters" : "buyer-public-filters"} className={`hidden lg:block space-y-5 ${filtersOpen ? "!block" : ""}`}>
      <h2 className="font-bold text-primary">Filtros de materiais</h2>
      <label className="block text-sm">Categoria<select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className={styles.campo}><option value="">Todas</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="block text-sm">Modalidade<select value={type} onChange={e => { setType(e.target.value); setPage(1); }} className={styles.campo}><option value="">Venda e doação</option><option value="sale">Venda</option><option value="donation">Doação</option></select></label>
      <label className="block text-sm">Disponibilidade<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className={styles.campo}><option value="available">Disponíveis</option><option value="">Todos os estados</option><option value="reserved">Reservados</option><option value="unavailable">Indisponíveis</option></select></label>
      <button type="button" onClick={reset} className={styles.secundario}>Limpar filtros</button>
    </div></aside>
    <div className=" min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><h2 id="catalog-title" className="font-display text-xl font-bold text-ink">Materiais do marketplace</h2><button type="button" disabled={loading} onClick={reload} className={styles.secundario}><RefreshCw size={16} />Atualizar</button></div>
      <div className="flex flex-wrap items-center gap-4"><label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-line bg-surface px-4 text-muted"><Search size={18} /><span className="sr-only">Buscar materiais</span><input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar materiais..." className="min-h-12 w-full min-w-0 bg-transparent text-base" /></label><label className="text-sm">Ordenar por<select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="ml-2 rounded-lg bg-white p-2"><option value="api">Ordem do catálogo</option><option value="name">Nome</option><option value="quantity">Maior quantidade</option></select></label></div>
      {loading ? <p role="status" className={styles.texto}>Carregando materiais...</p> : error ? <div role="alert" className={styles.aviso}><p>{error}</p><button onClick={reload} className={`${styles.secundario} mt-4`}>Tentar novamente</button></div> : !filtered.length ? <div className={`${styles.painel} text-center`}><h2 className={styles.subtitulo}>{products.length ? "Nenhum material encontrado" : "Nenhum material publicado"}</h2><p className={`${styles.texto} my-4`}>{products.length ? "Altere os filtros para encontrar outros materiais." : "Quando houver materiais publicados, eles aparecerão aqui."}</p>{products.length > 0 && <button onClick={reset} className={styles.secundario}>Restaurar filtros</button>}</div> : <>
        <p role="status" className={styles.texto}>{filtered.length} {filtered.length === 1 ? "material encontrado" : "materiais encontrados"}</p>
        <div className="motion-stagger grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.slice((current - 1) * 8, current * 8).map(product => <article key={product.id} className="dashboard-material-card flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface">
          <Link to={`/marketplace/produto/${product.id}`} className="block aspect-[4/3] overflow-hidden bg-canvas [&_img]:h-full [&_img]:w-full [&_img]:object-cover" aria-label={`Ver ${product.name}`}><MaterialImage src={productPhotos(product)[0]} nome={product.name} /></Link>
          <div className="flex flex-1 flex-col gap-4 p-5"><span className={`${styles.badge} self-start`}>{product.category}</span><h2 className="break-words font-display text-lg font-bold text-ink">{product.name}</h2><p className="text-lg font-bold text-primary">{productPrice(product)}</p><dl className="mb-auto space-y-2 text-xs text-muted"><div className="flex justify-between gap-2"><dt>Quantidade</dt><dd>{product.quantity} unidades</dd></div><div className="flex justify-between gap-2"><dt>Estado</dt><dd>{productCondition(product)}</dd></div><div className="flex justify-between gap-2"><dt>Disponibilidade</dt><dd>{productStatus(product)}</dd></div></dl><Link to={`/marketplace/produto/${product.id}`} className={styles.botao}>Ver material</Link></div>
        </article>)}</div>
        {pages > 1 && <nav aria-label="Paginação do catálogo" className="flex flex-wrap items-center justify-center gap-4"><button disabled={current === 1} onClick={() => setPage(current - 1)} className={styles.secundario}>Anterior</button><span className="text-sm">Página {current} de {pages}</span><button disabled={current === pages} onClick={() => setPage(current + 1)} className={styles.secundario}>Próxima</button></nav>}
      </>}
    </div>
  </section>;
}
