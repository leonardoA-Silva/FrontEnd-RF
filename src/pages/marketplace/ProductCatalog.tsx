import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import { useProducts } from "../../hooks/useProducts";
import { productCondition, productPhotos, productPrice, productStatus } from "./productPresentation";
import MaterialImage from "./MaterialImage";
import { marketplaceTheme, styles } from "./marketplaceStyles";

export default function ProductCatalog({ embedded = false, preview = false }: { embedded?: boolean; preview?: boolean }) {
  const { products, loading, error, reload } = useProducts();
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  return <section className={`buyer-catalog ${embedded ? "buyer-catalog-embedded" : ""} ${marketplaceTheme}`} aria-labelledby="catalog-title">
    {!embedded && <header className="buyer-catalog-intro"><p className="buyer-kicker">Marketplace</p><h1 className="buyer-title">Novos começos,<br /><em>com os mesmos materiais.</em></h1><p className="buyer-copy">Explore materiais publicados por empresas e encontre possibilidades para a sua próxima criação.</p></header>}
    <aside className="buyer-catalog-filters"><button type="button" className="buyer-filter-toggle" aria-expanded={filtersOpen} aria-controls={embedded ? "buyer-embedded-filters" : "buyer-public-filters"} onClick={() => setFiltersOpen(open => !open)}>{filtersOpen ? "Fechar filtros" : "Filtrar materiais"}<span aria-hidden="true">{filtersOpen ? "−" : "+"}</span></button><div id={embedded ? "buyer-embedded-filters" : "buyer-public-filters"} className={`buyer-filter-fields space-y-5 ${filtersOpen ? "is-open" : ""}`}>
      <h2 className="font-bold text-[#064e3b]">Filtros de materiais</h2>
      <label className="block text-sm">Categoria<select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className={styles.campo}><option value="">Todas</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="block text-sm">Modalidade<select value={type} onChange={e => { setType(e.target.value); setPage(1); }} className={styles.campo}><option value="">Venda e doação</option><option value="sale">Venda</option><option value="donation">Doação</option></select></label>
      <label className="block text-sm">Disponibilidade<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className={styles.campo}><option value="available">Disponíveis</option><option value="">Todos os estados</option><option value="reserved">Reservados</option><option value="unavailable">Indisponíveis</option></select></label>
      <button type="button" onClick={reset} className={styles.secundario}>Limpar filtros</button>
    </div></aside>
    <div className="buyer-catalog-results min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><h2 id="catalog-title" className="buyer-subtitle">Materiais do marketplace</h2><button type="button" disabled={loading} onClick={reload} className={styles.secundario}><RefreshCw size={16} />Atualizar</button></div>
      <div className="flex flex-wrap items-center gap-4"><label className="buyer-search"><Search size={18} /><span className="sr-only">Buscar materiais</span><input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar materiais..." className="min-h-12 w-full min-w-0 bg-transparent text-base" /></label><label className="text-sm">Ordenar por<select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="ml-2 rounded-lg bg-white p-2"><option value="api">Ordem do catálogo</option><option value="name">Nome</option><option value="quantity">Maior quantidade</option></select></label></div>
      {loading ? <p role="status" className={styles.texto}>Carregando materiais...</p> : error ? <div role="alert" className={styles.aviso}><p>{error}</p><button onClick={reload} className={`${styles.secundario} mt-4`}>Tentar novamente</button></div> : !filtered.length ? <div className={`${styles.painel} text-center`}><h2 className={styles.subtitulo}>{products.length ? "Nenhum material encontrado" : "Nenhum material publicado"}</h2><p className={`${styles.texto} my-4`}>{products.length ? "Altere os filtros para encontrar outros materiais." : "Quando houver materiais publicados, eles aparecerão aqui."}</p>{products.length > 0 && <button onClick={reset} className={styles.secundario}>Restaurar filtros</button>}</div> : <>
        <p role="status" className={styles.texto}>{filtered.length} {filtered.length === 1 ? "material encontrado" : "materiais encontrados"}</p>
        <div className="buyer-material-grid">{filtered.slice((current - 1) * 8, current * 8).map(product => <article key={product.id} className="buyer-material-card">
           {preview ? <div className="buyer-material-image"><MaterialImage src={productPhotos(product)[0]} nome={product.name} /></div> : <Link to={`/marketplace/produto/${product.id}`} className="buyer-material-image" aria-label={`Ver ${product.name}`}><MaterialImage src={productPhotos(product)[0]} nome={product.name} /></Link>}
           <div className="buyer-material-content"><span className={`${styles.badge} self-start`}>{product.category}</span><h2 className="buyer-material-name">{product.name}</h2><p className="buyer-material-price">{productPrice(product)}</p><dl className="buyer-material-meta"><div className="flex justify-between gap-2"><dt>Quantidade</dt><dd>{product.quantity} unidades</dd></div><div className="flex justify-between gap-2"><dt>Estado</dt><dd>{productCondition(product)}</dd></div><div className="flex justify-between gap-2"><dt>Disponibilidade</dt><dd>{productStatus(product)}</dd></div></dl>{preview ? <p className="text-xs text-[#5F6E55]">Anúncio fictício para demonstração.</p> : <Link to={`/marketplace/produto/${product.id}`} className={styles.botao}>Ver material</Link>}</div>
        </article>)}</div>
        {pages > 1 && <nav aria-label="Paginação do catálogo" className="flex flex-wrap items-center justify-center gap-4"><button disabled={current === 1} onClick={() => setPage(current - 1)} className={styles.secundario}>Anterior</button><span className="text-sm">Página {current} de {pages}</span><button disabled={current === pages} onClick={() => setPage(current + 1)} className={styles.secundario}>Próxima</button></nav>}
      </>}
    </div>
  </section>;
}
