import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, MenuItem, useMediaQuery } from "@mui/material";
import { ArrowRight, ChevronLeft, ChevronRight, Circle, Cpu, Eye, Layers3, MoreHorizontal, Package, Pencil, Plus, Search, Shirt, SlidersHorizontal, ScrollText, Trash2, Trees, Wine, Wrench, X } from "lucide-react";
import { useCompany } from "./CompanyContext";
import { categories, categoryLabel, conditionLabel, money, number, statusLabel, statuses } from "./companyTypes";
import type { CompanyProduct } from "./companyTypes";
import { CompanyLoading, CompanyMessage, DeleteMaterialDialog, MaterialImage, TypeBadge } from "./CompanyUi";
import { useCollectionMotion } from "../../hooks/useCollectionMotion";

const pageSize = 12;
const priceOf = (product: CompanyProduct) => product.type === "donation" ? 0 : product.price;
const categoryIcons: Record<string, typeof Package> = { madeira: Trees, metal: Wrench, plastico: Layers3, "papel/papelao": ScrollText, vidro: Wine, tecido: Shirt, borracha: Circle, eletronicos: Cpu };

function MaterialPlaceholder({ category }: { category: string }) {
  const Icon = categoryIcons[category] ?? Package;
  return <><Icon className="market-placeholder-icon" size={58} strokeWidth={1} aria-hidden="true" /><strong>{categoryLabel(category)}</strong><small>Sem foto disponível</small></>;
}

export default function CompanyLibrary() {
  const { products, preview, base, loading, error, reload } = useCompany();
  if (loading) return <CompanyLoading />;
  if (error) return <CompanyMessage title="Seus materiais não carregaram" text={error} retry={reload} />;
  return <MaterialStorefront products={products} preview={preview} base={base} />;
}

interface StorefrontProps {
  products: CompanyProduct[];
  preview: boolean;
  base?: string;
  onSelect?: (product: CompanyProduct) => void;
}

