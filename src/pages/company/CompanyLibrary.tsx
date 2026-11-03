import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, MenuItem } from "@mui/material";
import { ChevronLeft, ChevronRight, Eye, Lightbulb, MoreHorizontal, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { useCompany } from "./CompanyContext";
import { categories, categoryLabel, number } from "./companyTypes";
import type { CompanyProduct } from "./companyTypes";
import { CompanyLoading, CompanyMessage, DeleteMaterialDialog, MaterialImage, TypeBadge } from "./CompanyUi";

export default function CompanyLibrary() {
  const { products, preview, base, loading, error, reload } = useCompany();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState<{ anchor: HTMLElement; product: CompanyProduct } | null>(null);
  const [deleting, setDeleting] = useState<CompanyProduct | null>(null);
  const filtered = useMemo(() => products.filter(product => (type === "all" || product.type === type) && (!category || product.category === category) && `${product.name} ${categoryLabel(product.category)}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"))), [products, search, type, category]);
  const pages = Math.max(1, Math.ceil(filtered.length / 5));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * 5, current * 5);
  const sales = products.filter(product => product.type === "sale").length;
  if (loading) return <CompanyLoading />;
  if (error) return <CompanyMessage title="Seus materiais não carregaram" text={error} retry={reload} />;
  return <>
    <section className="company-hero"><div><h1>Cada material,<br />um <em>novo destino.</em></h1><p>Organize os materiais da sua empresa e abra espaço para novas possibilidades.</p><Link to={`${base}/publicar`} className="company-button"><Plus size={18} />Publicar material</Link></div><img src="/images/company/leather-stack.webp" alt="" width="1000" height="667" /></section>
    <div className="company-stats"><div><strong>{number(products.length)}</strong><span>Materiais cadastrados</span></div><div><strong>{number(sales)}</strong><span>Para venda</span></div><div><strong>{number(products.length - sales)}</strong><span>Para doação</span></div>{preview && <p><span />Exemplos de cadastro</p>}</div>
    <section aria-labelledby="library-title"><div className="company-library-heading"><h2 id="library-title">Biblioteca de materiais</h2><span>{filtered.length} {filtered.length === 1 ? "material" : "materiais"}</span></div>
      <div className="company-library-toolbar"><div className="company-tabs" role="group" aria-label="Tipo de negociação">{[{ value: "all", label: "Todos", count: products.length }, { value: "sale", label: "Venda", count: sales }, { value: "donation", label: "Doação", count: products.length - sales }].map(tab => <button key={tab.value} type="button" aria-pressed={type === tab.value} onClick={() => { setType(tab.value); setPage(1); }}>{tab.label}<span>{tab.count}</span></button>)}</div><div className="company-search-tools"><label className="company-search"><Search size={17} /><span className="sr-only">Buscar material</span><input type="search" placeholder="Buscar material…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label><button type="button" className="company-icon-button" aria-label="Filtrar por categoria" aria-expanded={filtersOpen} aria-controls="company-category-filter" onClick={() => setFiltersOpen(value => !value)}><SlidersHorizontal size={18} /></button></div></div>
      {filtersOpen && <div id="company-category-filter" className="company-filter-panel"><label htmlFor="category-filter">Categoria</label><select id="category-filter" value={category} onChange={event => { setCategory(event.target.value); setPage(1); }}><option value="">Todas as categorias</option>{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" className="company-inline-link" onClick={() => { setCategory(""); setSearch(""); setType("all"); setPage(1); }}>Limpar filtros</button></div>}
      {visible.length ? <table className="company-table"><caption className="sr-only">Materiais cadastrados pela empresa</caption><thead><tr><th scope="col">Material</th><th scope="col">Categoria</th><th scope="col">Tipo</th><th scope="col">Quantidade</th><th scope="col">Ações</th></tr></thead><tbody>{visible.map(product => <tr key={product.id}><td><Link to={`${base}/materiais/${encodeURIComponent(product.id)}`} className="company-material-cell"><MaterialImage product={product} /><strong>{product.name}</strong></Link></td><td className="company-table-category">{categoryLabel(product.category)}</td><td><TypeBadge type={product.type} /></td><td className="company-table-quantity">{number(product.quantity)} un.<small>{number(product.weight)} kg</small></td><td><div className="company-row-actions"><Link to={`${base}/materiais/${encodeURIComponent(product.id)}/editar`} className="company-icon-button" aria-label={`Editar ${product.name}`}><Pencil size={16} /></Link><button type="button" aria-label={`Mais ações para ${product.name}`} aria-haspopup="menu" className="company-icon-button" onClick={event => setMenu({ anchor: event.currentTarget, product })}><MoreHorizontal size={18} /></button></div></td></tr>)}</tbody></table> : <div className="company-empty"><Search size={29} strokeWidth={1.3} /><h3>{products.length ? "Nenhum material encontrado" : "Seu próximo anúncio começa aqui"}</h3><p>{products.length ? "Tente outro nome ou ajuste os filtros." : "Adicione um material para organizar sua biblioteca."}</p>{products.length ? <button type="button" className="company-button is-secondary" onClick={() => { setSearch(""); setCategory(""); setType("all"); }}>Limpar busca e filtros</button> : <Link to={`${base}/publicar`} className="company-button">Cadastrar primeiro material</Link>}</div>}
      <div className="company-pagination"><p>{filtered.length ? `Mostrando ${(current - 1) * 5 + 1}–${Math.min(current * 5, filtered.length)} de ${filtered.length} materiais` : "Nenhum resultado"}</p><nav aria-label="Páginas da biblioteca"><button type="button" disabled={current === 1} aria-label="Página anterior" onClick={() => setPage(current - 1)}><ChevronLeft size={17} /></button>{Array.from({ length: pages }, (_, index) => index + 1).filter(value => value === 1 || value === pages || Math.abs(value - current) <= 1).map(value => <button key={value} type="button" aria-label={`Página ${value}`} aria-current={value === current ? "page" : undefined} onClick={() => setPage(value)}>{value}</button>)}<button type="button" disabled={current === pages} aria-label="Próxima página" onClick={() => setPage(current + 1)}><ChevronRight size={17} /></button></nav></div>
    </section>
    <div className="company-guidance"><Lightbulb size={22} strokeWidth={1.2} /><p>Uma boa descrição aproxima o material de quem precisa.</p><Link to={`${base}/publicar`}>Criar um anúncio claro ↗</Link></div>
    <Menu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>{menu && <MenuItem component={Link} to={`${base}/materiais/${encodeURIComponent(menu.product.id)}`} onClick={() => setMenu(null)}><Eye size={16} className="mr-2" />Ver detalhes</MenuItem>}{menu && <MenuItem onClick={() => { setDeleting(menu.product); setMenu(null); }}><Trash2 size={16} className="mr-2" />Excluir material</MenuItem>}</Menu>
    <DeleteMaterialDialog product={deleting} close={() => setDeleting(null)} />
  </>;
}
