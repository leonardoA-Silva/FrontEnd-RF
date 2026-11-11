import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Package, Pencil, Scale, Trash2 } from "lucide-react";
import { useCompany } from "./CompanyContext";
import { categoryLabel, conditionLabel, money, number, statusLabel } from "./companyTypes";
import { CompanyLoading, CompanyMessage, DeleteMaterialDialog, MaterialImage, TypeBadge } from "./CompanyUi";

export default function CompanyDetails() {
  const { id } = useParams();
  const { products, loading, error, reload, base, preview } = useCompany();
  const [deleting, setDeleting] = useState(false);
  const [photo, setPhoto] = useState(0);
  const product = products.find(item => item.id === id);
  if (loading) return <CompanyLoading />;
  if (error) return <CompanyMessage title="Não foi possível abrir o material" text={error} retry={reload} />;
  if (!product) return <CompanyMessage title="Material não encontrado" text="O anúncio não está disponível na sua biblioteca ou foi removido." />;
  const selectedPhoto = Math.min(photo, Math.max(0, product.images.length - 1));
  return <div className="company-detail-page">
    <Link to={base} className="company-inline-link company-back"><ArrowLeft size={15} aria-hidden="true" /> Biblioteca de materiais</Link>
    <div className="company-page-heading"><div><p className="home-eyebrow">Detalhes do anúncio</p><h1>{product.name}</h1><p>{categoryLabel(product.category)} · {conditionLabel(product.condition)}</p></div><Link to={`${base}/materiais/${encodeURIComponent(product.id)}/editar`} className="company-button"><Pencil size={16} aria-hidden="true" />Editar material</Link></div>
    <div className="company-detail-grid">
      <section className="company-detail-gallery" aria-label="Fotos do material"><div className="company-gallery-label"><span>O material de perto</span><span>{product.images.length ? `${product.images.length} ${product.images.length === 1 ? "foto" : "fotos"}` : "Sem foto"}</span></div><MaterialImage key={`${product.id}-${selectedPhoto}`} product={{ ...product, images: product.images[selectedPhoto] ? [product.images[selectedPhoto]] : [] }} large />{product.images.length > 1 && <div className="company-gallery-thumbs">{product.images.map((src, index) => <button key={index} type="button" onClick={() => setPhoto(index)} aria-pressed={selectedPhoto === index} aria-label={`Ver foto ${index + 1} de ${product.name}`}><img src={src} alt="" /></button>)}</div>}<p>Confira as fotos e as características cadastradas antes de atualizar o anúncio.</p></section>
      <section className="company-detail-copy"><div className="company-detail-meta"><TypeBadge type={product.type} /><span className={`company-detail-status ${product.status === "available" ? "is-available" : ""}`}><i aria-hidden="true" />{statusLabel(product.status)}</span></div><div className="company-detail-price"><strong>{product.type === "donation" ? "Doação" : product.price !== null ? money(product.price) : "Valor não informado"}</strong><span>{product.type === "donation" ? "Sem custo pelo material" : "Valor do anúncio"}</span></div><div className="company-detail-amounts"><div><Package size={21} strokeWidth={1.4} aria-hidden="true" /><span>Quantidade<strong>{number(product.quantity)} unidades</strong></span></div><div><Scale size={21} strokeWidth={1.4} aria-hidden="true" /><span>Peso total<strong>{number(product.weight)} kg</strong></span></div></div><h2>Sobre este material</h2><p className="company-detail-description">{product.description || "Nenhuma descrição foi adicionada a este material."}</p><dl className="company-properties">{[["Categoria", categoryLabel(product.category)], ["Conservação", conditionLabel(product.condition)], ["Situação", statusLabel(product.status)]].map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><p className="company-small-note">{preview ? "Material ilustrativo. Alterações nesta prévia não afetam anúncios reais." : "As informações são apresentadas conforme o cadastro do material."}</p><button type="button" className="company-delete-link" onClick={() => setDeleting(true)}><Trash2 size={15} aria-hidden="true" />Excluir material</button></section>
    </div>
    <DeleteMaterialDialog product={deleting ? product : null} close={() => setDeleting(false)} />
  </div>;
}