export function MaterialStorefront({ products, preview, base = "/dashboardEmpresa", onSelect }: StorefrontProps) {
  const management = !onSelect;
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("photos");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterPanel = useRef<HTMLElement>(null);
  const filterToggle = useRef<HTMLButtonElement>(null);
  const categoryNav = useRef<HTMLElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState<{ anchor: HTMLElement; product: CompanyProduct } | null>(null);
  const [deleting, setDeleting] = useState<CompanyProduct | null>(null);
  const filtered = useMemo(() => {
    const result = products.filter(product =>
      (type === "all" || product.type === type) && (!category || product.category === category) &&
      (!status || product.status === status) &&
      `${product.name} ${categoryLabel(product.category)}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"))
    );
    return result.sort((a, b) => {
      const byName = a.name.localeCompare(b.name, "pt-BR");
      if (sort === "photos") return Number(b.images.length > 0) - Number(a.images.length > 0) || byName;
      if (sort === "quantity") return b.quantity - a.quantity || byName;
      if (sort === "price-asc" || sort === "price-desc") {
        const first = priceOf(a), second = priceOf(b);
        if (first === null) return second === null ? byName : 1;
        if (second === null) return -1;
        return (sort === "price-asc" ? first - second : second - first) || byName;
      }
      return byName;
    });
  }, [products, search, type, category, status, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);
  useCollectionMotion(grid, visible.map(product => product.id).join("|"));
  const sales = products.filter(product => product.type === "sale").length;
  const categoryCounts = useMemo(() => Object.entries(categories).map(([value, label]) => ({ value, label, count: products.filter(product => product.category === value).length })).filter(item => item.count > 0), [products]);
  useEffect(() => {
    const nav = categoryNav.current;
    const active = nav?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (nav && active) nav.scrollLeft = active.offsetLeft - nav.offsetLeft - (nav.clientWidth - active.clientWidth) / 2;
  }, [category, categoryCounts.length]);
  const activeFilters = [category && categoryLabel(category), status && statusLabel(status), type !== "all" && (type === "sale" ? "Venda" : "Doação")].filter(Boolean).length;
  function clearFilters() { setSearch(""); setCategory(""); setType("all"); setStatus(""); setPage(1); }
  function closeFilters() { setFiltersOpen(false); filterToggle.current?.focus(); }
  function toggleFilters() {
    if (filtersOpen) { closeFilters(); return; }
    setFiltersOpen(true);
    requestAnimationFrame(() => filterPanel.current?.querySelector<HTMLInputElement>('input:checked')?.focus());
  }
  return <div className="company-market">
    <header className="market-heading"><div><p className="company-eyebrow">{management ? "Meus anúncios" : "Explorar materiais"}</p><h1>Biblioteca de materiais</h1><p>{management ? "Seus materiais em vitrine. Encontre, confira e gerencie cada anúncio." : "Encontre materiais para seu próximo projeto. Compare opções de venda e doação."}</p></div>{management && <Link to={`${base}/publicar`} className="company-button"><Plus size={18} aria-hidden="true" />Publicar material</Link>}</header>
    <div className="market-search-row"><label className="market-search"><Search size={21} aria-hidden="true" /><span className="sr-only">Buscar material</span><input type="search" placeholder={management ? "O que você procura na sua biblioteca?" : "Qual material você procura?"} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label><span className="market-total"><Layers3 size={18} aria-hidden="true" /><strong>{number(products.length)}</strong> anúncios{preview && <small>de exemplo</small>}</span></div>
    <section className="market-banner" aria-label="Materiais para novos projetos"><div><span className="company-eyebrow">Da indústria para a criação</span><p>Novos destinos.<br /><em>Novas possibilidades.</em></p><span>{management ? "Uma vitrine para o que sua empresa tem a oferecer." : "Materiais com história para transformar suas ideias."}</span><div className="market-banner-tags"><span>{number(sales)} para venda</span><span>{number(products.length - sales)} para doação</span></div></div><div className="market-banner-visual"><img src="/images/company/leather-stack.webp" alt="" width={1000} height={667} /><span>MATÉRIA QUE CIRCULA</span></div></section>
    {categoryCounts.length > 0 && <nav ref={categoryNav} className="market-quick-categories" aria-label="Atalhos de categorias"><button type="button" aria-pressed={!category} onClick={() => { setCategory(""); setPage(1); }}><span><Layers3 size={23} strokeWidth={1.4} aria-hidden="true" /></span><strong>Todos</strong><small>{products.length} materiais</small></button>{categoryCounts.map(item => {
      const Icon = categoryIcons[item.value] ?? Package;
      return <button key={item.value} type="button" aria-pressed={category === item.value} onClick={() => { setCategory(category === item.value ? "" : item.value); setPage(1); }}><span><Icon size={23} strokeWidth={1.4} aria-hidden="true" /></span><strong>{item.label}</strong><small>{item.count} {item.count === 1 ? "material" : "materiais"}</small></button>;
    })}</nav>}

    <div className="market-layout">
      <aside ref={filterPanel} id="library-filters" className={`market-filters ${filtersOpen ? "is-open" : ""}`} aria-label="Filtros de materiais">
        <div className="market-filter-heading"><h2>Filtrar materiais</h2>{activeFilters > 0 && <button type="button" className="company-inline-link" onClick={clearFilters}>Limpar</button>}<button type="button" className="market-close-filters" aria-label="Fechar filtros" onClick={closeFilters}><X size={18} aria-hidden="true" /></button></div>
        <fieldset><legend>Categorias</legend><div className="market-categories">{[["", "Todas as categorias"], ...Object.entries(categories)].map(([value, label]) => <label key={value} className={category === value ? "is-selected" : ""}><input type="radio" name="library-category" value={value} checked={category === value} onChange={() => { setCategory(value); setPage(1); }} /><span>{label}</span><small>{value ? products.filter(product => product.category === value).length : products.length}</small></label>)}</div></fieldset>
        <label className="market-status-filter" htmlFor="library-status">Situação do anúncio<select id="library-status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Todas as situações</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <p className="market-owner-note"><Package size={18} strokeWidth={1.5} aria-hidden="true" />{management ? "Esta vitrine reúne os anúncios da sua empresa." : "Explore os materiais. Valores e disponibilidade estão em cada anúncio."}</p>
        <button type="button" className="company-button market-apply-filters" onClick={closeFilters}>Ver {filtered.length} {filtered.length === 1 ? "material" : "materiais"}<ArrowRight size={16} aria-hidden="true" /></button>
      </aside>
      <section className="market-results" aria-labelledby="library-title">
        <div className="market-results-heading"><div><h2 id="library-title">{category ? categoryLabel(category) : "Todos os materiais"}</h2><p role="status">{filtered.length} {filtered.length === 1 ? "material encontrado" : "materiais encontrados"}</p></div><label className="market-sort">Ordenar por<select aria-label="Ordenar materiais" value={sort} onChange={event => { setSort(event.target.value); setPage(1); }}><option value="photos">Com foto primeiro</option><option value="name">Nome: A a Z</option><option value="price-asc">Menor valor</option><option value="price-desc">Maior valor</option><option value="quantity">Maior quantidade</option></select></label></div>
        <div className="market-toolbar"><div className="company-tabs" role="group" aria-label="Tipo de negociação">{[{ value: "all", label: "Todos", count: products.length }, { value: "sale", label: "Venda", count: sales }, { value: "donation", label: "Doação", count: products.length - sales }].map(tab => <button key={tab.value} type="button" aria-pressed={type === tab.value} onClick={() => { setType(tab.value); setPage(1); }}>{tab.label}<span>{tab.count}</span></button>)}</div><button ref={filterToggle} type="button" className="market-filter-toggle" aria-expanded={filtersOpen} aria-controls="library-filters" onClick={toggleFilters}><SlidersHorizontal size={17} aria-hidden="true" />Filtros{activeFilters > 0 && <span>{activeFilters}</span>}</button></div>
        {(category || status || type !== "all") && <div className="market-active-filters" aria-label="Filtros aplicados">{[{ value: category, label: categoryLabel(category), clear: () => setCategory("") }, { value: status, label: statusLabel(status), clear: () => setStatus("") }, { value: type !== "all" ? type : "", label: type === "sale" ? "Venda" : "Doação", clear: () => setType("all") }].filter(filter => filter.value).map(filter => <button key={filter.value} type="button" aria-label={`Remover filtro ${filter.label}`} onClick={() => { filter.clear(); setPage(1); }}>{filter.label}<X size={13} aria-hidden="true" /></button>)}</div>}
        {visible.length ? <ul ref={grid} className="market-grid">{visible.map(product => <li key={product.id} data-motion-key={product.id} className="market-card">
          <StorefrontProduct product={product} base={base} onSelect={onSelect} />
          {management && <div className="market-card-actions"><Link to={`${base}/materiais/${encodeURIComponent(product.id)}/editar`} aria-label={`Editar ${product.name}`}><Pencil size={14} aria-hidden="true" />Editar anúncio</Link><button type="button" aria-label={`Mais ações para ${product.name}`} aria-haspopup="menu" aria-expanded={menu?.product.id === product.id} className="company-icon-button" onClick={event => setMenu({ anchor: event.currentTarget, product })}><MoreHorizontal size={19} aria-hidden="true" /></button></div>}
        </li>)}</ul> : <div className="company-empty market-empty"><Search size={29} strokeWidth={1.3} aria-hidden="true" /><h3>{products.length ? "Nenhum material encontrado" : management ? "Seu próximo anúncio começa aqui" : "Nenhum material para explorar"}</h3><p>{products.length ? "Tente outro nome ou ajuste os filtros para encontrar seus materiais." : management ? "Publique seu primeiro material para começar a montar sua vitrine." : "Ative os exemplos para conhecer a biblioteca de materiais."}</p>{products.length ? <button type="button" className="company-button is-secondary" onClick={clearFilters}>Limpar busca e filtros</button> : management ? <Link to={`${base}/publicar`} className="company-button">Cadastrar primeiro material</Link> : null}</div>}
        <div className="company-pagination market-pagination"><p>{filtered.length ? `Mostrando ${(current - 1) * pageSize + 1}–${Math.min(current * pageSize, filtered.length)} de ${filtered.length} materiais` : "Nenhum resultado"}</p>{pages > 1 && <nav aria-label="Páginas da biblioteca"><button type="button" disabled={current === 1} aria-label="Página anterior" onClick={() => setPage(current - 1)}><ChevronLeft size={17} aria-hidden="true" /></button>{Array.from({ length: pages }, (_, index) => index + 1).filter(value => value === 1 || value === pages || Math.abs(value - current) <= 1).map(value => <button key={value} type="button" aria-label={`Página ${value}`} aria-current={value === current ? "page" : undefined} onClick={() => setPage(value)}>{value}</button>)}<button type="button" disabled={current === pages} aria-label="Próxima página" onClick={() => setPage(current + 1)}><ChevronRight size={17} aria-hidden="true" /></button></nav>}</div>
      </section>
    </div>
    {management && <div className="market-publish-note"><span>Tem mais material esperando um novo destino?</span><Link to={`${base}/publicar`}>Criar outro anúncio<ArrowRight size={16} aria-hidden="true" /></Link></div>}
    <Menu transitionDuration={reducedMotion ? 0 : 150} anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>{menu && <MenuItem component={Link} to={`${base}/materiais/${encodeURIComponent(menu.product.id)}`} onClick={() => setMenu(null)}><Eye size={16} className="mr-2" aria-hidden="true" />Ver detalhes</MenuItem>}{menu && <MenuItem onClick={() => { setDeleting(menu.product); setMenu(null); }}><Trash2 size={16} className="mr-2" aria-hidden="true" />Excluir material</MenuItem>}</Menu>
    {management && <DeleteMaterialDialog product={deleting} close={() => setDeleting(null)} />}
  </div>;
}

function StorefrontProduct({ product, base, onSelect }: { product: CompanyProduct; base: string; onSelect?: (product: CompanyProduct) => void }) {
  const content = <>
            <div className={`market-photo market-photo-${product.category.replace(/[^a-z]/g, "-")}`}><MaterialImage key={product.id} product={product} large placeholder={<MaterialPlaceholder category={product.category} />} /><TypeBadge type={product.type} /></div>
            <div className="market-product-copy"><p className="market-product-category">{categoryLabel(product.category)} · {conditionLabel(product.condition)}</p><h3>{product.name}</h3><div className="market-product-value"><strong>{product.type === "donation" ? "Doação" : product.price !== null ? money(product.price) : "Valor não informado"}</strong><small>{product.type === "donation" ? "Sem custo pelo material" : "Valor do anúncio"}</small></div><p className="market-product-stock"><Package size={14} aria-hidden="true" />{number(product.quantity)} un.<span aria-hidden="true">·</span>{number(product.weight)} kg</p><span className={`market-availability ${product.status === "available" ? "is-available" : ""}`}><i aria-hidden="true" />{statusLabel(product.status)}</span></div>
  </>;
  return onSelect
    ? <button type="button" className="market-product-link market-product-button" onClick={() => onSelect(product)} aria-label={`Ver material ${product.name}`}>{content}</button>
    : <Link to={`${base}/materiais/${encodeURIComponent(product.id)}`} className="market-product-link" aria-label={`Ver material ${product.name}`}>{content}</Link>;
}
