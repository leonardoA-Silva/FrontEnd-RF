import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useCompany } from "./CompanyContext";
import { categoryLabel, conditionLabel, money, number, statusLabel } from "./companyTypes";
import { CompanyLoading, CompanyMessage, DeleteMaterialDialog, MaterialImage, TypeBadge } from "./CompanyUi";

export default function CompanyDetails() {
  const { id } = useParams();
  const { products, loading, error, reload, base, preview } = useCompany();
  const [deleting, setDeleting] = useState(false);
  const product = products.find(item => item.id === id);
  if (loading) return <CompanyLoading />;
  if (error) return <CompanyMessage title="Não foi possível abrir o material" text={error} retry={reload} />;
  if (!product) return <CompanyMessage title="Material não encontrado" text="O anúncio não está disponível na sua biblioteca ou foi removido." />;
  return <>
    <Link to={base} className="company-inline-link company-back"><ArrowLeft size={15} /> Biblioteca de materiais</Link>
    <div className="company-page-heading"><div><p className="home-eyebrow">Detalhes do anúncio</p><h1>{product.name}</h1></div><Link to={`${base}/materiais/${encodeURIComponent(product.id)}/editar`} className="company-button"><Pencil size={16} />Editar material</Link></div>
    <div className="company-detail-grid"><div><MaterialImage key={product.id} product={product} large />{product.images.length > 1 && <div className="company-photo-thumbs">{product.images.slice(1).map((src, index) => <img key={index} src={src} alt={`Foto adicional ${index + 1} de ${product.name}`} />)}</div>}</div><section className="company-detail-copy"><TypeBadge type={product.type} /><h2>Uma nova possibilidade.</h2><p className="company-detail-description">{product.description || "Nenhuma descrição foi adicionada a este material."}</p><dl className="company-properties">{[["Categoria", categoryLabel(product.category)], ["Quantidade", `${number(product.quantity)} unidades`], ["Peso total", `${number(product.weight)} kg`], ["Conservação", conditionLabel(product.condition)], ["Situação", statusLabel(product.status)], ["Valor do anúncio", product.type === "donation" ? "Doação · Sem preço" : product.price !== null ? money(product.price) : "Não informado"]].map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><p className="company-small-note">{preview ? "Material ilustrativo. Alterações nesta prévia não afetam anúncios reais." : "As informações são apresentadas conforme o cadastro do material."}</p><button type="button" className="company-delete-link" onClick={() => setDeleting(true)}><Trash2 size={15} />Excluir material</button></section></div>
    <DeleteMaterialDialog product={deleting ? product : null} close={() => setDeleting(false)} />
  </>;
}
